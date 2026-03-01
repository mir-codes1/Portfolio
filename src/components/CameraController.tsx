import { useEffect, useRef, MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { usePortfolioStore } from '@/store/usePortfolioStore'

// Camera distance from the node face when focused
const FOCUS_DIST   = 3.4
// World-units to shift lookAt right → node appears at roughly x ≈ 0.3 of screen
const LOOKAT_SHIFT = 0.85
// Lerp speed (higher = snappier)
const LERP_SPEED   = 5

// Right vector for each face direction (camera's rightward axis when facing that face)
const FACE_RIGHT: Record<string, [number, number, number]> = {
  '+z': [ 1, 0,  0],
  '-z': [-1, 0,  0],
  '+x': [ 0, 0, -1],
  '-x': [ 0, 0,  1],
  '+y': [ 1, 0,  0],
  '-y': [-1, 0,  0],
}

interface Props {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
}

export function CameraController({ controlsRef }: Props) {
  const { camera } = useThree()
  const { selectedFace, setSelectedFace } = usePortfolioStore()

  // Lerp targets, updated when selectedFace changes
  const targetPos    = useRef(new THREE.Vector3(4, 3.5, 5))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const isFocused = useRef(false)

  useEffect(() => {
    if (selectedFace) {
      const [nx, ny, nz] = selectedFace.worldNormal
      const [px, py, pz] = selectedFace.worldPos
      const faceDir = selectedFace.faceProject.faceDir
      const right = FACE_RIGHT[faceDir] ?? [1, 0, 0]
      const normal = new THREE.Vector3(nx, ny, nz).normalize()
      const rightVec = new THREE.Vector3(right[0], right[1], right[2]).normalize()
      const focusPoint = new THREE.Vector3(px, py, pz)

      // Camera sits directly in front of the clicked face, with a sideways
      // offset so the node lands around the left-centre of the screen.
      targetPos.current
        .copy(focusPoint)
        .addScaledVector(normal, FOCUS_DIST)
        .addScaledVector(rightVec, LOOKAT_SHIFT)

      // Always look at the centre of the selected node so it stays vertically centred.
      targetLookAt.current.copy(focusPoint)
      isFocused.current = true
    } else {
      isFocused.current = false
    }
  }, [selectedFace])

  // Escape key to deselect
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedFace(null)
        document.body.style.cursor = 'default'
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelectedFace])

  useFrame((_, delta) => {
    if (!isFocused.current) return

    const alpha = Math.min(1, delta * LERP_SPEED)

    camera.position.lerp(targetPos.current, alpha)
    currentLookAt.current.lerp(targetLookAt.current, alpha)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
