export const FACE_ICON_MAP: Record<string, string> = {
  '0-+z': '/textures/icons/LiveBoard_symbol.png',
  '0-+y': '/textures/icons/1D-Collision_symbol.png',
  '1-+y': '/textures/icons/sandSimulator_symbol.png',
  '0--y': '/textures/icons/piComputation_symbol.png',
  '1-+z': '/textures/icons/midpointFinder_symbol.png',
}

// Per-face size multipliers applied on top of the base TARGET (0.65)
export const FACE_ICON_SCALE: Record<string, number> = {
  '1-+y': 1.25,     // Sand Simulator ×1.25
  '0-+z': 1.625,    // LiveBoard ×1.625
  '1-+z': 1.859375, // Midpoint ×2.1875 −15%
  '0--y': 1.50,     // Pi ×1.50
}

// Per-face [x, y] positional nudge in face-local units to correct for
// off-center content within the source PNG canvas
export const FACE_ICON_OFFSET: Record<string, [number, number]> = {
  '1-+z': [0, -0.055], // Midpoint pin sits in upper half of canvas; shift down
}
