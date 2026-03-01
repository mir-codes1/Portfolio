// SceneCard renders the ExpandedCard for the currently selected face.
// Lives at scene level (not inside the node mesh) so its Html element
// always uses fixed screen-space coordinates via calculatePosition.
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { ExpandedCard } from './ExpandedCard'

export function SceneCard() {
  const { selectedFace, setSelectedFace } = usePortfolioStore()
  if (!selectedFace) return null
  return (
    <ExpandedCard
      project={selectedFace.faceProject}
      onClose={() => setSelectedFace(null)}
    />
  )
}
