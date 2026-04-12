import * as THREE from 'three'

// Canvas-generated textures for faces whose icons cannot be reliably loaded
// as static files (e.g. text logos that require a specific loaded web font).
// Values are factory functions called once; results are cached.
const _canvasCache = new Map<string, THREE.CanvasTexture>()

function makeRealEstateTexture(): THREE.CanvasTexture {
  // Square canvas so aspect = 1 always — plane scales uniformly, no distortion.
  const SIZE = 512
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  const fontSize = 72
  const fontNormal = `400 ${fontSize}px 'Instrument Serif', 'Times New Roman', serif`
  const fontItalic = `italic 400 ${fontSize}px 'Instrument Serif', 'Times New Roman', serif`
  const lineGap = Math.round(fontSize * 0.95)  // tight 0.95 leading

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Vertically centre the two-line block in the square canvas
  const y1 = 230
  const y2 = y1 + lineGap  // 298

  // Line 1: "Real" (blue) + italic "estate" (pink)
  ctx.font = fontNormal
  const wReal = ctx.measureText('Real').width
  ctx.font = fontItalic
  const wEstate = ctx.measureText('estate').width
  let x = (SIZE - (wReal + wEstate)) / 2

  ctx.font = fontNormal
  ctx.fillStyle = '#5aa9e6'
  ctx.fillText('Real', x, y1)
  x += wReal

  ctx.font = fontItalic
  ctx.fillStyle = '#ff6392'
  ctx.fillText('estate', x, y1)

  // Line 2: "Automation" (blue) + "." (yellow)
  ctx.font = fontNormal
  const wAuto = ctx.measureText('Automation').width
  const wDot  = ctx.measureText('.').width
  x = (SIZE - (wAuto + wDot)) / 2

  ctx.fillStyle = '#5aa9e6'
  ctx.fillText('Automation', x, y2)
  x += wAuto

  ctx.fillStyle = '#ffe45e'
  ctx.fillText('.', x, y2)

  return new THREE.CanvasTexture(canvas)
}

function makeQuizlioTexture(): THREE.CanvasTexture {
  const W = 512, H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Match Quizlio navbar: Inter 700, tracking-tight (-0.025em)
  const fontSize = 76
  ctx.font = `700 ${fontSize}px 'Inter', sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#1a1a1a'
  ctx.letterSpacing = `${-0.025 * fontSize}px`
  ctx.fillText('Quizlio', W / 2, 96)

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

export const FACE_CANVAS_ICONS: Record<string, () => THREE.CanvasTexture> = {
  '0--x': () => {
    if (!_canvasCache.has('0--x')) _canvasCache.set('0--x', makeRealEstateTexture())
    return _canvasCache.get('0--x')!
  },
  '1-+x': () => {
    if (!_canvasCache.has('1-+x')) _canvasCache.set('1-+x', makeQuizlioTexture())
    return _canvasCache.get('1-+x')!
  },
}

export const FACE_ICON_MAP: Record<string, string> = {
  '0--z': '/textures/icons/Souvenote_symbol.png',
  '0-+z': '/textures/icons/LiveBoard_symbol.png',
  '1-+y': '/textures/icons/sandSimulator_symbol.png',
  '1-+z': '/textures/icons/midpointFinder_symbol.png',
}

// Per-face size multipliers applied on top of the base TARGET (0.65)
export const FACE_ICON_SCALE: Record<string, number> = {
  '0--z': 1.8,      // Souvenote
  '1-+y': 1.25,     // Sand Simulator ×1.25
  '0-+z': 1.625,    // LiveBoard ×1.625
  '1-+z': 1.859375, // Midpoint ×2.1875 −15%
  '0--x': 1.2,      // Real Estate Automation — square canvas, two-line text logo
  '1-+x': 2.0,      // Quizlio — wide text logo
}

// Per-face [x, y] positional nudge in face-local units to correct for
// off-center content within the source PNG canvas
export const FACE_ICON_OFFSET: Record<string, [number, number]> = {
  '1-+z': [0, -0.055], // Midpoint pin sits in upper half of canvas; shift down
}

// Faces listed here render no drop shadow beneath their icon
export const FACE_ICON_NO_SHADOW = new Set<string>(['0--z', '0--x', '1-+x'])

// Per-face color tint applied to the icon mesh — use to adjust exposure/brightness
// Three.js multiplies the texture by this color, so #ffffff = full brightness
export const FACE_ICON_TINT: Record<string, string> = {
  '0--z': '#b3b3b3', // Souvenote: ~70% brightness (30% darkening)
}
