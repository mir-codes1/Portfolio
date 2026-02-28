import * as THREE from 'three'

// Generates a sandstone-like grain texture procedurally.
// Used as a fallback when Poly Haven texture files are not present.
export function createSandstoneTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base warm off-white
  ctx.fillStyle = '#E8DDD0'
  ctx.fillRect(0, 0, size, size)

  // Grain layer — small random speckles
  for (let i = 0; i < size * size * 0.4; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 1.2
    const v = Math.floor(200 + Math.random() * 55)
    const a = Math.random() * 0.15
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${v},${v - 10},${v - 20},${a})`
    ctx.fill()
  }

  // Subtle horizontal striations
  for (let y = 0; y < size; y += Math.random() * 8 + 2) {
    const a = Math.random() * 0.04
    ctx.fillStyle = `rgba(160,140,120,${a})`
    ctx.fillRect(0, y, size, 1)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Generates a simple flat normal map (pointing straight out — no bump).
export function createFlatNormalMap(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  // Neutral normal (0.5, 0.5, 1.0) in RGB = (128, 128, 255)
  ctx.fillStyle = 'rgb(128,128,255)'
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Generates a flat white AO map (no occlusion — used when real AO isn't loaded).
export function createFlatAOMap(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
