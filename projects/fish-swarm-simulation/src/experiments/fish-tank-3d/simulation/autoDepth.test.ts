import { describe, expect, it } from 'vitest';
import { computeAutoDepthTarget } from './autoDepth';
import type { Fish3D, TankBounds3D } from './types';

const bounds: TankBounds3D = { width: 30, height: 18, depth: 18 };

describe('computeAutoDepthTarget', () => {
  it('snaps the predator target to fish near the mouse ray', () => {
    const fish: Fish3D[] = [
      makeFish(1, 0.1, 0.2, 5),
      makeFish(2, 0.2, -0.1, 5.4),
      makeFish(3, 8, 0, -5),
    ];

    const result = computeAutoDepthTarget(
      fish,
      { origin: { x: 0, y: 0, z: -20 }, direction: { x: 0, y: 0, z: 1 } },
      { x: 0, y: 0, z: 0 },
      bounds,
      1,
    );

    expect(result.selected).toHaveLength(2);
    expect(result.target.z).toBeGreaterThan(4.8);
    expect(result.target.z).toBeLessThan(5.6);
  });

  it('falls back to the closest point on the ray near the school center', () => {
    const fish: Fish3D[] = [makeFish(1, 8, 2, 4)];

    const result = computeAutoDepthTarget(
      fish,
      { origin: { x: 0, y: 0, z: -20 }, direction: { x: 0, y: 0, z: 1 } },
      { x: 0, y: 0, z: 3 },
      bounds,
      0.5,
    );

    expect(result.selected).toHaveLength(0);
    expect(result.target.x).toBe(0);
    expect(result.target.y).toBe(0);
    expect(result.target.z).toBe(3);
  });
});

function makeFish(id: number, x: number, y: number, z: number): Fish3D {
  return {
    id,
    x,
    y,
    z,
    vx: 1,
    vy: 0,
    vz: 0,
    panic: 0,
    hitTimer: 0,
    autoDepthSelected: false,
  };
}
