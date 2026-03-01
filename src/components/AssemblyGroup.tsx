import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useResponsiveScale } from '@/hooks/useResponsiveScale'
import { GRID_SIZE } from '@/data/projects'
import { CubeNode } from './CubeNode'

const STEP = 1.015   // nodeSize (1.0) + gap (0.015)
const HALF = (GRID_SIZE - 1) / 2   // 0.5 — centres the assembly at origin

interface NodeDef {
  gridX: number
  gridY: number
  gridZ: number
  nodeIndex: number
  position: [number, number, number]
}

function buildGrid(): NodeDef[] {
  const nodes: NodeDef[] = []
  for (let z = 0; z < GRID_SIZE; z++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        nodes.push({
          gridX: x, gridY: y, gridZ: z,
          nodeIndex: x + y * GRID_SIZE + z * GRID_SIZE * GRID_SIZE,
          position: [
            (x - HALF) * STEP,
            (y - HALF) * STEP,
            (z - HALF) * STEP,
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
