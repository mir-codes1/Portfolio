// Shared mutable target written by AssemblyGroup every frame and read by WelcomeTitle's
// RAF loop.  Stored as pre-parsed RGB tuples to avoid per-frame hex parsing.
// No React state involved → zero re-renders.

// Vivid per-face colours that match the category legend (no near-black values)
export const FACE_VIVID_RGB: Record<string, [number, number, number]> = {
  '+x': [247, 122,   0],  // tools   – orange
  '-x': [247, 122,   0],  // tools   – orange
  '+y': [156,  86, 219],  // physics – purple
  '-y': [138, 161, 255],  // apps    – soft blue
  '+z': [247, 122,   0],  // tools   – orange
  '-z': [212, 212, 217],  // games   – silver
}

// Defaults = top-3 at zero rotation sorted by dot-product with camera [3.6,3.2,4.5]:
//   +z (0.658) → +x (0.527) → +y (0.468)
export const mirGradientTarget: [[number,number,number],[number,number,number],[number,number,number]] = [
  [247, 122,   0],  // +z / tools
  [247, 122,   0],  // +x / tools
  [156,  86, 219],  // +y / physics
]

export function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}
