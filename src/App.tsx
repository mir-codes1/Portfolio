import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { AssemblyGroup } from '@/components/AssemblyGroup'
import { SceneLighting } from '@/components/SceneLighting'
import { CameraController } from '@/components/CameraController'
import { SceneCard } from '@/components/SceneCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PolkaDotBackground } from '@/components/PolkaDotBackground'
import { WelcomeTitle } from '@/components/WelcomeTitle'

function SceneContent() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { selectedFace, isCameraReturning } = usePortfolioStore()
  useIdleTimer()

  return (
    <>
      {/* No opaque background so polka dots behind the canvas show through */}
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
        enabled={!selectedFace && !isCameraReturning}
      />

      <CameraController controlsRef={controlsRef} />

      {/* Fixed-position rich card rendered outside node hierarchy */}
      <SceneCard />
    </>
  )
}

export default function App() {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#111111',
    }}>
      {/* Dots sit behind the canvas so they don’t overlap the cube */}
      <PolkaDotBackground />
      <Canvas
        camera={{ position: [3.6, 3.2, 4.5], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        style={{ display: 'block', width: '100%', height: '100%', position: 'relative', zIndex: 0 }}
        shadows={false}
      >
        <SceneContent />
      </Canvas>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <WelcomeTitle />
      </div>
    </div>
  )
}
