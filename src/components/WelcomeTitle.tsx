import { useEffect, useRef } from 'react'
import { mirGradientTarget } from '@/utils/mirColors'

// ── Timing constants ───────────────────────────────────────────────────────────
// (1) "Hi there! I'm"  — quick slide from left
const T1_DELAY = '0.1s'
const T1_DUR   = '0.25s'
const T1_EASE  = 'cubic-bezier(0.16, 1, 0.3, 1)'

// (2) "Mir"            — slow, dramatic slide from left
const T2_DELAY = '0.32s'
const T2_DUR   = '0.7s'
const T2_EASE  = 'cubic-bezier(0.4, 0, 0.2, 1)'

// (2b) comma           — appears with Mir
const TC_DELAY = '0.32s'

// (3) "a Full Stack Developer." — starts when Mir finishes
const T3_DELAY = '1.02s'
const T3_DUR   = '0.4s'
const T3_EASE  = 'cubic-bezier(0.16, 1, 0.3, 1)'

const css = `
@keyframes titleSlideInLeft {
  from { transform: translateX(-110%); }
  to   { transform: translateX(0); }
}
@keyframes mirSlideInLeft {
  from { transform: translateX(-110%); }
  to   { transform: translateX(0); }
}
@keyframes commaAppear {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes developerSlideDown {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}
`

export function WelcomeTitle() {
  const mirPRef = useRef<HTMLParagraphElement>(null)

  // Smoothly interpolated RGB values — updated via RAF, no React re-renders
  const currentRGB = useRef<[[number,number,number],[number,number,number],[number,number,number]]>([
    [...mirGradientTarget[0]],
    [...mirGradientTarget[1]],
    [...mirGradientTarget[2]],
  ])

  useEffect(() => {
    const LERP = 0.03
    let rafId: number
    function tick() {
      const curr = currentRGB.current
      let dirty = false
      for (let i = 0; i < 3; i++) {
        for (let ch = 0; ch < 3; ch++) {
          const diff = mirGradientTarget[i][ch] - curr[i][ch]
          if (Math.abs(diff) > 0.05) {
            curr[i][ch] += diff * LERP
            dirty = true
          }
        }
      }
      if (dirty && mirPRef.current) {
        const [c0, c1, c2] = curr
        mirPRef.current.style.backgroundImage =
          `linear-gradient(to bottom, ` +
          `rgb(${Math.round(c0[0])},${Math.round(c0[1])},${Math.round(c0[2])}) 0%, ` +
          `rgb(${Math.round(c1[0])},${Math.round(c1[1])},${Math.round(c1[2])}) 50%, ` +
          `rgb(${Math.round(c2[0])},${Math.round(c2[1])},${Math.round(c2[2])}) 100%)`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div style={{ lineHeight: 0, fontStyle: 'normal', position: 'relative', width: '100%', height: '100%' }}>
      <style>{css}</style>

      {/* Text layer — no outer overflow:hidden needed; body overflow:hidden clips off-screen slide animations */}
      <div style={{
        transform: 'translateY(-50%)',
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        height: 'auto',
        left: '2.7vw',
        fontSize: '0px',
        color: 'white',
        top: '19.2vh',
        width: 'clamp(220px, 32.188vw, 560px)',
        whiteSpace: 'pre-wrap',
        pointerEvents: 'none',
      }}>
        {/* (1) "Hi there! I'm" — quick slide from left */}
        <p style={{
          fontFamily: "'Marcellus', serif",
          margin: 0,
          animation: `titleSlideInLeft ${T1_DUR} ${T1_EASE} ${T1_DELAY} both`,
        }}>
          <span style={{ lineHeight: 0, fontSize: 'clamp(14px, 1.68vw, 28px)', letterSpacing: '0.33em' }}>Hi there!</span>
          <span style={{ lineHeight: 0, fontSize: 'clamp(13px, 1.68vw, 28px)', letterSpacing: '0.32em' }}>{`  `}</span>
          <span style={{ lineHeight: 0, fontSize: 'clamp(13px, 1.563vw, 26px)', letterSpacing: '0.16em' }}>I'm</span>
        </p>

        {/* Spacer line (positions "Mir" space) + comma + developer text */}
        <p style={{ margin: 0 }}>
          {/* Spacer — invisible, just creates vertical space for "Mir" */}
          <span style={{ fontFamily: "'Kaisei Opti', sans-serif", lineHeight: 1.45, fontStyle: 'normal', fontSize: 'clamp(26px, 3.125vw, 52px)' }}>{`        `}</span>

          {/* Comma — appears with Mir */}
          <span style={{
            fontFamily: "'Kosugi Maru', sans-serif",
            lineHeight: 1.45,
            fontStyle: 'normal',
            fontSize: 'clamp(17px, 2.102vw, 36px)',
            animation: `commaAppear 0.15s ease ${TC_DELAY} both`,
          }}>,</span>

          <span style={{ lineHeight: 1.45, fontSize: 'clamp(14px, 1.823vw, 30px)' }}>
            <br aria-hidden="true" />
          </span>

          {/* (3) "a Software Developer." — clip wrapper gives real height for translateY(-100%) */}
          <span style={{ display: 'block', overflow: 'hidden', lineHeight: 'clamp(12px, 1.4vw, 24px)' }}>
            <span style={{
              display: 'block',
              lineHeight: 'clamp(12px, 1.4vw, 24px)',
              animation: `developerSlideDown ${T3_DUR} ${T3_EASE} ${T3_DELAY} both`,
              fontFamily: "'Jura', sans-serif",
              fontWeight: 100,
              fontSize: 'clamp(12px, 1.4vw, 24px)',
              color: '#c8c8c8',
            }}>a Software Developer.</span>
          </span>
        </p>
      </div>

      {/* (2) Gradient "Mir" — slow dramatic slide from left */}
      <div style={{
        transform: 'translateY(-50%)',
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Kaisei Opti', sans-serif",
        fontWeight: 700,
        height: 'auto',
        left: '2.7vw',
        fontSize: 'clamp(26px, 3.125vw, 52px)',
        top: '19.5vh',
        width: 'clamp(220px, 32.188vw, 560px)',
        pointerEvents: 'auto',
      }}>
        {/* Tight clip wrapper — exactly the width of "Mir" text */}
        <div style={{ overflow: 'hidden', width: 'fit-content' }}>
          <p
            ref={mirPRef}
            data-cursor-rainbow="true"
            style={{
              lineHeight: 1.45,
              margin: 0,
              width: 'fit-content',
              backgroundImage: `linear-gradient(to bottom, rgb(${mirGradientTarget[0].join(',')}) 0%, rgb(${mirGradientTarget[1].join(',')}) 50%, rgb(${mirGradientTarget[2].join(',')}) 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              animation: `mirSlideInLeft ${T2_DUR} ${T2_EASE} ${T2_DELAY} both`,
            }}
          >Mir</p>
        </div>
      </div>
    </div>
  )
}
