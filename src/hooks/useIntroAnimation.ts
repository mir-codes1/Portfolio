import { useSpring } from '@react-spring/three'

// Stagger each node by 80 ms based on its index so they pop in sequentially.
export function useNodeIntroSpring(nodeIndex: number) {
  const delay = nodeIndex * 80

  const spring = useSpring({
    from:   { scale: 0 },
    to:     { scale: 1 },
    delay,
    config: { tension: 200, friction: 16 },
  })
  return spring
}
