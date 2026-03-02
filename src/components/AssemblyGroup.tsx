import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useResponsiveScale } from '@/hooks/useResponsiveScale'
import { GRID_SIZE_X, GRID_SIZE_Y, GRID_SIZE_Z } from '@/data/projects'
import { CubeNode } from './CubeNode'

const STEP = 1.0075  // nodeSize (1.0) + gap (0.0075), halved
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
  const idleTime = useRef(0)   // accumulates time while idle
  const { isIdle, selectedFace, setSelectedFace } = usePortfolioStore()
  const scale = useResponsiveScale()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (isIdle && !selectedFace) {
      idleTime.current += delta
      groupRef.current.rotation.y += delta * ROT_Y_SPEED
      groupRef.current.rotation.x  =
        Math.sin(idleTime.current * ROT_X_FREQ * Math.PI * 2) * ROT_X_AMP
    } else if (!isIdle) {
      // Reset oscillation phase when user is active so there's no jump on resume
      idleTime.current = 0
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
