import { usePortfolioStore } from '@/store/usePortfolioStore'

export function ScrollPrompt() {
  const selectedFace = usePortfolioStore(s => s.selectedFace)

  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      pointerEvents: 'none',
      opacity: selectedFace ? 0 : 1,
      transition: 'opacity 0.3s ease',
    }}>
      {/* Label */}
      <div style={{
        maxWidth: 343,
        width: '90vw',
        fontFamily: 'Jura',
        fontStyle: 'normal',
        fontWeight: 200,
        fontSize: 16,
        lineHeight: '21px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.59)',
      }}>
        scroll down to learn about me!
      </div>

      {/* Down arrow — shrunk 35% from original 26×38 */}
      <svg width="17" height="25" viewBox="0 0 26 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="13" y1="0" x2="13" y2="30" stroke="#CECECE" strokeWidth="2"/>
        <polyline points="3,20 13,32 23,20" fill="none" stroke="#CECECE" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
