import { useMemo, useCallback, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

import type { FaceDirection } from '@/data/projects'
import { GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z, ALL_FACE_DIRS, getFaceProject } from '@/data/projects'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useNodeIntroSpring } from '@/hooks/useIntroAnimation'
import { FaceIcon } from './FaceIcon'
import { FACE_ICON_MAP } from '@/utils/faceIcons'

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
  uniform sampler2D u_satinMap;
  uniform float u_hover;
  uniform float u_opacity;
  varying vec3 vLocalNormal;
  varying vec2 vUv;

  // ── Gradient-button 5-stop radial sample (branchless) ───────────────────────
  vec3 gbSample(float r,
                vec3 c1, vec3 c2, vec3 c3, vec3 c4, vec3 c5,
                float s1, float s2, float s3, float s4, float s5) {
    vec3 col = c1;
    col = mix(col, c2, clamp((r - s1) / max(s2 - s1, 0.0001), 0.0, 1.0));
    col = mix(col, c3, clamp((r - s2) / max(s3 - s2, 0.0001), 0.0, 1.0));
    col = mix(col, c4, clamp((r - s3) / max(s4 - s3, 0.0001), 0.0, 1.0));
    col = mix(col, c5, clamp((r - s4) / max(s5 - s4, 0.0001), 0.0, 1.0));
    return col;
  }

  void main() {
    vec3 n = normalize(vLocalNormal);
    vec3 an = abs(n);

    // ── Per-face tint colour (used as a subtle additive overlay) ────────────────
    vec3 centerCol, edgeCol;
    if (an.x >= an.y && an.x >= an.z) {
      centerCol = n.x > 0.0 ? u_px_center : u_nx_center;
      edgeCol   = n.x > 0.0 ? u_px_edge   : u_nx_edge;
    } else if (an.y >= an.x && an.y >= an.z) {
      centerCol = n.y > 0.0 ? u_py_center : u_ny_center;
      edgeCol   = n.y > 0.0 ? u_py_edge   : u_ny_edge;
    } else {
      centerCol = n.z > 0.0 ? u_pz_center : u_nz_center;
      edgeCol   = n.z > 0.0 ? u_pz_edge   : u_nz_edge;
    }
    float tintT   = clamp(length(vUv - vec2(0.5)) / 0.7, 0.0, 1.0);
    vec3  faceTint = mix(centerCol, edgeCol, tintT);

    // ── Gradient-button: idle state  (dark navy / maroon) ──────────────────────
    // Colors match the CSS: #000, #08012c, #4e1e40, #70464e, #88394c
    const vec3 DC1 = vec3(0.0000, 0.0000, 0.0000);
    const vec3 DC2 = vec3(0.0314, 0.0039, 0.1725);
    const vec3 DC3 = vec3(0.3059, 0.1176, 0.2510);
    const vec3 DC4 = vec3(0.4392, 0.2745, 0.3059);
    const vec3 DC5 = vec3(0.5333, 0.2235, 0.2980);

    // ── Gradient-button: hover state  (warm pink / orange) ─────────────────────
    // Colors match the CSS hover: #c96287, #c66c64, #cc7d23, #37140a, #000
    const vec3 HC1 = vec3(0.7882, 0.3843, 0.5294);
    const vec3 HC2 = vec3(0.7765, 0.4235, 0.3922);
    const vec3 HC3 = vec3(0.8000, 0.4902, 0.1373);
    const vec3 HC4 = vec3(0.2157, 0.0784, 0.0392);
    const vec3 HC5 = vec3(0.0000, 0.0000, 0.0000);

    vec3 c1 = mix(DC1, HC1, u_hover);
    vec3 c2 = mix(DC2, HC2, u_hover);
    vec3 c3 = mix(DC3, HC3, u_hover);
    vec3 c4 = mix(DC4, HC4, u_hover);
    vec3 c5 = mix(DC5, HC5, u_hover);

    // Gradient focal point and elliptical spread (CSS percentages → UV fractions)
    // idle:  at (11.14%, 140%)  spread (150%, 180%)
    // hover: at (0%,    91.5%)  spread (120%,  103%)
    vec2 pos = mix(vec2(0.1114, 1.4000), vec2(0.0000, 0.9151), u_hover);
    vec2 sp  = mix(vec2(1.5000, 1.8006), vec2(1.2024, 1.0318), u_hover);

    // Color stops (0–1, matching CSS % / 100)
    float s1 = mix(0.3735, 0.0000, u_hover);
    float s2 = mix(0.6136, 0.0880, u_hover);
    float s3 = mix(0.7842, 0.2144, u_hover);
    float s4 = mix(0.8952, 0.7134, u_hover);
    float s5 = mix(1.0000, 0.8576, u_hover);

    // Elliptic radial distance → sample gradient
    float r   = length((vUv - pos) / sp);
    vec3  gbCol = gbSample(r, c1, c2, c3, c4, c5, s1, s2, s3, s4, s5);

    // Face colour is the base; gradient is a weak overlay that strengthens on hover
    float gbStrength = mix(0.22, 0.45, u_hover);
    vec3  col = mix(faceTint, gbCol, gbStrength);

    // ── Satin texture ──────────────────────────────────────────────────────────
    float satinLuma = dot(texture2D(u_satinMap, vUv * 4.0).rgb, vec3(0.299, 0.587, 0.114));
    col *= mix(0.90, 1.10, satinLuma);

    // ── Glass / specular streak ────────────────────────────────────────────────
    float diag = (vUv.x + vUv.y) * 0.7;
    col = mix(col, vec3(1.0), smoothstep(0.30, 0.0, abs(diag - 0.30)) * 0.05);

    // ── Gap + rounded-corner sticker mask ─────────────────────────────────────
    float gap = 0.02, feather = 0.0075;
    vec2 iMin = vec2(gap), iMax = vec2(1.0 - gap);
    float mX = smoothstep(iMin.x, iMin.x + feather, vUv.x)
             * smoothstep(iMax.x, iMax.x - feather, vUv.x);
    float mY = smoothstep(iMin.y, iMin.y + feather, vUv.y)
             * smoothstep(iMax.y, iMax.y - feather, vUv.y);
    float cDist = length(vUv - clamp(vUv, iMin, iMax));
    float mask  = mX * mY * smoothstep(0.22, 0.22 - feather, cDist);

    // ── Border glow  (::before equivalent from gradient-button CSS) ────────────
    // Linear-gradient angle: 20° idle → 190° hover
    float bAngle = mix(radians(20.0), radians(190.0), u_hover);
    float bGrad  = clamp(dot(vUv - 0.5, vec2(sin(bAngle), cos(bAngle))) + 0.5, 0.0, 1.0);
    // idle:  hsla(340,75%,60%,0.20) → hsla(340,75%,40%,0.75)
    // hover: hsla(340,78%,90%,0.10) → hsla(340,75%,90%,0.60)
    vec3  bc1 = mix(vec3(0.902, 0.302, 0.498), vec3(0.980, 0.863, 0.910), u_hover);
    vec3  bc2 = mix(vec3(0.686, 0.102, 0.302), vec3(0.980, 0.855, 0.906), u_hover);
    float ba1 = mix(0.20, 0.10, u_hover);
    float ba2 = mix(0.75, 0.60, u_hover);
    vec3  bRgb = mix(bc1, bc2, bGrad);
    float bA   = mix(ba1, ba2, bGrad);
    // Apply only inside the sticker, near its edge
    float eDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    col = mix(col, bRgb, (1.0 - smoothstep(0.0, 0.04, eDist)) * mask * bA);

    // ── Final composite ────────────────────────────────────────────────────────
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
  const maxX = GRID_SIZE_X - 1
  const maxY = GRID_SIZE_Y - 1
  const maxZ = GRID_SIZE_Z - 1
  switch (faceDir) {
    case '+x': return gridX === maxX
    case '-x': return gridX === 0
    case '+y': return gridY === maxY
    case '-y': return gridY === 0
    case '+z': return gridZ === maxZ
    case '-z': return gridZ === 0
    default:   return false
  }
}

