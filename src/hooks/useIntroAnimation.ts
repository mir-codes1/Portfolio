import { useSpring } from '@react-spring/three'

// Shell distance: max(|x-1|, |y-1|, |z-1|)
// Shell 0 (core 8): delay 0 ms
// Shell 1 (edges, 12): delay 180 ms
// Shell 2 (outer, 8 corners + 6 face-centres): delay 360 ms
export function getShellDelay(x: number, y: number, z: number): number {
  const dist = Math.max(Math.abs(x - 1), Math.abs(y - 1), Math.abs(z - 1))
  return dist * 180
}

export function useNodeIntroSpring(x: number, y: number, z: number) {
  const delay = getShellDelay(x, y, z)
  const spring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    delay,
    config: { tension: 180, friction: 20 },
  })
  return spring
}
