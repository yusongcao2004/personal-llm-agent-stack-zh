import { describe, expect, it } from 'vitest';
import { limitMagnitude, limitSpeed, normalize } from './vector';

describe('vector helpers', () => {
  it('normalizes vectors safely', () => {
    expect(normalize(3, 4)).toEqual({ x: 0.6, y: 0.8 });
    expect(normalize(0, 0)).toEqual({ x: 0, y: 0 });
  });

  it('limits magnitude without changing small vectors', () => {
    expect(limitMagnitude({ x: 3, y: 4 }, 10)).toEqual({ x: 3, y: 4 });
    expect(limitMagnitude({ x: 6, y: 8 }, 5)).toEqual({ x: 3, y: 4 });
  });

  it('keeps speed inside a min and max range', () => {
    expect(limitSpeed(1, 0, 5, 10).x).toBe(5);
    expect(limitSpeed(20, 0, 5, 10).x).toBe(10);
  });
});
