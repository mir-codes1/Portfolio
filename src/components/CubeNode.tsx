import { useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

import type { FaceDirection } from '@/data/projects'
import { FACE_COLORS, GRID_SIZE, getFaceProject } from '@/data/projects'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useNodeIntroSpring } from '@/hooks/useIntroAnimation'

// ─── Shader: per-face flat colouring + procedural grain ──────────────────────

const vertexShader = /* glsl */`
  varying vec3 vLocalNormal;
  varying vec2 vUv;
  void main() {
    vLocalNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  uniform vec3 u_px; uniform vec3 u_nx;
  uniform vec3 u_py; uniform vec3 u_ny;
  uniform vec3 u_pz; uniform vec3 u_nz;
  uniform float u_hover;
  uniform float u_opacity;
  varying vec3 vLocalNormal;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float grain(vec2 uv) {
    vec2 i = floor(uv); vec2 f = fract(uv);
    float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }

  void main() {
    vec3 n = normalize(vLocalNormal);
    vec3 an = abs(n);
    vec3 col;
    if (an.x >= an.y && an.x >= an.z) col = n.x > 0.0 ? u_px : u_nx;
    else if (an.y >= an.x && an.y >= an.z) col = n.y > 0.0 ? u_py : u_ny;
    else col = n.z > 0.0 ? u_pz : u_nz;

    float g = grain(vUv * 20.0) * 0.6 + grain(vUv * 7.0) * 0.4;
    col *= mix(0.68, 1.0, g);
    col = mix(col, col + vec3(0.20), u_hover);
    gl_FragColor = vec4(col, u_opacity);
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalToFaceDir(n: THREE.Vector3): FaceDirection {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z)
  if (ax >= ay && ax >= az) return n.x > 0 ? '+x' : '-x'
  if (ay >= ax && ay >= az) return n.y > 0 ? '+y' : '-y'
  return n.z > 0 ? '+z' : '-z'
}

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex)
  return new THREE.Vector3(c.r, c.g, c.b)
}

function isOuterFace(
  gridX: number,
  gridY: number,
  gridZ: number,
  faceDir: FaceDirection,
): boolean {
  const max = GRID_SIZE - 1
  switch (faceDir) {
    case '+x': return gridX === max
    case '-x': return gridX === 0
    case '+y': return gridY === max
    case '-y': return gridY === 0
    case '+z': return gridZ === max
    case '-z': return gridZ === 0
    default:   return false
  }
}

// Shared colour values (read-only, cloned per instance below)
const INNER_GREY = hexToVec3('#202124')

// ─── Component ────────────────────────────────────────────────────────────────

interface CubeNodeProps {
  nodeIndex: number
  gridX: number
  gridY: number
  gridZ: number
  position:  [number, number, number]
}

export function CubeNode({ nodeIndex, gridX, gridY, gridZ, position }: CubeNodeProps) {
  const { selectedFace, setHoveredFaceId, setSelectedFace } = usePortfolioStore()
  const anySelected = selectedFace !== null
  const isSelected  = selectedFace?.faceProject.nodeIndex === nodeIndex

  // Intro spring — stagger by nodeIndex for bouncy sequential appearance
  const x = nodeIndex % 2
  const y = Math.floor(nodeIndex / 2) % 2
  const z = Math.floor(nodeIndex / 4)
  const intro = useNodeIntroSpring(x, y, z)

  // Hover spring
  const [hoverSp] = useSpring(() => ({
    hover: 0, scale: 1,
    config: { tension: 220, friction: 18 },
  }), [])

  // Sibling fade spring
  const [fadeSp] = useSpring(() => ({
    opacity: 1,
    config: { tension: 160, friction: 22 },
  }), [])
  fadeSp.opacity.start(anySelected && !isSelected ? 0.18 : 1)

  // Per-node shader uniforms (cloned so each node is independent)
  const uniforms = useMemo(() => ({
    u_px: {
      value: (gridX === GRID_SIZE - 1 ? hexToVec3(FACE_COLORS['+x']) : INNER_GREY).clone(),
    },
    u_nx: {
      value: (gridX === 0 ? hexToVec3(FACE_COLORS['-x']) : INNER_GREY).clone(),
    },
    u_py: {
      value: (gridY === GRID_SIZE - 1 ? hexToVec3(FACE_COLORS['+y']) : INNER_GREY).clone(),
    },
    u_ny: {
      value: (gridY === 0 ? hexToVec3(FACE_COLORS['-y']) : INNER_GREY).clone(),
    },
    u_pz: {
      value: (gridZ === GRID_SIZE - 1 ? hexToVec3(FACE_COLORS['+z']) : INNER_GREY).clone(),
    },
    u_nz: {
      value: (gridZ === 0 ? hexToVec3(FACE_COLORS['-z']) : INNER_GREY).clone(),
    },
    u_hover:   { value: 0 },
    u_opacity: { value: 1 },
  }), [gridX, gridY, gridZ])

  useFrame(() => {
    uniforms.u_hover.value   = hoverSp.hover.get()
    uniforms.u_opacity.value = fadeSp.opacity.get()
  })

  // ── Pointer handlers ─────────────────────────────────────────────────────────

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (anySelected) return
    if (!e.face) return
    const faceDir = normalToFaceDir(e.face.normal)
    if (!isOuterFace(gridX, gridY, gridZ, faceDir)) return
    setHoveredFaceId(`${nodeIndex}-${faceDir}`)
    hoverSp.hover.start(1)
    hoverSp.scale.start(1.06)
    document.body.style.cursor = 'pointer'
  }, [anySelected, gridX, gridY, gridZ, nodeIndex, setHoveredFaceId, hoverSp])

  const handlePointerOut = useCallback(() => {
    setHoveredFaceId(null)
    hoverSp.hover.start(0)
    hoverSp.scale.start(1)
    document.body.style.cursor = 'default'
  }, [setHoveredFaceId, hoverSp])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!e.face) return

    const faceDir    = normalToFaceDir(e.face.normal)
    if (!isOuterFace(gridX, gridY, gridZ, faceDir)) return
    const worldNorm  = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize()
    const worldPos   = new THREE.Vector3()
    e.object.getWorldPosition(worldPos)

    const faceProject = getFaceProject(nodeIndex, faceDir)
    const alreadySelected = selectedFace?.faceProject.id === faceProject.id

    setSelectedFace(alreadySelected ? null : {
      faceProject,
      worldPos:    [worldPos.x, worldPos.y, worldPos.z],
      worldNormal: [worldNorm.x, worldNorm.y, worldNorm.z],
    })
    setHoveredFaceId(null)
    hoverSp.hover.start(0)
    hoverSp.scale.start(1)
    document.body.style.cursor = 'default'
  }, [gridX, gridY, gridZ, nodeIndex, selectedFace, setSelectedFace, setHoveredFaceId, hoverSp])

  return (
    <animated.group position={position} scale={intro.scale}>
      <animated.group scale={hoverSp.scale}>
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[1, 1, 1]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
          />
        </mesh>
      </animated.group>
    </animated.group>
  )
}
