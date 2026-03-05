// ─── Types ────────────────────────────────────────────────────────────────────

export type FaceDirection = '+x' | '-x' | '+y' | '-y' | '+z' | '-z'
export type CategoryId    = 'ml' | 'tools' | 'math' | 'physics' | 'apps' | 'games'

export type ProjectStatus = 'live' | 'wip' | 'placeholder'

export interface FaceProject {
  id: string                   // `${nodeIndex}-${faceDir}`
  nodeIndex: number            // 0–1 (2×1×1 grid)
  faceDir: FaceDirection
  category: CategoryId
  label: string
  description: string
  techTags: string[]
  url: string
  status: ProjectStatus
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Grid is 2×1×1: two nodes along X. 2-sided categories: tools, physics, math, games. 1-sided: ML, Apps.
export const GRID_SIZE_X = 2
export const GRID_SIZE_Y = 1
export const GRID_SIZE_Z = 1
export const GRID_TOTAL = GRID_SIZE_X * GRID_SIZE_Y * GRID_SIZE_Z

// Per-face colours (one colour per world face direction)
export const FACE_COLORS: Record<FaceDirection, string> = {
  '+x': '#0A2A43',
  '-x': '#18D1C1',
  '+y': '#7A3EF1',
  '-y': '#E043A5',
  '+z': '#D9A441',
  '-z': '#C9D1D9',
}

// Face → category. +x/-x = 1-sided (Apps, ML). +y/-y/+z/-z = 2-sided (Physics, Math, Website Tools, Game Development).
export const FACE_CATEGORY: Record<FaceDirection, CategoryId> = {
  '+x': 'apps',
  '-x': 'ml',
  '+y': 'physics',
  '-y': 'math',
  '+z': 'tools',
  '-z': 'games',
}

export const CATEGORY_META: Record<CategoryId, { name: string }> = {
  ml:      { name: 'ML' },
  tools:   { name: 'Website Tools' },
  math:    { name: 'Mathematical Curiosities' },
  physics: { name: 'Physics' },
  apps:    { name: 'Browser Extensions' },
  games:   { name: 'Game Development' },
}

// ─── Named projects ───────────────────────────────────────────────────────────

const NAMED: Record<string, Pick<FaceProject, 'label' | 'description' | 'techTags' | 'url' | 'status'>> = {
  '0-+y': {
    label: '1D Elastic Collision Simulator',
    description: 'Browser-based simulator for two-box elastic collisions. Enter mass and velocity, click Run, and watch the boxes animate between boundaries with physics-accurate velocity updates on every collision.',
    techTags: ['HTML', 'CSS', 'Vanilla JS', 'Canvas API', 'requestAnimationFrame'],
    url: 'https://mireducation.github.io/2D-Elastic-Collision-Simulation/',
    status: 'live',
  },
  '1-+y': {
    label: 'Sand Simulator',
    description: 'Interactive 2D falling-sand simulator — paint sand into a full-screen canvas and watch it fall and slide with particle physics. Supports mouse and touch controls with pause, erase, and reset.',
    techTags: ['HTML', 'CSS', 'JavaScript', 'Canvas 2D API', 'Uint32Array'],
    url: 'https://sand-simulator-nu.vercel.app/',
    status: 'live',
  },
  '0--y': {
    label: "Galperin's Method for Computing Pi",
    description: "High-precision physics simulation using perfectly elastic collisions to compute digits of π. Based on Galperin's discovery: the total collision count equals π × 10ⁿ when the mass ratio is a power of 100.",
    techTags: ['React', 'Vite', 'Tailwind CSS', 'Canvas API', 'Zustand'],
    url: '#',
    status: 'wip',
  },
  '0-+z': {
    label: 'LiveBoard',
    description: 'Real-time collaborative whiteboard with canvas-based drawing, multi-user presence, live cursors, undo/redo, and persistent board state over WebSockets.',
    techTags: ['React', 'TypeScript', 'Socket.IO', 'Konva', 'Node.js', 'SQLite', 'Zustand'],
    url: 'https://liveboard.up.railway.app/',
    status: 'live',
  },
  '1-+z': {
    label: 'Geographical Midpoint Finder',
    description: 'Geocodes two addresses and plots a bias-adjustable geographic midpoint on an interactive map. Optionally searches nearby points of interest — restaurants, cafes, parks, and more.',
    techTags: ['React', 'Leaflet', 'Tailwind CSS', 'Nominatim API', 'Overpass API', 'Vite'],
    url: 'https://midpoint-finder.vercel.app/',
    status: 'live',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFaceProject(nodeIndex: number, faceDir: FaceDirection): FaceProject {
  const key      = `${nodeIndex}-${faceDir}`
  const named    = NAMED[key]
  const category = FACE_CATEGORY[faceDir]
  return {
    id:          key,
    nodeIndex,
    faceDir,
    category,
    label:       named?.label       ?? 'Project Placeholder',
    description: named?.description ?? 'Coming Soon',
    techTags:    named?.techTags    ?? [],
    url:         named?.url         ?? '#',
    status:      named?.status      ?? 'placeholder',
  }
}

export const ALL_FACE_DIRS: FaceDirection[] = ['+x', '-x', '+y', '-y', '+z', '-z']
