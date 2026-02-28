import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, SSAO } from '@react-three/postprocessing'

import { usePortfolioStore } from '@/store/usePortfolioStore'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { AssemblyGroup } from '@/components/AssemblyGroup'
import { SceneLighting } from '@/components/SceneLighting'
import { GapAccents } from '@/components/GapAccents'
import { CameraController } from '@/components/CameraController'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const USE_SSAO = window.devicePixelRatio >= 1.5

function SceneContent() {
  const { isIdle, expandedNodeId } = usePortfolioStore()
  useIdleTimer()

  return (
    <>
      <color attach="background" args={['#1A0505']} />

      <SceneLighting />

      <Suspense fallback={<LoadingSpinner />}>
        <AssemblyGroup />
        <GapAccents />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.6}
        dampingFactor={0.08}
        enableDamping
        autoRotate={isIdle && !expandedNodeId}
        autoRotateSpeed={0.4}
        enabled={!expandedNodeId}
        makeDefault
      />

      <CameraController />

      {USE_SSAO && (
        <EffectComposer>
          <SSAO
            radius={0.4}
            intensity={30}
            luminanceInfluence={0.6}
            bias={0.035}
            worldDistanceThreshold={1}
            worldDistanceFalloff={0.1}
            worldProximityThreshold={0.5}
            worldProximityFalloff={0.1}
          />
        </EffectComposer>
      )}
    </>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        shadows
        style={{ display: 'block' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
