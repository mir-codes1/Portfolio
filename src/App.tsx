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

function SceneContent() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { selectedFace } = usePortfolioStore()
  useIdleTimer()

  return (
    <>
      {/* Scene background */}
      <color attach="background" args={['#111111']} />

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
        enabled={!selectedFace}
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
      width: '100vw',
      height: '100vh',
      background: '#111111',
    }}>
      <Canvas
        // High-angle corner view: see top, front, and right faces simultaneously
        camera={{ position: [3.6, 3.2, 4.5], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ display: 'block', width: '100%', height: '100%' }}
        // No shadows needed with flat lighting
        shadows={false}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
