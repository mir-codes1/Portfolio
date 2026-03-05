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

// World-up reference used to derive the camera right/up vectors from the face normal
const WORLD_UP = new THREE.Vector3(0, 1, 0)

const DEFAULT_POS    = new THREE.Vector3(3.6, 3.2, 4.5)
const DEFAULT_LOOKAT = new THREE.Vector3(0, 0, 0)
const DEFAULT_UP     = new THREE.Vector3(0, 1, 0)

const SCROLL_TARGET_POS    = new THREE.Vector3(0, 0.3, 3.5)
const SCROLL_TARGET_LOOKAT = new THREE.Vector3(0, 0, 0)

type CameraMode = 'idle' | 'focus' | 'return'

interface Props {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
}

export function CameraController({ controlsRef }: Props) {
  const { camera } = useThree()
  const { selectedFace, setSelectedFace, setIsCameraReturning } = usePortfolioStore()

  const targetPos     = useRef(new THREE.Vector3(3.6, 3.2, 4.5))
  const targetLookAt  = useRef(new THREE.Vector3(0, 0, 0))
  const targetUp      = useRef(new THREE.Vector3(0, 1, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentUp     = useRef(new THREE.Vector3(0, 1, 0))
  const mode          = useRef<CameraMode>('idle')

  // Captured camera state at the moment scrolling begins — so we always
  // lerp FROM wherever the camera actually is, not from a hardcoded default.
  const scrollOriginPos    = useRef<THREE.Vector3 | null>(null)
  const scrollOriginLookAt = useRef<THREE.Vector3 | null>(null)

  useEffect(() => {
    if (selectedFace) {
      const [nx, ny, nz] = selectedFace.worldNormal
      const [px, py, pz] = selectedFace.worldPos
      const [ux, uy, uz] = selectedFace.worldFaceUp

      const normal = new THREE.Vector3(nx, ny, nz).normalize()

      // Derive right from world-up × normal so the camera shift is always
      // horizontal, regardless of how much the cube has auto-rotated.
      const rightVec = new THREE.Vector3().crossVectors(WORLD_UP, normal)
      if (rightVec.lengthSq() < 0.001) {
        // Normal is nearly parallel to worldUp (top/bottom face) — use X fallback
        rightVec.set(1, 0, 0)
      }
      rightVec.normalize()

      // Use the world-space face-up captured at click time so the camera "up"
      // always matches the icon's actual orientation (critical for top/bottom faces
      // when the cube has auto-rotated to an arbitrary angle).
      const upVec = new THREE.Vector3(ux, uy, uz)
      const focusPoint = new THREE.Vector3(px, py, pz)

      targetPos.current
        .copy(focusPoint)
        .addScaledVector(normal, FOCUS_DIST)
        .addScaledVector(rightVec, LOOKAT_SHIFT)

      targetLookAt.current.copy(focusPoint)
      targetUp.current.copy(upVec)
      mode.current = 'focus'
      if (controlsRef.current) controlsRef.current.enabled = false
    } else {
      // Animate camera back to default overview so zoom returns to normal.
      targetPos.current.copy(DEFAULT_POS)
      targetLookAt.current.copy(DEFAULT_LOOKAT)
      targetUp.current.copy(DEFAULT_UP)
      mode.current = 'return'
      setIsCameraReturning(true)
    }
  }, [selectedFace, setIsCameraReturning, controlsRef])

  // Escape key to deselect
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (usePortfolioStore.getState().isScrollMode) return
      setSelectedFace(null)
      document.body.style.cursor = 'default'
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelectedFace])

  useFrame((_, delta) => {
    const scrollProgress = usePortfolioStore.getState().scrollProgress
    if (scrollProgress > 0 && mode.current === 'idle') {
      // Imperatively cut OrbitControls off immediately — don't wait for the
      // React prop update, which arrives 1-2 frames late and causes damping jitter.
      if (controlsRef.current?.enabled) controlsRef.current.enabled = false

      // Capture the camera's actual position the first frame scroll begins
      if (!scrollOriginPos.current) {
        scrollOriginPos.current    = camera.position.clone()
        scrollOriginLookAt.current = currentLookAt.current.clone()
      }
      const p = Math.min(scrollProgress, 1)
      const smooth = p * p * (3 - 2 * p)
      camera.position.lerpVectors(scrollOriginPos.current, SCROLL_TARGET_POS, smooth)
      currentLookAt.current.lerpVectors(scrollOriginLookAt.current!, SCROLL_TARGET_LOOKAT, smooth)
      camera.lookAt(currentLookAt.current)
      return
    }

    // Reset captured origin once scroll returns to 0
    if (scrollProgress === 0 && scrollOriginPos.current) {
      scrollOriginPos.current    = null
      scrollOriginLookAt.current = null
    }

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
        setIsCameraReturning(false)
      }
    }
  })

  return null
}
