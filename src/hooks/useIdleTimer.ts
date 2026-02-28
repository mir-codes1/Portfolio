import { useEffect, useRef } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

const IDLE_DELAY = 4000

export function useIdleTimer() {
  const setIdle = usePortfolioStore((s) => s.setIdle)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function reset() {
      setIdle(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIdle(true), IDLE_DELAY)
    }

    reset() // start timer immediately

    window.addEventListener('pointerdown', reset)
    window.addEventListener('pointermove', reset)

    return () => {
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('pointermove', reset)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [setIdle])
}
