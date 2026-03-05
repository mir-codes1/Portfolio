import { Download } from 'lucide-react'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { faceScreenRect } from '@/utils/faceScreenRect'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// Final card dimensions at checkpoint 2
const END_WIDTH      = 860
const END_LEFT_WIDTH = 310   // left photo panel — square (310×310)
const END_HEIGHT     = 310   // = END_LEFT_WIDTH so photo is a perfect square

export function AboutMeCard() {
  const scrollProgress = usePortfolioStore(s => s.scrollProgress)

  if (scrollProgress <= 0.95) return null

  const p2      = Math.max(0, Math.min(1, scrollProgress - 1))
  const smoothP2 = p2 * p2 * (3 - 2 * p2)

  // Fade in 0.95→1.0 to avoid pop-in
  const mountOpacity = Math.min(1, (scrollProgress - 0.95) / 0.05)

  // ── Start = projected cube face screen rect ───────────────────────────────
  const startLeft   = faceScreenRect.valid ? faceScreenRect.left   : window.innerWidth  / 2 - 200
  const startTop    = faceScreenRect.valid ? faceScreenRect.top    : window.innerHeight / 2 - 110
  const startWidth  = faceScreenRect.valid ? faceScreenRect.width  : 400
  const startHeight = faceScreenRect.valid ? faceScreenRect.height : 200

  // ── End = centered final card ─────────────────────────────────────────────
  const endLeft = (window.innerWidth  - END_WIDTH)  / 2
  const endTop  = (window.innerHeight - END_HEIGHT) / 2

  // ── Interpolated geometry ─────────────────────────────────────────────────
  const width        = lerp(startWidth,  END_WIDTH,      smoothP2)
  const height       = lerp(startHeight, END_HEIGHT,     smoothP2)
  const left         = lerp(startLeft,   endLeft,        smoothP2)
  const top          = lerp(startTop,    endTop,         smoothP2)
  const borderRadius = lerp(4, 14, smoothP2)

  // Left panel: starts at 50% of card width (matches left cube face), ends at 220px
  const leftWidth = lerp(width * 0.5, END_LEFT_WIDTH, smoothP2)

  // ── Silver background ─────────────────────────────────────────────────────
  // p2=0: flat silver matching the cube face (#F5F5F7)
  // p2=1: polished silver gradient with slight depth
  const flatSilver     = 'rgba(245,245,247,1)'
  const richBackground = 'linear-gradient(135deg, #f8f9fb 0%, #e9eaee 55%, #d4d6dc 100%)'
  const background     = smoothP2 < 0.01 ? flatSilver : richBackground

  const shadowAlpha = lerp(0, 0.18, smoothP2)
  const boxShadow   = `0 8px 32px rgba(0,0,0,${shadowAlpha.toFixed(3)}), 0 1px 4px rgba(0,0,0,0.06)`
  const borderColor = `rgba(${Math.round(lerp(200, 170, smoothP2))}, ${Math.round(lerp(200, 175, smoothP2))}, ${Math.round(lerp(200, 185, smoothP2))}, ${lerp(0.4, 0.85, smoothP2).toFixed(2)})`

  return (
    <div
      aria-hidden={scrollProgress < 2}
      style={{
        position:   'fixed',
        left,
        top,
        width,
        height,
        borderRadius,
        background,
        boxShadow,
        border:        '1px solid rgba(255,255,255,0.6)',
        display:       'flex',
        overflow:      'hidden',
        zIndex:        10,
        opacity:       mountOpacity,
        pointerEvents: scrollProgress >= 2 ? 'auto' : 'none',
        boxSizing:     'border-box',
      }}
    >
      {/* ── Left panel — square profile photo ──────────────────────────────── */}
      <div style={{
        width:      leftWidth,
        flexShrink: 0,
        overflow:   'hidden',
        position:   'relative',
      }}>
        <img
          src="/profile.png"
          alt="Profile photo"
          style={{
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: 'center top',
            display:        'block',
          }}
        />
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div style={{
        width:      1,
        flexShrink: 0,
        background: `rgba(160,165,175,${lerp(0.15, 0.35, smoothP2).toFixed(2)})`,
      }} />

      {/* ── Right panel — About Me content ─────────────────────────────────── */}
      <div style={{
        flex:          1,
        padding:       '24px 28px',
        display:       'flex',
        flexDirection: 'column',
        gap:           12,
        opacity:       smoothP2,
        overflow:      'hidden',
      }}>
        <h2 style={{
          margin:      0,
          fontFamily:  'Marcellus, serif',
          fontWeight:  400,
          fontSize:    22,
          color:       '#111111',
          lineHeight:  1.2,
        }}>
          About Me
        </h2>

        <p style={{
          margin:     0,
          fontFamily: 'Jura, sans-serif',
          fontWeight: 200,
          fontSize:   13,
          color:      '#3a3a3e',
          lineHeight: 1.7,
          flex:       1,
          overflow:   'hidden',
        }}>
          Hey! I'm a 2nd-year Computer Science student at York University who
          loves turning ideas into interactive experiences. From simulating
          physics to building real-time collaborative tools, I enjoy projects
          where code meets creativity. Whether it's a falling-sand playground
          or a geographic midpoint finder, I'm always exploring what browsers
          can do. Currently leveling up in full-stack development and always
          looking for the next fun problem to solve.
        </p>

        {/* Resume button */}
        <a
          href="./resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            alignSelf:      'flex-start',
            display:        'flex',
            alignItems:     'center',
            gap:            5,
            padding:        '7px 16px',
            background:     '#1e1e28',
            border:         '1px solid rgba(0,0,0,0.12)',
            borderRadius:   20,
            color:          'rgba(255,255,255,0.88)',
            fontFamily:     'Jura, sans-serif',
            fontWeight:     400,
            fontSize:       12,
            cursor:         'pointer',
            letterSpacing:  '0.4px',
            textDecoration: 'none',
          }}
        >
          <Download size={12} />
          Resume
        </a>
      </div>
    </div>
  )
}
