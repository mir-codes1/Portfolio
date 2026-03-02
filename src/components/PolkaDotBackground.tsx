import { useMemo } from 'react'

const DOT_SPACING = 48   // halved density (was 24)
const DOT_SIZE = 1.5
const DOT_OPACITY = 0.055  // more transparent
// Dots fade from full visibility in center to transparent toward edges
const FADE_INNER = '35%'  // full visibility within this radius
const FADE_OUTER = '85%'  // fully faded by this radius

export function PolkaDotBackground() {
  const style = useMemo(() => {
    const size = DOT_SPACING
    const dot = `radial-gradient(circle at center, rgba(255,255,255,${DOT_OPACITY}) ${DOT_SIZE}px, transparent ${DOT_SIZE + 0.5}px)`
    return {
      position: 'absolute' as const,
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none' as const,
      backgroundImage: dot,
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: '0 0',
      maskImage: `radial-gradient(ellipse 100% 100% at 50% 50%, black ${FADE_INNER}, transparent ${FADE_OUTER})`,
      WebkitMaskImage: `radial-gradient(ellipse 100% 100% at 50% 50%, black ${FADE_INNER}, transparent ${FADE_OUTER})`,
    }
  }, [])

  return <div style={style} aria-hidden />
}
