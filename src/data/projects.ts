// ─── Types ────────────────────────────────────────────────────────────────────

export type FaceDirection = '+x' | '-x' | '+y' | '-y' | '+z' | '-z'
export type CategoryId    = 'ml' | 'tools' | 'math' | 'physics' | 'apps' | 'games'

export interface FaceProject {
  id: string                   // `${nodeIndex}-${faceDir}`
  nodeIndex: number            // 0–7 (2×2×2 grid)
  faceDir: FaceDirection
  category: CategoryId
  label: string
  description: string
  techTags: string[]
  url: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const GRID_SIZE = 2   // 2×2×2

// Per-face colours (one colour per world face direction)
export const FACE_COLORS: Record<FaceDirection, string> = {
  '+x': '#0A2A43',
  '-x': '#18D1C1',
  '+y': '#7A3EF1',
  '-y': '#E043A5',
  '+z': '#D9A441',
  '-z': '#C9D1D9',
}

// Face → category
export const FACE_CATEGORY: Record<FaceDirection, CategoryId> = {
  '+x': 'apps',
  '-x': 'games',
  '+y': 'physics',
  '-y': 'math',
  '+z': 'tools',
  '-z': 'ml',
}

export const CATEGORY_META: Record<CategoryId, { name: string }> = {
  ml:      { name: 'ML' },
  tools:   { name: 'Website Tools' },
  math:    { name: 'Mathematical Curiosities' },
  physics: { name: 'Physics' },
  apps:    { name: 'Apps' },
  games:   { name: 'Game Development' },
}

// ─── Named projects ───────────────────────────────────────────────────────────

const NAMED: Record<string, Pick<FaceProject, 'label' | 'description' | 'techTags' | 'url'>> = {
  '7-+y': {
    label: '1D Elastic Collision Simulator',
    description: 'Visualise perfectly elastic collisions in real time. Adjust mass and velocity of multiple balls and watch momentum and energy conservation.',
    techTags: ['React', 'Canvas API', 'Physics'],
    url: '#',
  },
  '6-+z': {
    label: 'Geographical Midpoint Tool',
    description: 'Find the geographic midpoint between any number of locations on Earth. Useful for planning meetups, travel routes, and logistics.',
    techTags: ['React', 'Leaflet', 'TypeScript'],
    url: '#',
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
  }
}

export const ALL_FACE_DIRS: FaceDirection[] = ['+x', '-x', '+y', '-y', '+z', '-z']
