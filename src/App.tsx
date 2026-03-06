import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Analytics } from '@vercel/analytics/react'

import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { useAboutMeScroll } from '@/hooks/useAboutMeScroll'

import { AssemblyGroup } from '@/components/AssemblyGroup'
import { SceneLighting } from '@/components/SceneLighting'
import { CameraController } from '@/components/CameraController'
import { SceneCard } from '@/components/SceneCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PolkaDotBackground } from '@/components/PolkaDotBackground'
import { WelcomeTitle } from '@/components/WelcomeTitle'
import { CategoryLegend } from '@/components/CategoryLegend'
import { ScrollPrompt } from '@/components/ScrollPrompt'
import { SpotlightCursor } from '@/components/ui/SpotlightCursor'
import { AboutMeCard } from '@/components/AboutMeCard'
import { ScrollIndicator } from '@/components/ScrollIndicator'

// WelcomeTitle + CategoryLegend only — fades out early on scroll
function UIOverlay() {
  const selected       = usePortfolioStore(state => !!state.selectedFace)
  const scrollProgress = usePortfolioStore(state => state.scrollProgress)

  const opacity = scrollProgress > 0
    ? Math.max(0, 1 - scrollProgress * 4)
    : (selected ? 0 : 1)

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
      opacity,
      transition: scrollProgress > 0 ? 'none' : 'opacity 0.15s ease-out',
    }}>
      <WelcomeTitle />
      <CategoryLegend />
    </div>
  )
}

function SceneContent() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { selectedFace, isCameraReturning, isScrollMode } = usePortfolioStore()
  useIdleTimer()

  return (
    <>
      <SceneLighting />

      <Suspense fallback={<LoadingSpinner />}>
        <AssemblyGroup />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.55}
        dampingFactor={0.08}
        enableDamping
        enabled={!selectedFace && !isCameraReturning && !isScrollMode}
      />

      <CameraController controlsRef={controlsRef} />

      {/* Fixed-position rich card rendered outside node hierarchy */}
      <SceneCard />
    </>
  )
}

export default function App() {
  useAboutMeScroll()

  const scrollProgress = usePortfolioStore(state => state.scrollProgress)

  // ScrollPrompt stays visible through phase 1, fades as card appears
  const scrollPromptOpacity = scrollProgress > 1.3 ? 0 : 1

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#191919',
      cursor: 'default',
    }}>
      {/* Dots sit behind the canvas so they don't overlap the cube */}
      <PolkaDotBackground />
      <Canvas
        camera={{ position: [3.6, 3.2, 4.5], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        style={{ display: 'block', width: '100%', height: '100%', position: 'relative', zIndex: 0 }}
        shadows={false}
      >
        <SceneContent />
      </Canvas>
      <UIOverlay />
      {/* ScrollPrompt lives outside UIOverlay so it can stay visible longer */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        opacity: scrollPromptOpacity,
        transition: 'opacity 0.3s ease-out',
      }}>
        <ScrollPrompt />
      </div>
      <AboutMeCard />
      <ScrollIndicator />
      <SpotlightCursor config={{ radius: 120, brightness: 0.06, color: '#ffffff' }} />
      <Analytics />
    </div>
  )
}
