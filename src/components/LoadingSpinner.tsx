import { Html } from '@react-three/drei'

export function LoadingSpinner() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: '#E8DDD0',
        fontFamily: 'monospace',
        fontSize: '14px',
        letterSpacing: '0.1em',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(232, 221, 208, 0.2)',
          borderTop: '2px solid #E8DDD0',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span>Loading</span>
      </div>
    </Html>
  )
}
