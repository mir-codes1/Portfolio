import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

// Handles Escape key to collapse any expanded node.
// Background click is handled in AssemblyGroup via onPointerMissed on the Canvas.
export function CameraController() {
  const { expandedNodeId, setExpandedNodeId } = usePortfolioStore()

  useEffect(() => {
    if (!expandedNodeId) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setExpandedNodeId(null)
        document.body.style.cursor = 'default'
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expandedNodeId, setExpandedNodeId])

  return null
}
