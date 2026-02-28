import * as THREE from 'three'
import type { CategoryId } from '@/data/projects'

// Lucide icon paths as SVG path data (simplified, stroke-based)
// We render them to an offscreen canvas and return a Three.js CanvasTexture.

const ICON_PATHS: Record<CategoryId | 'default', string> = {
  // Brain (ML)
  ml: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>`,

  // Code2 (Website Tools)
  tools: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m18 16 4-4-4-4"/>
    <path d="m6 8-4 4 4 4"/>
    <path d="m14.5 4-5 16"/>
  </svg>`,

  // Sigma (Mathematical Curiosities)
  math: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a1 1 0 0 1 0 1.2l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>
  </svg>`,

  // Atom (Physics)
  physics: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
    <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
  </svg>`,

  // LayoutGrid (Apps)
  apps: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/>
    <rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>`,

  // Gamepad2 (Game Development)
  games: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="6" x2="10" y1="12" y2="12"/>
    <line x1="8" x2="8" y1="10" y2="14"/>
    <line x1="15" x2="15.01" y1="13" y2="13"/>
    <line x1="18" x2="18.01" y1="11" y2="11"/>
    <rect width="20" height="12" x="2" y="6" rx="2"/>
  </svg>`,

  // Diamond (default / unassigned)
  default: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/>
  </svg>`,
}

const textureCache = new Map<string, THREE.CanvasTexture>()

function svgToTexture(svgString: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Transparent background
  ctx.clearRect(0, 0, size, size)

  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()

  const texture = new THREE.CanvasTexture(canvas)

  img.onload = () => {
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
    URL.revokeObjectURL(url)
    texture.needsUpdate = true
  }
  img.src = url

  return texture
}

export function getGlyphTexture(category: CategoryId | null): THREE.CanvasTexture {
  const key = category ?? 'default'
  if (textureCache.has(key)) return textureCache.get(key)!

  const svgPath = ICON_PATHS[key as CategoryId] ?? ICON_PATHS.default
  const texture = svgToTexture(svgPath)
  textureCache.set(key, texture)
  return texture
}

export function disposeGlyphTextures() {
  textureCache.forEach((t) => t.dispose())
  textureCache.clear()
}
