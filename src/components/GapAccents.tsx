import { useMemo } from 'react'
import * as THREE from 'three'

const STEP = 1.06
const STRIP_LEN = 3.12  // total assembly span

const purpleMat = new THREE.MeshBasicMaterial({ color: '#7B68A0', side: THREE.DoubleSide })
const greenMat  = new THREE.MeshBasicMaterial({ color: '#5A8A6A', side: THREE.DoubleSide })
const redMat    = new THREE.MeshBasicMaterial({ color: '#A05555', side: THREE.DoubleSide })

// Internal seam positions (2 seams per axis, at ±0.53 from centre)
const seams = [-STEP / 2, STEP / 2]

export function GapAccents() {
  const strips = useMemo(() => {
    const result: { pos: [number, number, number]; rot: [number, number, number]; mat: THREE.MeshBasicMaterial }[] = []

    // X-seams (purple): planes at x = ±seam, spanning Y and Z
    seams.forEach((sx) => {
      result.push({
        pos: [sx, 0, 0],
        rot: [0, Math.PI / 2, 0],
        mat: purpleMat,
      })
    })

    // Y-seams (green): planes at y = ±seam, spanning X and Z
    seams.forEach((sy) => {
      result.push({
        pos: [0, sy, 0],
        rot: [Math.PI / 2, 0, 0],
        mat: greenMat,
      })
    })

    // Z-seams (red): planes at z = ±seam, spanning X and Y
    seams.forEach((sz) => {
      result.push({
        pos: [0, 0, sz],
        rot: [0, 0, 0],
        mat: redMat,
      })
    })

    return result
  }, [])

  return (
    <group>
      {strips.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          rotation={s.rot}
          material={s.mat}
          receiveShadow={false}
        >
          <planeGeometry args={[STRIP_LEN, STRIP_LEN]} />
        </mesh>
      ))}
    </group>
  )
}
