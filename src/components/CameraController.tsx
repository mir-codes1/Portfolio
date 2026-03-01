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

  // Default (unfocused) camera position — matches App.tsx initial camera
  const DEFAULT_POS    = new THREE.Vector3(3.6, 3.2, 4.5)
  const DEFAULT_LOOKAT = new THREE.Vector3(0, 0, 0)

  useEffect(() => {
    if (selectedFace) {
      const [nx, ny, nz] = selectedFace.worldNormal
      const [px, py, pz] = selectedFace.worldPos
      const faceDir = selectedFace.faceProject.faceDir
      const right = FACE_RIGHT[faceDir] ?? [1, 0, 0]

      // Camera sits directly in front of the clicked face
      targetPos.current.set(
        px + nx * FOCUS_DIST,
        py + ny * FOCUS_DIST,
        pz + nz * FOCUS_DIST,
      )
      // Shift lookAt so the node appears on the LEFT (x≈0.3) of the screen
      targetLookAt.current.set(
        px + right[0] * LOOKAT_SHIFT,
        py + right[1] * LOOKAT_SHIFT,
        pz + right[2] * LOOKAT_SHIFT,
      )
      isFocused.current = true
      if (controlsRef.current) controlsRef.current.enabled = false
    } else {
      // Return to default view
      targetPos.current.copy(DEFAULT_POS)
      targetLookAt.current.copy(DEFAULT_LOOKAT)
      isFocused.current = false
    }
  }, [selectedFace, controlsRef])

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
    const alpha = Math.min(1, delta * LERP_SPEED)

    camera.position.lerp(targetPos.current, alpha)
    currentLookAt.current.lerp(targetLookAt.current, alpha)
    camera.lookAt(currentLookAt.current)

    // Once back at default, re-enable OrbitControls
    if (!isFocused.current && controlsRef.current && !controlsRef.current.enabled) {
      const arrivedPos    = camera.position.distanceTo(DEFAULT_POS)    < 0.08
      const arrivedLook   = currentLookAt.current.distanceTo(DEFAULT_LOOKAT) < 0.08
      if (arrivedPos && arrivedLook) {
        controlsRef.current.enabled = true
      }
    }
  })

  return null
}
