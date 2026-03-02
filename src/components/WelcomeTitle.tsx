import { useState, useEffect } from 'react'

const titleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'clamp(1.5rem, 4vw, 2.5rem)',
  left: 'clamp(1.5rem, 4vw, 2.5rem)',
  margin: 0,
  fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "San Francisco", sans-serif',
  fontWeight: 700,
  fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
  color: '#f5f5f7',
  letterSpacing: '-0.02em',
  textShadow: '0 0 24px rgba(255,255,255,0.25), 0 0 48px rgba(255,255,255,0.12)',
  opacity: 0,
  transition: 'opacity 1.2s ease-out',
  zIndex: 1,
  pointerEvents: 'none',
}

export function WelcomeTitle() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(id)
  }, [])

  return (
    <h1 style={{ ...titleStyle, opacity: visible ? 1 : 0 }}>
      Hi There!
    </h1>
  )
}
