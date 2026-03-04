import { useEffect, useRef } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

const IDLE_DELAY = 2000  // Resume auto-rotate 2s after last interaction

// Idle is reset only when the user *drags* (pointer-down + move),
// not on every pointer event, so stationary hovering doesn't reset it.
export function useIdleTimer() {
  const setIdle  = usePortfolioStore((s) => s.setIdle)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragging = useRef(false)

  useEffect(() => {
    function startTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIdle(true), IDLE_DELAY)
    }

    function onDown() {
      dragging.current = true
      setIdle(false)
      startTimer()
    }

    function onMove() {
      if (!dragging.current) return
      setIdle(false)
      startTimer()
    }

    function onUp() {
      dragging.current = false
      startTimer()
    }

    startTimer()

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
      window.removeEventListener('pointercancel', onUp)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [setIdle])
}
