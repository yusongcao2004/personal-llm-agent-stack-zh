import type { Fish3D, TankBounds3D, Vec3 } from './types';
import { clamp } from './vector3';

export type Ray3D = {
  origin: Vec3;
  direction: Vec3;
};

export type AutoDepthResult = {
  target: Vec3;
  selected: Vec3[];
};

export function computeAutoDepthTarget(
  fish: Fish3D[],
  ray: Ray3D,
  schoolCenter: Vec3,
  bounds: TankBounds3D,
  radius: number,
): AutoDepthResult {
  let totalWeight = 0;
  let x = 0;
  let y = 0;
  let z = 0;
  const selected: Vec3[] = [];

  for (const item of fish) {
    item.autoDepthSelected = false;
    const distance = distancePointToRay(item, ray);
    if (distance > radius) {
      continue;
    }
    const weight = (1 - distance / radius) ** 2;
    x += item.x * weight;
    y += item.y * weight;
    z += item.z * weight;
    totalWeight += weight;
    item.autoDepthSelected = true;
    if (selected.length < 32) {
      selected.push({ x: item.x, y: item.y, z: item.z });
    }
  }

  if (totalWeight > 0) {
    return {
      target: clampToTank({ x: x / totalWeight, y: y / totalWeight, z: z / totalWeight }, bounds),
      selected,
    };
  }

  const fallback = closestPointOnRayToPoint(ray, schoolCenter);
  return {
    target: clampToTank(fallback, bounds),
    selected,
  };
}

export function distancePointToRay(point: Vec3, ray: Ray3D): number {
  const dx = point.x - ray.origin.x;
  const dy = point.y - ray.origin.y;
  const dz = point.z - ray.origin.z;
  const t = Math.max(0, dx * ray.direction.x + dy * ray.direction.y + dz * ray.direction.z);
  const px = ray.origin.x + ray.direction.x * t;
  const py = ray.origin.y + ray.direction.y * t;
  const pz = ray.origin.z + ray.direction.z * t;
  return Math.hypot(point.x - px, point.y - py, point.z - pz);
}

function closestPointOnRayToPoint(ray: Ray3D, point: Vec3): Vec3 {
  const dx = point.x - ray.origin.x;
  const dy = point.y - ray.origin.y;
  const dz = point.z - ray.origin.z;
  const t = Math.max(0, dx * ray.direction.x + dy * ray.direction.y + dz * ray.direction.z);
  return {
    x: ray.origin.x + ray.direction.x * t,
    y: ray.origin.y + ray.direction.y * t,
    z: ray.origin.z + ray.direction.z * t,
  };
}

function clampToTank(point: Vec3, bounds: TankBounds3D): Vec3 {
  return {
    x: clamp(point.x, -bounds.width / 2, bounds.width / 2),
    y: clamp(point.y, -bounds.height / 2, bounds.height / 2),
    z: clamp(point.z, -bounds.depth / 2, bounds.depth / 2),
  };
}
