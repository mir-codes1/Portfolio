import { useState, useEffect } from 'react'

// 2×1×1 assembly: two nodes along X; bounding extent ~1.02 × 0.51 × 0.51.
const ASSEMBLY_RADIUS = 0.9

function computeScale(vw: number, vh: number): number {
  const minDim = Math.min(vw, vh)
  if (vw >= 1024) {
    // Desktop: assembly radius ≤ min(vw, vh) × 0.333 in screen space.
    // With FOV=45 and camera at z=8, 1 world unit ≈ vh/8 px (rough).
    // We just drive a world-space scale factor.
    return Math.min(1.1, minDim / 800)
  }
  // Tablet / mobile: occupy ~80 % of shortest dimension.
  // Target diameter in screen-space = minDim × 0.80.
  // Diameter in world units ≈ ASSEMBLY_RADIUS * 2 at scale 1.
  const targetWorldDiameter = (minDim * 0.80) / (vh / 8)
  return Math.max(0.4, Math.min(1.1, targetWorldDiameter / (ASSEMBLY_RADIUS * 2)))
}

let debounceTimer: ReturnType<typeof setTimeout>

export function useResponsiveScale(): number {
  const [scale, setScale] = useState(() =>
    computeScale(window.innerWidth, window.innerHeight)
  )

  useEffect(() => {
    function handleResize() {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        setScale(computeScale(window.innerWidth, window.innerHeight))
      }, 100)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(debounceTimer)
    }
  }, [])

  return scale
}
