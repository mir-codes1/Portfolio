import { usePortfolioStore } from '@/store/usePortfolioStore'

const DOT_SPACING = 48
const DOT_SIZE = 1.5

export function PolkaDotBackground() {
  const scrollProgress = usePortfolioStore(s => s.scrollProgress)

  const p = Math.min(scrollProgress, 1)
  const dotOpacity = 0.09 + p * 0.18        // 0.09 → 0.27
  const fadeInner  = `${30 + p * 50}%`      // 30% → 80%
  const fadeOuter  = `${50 + p * 50}%`      // 50% → 100%

  const dot = `radial-gradient(circle at center, rgba(255,255,255,${dotOpacity.toFixed(3)}) ${DOT_SIZE}px, transparent ${DOT_SIZE + 0.5}px)`

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: dot,
        backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
        backgroundPosition: '0 0',
        maskImage: `radial-gradient(ellipse 100% 100% at 50% 50%, black ${fadeInner}, transparent ${fadeOuter})`,
        WebkitMaskImage: `radial-gradient(ellipse 100% 100% at 50% 50%, black ${fadeInner}, transparent ${fadeOuter})`,
      }}
    />
  )
}
