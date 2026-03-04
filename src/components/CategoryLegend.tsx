import { useState, useEffect } from 'react'

const ICON_SIZE = 30

const iconStyle = (gradient: string): React.CSSProperties => ({
  width: ICON_SIZE,
  height: ICON_SIZE,
  borderRadius: '7px',
  flexShrink: 0,
  background: gradient,
})

const categories = [
  {
    label: 'Web App',
    textGradient: 'linear-gradient(to right, #f77a00, #c06000, #f77a00, #914800, #f77a00)',
    animDuration: '9s',
    animDelay: '0s',
    icon: iconStyle('conic-gradient(from 90deg, rgb(255, 121, 0) 0%, rgb(204, 97, 0) 50%, rgb(153, 73, 0) 100%)'),
  },
  {
    label: 'Game Engine',
    textColor: '#e6e6eb',
    animDuration: '11s',
    animDelay: '-3s',
    icon: iconStyle('conic-gradient(from 90deg, rgb(232, 232, 237) 0%, rgb(182, 182, 186) 50%, rgb(132, 132, 135) 100%)'),
  },
  {
    label: 'Math',
    textGradient: 'linear-gradient(to right, #fa0b08, #c00806, #fa0b08, #940705, #fa0b08)',
    animDuration: '10s',
    animDelay: '-6s',
    icon: iconStyle('conic-gradient(from 90deg, rgb(255, 11, 8) 0%, rgb(204, 9, 6) 50%, rgb(153, 7, 5) 100%)'),
  },
  {
    label: 'ML',
    textGradient: 'linear-gradient(to right, #3dda50, #28a836, #3dda50, #20742a, #3dda50)',
    animDuration: '12s',
    animDelay: '-2s',
    icon: iconStyle('conic-gradient(from 90deg, rgb(9, 148, 26) 0%, rgb(6, 97, 17) 50%, rgb(4, 72, 13) 75%, rgb(3, 46, 8) 100%)'),
  },
  {
    label: 'App',
    textGradient: 'linear-gradient(to right, #8aa1ff, #5570ff, #8aa1ff, #3059ff, #8aa1ff)',
    animDuration: '10.5s',
    animDelay: '-5s',
    icon: iconStyle('conic-gradient(from 90deg, rgb(0, 50, 255) 0%, rgb(0, 40, 204) 50%, rgb(0, 30, 153) 100%)'),
  },
  {
    label: 'Physics',
    textGradient: 'linear-gradient(to right, #9c56db, #7a30c0, #9c56db, #4d1083, #9c56db)',
    animDuration: '13s',
    animDelay: '-8s',
    icon: iconStyle('conic-gradient(from 90deg, rgb(117, 24, 199) 0%, rgb(87, 18, 148) 50%, rgb(57, 12, 97) 100%)'),
  },
]

const ANIM_START_MS = 150   // delay before first label starts
const STAGGER_MS   = 75     // gap between each label
const SLIDE_DUR    = 300    // each label slide duration (ms)

const css = `
@keyframes legendGradientWave {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes labelSlideIn {
  from { transform: translateX(120%); }
  to   { transform: translateX(0); }
}
@keyframes iconFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`

const ICON_FADE_DUR = 350   // ms
const ICON_STAGGER  = 55    // ms between each icon

export function CategoryLegend() {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setStarted(true), ANIM_START_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <style>{css}</style>
      <div style={{
        position: 'absolute',
        right: '3.35vw',
        top: '68%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        pointerEvents: 'none',
      }}>
        {categories.map(({ label, textGradient, textColor, icon, animDuration, animDelay }, index) => {
          const delay = `${index * STAGGER_MS}ms`
          const slideAnim = `labelSlideIn ${SLIDE_DUR}ms cubic-bezier(0.16,1,0.3,1) ${delay} both`

          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', justifyContent: 'flex-end' }}>
              {/* Label — overflow clip so text slides in from the icon side */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontFamily: "'Kantumruy Pro', sans-serif",
                  fontWeight: 100,
                  fontSize: '1.2vw',
                  lineHeight: 1.45,
                  textAlign: 'right',
                  // Pre-animation: keep hidden via transform
                  transform: started ? undefined : 'translateX(120%)',
                  ...(textGradient
                    ? {
                        background: textGradient,
                        backgroundSize: '300% 100%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: started
                          ? `legendGradientWave ${animDuration} ease-in-out ${animDelay} infinite, ${slideAnim}`
                          : `legendGradientWave ${animDuration} ease-in-out ${animDelay} infinite`,
                      }
                    : {
                        color: textColor,
                        animation: started ? slideAnim : undefined,
                      }),
                }}>
                  {label}
                </div>
              </div>
              {/* Icon — fades in sequentially on load */}
              <div style={{
                ...icon,
                transform: 'rotate(90deg)',
                boxShadow: '2px 3px 8px rgba(0,0,0,0.5), 1px 1px 3px rgba(0,0,0,0.35)',
                animation: `iconFadeIn ${ICON_FADE_DUR}ms ease-out ${index * ICON_STAGGER}ms both`,
              }} />
            </div>
          )
        })}
      </div>
    </>
  )
}
