import { useEffect, useRef, MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { usePortfolioStore } from '@/store/usePortfolioStore'

// Camera distance from the node face when focused
const FOCUS_DIST   = 3.4
// World-units to shift sideways so the node appears on the left
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

type CameraMode = 'idle' | 'focus'

interface Props {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
}

export function CameraController({ controlsRef }: Props) {
  const { camera } = useThree()
  const { selectedFace, setSelectedFace } = usePortfolioStore()

  // Lerp targets, updated when selectedFace changes
  const targetPos     = useRef(new THREE.Vector3(3.6, 3.2, 4.5))
  const targetLookAt  = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const mode          = useRef<CameraMode>('idle')

  const DEFAULT_POS    = new THREE.Vector3(3.6, 3.2, 4.5)
  const DEFAULT_LOOKAT = new THREE.Vector3(0, 0, 0)

  useEffect(() => {
    if (selectedFace) {
      const [nx, ny, nz] = selectedFace.worldNormal
      const [px, py, pz] = selectedFace.worldPos
      const faceDir = selectedFace.faceProject.faceDir
      const right = FACE_RIGHT[faceDir] ?? [1, 0, 0]

      const normal   = new THREE.Vector3(nx, ny, nz).normalize()
      const rightVec = new THREE.Vector3(right[0], right[1], right[2]).normalize()
      const focusPoint = new THREE.Vector3(px, py, pz)

      // Camera sits directly in front of the clicked face, with a sideways
      // offset so the node lands around the left-centre of the screen.
      targetPos.current
        .copy(focusPoint)
        .addScaledVector(normal, FOCUS_DIST)
        .addScaledVector(rightVec, LOOKAT_SHIFT)

      // Look straight at the centre of the node, and align camera "up"
      // with a stable world up so the sticker is never rolled.
      targetLookAt.current.copy(focusPoint)
      mode.current = 'focus'
    } else {
      // Immediately restore the default overview and relinquish control
      // back to OrbitControls so the user has full freedom.
      mode.current = 'idle'
      targetPos.current.copy(DEFAULT_POS)
      targetLookAt.current.copy(DEFAULT_LOOKAT)

      if (controlsRef.current) {
        controlsRef.current.reset()
      } else {
        camera.position.copy(DEFAULT_POS)
        camera.up.set(0, 1, 0)
        camera.lookAt(DEFAULT_LOOKAT)
      }
    }
  }, [selectedFace, camera, controlsRef])

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
    if (mode.current === 'idle') return

    const alpha = Math.min(1, delta * LERP_SPEED)

    camera.position.lerp(targetPos.current, alpha)
    currentLookAt.current.lerp(targetLookAt.current, alpha)
    camera.up.set(0, 1, 0)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
