import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

import type { Project, FaceDirection } from '@/data/projects'
import { getOuterFaces } from '@/data/projects'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useNodeIntroSpring } from '@/hooks/useIntroAnimation'
import { useProceduralSandstoneTextures } from '@/hooks/useSandstoneTextures'
import { getGlyphTexture } from '@/utils/glyphTextures'
import { ExpandedCard } from './ExpandedCard'

// Face direction → local normal and rotation for glyph planes
const FACE_CONFIG: Record<FaceDirection, { normal: [number, number, number]; rotation: [number, number, number] }> = {
  '+x': { normal: [1, 0, 0],  rotation: [0,  Math.PI / 2, 0] },
  '-x': { normal: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  '+y': { normal: [0, 1, 0],  rotation: [-Math.PI / 2, 0, 0] },
  '-y': { normal: [0, -1, 0], rotation: [Math.PI / 2, 0, 0] },
  '+z': { normal: [0, 0, 1],  rotation: [0, 0, 0] },
  '-z': { normal: [0, 0, -1], rotation: [0, Math.PI, 0] },
}

interface CubeNodeProps {
  gridX: number  // 0, 1, 2
  gridY: number
  gridZ: number
  position: [number, number, number]
  project: Project
}

const GLYPH_OFFSET = 0.51  // slightly in front of face (face at ±0.5)

export function CubeNode({ gridX, gridY, gridZ, position, project }: CubeNodeProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  const { hoveredNodeId, expandedNodeId, setHoveredNodeId, setExpandedNodeId } = usePortfolioStore()
  const isHovered   = hoveredNodeId  === project.id
  const isExpanded  = expandedNodeId === project.id
  const anyExpanded = expandedNodeId !== null
  const isSibling   = anyExpanded && !isExpanded

  // Procedural sandstone textures (swap to useTexture once PNGs are placed in /public/textures/)
  const [diffuse, normal, ao] = useProceduralSandstoneTextures()

  // Outer faces for this grid position
  const outerFaces = useMemo(() => getOuterFaces(gridX, gridY, gridZ), [gridX, gridY, gridZ])

  // ── Intro animation ──────────────────────────────────────────────────────────
  const intro = useNodeIntroSpring(gridX, gridY, gridZ)

  // ── Hover springs ────────────────────────────────────────────────────────────
  const [hoverSpring] = useSpring(() => ({
    emissiveIntensity: 0,
    scale: 1,
    config: { tension: 200, friction: 18 },
  }), [])

  // Imperatively update spring targets each render (avoids re-creating the spring)
  hoverSpring.emissiveIntensity.start(isHovered && !anyExpanded ? 0.25 : 0)
  hoverSpring.scale.start(isHovered && !anyExpanded ? 1.04 : 1.0)

  // ── Expand / sibling springs ─────────────────────────────────────────────────
  const [expandSpring] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: { tension: 160, friction: 22 },
  }), [])

  expandSpring.scale.start(isExpanded ? 8 : 1)
  expandSpring.opacity.start(isSibling ? 0 : 1)

  // ── Sync emissive intensity each frame ───────────────────────────────────────
  useFrame(() => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = hoverSpring.emissiveIntensity.get()
      matRef.current.opacity = expandSpring.opacity.get()
    }
  })

  // ── Event handlers ───────────────────────────────────────────────────────────
  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!anyExpanded) {
      setHoveredNodeId(project.id)
      document.body.style.cursor = 'pointer'
    }
  }, [anyExpanded, setHoveredNodeId, project.id])

  const handlePointerOut = useCallback(() => {
    setHoveredNodeId(null)
    document.body.style.cursor = 'default'
  }, [setHoveredNodeId])

  const handleClick = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setHoveredNodeId(null)
    document.body.style.cursor = 'default'
    setExpandedNodeId(isExpanded ? null : project.id)
  }, [isExpanded, project.id, setHoveredNodeId, setExpandedNodeId])

  const handleClose = useCallback(() => setExpandedNodeId(null), [setExpandedNodeId])

  return (
    <animated.group position={position} scale={intro.scale}>
      <animated.group scale={expandSpring.scale}>
        <animated.group scale={hoverSpring.scale}>
          <RoundedBox
            args={[1, 1, 1]}
            radius={0.04}
            smoothness={4}
            castShadow
            receiveShadow
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            <meshStandardMaterial
              ref={matRef}
              map={diffuse}
              normalMap={normal}
              aoMap={ao}
              normalScale={new THREE.Vector2(0.4, 0.4)}
              color="#E8DDD0"
              roughness={0.85}
              metalness={0}
              emissive={new THREE.Color('#FFFFFF')}
              emissiveIntensity={0}
              transparent
            />
          </RoundedBox>

          {/* Glyph planes on each outer face */}
          {outerFaces.map((face) => {
            const cfg = FACE_CONFIG[face]
            const glyphTex = getGlyphTexture(project.category)
            return (
              <mesh
                key={face}
                position={cfg.normal.map((n) => n * GLYPH_OFFSET) as [number, number, number]}
                rotation={cfg.rotation}
              >
                <planeGeometry args={[0.7, 0.7]} />
                <meshStandardMaterial
                  map={glyphTex}
                  color="#FFFFFF"
                  roughness={0.3}
                  metalness={0}
                  emissive={new THREE.Color('#FFFFFF')}
                  emissiveIntensity={0.15}
                  transparent
                  alphaTest={0.05}
                />
              </mesh>
            )
          })}

          {/* 3D label — visible only when expanded */}
          {isExpanded && (
            <Text
              position={[0, 0.55, 0]}
              fontSize={0.09}
              color="#FFFFFF"
              maxWidth={0.9}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              {project.label}
            </Text>
          )}
        </animated.group>

        {/* Rich card rendered outside hover-scale group */}
        {isExpanded && (
          <ExpandedCard project={project} onClose={handleClose} />
        )}
      </animated.group>
    </animated.group>
  )
}
