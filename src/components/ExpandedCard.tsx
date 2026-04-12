import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { FaceProject } from '@/data/projects'
import { CATEGORY_META, FACE_COLORS } from '@/data/projects'
import { GlowingEffect } from './ui/GlowingEffect'

interface ExpandedCardProps {
  project: FaceProject
  onClose: () => void
}

function calcPos(_el: THREE.Object3D, _cam: THREE.Camera, size: { width: number; height: number }) {
  const xRatio = size.width < 640 ? 0.5 : 0.74
  return [
    Math.round(size.width  * xRatio),
    Math.round(size.height * 0.5),
  ] as [number, number]
}

function Corner({ top, right, bottom, left }: { top?: string; right?: string; bottom?: string; left?: string }) {
  return (
    <div style={{
      position: 'absolute',
      top, right, bottom, left,
      color: 'rgba(255,255,255,0.28)',
      fontSize: '13px',
      lineHeight: 1,
      fontWeight: 300,
      pointerEvents: 'none',
      userSelect: 'none',
    }}>+</div>
  )
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '32px', height: '32px', flexShrink: 0,
      background: '#1c1c1c',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '7px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

const iconStroke = 'rgba(255,255,255,0.55)'
const iconProps = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: iconStroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function LiveIcon() {
  return (
    <svg {...iconProps}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}
function SoonIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

const fieldBox: React.CSSProperties = {
  background: '#0d0d0d',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '6px',
  padding: '7px 10px',
}
const fieldLabel: React.CSSProperties = {
  fontSize: '9px',
  color: 'rgba(255,255,255,0.4)',
  letterSpacing: '0.04em',
  marginBottom: '5px',
}

export function ExpandedCard({ project, onClose }: ExpandedCardProps) {
  const { status } = project
  const isPlaceholder = status === 'placeholder'
  const isWip = status === 'wip'
  const catMeta   = CATEGORY_META[project.category]
  const accentHex = FACE_COLORS[project.faceDir]

  return (
    <Html
      calculatePosition={calcPos}
      zIndexRange={[100, 0]}
      occlude={false}
    >
      <div style={{
        position: 'relative',
        width: 'clamp(220px, 21vw, 320px)',
        transform: 'translate(-50%, -50%)',
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '3px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}>
        <GlowingEffect spread={28} disabled={false} proximity={48} inactiveZone={0.01} borderWidth={1.5} />

        {/* Corner markers */}
        <Corner top="9px"    left="9px"  />
        <Corner top="9px"    right="9px" />
        <Corner bottom="9px" left="9px" />
        <Corner bottom="9px" right="9px"/>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '10px', right: '20px', zIndex: 2,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
            fontSize: '16px', lineHeight: 1, padding: 0,
          }}
          aria-label="Close"
        >×</button>

        {/* ── Two-panel row ── */}
        <div style={{ display: 'flex', minHeight: '180px', overflow: 'hidden', borderRadius: 'inherit' }}>

          {/* Left panel */}
          <div style={{ flex: '1 1 56%', padding: '20px 14px 20px 18px', display: 'flex', flexDirection: 'column' }}>

            {/* Category chip */}
            <span style={{
              display: 'inline-block', alignSelf: 'flex-start',
              fontSize: '8px', fontWeight: 700, letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: accentHex,
              background: `${accentHex}18`,
              border: `1px solid ${accentHex}40`,
              borderRadius: '3px',
              padding: '2px 6px',
              marginBottom: '8px',
            }}>
              {catMeta.name}
            </span>

            {/* Title */}
            <h2 style={{
              margin: '0 0 8px',
              fontSize: 'clamp(12px, 1.2vw, 17px)',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {project.label}
            </h2>

            {/* Description */}
            <p style={{
              margin: '0 0 14px',
              fontSize: 'clamp(9px, 0.72vw, 10.5px)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.42)',
              flexGrow: 1,
            }}>
              {project.description}
            </p>

            {/* Status row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <IconBox>{isPlaceholder || isWip ? <SoonIcon /> : <LiveIcon />}</IconBox>
              <div>
                <div style={{ fontWeight: 600, fontSize: '10px', lineHeight: 1.3 }}>Status</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '9px', marginTop: '1px' }}>
                  {isPlaceholder ? 'Coming soon' : isWip ? 'WIP' : 'Live'}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

          {/* Right panel */}
          <div style={{ flex: '0 0 44%', padding: '20px 16px 20px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Tech Stack */}
            <div>
              <div style={fieldLabel}>Tech Stack</div>
              <div style={{ ...fieldBox, minHeight: '36px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'flex-start' }}>
                {project.techTags.length > 0 ? project.techTags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '9px', color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '3px', padding: '2px 5px',
                  }}>{tag}</span>
                )) : (
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>—</span>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flexGrow: 1 }} />

            {/* CTA button */}
            {!isPlaceholder && !isWip && project.url !== '#' ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '34px',
                  background: 'rgba(235,235,235,0.9)',
                  color: '#111',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '10px', fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                View Project
              </a>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '34px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                fontSize: '10px', fontStyle: 'italic',
              }}>
                Coming Soon
              </div>
            )}
          </div>
        </div>
      </div>
    </Html>
  )
}
