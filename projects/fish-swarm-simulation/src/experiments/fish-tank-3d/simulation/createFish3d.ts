import type { Fish3D, TankBounds3D } from './types';

export function createFish3D(count: number, bounds: TankBounds3D, seed: number): Fish3D[] {
  const random = seededRandom(seed);
  const spreadX = bounds.width * 0.18;
  const spreadY = bounds.height * 0.24;
  const spreadZ = bounds.depth * 0.2;

  return Array.from({ length: count }, (_, id) => {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = Math.cbrt(random());
    const x = Math.sin(phi) * Math.cos(theta) * radius * spreadX;
    const y = Math.cos(phi) * radius * spreadY;
    const z = Math.sin(phi) * Math.sin(theta) * radius * spreadZ;
    const heading = random() * Math.PI * 2;
    const vertical = (random() - 0.5) * 0.38;
    const speed = 2.3 + random() * 1.3;

    return {
      id,
      x,
      y,
      z,
      vx: Math.cos(heading) * speed,
      vy: vertical * speed,
      vz: Math.sin(heading) * speed,
      panic: 0,
      hitTimer: 0,
      autoDepthSelected: false,
    };
  });
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}
