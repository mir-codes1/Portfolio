import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { FaceProject } from '@/data/projects'
import { CATEGORY_META, FACE_COLORS } from '@/data/projects'

interface ExpandedCardProps {
  project: FaceProject
  onClose: () => void
}

// The card is always rendered at a fixed screen-space position regardless of
// where the 3D node sits. calculatePosition overrides drei's projection.
// Target: horizontal centre of card at x=0.8 (80 % from left), y=0.5 (vertical centre).
function calcPos(_el: THREE.Object3D, _cam: THREE.Camera, size: { width: number; height: number }) {
  return [
    Math.round(size.width  * 0.8),
    Math.round(size.height * 0.5),
  ] as [number, number]
}

export function ExpandedCard({ project, onClose }: ExpandedCardProps) {
  const isPlaceholder = project.label === 'Project Placeholder'
  const catMeta  = CATEGORY_META[project.category]
  const accentHex = FACE_COLORS[project.faceDir]

  return (
    <Html
      calculatePosition={calcPos}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: 'all' }}
      // Prevent Html from being occluded by 3D geometry
      occlude={false}
    >
      <div style={{
        width: 'clamp(240px, 28vw, 340px)',
        transform: 'translate(-50%, -50%)',  // centre the card on the calculated point
        background: 'rgba(8, 6, 14, 0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${accentHex}44`,
        borderRadius: '14px',
        padding: 'clamp(16px, 2vw, 26px)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${accentHex}22`,
        userSelect: 'none',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: accentHex,
            background: `${accentHex}20`,
            border: `1px solid ${accentHex}55`,
            borderRadius: '4px',
            padding: '3px 9px',
          }}>
            {catMeta.name}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer', fontSize: '20px', lineHeight: 1,
              padding: '0 0 0 10px',
            }}
            aria-label="Close"
          >×</button>
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 10px',
          fontSize: 'clamp(14px, 1.4vw, 18px)',
          fontWeight: 700,
          lineHeight: 1.3,
          color: '#ffffff',
        }}>
          {project.label}
        </h2>

        {/* Description */}
        <p style={{
          margin: '0 0 16px',
          fontSize: 'clamp(11px, 1vw, 13px)',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.55)',
        }}>
          {project.description}
        </p>

        {/* Tech tags */}
        {project.techTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {project.techTags.map((tag) => (
              <span key={tag} style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '4px',
                padding: '2px 8px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Visit link (hidden for placeholders or missing URLs) */}
        {!isPlaceholder && project.url !== '#' && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 600,
              color: '#ffffff',
              background: `${accentHex}33`,
              border: `1px solid ${accentHex}66`,
              borderRadius: '7px',
              padding: '8px 16px',
              textDecoration: 'none',
            }}
          >
            Visit Project →
          </a>
        )}

        {isPlaceholder && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, fontStyle: 'italic' }}>
            Coming soon
          </p>
        )}

        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', margin: '14px 0 0', textAlign: 'center' }}>
          Esc or click background to close
        </p>
      </div>
    </Html>
  )
}
