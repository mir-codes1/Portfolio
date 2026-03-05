import { create } from 'zustand'
import type { FaceProject } from '@/data/projects'

export interface SelectedFace {
  faceProject:  FaceProject
  worldPos:     [number, number, number]   // node centre in world space
  worldNormal:  [number, number, number]   // face normal in world space
  worldFaceUp:  [number, number, number]   // icon "up" direction in world space
}

interface PortfolioStore {
  hoveredFaceId:       string | null
  selectedFace:        SelectedFace | null
  isIdle:              boolean
  isCameraReturning:   boolean
  scrollProgress:      number
  isScrollMode:        boolean

  setHoveredFaceId:     (id: string | null) => void
  setSelectedFace:     (face: SelectedFace | null) => void
  setIdle:             (idle: boolean) => void
  setIsCameraReturning: (v: boolean) => void
  setScrollProgress:   (p: number) => void
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  hoveredFaceId:     null,
  selectedFace:      null,
  isIdle:            true,
  isCameraReturning: false,
  scrollProgress:    0,
  isScrollMode:      false,

  setHoveredFaceId:      (id)   => set({ hoveredFaceId: id }),
  setSelectedFace:       (face) => set({ selectedFace: face }),
  setIdle:               (idle) => set({ isIdle: idle }),
  setIsCameraReturning:  (v)    => set({ isCameraReturning: v }),
  setScrollProgress:     (p)    => set({ scrollProgress: p, isScrollMode: p > 0 }),
}))
