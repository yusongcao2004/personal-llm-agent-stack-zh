import type { Fish } from './types';

export function createFish(count: number, width: number, height: number, seed: number): Fish[] {
  const random = seededRandom(seed);
  const centerX = width * (0.46 + (random() - 0.5) * 0.12);
  const centerY = height * (0.5 + (random() - 0.5) * 0.12);
  const populationScale = Math.min(1, Math.sqrt(count / 500));
  const spreadX = Math.max(180, width * (0.22 + populationScale * 0.18));
  const spreadY = Math.max(140, height * (0.18 + populationScale * 0.18));

  return Array.from({ length: count }, (_, id) => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    const x = centerX + Math.cos(angle) * radius * spreadX;
    const y = centerY + Math.sin(angle) * radius * spreadY;
    const heading = -0.45 + (random() - 0.5) * 0.8;
    const speed = 48 + random() * 28;

    return {
      id,
      x,
      y,
      vx: Math.cos(heading) * speed,
      vy: Math.sin(heading) * speed,
      panic: 0,
      density: 0,
    };
  });
}

export function createReinforcementFish(
  count: number,
  width: number,
  height: number,
  seed: number,
  startId: number,
): Fish[] {
  const random = seededRandom(seed);
  const side = Math.floor(random() * 4);
  const margin = 26;
  return Array.from({ length: count }, (_, index) => {
    const along = random();
    const x = side === 0 ? margin : side === 1 ? width - margin : along * width;
    const y = side === 2 ? margin : side === 3 ? height - margin : along * height;
    const targetX = width * (0.38 + random() * 0.24);
    const targetY = height * (0.38 + random() * 0.24);
    const heading = Math.atan2(targetY - y, targetX - x) + (random() - 0.5) * 0.5;
    const speed = 54 + random() * 30;
    return {
      id: startId + index,
      x,
      y,
      vx: Math.cos(heading) * speed,
      vy: Math.sin(heading) * speed,
      panic: 0.2,
      density: 0,
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
