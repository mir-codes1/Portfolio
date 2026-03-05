/**
 * Shared mutable rect — written each frame by AssemblyGroup's useFrame,
 * read by AboutMeCard on each React render (triggered by scrollProgress changes).
 * Avoids Zustand updates every frame.
 */
export const faceScreenRect = {
  left:   0,
  top:    0,
  width:  0,
  height: 0,
  valid:  false,
}
