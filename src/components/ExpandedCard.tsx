import { Html } from '@react-three/drei'
import type { Project } from '@/data/projects'
import { CATEGORY_META } from '@/data/projects'

interface ExpandedCardProps {
  project: Project
  onClose: () => void
}

export function ExpandedCard({ project, onClose }: ExpandedCardProps) {
  const isPlaceholder = project.label === 'Project Placeholder'
  const meta = project.category ? CATEGORY_META[project.category] : null

  return (
    <Html
      center
      style={{ pointerEvents: 'all' }}
      zIndexRange={[100, 0]}
    >
      <div
        style={{
          width: '280px',
          background: 'rgba(10, 0, 0, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          userSelect: 'none',
        }}
      >
        {/* Close hint */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          {meta && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: meta.colour,
              background: `${meta.colour}22`,
              border: `1px solid ${meta.colour}44`,
              borderRadius: '4px',
              padding: '2px 8px',
            }}>
              {meta.name}
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              padding: '0 0 0 8px',
              marginLeft: 'auto',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 10px',
          fontSize: '18px',
          fontWeight: 700,
          lineHeight: 1.3,
          color: '#ffffff',
        }}>
          {project.label}
        </h2>

        {/* Description */}
        <p style={{
          margin: '0 0 16px',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.6)',
        }}>
          {project.description}
        </p>

        {/* Tech tags */}
        {project.techTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {project.techTags.map((tag) => (
              <span key={tag} style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
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

        {/* Visit link — hidden for placeholders */}
        {!isPlaceholder && project.url !== '#' && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffffff',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '8px 16px',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)' }}
          >
            Visit Project →
          </a>
        )}

        {isPlaceholder && (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, fontStyle: 'italic' }}>
            Coming soon
          </p>
        )}

        {/* Escape hint */}
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: '16px 0 0', textAlign: 'center' }}>
          Press Esc or click background to close
        </p>
      </div>
    </Html>
  )
}
