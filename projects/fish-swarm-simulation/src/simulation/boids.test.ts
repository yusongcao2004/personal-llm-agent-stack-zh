import { describe, expect, it } from 'vitest';
import { defaultSettings } from './settings';
import { stepBoids } from './boids';
import type { Fish, Predator } from './types';

describe('stepBoids', () => {
  it('keeps fish inside the canvas bounds', () => {
    const fish: Fish[] = [{ id: 1, x: 3, y: 100, vx: -50, vy: 0, panic: 0, density: 0 }];
    const predator: Predator = { x: 0, y: 0, active: false };

    stepBoids(fish, predator, defaultSettings, { width: 400, height: 300 }, 0.2, 0);

    expect(fish[0].x).toBeGreaterThanOrEqual(4);
    expect(fish[0].x).toBeLessThanOrEqual(396);
  });

  it('steers away from an active predator', () => {
    const fish: Fish[] = [{ id: 1, x: 120, y: 100, vx: 0, vy: 50, panic: 0, density: 0 }];
    const predator: Predator = { x: 100, y: 100, active: true };

    stepBoids(fish, predator, defaultSettings, { width: 400, height: 300 }, 0.016, 0);

    expect(fish[0].vx).toBeGreaterThan(0);
    expect(fish[0].panic).toBeGreaterThan(0);
  });

  it('applies a stronger impulse when the predator is very close', () => {
    const nearFish: Fish[] = [{ id: 1, x: 104, y: 100, vx: 0, vy: 50, panic: 0, density: 0 }];
    const farFish: Fish[] = [{ id: 1, x: 190, y: 100, vx: 0, vy: 50, panic: 0, density: 0 }];
    const predator: Predator = { x: 100, y: 100, active: true };

    stepBoids(nearFish, predator, defaultSettings, { width: 400, height: 300 }, 0.016, 0);
    stepBoids(farFish, predator, defaultSettings, { width: 400, height: 300 }, 0.016, 0);

    expect(nearFish[0].vx).toBeGreaterThan(farFish[0].vx);
  });

  it('does not apply predator panic after the mouse leaves', () => {
    const fish: Fish[] = [{ id: 1, x: 120, y: 100, vx: 50, vy: 0, panic: 0.5, density: 0 }];
    const predator: Predator = { x: 100, y: 100, active: false };

    stepBoids(fish, predator, defaultSettings, { width: 400, height: 300 }, 0.016, 0);

    expect(fish[0].panic).toBeLessThan(0.5);
  });
});
