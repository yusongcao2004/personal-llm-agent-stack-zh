import { describe, expect, it } from 'vitest';
import { resolveBite } from './bite';
import { defaultSettings } from './settings';
import type { Fish, Predator } from './types';

describe('resolveBite', () => {
  it('only considers fish inside the bite radius', () => {
    const fish: Fish[] = [
      { id: 1, x: 102, y: 100, vx: 0, vy: 10, panic: 0, density: 0 },
      { id: 2, x: 180, y: 100, vx: 0, vy: 10, panic: 0, density: 0 },
    ];
    const predator: Predator = { x: 100, y: 100, active: true };

    const result = resolveBite(fish, predator, defaultSettings);

    expect(result.candidates).toBe(1);
    expect(result.killedIds.has(1)).toBe(true);
    expect(result.killedIds.has(2)).toBe(false);
  });

  it('uses deterministic speed and companion thresholds', () => {
    const lonely: Fish[] = [{ id: 1, x: 102, y: 100, vx: 0, vy: 10, panic: 0, density: 0 }];
    const protectedFish: Fish[] = [
      { id: 1, x: 102, y: 100, vx: 0, vy: 10, panic: 0, density: 0 },
      ...Array.from({ length: 20 }, (_, index) => ({
        id: index + 2,
        x: 104 + index,
        y: 100,
        vx: 0,
        vy: 10,
        panic: 0,
        density: 0,
      })),
    ];
    const fastFish: Fish[] = [{ id: 1, x: 102, y: 100, vx: 160, vy: 0, panic: 0, density: 0 }];
    const predator: Predator = { x: 100, y: 100, active: true };

    expect(resolveBite(lonely, predator, defaultSettings).killedIds.has(1)).toBe(true);
    expect(resolveBite(protectedFish, predator, defaultSettings).killedIds.has(1)).toBe(false);
    expect(resolveBite(fastFish, predator, defaultSettings).killedIds.has(1)).toBe(false);
  });
});
