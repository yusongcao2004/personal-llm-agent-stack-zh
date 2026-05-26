import { describe, expect, it } from 'vitest';
import { resolvePredatorSurfaceCollision } from './boids3d';
import type { Fish3D, Predator3D } from './types';

describe('resolvePredatorSurfaceCollision', () => {
  it('pushes fish out to the predator ball surface', () => {
    const fish = makeFish(0.2, 0, 0);
    const predator = makePredator(0, 0, 0, 0, 0, 0);

    resolvePredatorSurfaceCollision(fish, predator, {
      predatorBodyRadius: 1,
      predatorSurfacePush: 8,
    }, 1 / 60);

    expect(Math.hypot(fish.x, fish.y, fish.z)).toBeCloseTo(1.38, 4);
    expect(fish.vx).toBeGreaterThan(0);
  });

  it('adds extra outward velocity when the predator ball moves into the fish', () => {
    const fish = makeFish(1.2, 0, 0);
    const predator = makePredator(0, 0, 0, -0.8, 0, 0);

    resolvePredatorSurfaceCollision(fish, predator, {
      predatorBodyRadius: 1,
      predatorSurfacePush: 4,
    }, 1 / 60);

    expect(fish.vx).toBeGreaterThan(10);
  });
});

function makeFish(x: number, y: number, z: number): Fish3D {
  return {
    id: 1,
    x,
    y,
    z,
    vx: -1,
    vy: 0,
    vz: 0,
    panic: 0,
    hitTimer: 0,
    autoDepthSelected: false,
  };
}

function makePredator(
  x: number,
  y: number,
  z: number,
  previousX: number,
  previousY: number,
  previousZ: number,
): Predator3D {
  return {
    id: 1,
    x,
    y,
    z,
    previousX,
    previousY,
    previousZ,
    targetX: x,
    targetY: y,
    targetZ: z,
    active: true,
    sprintTimer: 0,
    sprintCooldown: 0,
    phase: 0,
  };
}
