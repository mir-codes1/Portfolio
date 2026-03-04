import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useResponsiveScale } from '@/hooks/useResponsiveScale'
import { GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z, ALL_FACE_DIRS, type FaceDirection } from '@/data/projects'
import { mirGradientTarget, FACE_VIVID_RGB } from '@/utils/mirColors'
import { CubeNode } from './CubeNode'

// Face normals in local space (allocated once, reused every frame)
const _FACE_NORMALS: Record<FaceDirection, THREE.Vector3> = {
  '+x': new THREE.Vector3( 1,  0,  0),
  '-x': new THREE.Vector3(-1,  0,  0),
  '+y': new THREE.Vector3( 0,  1,  0),
  '-y': new THREE.Vector3( 0, -1,  0),
  '+z': new THREE.Vector3( 0,  0,  1),
  '-z': new THREE.Vector3( 0,  0, -1),
}
const _tmpCamDir = new THREE.Vector3()
const _tmpN = new THREE.Vector3()

const STEP = 0.99  // nodeSize (1.0) + gap (0.0075), halved
const HALF_X = (GRID_SIZE_X - 1) / 2
const HALF_Y = (GRID_SIZE_Y - 1) / 2
const HALF_Z = (GRID_SIZE_Z - 1) / 2

interface NodeDef {
  gridX: number
  gridY: number
  gridZ: number
  nodeIndex: number
  position: [number, number, number]
}

function buildGrid(): NodeDef[] {
  const nodes: NodeDef[] = []
  for (let z = 0; z < GRID_SIZE_Z; z++) {
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      for (let x = 0; x < GRID_SIZE_X; x++) {
        const nodeIndex = x + y * GRID_SIZE_X + z * GRID_SIZE_X * GRID_SIZE_Y
        nodes.push({
          gridX: x, gridY: y, gridZ: z,
          nodeIndex,
          position: [
            (x - HALF_X) * STEP,
            (y - HALF_Y) * STEP,
            (z - HALF_Z) * STEP,
          ],
        })
      }
    }
  }
  return nodes
}

const GRID = buildGrid()

// Diagonal idle rotation speeds (rad/s)
const ROT_Y_SPEED = 0.28
const ROT_X_AMP   = 0.18   // amplitude of X oscillation (radians)
const ROT_X_FREQ  = 0.18   // Hz

export function AssemblyGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const idleTime  = useRef(0)   // accumulates while rotating
  const rotWeight = useRef(0)   // 0 = static, 1 = full rotation; lerped for smooth in/out
  const { isIdle, selectedFace, setSelectedFace } = usePortfolioStore()
  const scale = useResponsiveScale()

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Lerp weight toward 1 when idle, toward 0 when active/selected
    const target = (isIdle && !selectedFace) ? 1 : 0
    const lerpSpeed = target > rotWeight.current ? 1.8 : 2.8   // ease in slower, ease out faster
    rotWeight.current += (target - rotWeight.current) * Math.min(delta * lerpSpeed, 1)

    const w = rotWeight.current
    if (w > 0.0001) {
      idleTime.current += delta
      groupRef.current.rotation.y += delta * ROT_Y_SPEED * w
      groupRef.current.rotation.x  =
        Math.sin(idleTime.current * ROT_X_FREQ * Math.PI * 2) * ROT_X_AMP * w
    }
    // Reset phase only once fully stopped so next ramp-in starts clean
    if (target === 0 && w < 0.001) {
      idleTime.current = 0
    }

    // Compute the 3 most camera-facing faces and expose their colors for WelcomeTitle.
    // Use the live camera position so manual orbit rotation updates the gradient too.
    const q = groupRef.current.quaternion
    _tmpCamDir.copy(state.camera.position).normalize()
    const scored: Array<{ dot: number; dir: FaceDirection }> = []
    for (const dir of ALL_FACE_DIRS) {
      _tmpN.copy(_FACE_NORMALS[dir]).applyQuaternion(q)
      const dot = _tmpN.dot(_tmpCamDir)
      if (dot > 0) scored.push({ dot, dir })
    }
    scored.sort((a, b) => b.dot - a.dot)
    for (let i = 0; i < 3 && i < scored.length; i++) {
      const rgb = FACE_VIVID_RGB[scored[i].dir]
      mirGradientTarget[i][0] = rgb[0]
      mirGradientTarget[i][1] = rgb[1]
      mirGradientTarget[i][2] = rgb[2]
    }
  })

  function handleMissed() {
    if (selectedFace) {
      setSelectedFace(null)
      document.body.style.cursor = 'default'
    }
  }

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} onPointerMissed={handleMissed}>
      {GRID.map((node) => (
        <CubeNode
          key={node.nodeIndex}
          nodeIndex={node.nodeIndex}
          gridX={node.gridX}
          gridY={node.gridY}
          gridZ={node.gridZ}
          position={node.position}
        />
      ))}
    </group>
  )
}
