import { useSpring } from '@react-spring/three'

// 2×2×2 grid: nodeIndex = x + y*2 + z*4
// Stagger each node by 80 ms based on its index so they pop in sequentially.
export function useNodeIntroSpring(x: number, y: number, z: number) {
  const nodeIndex = x + y * 2 + z * 4
  const delay = nodeIndex * 80   // 0 ms … 560 ms

  const spring = useSpring({
    from:   { scale: 0 },
    to:     { scale: 1 },
    delay,
    config: { tension: 200, friction: 16 },   // bouncy spring
  })
  return spring
}
