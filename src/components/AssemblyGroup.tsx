import { useMemo } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useResponsiveScale } from '@/hooks/useResponsiveScale'
import { PROJECTS } from '@/data/projects'
import { CubeNode } from './CubeNode'

const STEP = 1.06  // nodeSize (1.0) + gap (0.06)

interface NodeDef {
  gridX: number
  gridY: number
  gridZ: number
  nodeIndex: number
  position: [number, number, number]
}

function buildGrid(): NodeDef[] {
  const nodes: NodeDef[] = []
  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const nodeIndex = x + y * 3 + z * 9
        nodes.push({
          gridX: x,
          gridY: y,
          gridZ: z,
          nodeIndex,
          position: [
            (x - 1) * STEP,
            (y - 1) * STEP,
            (z - 1) * STEP,
          ],
        })
      }
    }
  }
  return nodes
}

const GRID = buildGrid()

export function AssemblyGroup() {
  const scale = useResponsiveScale()
  const { expandedNodeId, setExpandedNodeId } = usePortfolioStore()

  // Build a project lookup indexed by nodeIndex
  const projectMap = useMemo(() => {
    const map = new Map<number, (typeof PROJECTS)[0]>()
    PROJECTS.forEach((p) => map.set(p.nodeIndex, p))
    return map
  }, [])

  function handleMissed() {
    if (expandedNodeId) {
      setExpandedNodeId(null)
      document.body.style.cursor = 'default'
    }
  }

  return (
    <group scale={[scale, scale, scale]} onPointerMissed={handleMissed}>
      {GRID.map((node) => {
        const project = projectMap.get(node.nodeIndex)
        if (!project) return null
        return (
          <CubeNode
            key={node.nodeIndex}
            gridX={node.gridX}
            gridY={node.gridY}
            gridZ={node.gridZ}
            position={node.position}
            project={project}
          />
        )
      })}
    </group>
  )
}
