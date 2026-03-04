import { useState, useEffect, useRef } from 'react'

const STYLE_ID = 'cursor-follower-keyframes'

const css = `
@keyframes rainbowBreath {
  0%   { box-shadow: 0 0 3px 1px hsla(0,   65%, 68%, 0.2);  border-color: hsla(0,   65%, 68%, 0.35); }
  25%  { box-shadow: 0 0 10px 2px hsla(90,  65%, 68%, 0.6);  border-color: hsla(90,  65%, 68%, 0.8); }
  50%  { box-shadow: 0 0 3px 1px hsla(180, 65%, 68%, 0.2);  border-color: hsla(180, 65%, 68%, 0.35); }
  75%  { box-shadow: 0 0 10px 2px hsla(270, 65%, 68%, 0.6);  border-color: hsla(270, 65%, 68%, 0.8); }
  100% { box-shadow: 0 0 3px 1px hsla(360, 65%, 68%, 0.2);  border-color: hsla(360, 65%, 68%, 0.35); }
}
`

export function CursorFollower() {
  const mousePosition = useRef({ x: 0, y: 0 })
  const dotPosition = useRef({ x: 0, y: 0 })
  const borderDotPosition = useRef({ x: 0, y: 0 })
  const [renderPos, setRenderPos] = useState({ dot: { x: 0, y: 0 }, border: { x: 0, y: 0 } })
  const [isHovering, setIsHovering] = useState(false)
  const [isRainbow, setIsRainbow] = useState(false)

  const DOT_SMOOTHNESS = 0.2
  const BORDER_DOT_SMOOTHNESS = 0.1

  useEffect(() => {
    // Inject keyframe styles once
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = css
      document.head.appendChild(style)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    // Rainbow: detect hover on any [data-cursor-rainbow] element
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-cursor-rainbow]')) {
        setIsRainbow(true)
      }
    }
    const handleMouseOut = (e: MouseEvent) => {
      const to = e.relatedTarget as HTMLElement | null
      if (!to?.closest('[data-cursor-rainbow]')) {
        setIsRainbow(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mouseout', handleMouseOut)

    const interactiveElements = document.querySelectorAll('a, button, img, input, textarea, select')
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      dotPosition.current.x = lerp(dotPosition.current.x, mousePosition.current.x, DOT_SMOOTHNESS)
      dotPosition.current.y = lerp(dotPosition.current.y, mousePosition.current.y, DOT_SMOOTHNESS)
      borderDotPosition.current.x = lerp(borderDotPosition.current.x, mousePosition.current.x, BORDER_DOT_SMOOTHNESS)
      borderDotPosition.current.y = lerp(borderDotPosition.current.y, mousePosition.current.y, BORDER_DOT_SMOOTHNESS)

      setRenderPos({
        dot: { x: dotPosition.current.x, y: dotPosition.current.y },
        border: { x: borderDotPosition.current.x, y: borderDotPosition.current.y },
      })
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mouseout', handleMouseOut)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      cancelAnimationFrame(animationId)
    }
  }, [])

  const ringSize = isRainbow ? '52px' : isHovering ? '44px' : '28px'

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* Small filled dot */}
      <div style={{
        position: 'absolute',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'white',
        transform: 'translate(-50%, -50%)',
        left: `${renderPos.dot.x}px`,
        top: `${renderPos.dot.y}px`,
      }} />

      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        width: ringSize,
        height: ringSize,
        borderRadius: '50%',
        border: '1px solid white',
        transform: 'translate(-50%, -50%)',
        left: `${renderPos.border.x}px`,
        top: `${renderPos.border.y}px`,
        transition: 'width 0.3s, height 0.3s',
        animation: isRainbow ? 'rainbowBreath 3.5s ease-in-out infinite' : 'none',
      }} />
    </div>
  )
}
