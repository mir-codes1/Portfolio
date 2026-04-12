// ─── Types ────────────────────────────────────────────────────────────────────

export type FaceDirection = '+x' | '-x' | '+y' | '-y' | '+z' | '-z'
export type CategoryId    = 'tools' | 'physics' | 'apps' | 'games'

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

// Grid is 2×1×1: two nodes along X. 2-sided categories: tools, physics, apps, games. 1-sided: ML, Tools(+x).
export const GRID_SIZE_X = 2
export const GRID_SIZE_Y = 1
export const GRID_SIZE_Z = 1
export const GRID_TOTAL = GRID_SIZE_X * GRID_SIZE_Y * GRID_SIZE_Z

// Per-face colours (one colour per world face direction)
export const FACE_COLORS: Record<FaceDirection, string> = {
  '+x': '#D9A441',
  '-x': '#D9A441',
  '+y': '#7A3EF1',
  '-y': '#0A2A43',
  '+z': '#D9A441',
  '-z': '#C9D1D9',
}

// Face → category. All faces: tools (+x/-x/+z), physics (+y), apps (-y), games (-z).
export const FACE_CATEGORY: Record<FaceDirection, CategoryId> = {
  '+x': 'tools',
  '-x': 'tools',
  '+y': 'physics',
  '-y': 'apps',
  '+z': 'tools',
  '-z': 'games',
}

export const CATEGORY_META: Record<CategoryId, { name: string }> = {
  tools:   { name: 'Web App' },
  physics: { name: 'Physics' },
  apps:    { name: 'Browser Extensions' },
  games:   { name: 'Web Design' },
}

// ─── Named projects ───────────────────────────────────────────────────────────

const NAMED: Record<string, Pick<FaceProject, 'label' | 'description' | 'techTags' | 'url' | 'status'>> = {
  '0--x': {
    label: 'Real Estate Automation',
    description: 'Full-stack automation platform for real estate agents. Ingests sold property listings, generates AI-powered social media captions via Google Gemini, and dispatches them through n8n workflows for automated publishing — all tracked in a live React dashboard.',
    techTags: ['React', 'Node.js', 'Express', 'SQLite', 'Tailwind CSS', 'Google Gemini', 'n8n', 'React Router', 'Vite'],
    url: 'https://real-estate-automation-two.vercel.app/',
    status: 'live',
  },
  '0--z': {
    label: 'Souvenote',
    description: 'Branded marketing landing page for Souvenote — a digital greeting card platform. Features scroll-driven animations, a gallery showcase, FAQ accordion, and full auth page layouts. Frontend only; backend not connected.',
    techTags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'AWS Amplify'],
    url: 'https://landing-page-demo-drab.vercel.app/',
    status: 'live',
  },
  '1-+y': {
    label: 'Sand Simulator',
    description: 'Interactive 2D falling-sand simulator — paint sand into a full-screen canvas and watch it fall and slide with particle physics. Supports mouse and touch controls with pause, erase, and reset.',
    techTags: ['HTML', 'CSS', 'JavaScript', 'Canvas 2D API', 'Uint32Array'],
    url: 'https://sand-simulator-nu.vercel.app/',
    status: 'live',
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
  '1-+x': {
    label: 'Quizlio',
    description: 'Full-stack quiz web app for studying with AI-generated exam-style multiple-choice questions. Import quiz JSON, browse a shared library, take interactive quizzes with syntax-highlighted code blocks, per-option explanations, and track completion per browser via localStorage.',
    techTags: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'SQLite', 'Zod', 'React Router', 'Vite'],
    url: 'https://quizlio.vercel.app/',
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
