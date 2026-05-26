import type { Vec2 } from './types';

export function length(x: number, y: number): number {
  return Math.hypot(x, y);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function limitMagnitude(vector: Vec2, max: number): Vec2 {
  const magnitude = length(vector.x, vector.y);
  if (magnitude <= max || magnitude === 0) {
    return vector;
  }
  const scale = max / magnitude;
  return { x: vector.x * scale, y: vector.y * scale };
}

export function normalize(x: number, y: number): Vec2 {
  const magnitude = length(x, y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / magnitude, y: y / magnitude };
}

export function limitSpeed(vx: number, vy: number, minSpeed: number, maxSpeed: number): Vec2 {
  const speed = length(vx, vy);
  if (speed === 0) {
    return { x: minSpeed, y: 0 };
  }
  if (speed < minSpeed) {
    const scale = minSpeed / speed;
    return { x: vx * scale, y: vy * scale };
  }
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    return { x: vx * scale, y: vy * scale };
  }
  return { x: vx, y: vy };
}
