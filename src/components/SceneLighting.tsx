export function SceneLighting() {
  return (
    <>
      <directionalLight
        position={[2, 8, 4]}
        intensity={3.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-radius={4}
      />
      <ambientLight intensity={0.6} color="#FFE8D0" />
      <pointLight position={[-4, 2, -4]} intensity={0.8} color="#C0A8FF" />
    </>
  )
}
