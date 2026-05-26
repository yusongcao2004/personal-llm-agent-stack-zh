import type { Vec3 } from './types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function length3(x: number, y: number, z: number): number {
  return Math.hypot(x, y, z);
}

export function normalize3(x: number, y: number, z: number): Vec3 {
  const length = length3(x, y, z);
  if (length < 0.00001) {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: x / length, y: y / length, z: z / length };
}

export function limitMagnitude3(x: number, y: number, z: number, max: number): Vec3 {
  const length = length3(x, y, z);
  if (length <= max || length < 0.00001) {
    return { x, y, z };
  }
  const scale = max / length;
  return { x: x * scale, y: y * scale, z: z * scale };
}

export function limitSpeed3(
  x: number,
  y: number,
  z: number,
  min: number,
  max: number,
): Vec3 {
  const length = length3(x, y, z);
  if (length < 0.00001) {
    return { x: min, y: 0, z: 0 };
  }
  const target = clamp(length, min, max);
  const scale = target / length;
  return { x: x * scale, y: y * scale, z: z * scale };
}

export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}
