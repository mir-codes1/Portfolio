export type CategoryId = 'ml' | 'tools' | 'math' | 'physics' | 'apps' | 'games'

export type FaceDirection = '+x' | '-x' | '+y' | '-y' | '+z' | '-z'

export interface Project {
  id: string
  label: string
  description: string
  category: CategoryId | null
  faceDirection: FaceDirection
  nodeIndex: number  // 0–26, row-major: index = i + j*3 + k*9
  techTags: string[]
  url: string
}

// Category → face direction mapping
// Front (+Z): Website Tools
// Back  (-Z): ML
// Top   (+Y): Physics
// Bottom(-Y): Mathematical Curiosities
// Right (+X): Apps
// Left  (-X): Game Development

const PLACEHOLDER = (id: string, face: FaceDirection, nodeIndex: number, category: CategoryId): Project => ({
  id,
  label: 'Project Placeholder',
  description: 'Coming Soon',
  category,
  faceDirection: face,
  nodeIndex,
  techTags: [],
  url: '#',
})

// Grid layout: nodeIndex = x + y*3 + z*9
// x: 0=left(-X face), 1=centre, 2=right(+X face)
// y: 0=bottom(-Y face), 1=centre, 2=top(+Y face)
// z: 0=back(-Z face), 1=centre, 2=front(+Z face)

export const PROJECTS: Project[] = [
  // ─── Physics face (+Y) — top row: y=2 ───────────────────────────────────────
  // nodeIndex = x + 2*3 + z*9 → 6, 7, 8, 15, 16, 17, 24, 25, 26
  {
    id: 'elastic-collision',
    label: '1D Elastic Collision Simulator',
    description: 'Visualise perfectly elastic collisions in real time. Adjust mass and velocity of multiple balls and watch momentum and energy conservation play out.',
    category: 'physics',
    faceDirection: '+y',
    nodeIndex: 16, // x=1, y=2, z=1 — centre of top face
    techTags: ['React', 'Canvas API', 'Physics'],
    url: '#',
  },
  PLACEHOLDER('physics-1', '+y', 6,  'physics'),
  PLACEHOLDER('physics-2', '+y', 7,  'physics'),
  PLACEHOLDER('physics-3', '+y', 8,  'physics'),
  PLACEHOLDER('physics-4', '+y', 15, 'physics'),
  PLACEHOLDER('physics-5', '+y', 17, 'physics'),
  PLACEHOLDER('physics-6', '+y', 24, 'physics'),
  PLACEHOLDER('physics-7', '+y', 25, 'physics'),
  PLACEHOLDER('physics-8', '+y', 26, 'physics'),

  // ─── Website Tools face (+Z) — front column: z=2 ────────────────────────────
  // nodeIndex = x + y*3 + 2*9 → 18, 19, 20, 21, 22, 23, 24, 25, 26
  // (24, 25, 26 already assigned to physics; +Z nodes that aren't also +Y are 18–23)
  {
    id: 'midpoint-tool',
    label: 'Geographical Midpoint Tool',
    description: 'Find the geographic midpoint between any number of locations on Earth. Useful for planning meetups, travel routes, and logistics.',
    category: 'tools',
    faceDirection: '+z',
    nodeIndex: 22, // x=1, y=1, z=2 — centre of front face
    techTags: ['React', 'Leaflet', 'TypeScript'],
    url: '#',
  },
  PLACEHOLDER('tools-1', '+z', 18, 'tools'),
  PLACEHOLDER('tools-2', '+z', 19, 'tools'),
  PLACEHOLDER('tools-3', '+z', 20, 'tools'),
  PLACEHOLDER('tools-4', '+z', 21, 'tools'),
  PLACEHOLDER('tools-5', '+z', 23, 'tools'),

  // ─── ML face (-Z) — back column: z=0 ────────────────────────────────────────
  // nodeIndex = x + y*3 + 0*9 → 0, 1, 2, 3, 4, 5, 6, 7, 8
  // (6, 7, 8 already assigned to physics)
  PLACEHOLDER('ml-1', '-z', 0, 'ml'),
  PLACEHOLDER('ml-2', '-z', 1, 'ml'),
  PLACEHOLDER('ml-3', '-z', 2, 'ml'),
  PLACEHOLDER('ml-4', '-z', 3, 'ml'),
  PLACEHOLDER('ml-5', '-z', 4, 'ml'),
  PLACEHOLDER('ml-6', '-z', 5, 'ml'),

  // ─── Apps face (+X) — right column: x=2 ─────────────────────────────────────
  // nodeIndex = 2 + y*3 + z*9 → 2, 5, 8, 11, 14, 17, 20, 23, 26
  // (2, 8, 20, 23, 26 already assigned above)
  PLACEHOLDER('apps-1', '+x', 11, 'apps'),
  PLACEHOLDER('apps-2', '+x', 14, 'apps'),
  PLACEHOLDER('apps-3', '+x', 17, 'apps'),

  // ─── Mathematical Curiosities face (-Y) — bottom row: y=0 ───────────────────
  // nodeIndex = x + 0*3 + z*9 → 0, 9, 18, 1, 10, 19, 2, 11, 20
  // (0, 1, 2 already assigned to ml; 18, 19, 20 assigned to tools; 11 to apps)
  PLACEHOLDER('math-1', '-y', 9,  'math'),
  PLACEHOLDER('math-2', '-y', 10, 'math'),

  // ─── Game Development face (-X) — left column: x=0 ─────────────────────────
  // nodeIndex = 0 + y*3 + z*9 → 0, 3, 6, 9, 12, 15, 18, 21, 24
  // (0, 6, 18, 24 already assigned; remaining: 3, 9, 12, 15, 21)
  PLACEHOLDER('games-1', '-x', 3,  'games'),
  PLACEHOLDER('games-2', '-x', 12, 'games'),
  PLACEHOLDER('games-3', '-x', 15, 'games'),
  PLACEHOLDER('games-4', '-x', 21, 'games'),

  // ─── Centre node (not on any outer face) ─────────────────────────────────────
  // nodeIndex = 1 + 1*3 + 1*9 = 13
  PLACEHOLDER('centre', '+z', 13, 'tools'),
]

// Helper: look up a project by nodeIndex
export function getProjectByNodeIndex(index: number): Project | undefined {
  return PROJECTS.find(p => p.nodeIndex === index)
}

// Helper: determine which faces of a node are outer faces
// Node grid coords: x ∈ [0,2], y ∈ [0,2], z ∈ [0,2]
export function getOuterFaces(x: number, y: number, z: number): FaceDirection[] {
  const faces: FaceDirection[] = []
  if (x === 0) faces.push('-x')
  if (x === 2) faces.push('+x')
  if (y === 0) faces.push('-y')
  if (y === 2) faces.push('+y')
  if (z === 0) faces.push('-z')
  if (z === 2) faces.push('+z')
  return faces
}

// Category display names and accent colours
export const CATEGORY_META: Record<CategoryId, { name: string; colour: string }> = {
  ml:      { name: 'ML',                        colour: '#9B7FD4' },
  tools:   { name: 'Website Tools',             colour: '#5B9BD5' },
  math:    { name: 'Mathematical Curiosities',  colour: '#7EC8A4' },
  physics: { name: 'Physics',                   colour: '#E07B5A' },
  apps:    { name: 'Apps',                      colour: '#D4A55A' },
  games:   { name: 'Game Development',          colour: '#C45A7A' },
}
