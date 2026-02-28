import { create } from 'zustand'

type CameraState = 'idle' | 'transitioning'

interface PortfolioStore {
  hoveredNodeId: string | null
  expandedNodeId: string | null
  cameraState: CameraState
  isIdle: boolean

  setHoveredNodeId: (id: string | null) => void
  setExpandedNodeId: (id: string | null) => void
  setCameraState: (state: CameraState) => void
  setIdle: (idle: boolean) => void
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  hoveredNodeId: null,
  expandedNodeId: null,
  cameraState: 'idle',
  isIdle: false,

  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setExpandedNodeId: (id) => set({ expandedNodeId: id }),
  setCameraState: (state) => set({ cameraState: state }),
  setIdle: (idle) => set({ isIdle: idle }),
}))
