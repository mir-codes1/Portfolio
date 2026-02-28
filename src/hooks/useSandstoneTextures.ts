import { useMemo } from 'react'
import * as THREE from 'three'
import {
  createSandstoneTexture,
  createFlatNormalMap,
  createFlatAOMap,
} from '@/utils/proceduralTextures'

// Procedural textures are created once and reused
let cachedDiffuse: THREE.CanvasTexture | null = null
let cachedNormal: THREE.CanvasTexture | null = null
let cachedAO: THREE.CanvasTexture | null = null

export function useProceduralSandstoneTextures() {
  return useMemo(() => {
    if (!cachedDiffuse) cachedDiffuse = createSandstoneTexture(512)
    if (!cachedNormal)  cachedNormal  = createFlatNormalMap(512)
    if (!cachedAO)      cachedAO      = createFlatAOMap(512)
    return [cachedDiffuse, cachedNormal, cachedAO] as const
  }, [])
}
