import { useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

import type { FaceDirection } from '@/data/projects'
import { GRID_SIZE, getFaceProject } from '@/data/projects'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useNodeIntroSpring } from '@/hooks/useIntroAnimation'

// ─── Shader: per-face inner-glow stickers with grain + glass overlay ─────────

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
  uniform vec3 u_px_center; uniform vec3 u_px_edge;
  uniform vec3 u_nx_center; uniform vec3 u_nx_edge;
  uniform vec3 u_py_center; uniform vec3 u_py_edge;
  uniform vec3 u_ny_center; uniform vec3 u_ny_edge;
  uniform vec3 u_pz_center; uniform vec3 u_pz_edge;
  uniform vec3 u_nz_center; uniform vec3 u_nz_edge;
  uniform vec3 u_bg;
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

    // Pick gradient colours for the active face
    vec3 centerCol;
    vec3 edgeCol;
    if (an.x >= an.y && an.x >= an.z) {
      if (n.x > 0.0) {
        centerCol = u_px_center;
        edgeCol   = u_px_edge;
      } else {
        centerCol = u_nx_center;
        edgeCol   = u_nx_edge;
      }
    } else if (an.y >= an.x && an.y >= an.z) {
      if (n.y > 0.0) {
        centerCol = u_py_center;
        edgeCol   = u_py_edge;
      } else {
        centerCol = u_ny_center;
        edgeCol   = u_ny_edge;
      }
    } else {
      if (n.z > 0.0) {
        centerCol = u_pz_center;
        edgeCol   = u_pz_edge;
      } else {
        centerCol = u_nz_center;
        edgeCol   = u_nz_edge;
      }
    }

    // Radial "inner glow" from approx. (40%, 40%)
    vec2 glowCenter = vec2(0.4, 0.4);
    float r = distance(vUv, glowCenter);
    float maxR = 0.8;
    float t = clamp(r / maxR, 0.0, 1.0);
    vec3 col = mix(centerCol, edgeCol, t);

    // Fine grain for material richness (kept subtle)
    float g = grain(vUv * 20.0) * 0.6 + grain(vUv * 7.0) * 0.4;
    col *= mix(0.90, 1.03, g);

    // Hover brightening
    col = mix(col, col + vec3(0.22), u_hover);

    // Specular "glass" streak along a fixed diagonal in UV space
    float diag = (vUv.x + vUv.y) * 0.7;
    float glassBand = smoothstep(0.30, 0.0, abs(diag - 0.30));
    float glassStrength = glassBand * 0.06;
    col = mix(col, vec3(1.0), glassStrength);

    // Rounded-rect stencil with a dark studio background "gap"
    float gap = 0.03;
    float feather = 0.015;
    vec2 innerMin = vec2(gap, gap);
    vec2 innerMax = vec2(1.0 - gap, 1.0 - gap);

    // Base rectangle mask (2px-style gap)
    float maskX = smoothstep(innerMin.x, innerMin.x + feather, vUv.x)
                * smoothstep(innerMax.x, innerMax.x - feather, vUv.x);
    float maskY = smoothstep(innerMin.y, innerMin.y + feather, vUv.y)
                * smoothstep(innerMax.y, innerMax.y - feather, vUv.y);
    float rectMask = maskX * maskY;

    // Rounded corners via distance to the clipped UV (rounded-rect SDF)
    vec2 uvClamped = clamp(vUv, innerMin, innerMax);
    float cornerDist = length(vUv - uvClamped);
    float radius = 0.22;
    float cornerMask = smoothstep(radius, radius - feather, cornerDist);

    float mask = rectMask * cornerMask;
    col = mix(u_bg, col, clamp(mask, 0.0, 1.0));

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
const GAP_BG     = hexToVec3('#111111')

// Per-face inner/edge colours for the "sticker" gradients
const FACE_CENTER = {
  '+x': hexToVec3('#007AFF'), // Cerulean Blue
  '-x': hexToVec3('#34C759'), // Emerald Glass
  '+y': hexToVec3('#AF52DE'), // Royal Violet
  '-y': hexToVec3('#FF3B30'), // Vivid Crimson
  '+z': hexToVec3('#FFB900'), // Solar Amber
  '-z': hexToVec3('#F5F5F7'), // Studio White
} as const satisfies Record<FaceDirection, THREE.Vector3>

const FACE_EDGE = {
  '+x': hexToVec3('#0068D9'),
  '-x': hexToVec3('#2CA94C'),
  '+y': hexToVec3('#9546BD'),
  '-y': hexToVec3('#D93229'),
  '+z': hexToVec3('#D99D00'),
  '-z': hexToVec3('#D1D1D4'),
} as const satisfies Record<FaceDirection, THREE.Vector3>

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
    u_px_center: {
      value: (gridX === GRID_SIZE - 1 ? FACE_CENTER['+x'] : INNER_GREY).clone(),
    },
    u_px_edge: {
      value: (gridX === GRID_SIZE - 1 ? FACE_EDGE['+x'] : INNER_GREY).clone(),
    },
    u_nx_center: {
      value: (gridX === 0 ? FACE_CENTER['-x'] : INNER_GREY).clone(),
    },
    u_nx_edge: {
      value: (gridX === 0 ? FACE_EDGE['-x'] : INNER_GREY).clone(),
    },
    u_py_center: {
      value: (gridY === GRID_SIZE - 1 ? FACE_CENTER['+y'] : INNER_GREY).clone(),
    },
    u_py_edge: {
      value: (gridY === GRID_SIZE - 1 ? FACE_EDGE['+y'] : INNER_GREY).clone(),
    },
    u_ny_center: {
      value: (gridY === 0 ? FACE_CENTER['-y'] : INNER_GREY).clone(),
    },
    u_ny_edge: {
      value: (gridY === 0 ? FACE_EDGE['-y'] : INNER_GREY).clone(),
    },
    u_pz_center: {
      value: (gridZ === GRID_SIZE - 1 ? FACE_CENTER['+z'] : INNER_GREY).clone(),
    },
    u_pz_edge: {
      value: (gridZ === GRID_SIZE - 1 ? FACE_EDGE['+z'] : INNER_GREY).clone(),
    },
    u_nz_center: {
      value: (gridZ === 0 ? FACE_CENTER['-z'] : INNER_GREY).clone(),
    },
    u_nz_edge: {
      value: (gridZ === 0 ? FACE_EDGE['-z'] : INNER_GREY).clone(),
    },
    u_bg:      { value: GAP_BG.clone() },
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
