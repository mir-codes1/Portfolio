import { useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'
import type { SpringValue } from '@react-spring/three'
import * as THREE from 'three'

import type { FaceDirection } from '@/data/projects'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { FACE_ICON_SCALE, FACE_ICON_OFFSET } from '@/utils/faceIcons'

// ─── Per-face transform (group position + rotation in node-local space) ────────
// Local Z after rotation points outward (away from cube surface)

const FACE_TRANSFORM: Record<FaceDirection, { pos: [number, number, number]; rot: [number, number, number] }> = {
  '+x': { pos: [0.500, 0, 0],  rot: [0,  Math.PI / 2, 0] },
  '-x': { pos: [-0.500, 0, 0], rot: [0, -Math.PI / 2, 0] },
  '+y': { pos: [0, 0.500, 0],  rot: [-Math.PI / 2, 0, 0] },
  '-y': { pos: [0, -0.500, 0], rot: [ Math.PI / 2, 0, 0] },
  '+z': { pos: [0, 0, 0.500],  rot: [0, 0, 0]            },
  '-z': { pos: [0, 0, -0.500], rot: [0, Math.PI, 0]      },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FaceIconProps {
  faceDir: FaceDirection
  faceId: string
  iconPath: string
  springOpacity: SpringValue<number>
  scrollFade?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FaceIcon({ faceDir, faceId, iconPath, springOpacity, scrollFade = 0 }: FaceIconProps) {
  const texture = useLoader(THREE.TextureLoader, iconPath)

  const hoveredFaceId = usePortfolioStore(s => s.hoveredFaceId)
  const isHovered = hoveredFaceId === faceId

  const [glowSp] = useSpring(() => ({
    glow: 0,
    config: { tension: 200, friction: 20 },
  }), [])
  glowSp.glow.start(isHovered ? 1 : 0)

  const shadowRef = useRef<THREE.MeshBasicMaterial>(null)
  const iconRef   = useRef<THREE.MeshBasicMaterial>(null)
  const glowRef   = useRef<THREE.MeshBasicMaterial>(null)

  // Letter-box scale: fit inside TARGET units preserving aspect ratio
  const BASE_TARGET = 0.65
  const sizeMult = FACE_ICON_SCALE[faceId] ?? 1.0
  const TARGET = BASE_TARGET * sizeMult

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const scaleX = aspect >= 1 ? TARGET : TARGET * aspect
  const scaleY = aspect >= 1 ? TARGET / aspect : TARGET

  const { pos, rot } = FACE_TRANSFORM[faceDir]
  const [ox, oy] = FACE_ICON_OFFSET[faceId] ?? [0, 0]

  useFrame(() => {
    const baseOpacity = springOpacity.get() * (1 - scrollFade)
    const glow = glowSp.glow.get()

    if (shadowRef.current) shadowRef.current.opacity = 0.60 * baseOpacity
    if (iconRef.current)   iconRef.current.opacity   = baseOpacity
    if (glowRef.current)   glowRef.current.opacity   = glow * 0.4 * baseOpacity
  })

  return (
    <group position={pos} rotation={rot}>
      {/*
       * Drop shadow — directional offset (right + down in face-local space)
       * to create the illusion of the icon being raised off the surface.
       * Visible at the right and bottom edges even when viewed straight-on.
       */}
      <mesh position={[ox + 0.028, oy - 0.028, 0.004]} scale={[scaleX * 1.12, scaleY * 1.12, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={shadowRef}
          color="#0a0a0a"
          alphaMap={texture}
          transparent
          opacity={0.60}
          depthWrite={false}
        />
      </mesh>

      {/* Rim glow — white halo visible on hover */}
      <mesh position={[ox, oy, 0.019]} scale={[scaleX * 1.08, scaleY * 1.08, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={glowRef}
          color="white"
          alphaMap={texture}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Icon — full color PNG at raised height */}
      <mesh position={[ox, oy, 0.020]} scale={[scaleX, scaleY, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={iconRef}
          map={texture}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
