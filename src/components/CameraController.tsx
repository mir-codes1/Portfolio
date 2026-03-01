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

type CameraMode = 'idle' | 'focus' | 'return'

interface Props {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
}

export function CameraController({ controlsRef }: Props) {
  const { camera } = useThree()
  const { selectedFace, setSelectedFace } = usePortfolioStore()

  // Lerp targets, updated when selectedFace changes
  const targetPos     = useRef(new THREE.Vector3(3.6, 3.2, 4.5))
  const targetLookAt  = useRef(new THREE.Vector3(0, 0, 0))
  const targetUp      = useRef(new THREE.Vector3(0, 1, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentUp     = useRef(new THREE.Vector3(0, 1, 0))
  const mode          = useRef<CameraMode>('idle')

  const DEFAULT_POS    = new THREE.Vector3(3.6, 3.2, 4.5)
  const DEFAULT_LOOKAT = new THREE.Vector3(0, 0, 0)
  const DEFAULT_UP     = new THREE.Vector3(0, 1, 0)

  useEffect(() => {
    if (selectedFace) {
      const [nx, ny, nz] = selectedFace.worldNormal
      const [px, py, pz] = selectedFace.worldPos
      const faceDir = selectedFace.faceProject.faceDir
      const right = FACE_RIGHT[faceDir] ?? [1, 0, 0]

      const normal   = new THREE.Vector3(nx, ny, nz).normalize()
      const rightVec = new THREE.Vector3(right[0], right[1], right[2]).normalize()
      const upVec    = new THREE.Vector3().crossVectors(normal, rightVec).normalize()
      const focusPoint = new THREE.Vector3(px, py, pz)

      // Camera sits directly in front of the clicked face, with a sideways
      // offset so the node lands around the left-centre of the screen.
      targetPos.current
        .copy(focusPoint)
        .addScaledVector(normal, FOCUS_DIST)
        .addScaledVector(rightVec, LOOKAT_SHIFT)

      // Look straight at the centre of the node, and align camera "up"
      // with the face's up so the sticker is never tilted.
      targetLookAt.current.copy(focusPoint)
      targetUp.current.copy(upVec)
      mode.current = 'focus'
    } else {
      // Return smoothly to the default overview when deselecting.
      targetPos.current.copy(DEFAULT_POS)
      targetLookAt.current.copy(DEFAULT_LOOKAT)
      targetUp.current.copy(DEFAULT_UP)
      mode.current = 'return'
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
    if (mode.current === 'idle') return

    const alpha = Math.min(1, delta * LERP_SPEED)

    camera.position.lerp(targetPos.current, alpha)
    currentLookAt.current.lerp(targetLookAt.current, alpha)
    currentUp.current.lerp(targetUp.current, alpha)

    camera.up.copy(currentUp.current)
    camera.lookAt(currentLookAt.current)

    if (mode.current === 'return') {
      const arrivedPos  = camera.position.distanceTo(DEFAULT_POS) < 0.05
      const arrivedLook = currentLookAt.current.distanceTo(DEFAULT_LOOKAT) < 0.05
      if (arrivedPos && arrivedLook) {
        mode.current = 'idle'
      }
    }
  })

  return null
}