// Face-local "up" direction in node space (after applying FACE_TRANSFORM rotation).
// Used to compute a world-space up vector for the camera that matches the icon orientation.
const FACE_LOCAL_UP: Record<FaceDirection, THREE.Vector3> = {
  '+x': new THREE.Vector3(0,  1,  0),
  '-x': new THREE.Vector3(0,  1,  0),
  '+y': new THREE.Vector3(0,  0, -1), // rot [-π/2,0,0]: local Y → node -Z
  '-y': new THREE.Vector3(0,  0,  1), // rot [ π/2,0,0]: local Y → node +Z
  '+z': new THREE.Vector3(0,  1,  0),
  '-z': new THREE.Vector3(0,  1,  0),
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
  nodeIndex:  number
  gridX:      number
  gridY:      number
  gridZ:      number
  position:   [number, number, number]
  scrollFade?: number
}

export function CubeNode({ nodeIndex, gridX, gridY, gridZ, position, scrollFade = 0 }: CubeNodeProps) {
  const { selectedFace, setHoveredFaceId, setSelectedFace, isScrollMode } = usePortfolioStore()
  const scrollFadeRef = useRef(scrollFade)
  scrollFadeRef.current = scrollFade
  const anySelected = selectedFace !== null
  const isSelected  = selectedFace?.faceProject.nodeIndex === nodeIndex

  const satinTexture = useLoader(THREE.TextureLoader, '/textures/satin_strength.png')
  satinTexture.wrapS = THREE.RepeatWrapping
  satinTexture.wrapT = THREE.RepeatWrapping
  satinTexture.anisotropy = 8

  // Intro spring — stagger by nodeIndex for bouncy sequential appearance
  const intro = useNodeIntroSpring(nodeIndex)

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
      value: (gridX === GRID_SIZE_X - 1 ? FACE_CENTER['+x'] : INNER_GREY).clone(),
    },
    u_px_edge: {
      value: (gridX === GRID_SIZE_X - 1 ? FACE_EDGE['+x'] : INNER_GREY).clone(),
    },
    u_nx_center: {
      value: (gridX === 0 ? FACE_CENTER['-x'] : INNER_GREY).clone(),
    },
    u_nx_edge: {
      value: (gridX === 0 ? FACE_EDGE['-x'] : INNER_GREY).clone(),
    },
    u_py_center: {
      value: (gridY === GRID_SIZE_Y - 1 ? FACE_CENTER['+y'] : INNER_GREY).clone(),
    },
    u_py_edge: {
      value: (gridY === GRID_SIZE_Y - 1 ? FACE_EDGE['+y'] : INNER_GREY).clone(),
    },
    u_ny_center: {
      value: (gridY === 0 ? FACE_CENTER['-y'] : INNER_GREY).clone(),
    },
    u_ny_edge: {
      value: (gridY === 0 ? FACE_EDGE['-y'] : INNER_GREY).clone(),
    },
    u_pz_center: {
      value: (gridZ === GRID_SIZE_Z - 1 ? FACE_CENTER['+z'] : INNER_GREY).clone(),
    },
    u_pz_edge: {
      value: (gridZ === GRID_SIZE_Z - 1 ? FACE_EDGE['+z'] : INNER_GREY).clone(),
    },
    u_nz_center: {
      value: (gridZ === 0 ? FACE_CENTER['-z'] : INNER_GREY).clone(),
    },
    u_nz_edge: {
      value: (gridZ === 0 ? FACE_EDGE['-z'] : INNER_GREY).clone(),
    },
    u_satinMap: { value: satinTexture },
    u_bg:      { value: GAP_BG.clone() },
    u_hover:   { value: 0 },
    u_opacity: { value: 1 },
  }), [gridX, gridY, gridZ, satinTexture])

  useFrame(() => {
    uniforms.u_hover.value   = hoverSp.hover.get()
    uniforms.u_opacity.value = fadeSp.opacity.get()   // cube body stays visible during scroll flip
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
    if (isScrollMode) return
    if (!e.face) return

    const faceDir    = normalToFaceDir(e.face.normal)
    if (!isOuterFace(gridX, gridY, gridZ, faceDir)) return
    const worldNorm  = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize()
    const worldPos   = new THREE.Vector3()
    e.object.getWorldPosition(worldPos)

    // World-space "up" for the face icon — transforms the face's local-up through
    // the mesh's world matrix so the camera stays aligned with the icon orientation
    // even when the cube has auto-rotated (critical for top/bottom faces).
    const worldFaceUpVec = FACE_LOCAL_UP[faceDir].clone().transformDirection(e.object.matrixWorld).normalize()

    const faceProject = getFaceProject(nodeIndex, faceDir)
    const alreadySelected = selectedFace?.faceProject.id === faceProject.id

    setSelectedFace(alreadySelected ? null : {
      faceProject,
      worldPos:    [worldPos.x, worldPos.y, worldPos.z],
      worldNormal: [worldNorm.x, worldNorm.y, worldNorm.z],
      worldFaceUp: [worldFaceUpVec.x, worldFaceUpVec.y, worldFaceUpVec.z],
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
        {ALL_FACE_DIRS
          .filter(dir => isOuterFace(gridX, gridY, gridZ, dir))
          .filter(dir => !!FACE_ICON_MAP[`${nodeIndex}-${dir}`])
          .map(dir => (
            <FaceIcon
              key={dir}
              faceDir={dir}
              faceId={`${nodeIndex}-${dir}`}
              iconPath={FACE_ICON_MAP[`${nodeIndex}-${dir}`]}
              springOpacity={fadeSp.opacity}
              scrollFade={scrollFade}
            />
          ))
        }
      </animated.group>
    </animated.group>
  )
}
