import { usePortfolioStore } from '@/store/usePortfolioStore'

const LINE_HEIGHT  = 140   // px — height of the track
const SQUARE_SIZE  = 8     // px — side length of the thumb square

export function ScrollIndicator() {
  const scrollProgress = usePortfolioStore(s => s.scrollProgress)
  const selectedFace   = usePortfolioStore(s => s.selectedFace)

  // Square center travels from 0 (top) to LINE_HEIGHT (bottom)
  const thumbCenter = (scrollProgress / 2) * LINE_HEIGHT
  // Keep the square fully inside the line
  const thumbTop    = Math.max(0, Math.min(LINE_HEIGHT - SQUARE_SIZE, thumbCenter - SQUARE_SIZE / 2))

  // Hide while a project card is open; dim when at rest (no scroll yet)
  const opacity = selectedFace
    ? 0
    : scrollProgress > 0 ? 1 : 0.35

  return (
    <div
      aria-hidden
      style={{
        position:       'fixed',
        left:           28,
        top:            '50%',
        transform:      'translateY(-50%)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        zIndex:         5,
        pointerEvents:  'none',
        opacity,
        transition:     'opacity 0.4s ease',
      }}
    >
      {/* Track */}
      <div style={{
        position:     'relative',
        width:        1.5,
        height:       LINE_HEIGHT,
        background:   'rgba(255,255,255,0.28)',
        borderRadius: 1,
      }}>
        {/* Thumb */}
        <div style={{
          position:  'absolute',
          left:      '50%',
          top:       thumbTop,
          transform: 'translateX(-50%)',
          width:     SQUARE_SIZE,
          height:    SQUARE_SIZE,
          border:    '1.5px solid rgba(255,255,255,0.9)',
          background:'rgba(255,255,255,0.15)',
          transition:'top 0.05s linear',
        }} />
      </div>
    </div>
  )
}
