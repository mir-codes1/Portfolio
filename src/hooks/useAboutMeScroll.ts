import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

export function useAboutMeScroll() {
  const setScrollProgress = usePortfolioStore(s => s.setScrollProgress)

  useEffect(() => {
    let progress = 0

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      // Don't hijack scroll while a project card is open
      if (usePortfolioStore.getState().selectedFace) return
      progress = Math.max(0, Math.min(2, progress + e.deltaY / 600))
      setScrollProgress(progress)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [setScrollProgress])
}
