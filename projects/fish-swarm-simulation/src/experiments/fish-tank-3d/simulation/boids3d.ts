import type { Decoy3D, Fish3D, Predator3D, TankBounds3D, Vec3 } from './types';
import { clamp, limitMagnitude3, limitSpeed3, normalize3 } from './vector3';

export function stepBoids3D(
  fish: Fish3D[],
  predatorInput: Predator3D | Predator3D[],
  settings: {
    fishSpeed: number;
    maxForce: number;
    separationWeight: number;
    alignmentWeight: number;
    cohesionWeight: number;
    predatorRadius: number;
    predatorBodyRadius: number;
    predatorStrength: number;
    predatorSurfacePush: number;
    blackHoleEnabled: boolean;
    blackHoleRadius: number;
    blackHolePullStrength: number;
    decoyEnabled: boolean;
    decoyRadius: number;
    decoyStrength: number;
  },
  bounds: TankBounds3D,
  dt: number,
  elapsed = 0,
  decoys: Decoy3D[] = [],
  blackHoleActive = false,
): Vec3 {
  const safeDt = Math.min(dt, 0.033);
  const predators = Array.isArray(predatorInput) ? predatorInput : [predatorInput];
  const center = getSchoolCenter3D(fish);
  const minSpeed = settings.fishSpeed * 0.58;
  const maxSpeed = settings.fishSpeed * 1.8;
  const separationRadius = 1.05;
  const alignmentRadius = 2.65;
  const cohesionRadius = 5.15;
  const cohesionRadiusSquared = cohesionRadius * cohesionRadius;
  const grid = buildGrid3D(fish, cohesionRadius);
  const threat = getPredatorThreat(predators, center, settings.predatorRadius);
  const collectivePhase = Math.sin(elapsed * 0.17) * 0.5 + 0.5;
  const neighborIndices: number[] = [];

  for (let i = 0; i < fish.length; i += 1) {
    const current = fish[i];
    current.hitTimer = Math.max(0, current.hitTimer - safeDt);
    let separationX = 0;
    let separationY = 0;
    let separationZ = 0;
    let alignmentX = 0;
    let alignmentY = 0;
    let alignmentZ = 0;
    let cohesionX = 0;
    let cohesionY = 0;
    let cohesionZ = 0;
    let separationCount = 0;
    let alignmentCount = 0;
    let cohesionCount = 0;

    queryGrid3D(grid, current.x, current.y, current.z, neighborIndices);
    for (const j of neighborIndices) {
      if (i === j) {
        continue;
      }
      const other = fish[j];
      const dx = current.x - other.x;
      const dy = current.y - other.y;
      const dz = current.z - other.z;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      if (distanceSquared === 0 || distanceSquared > cohesionRadiusSquared) {
        continue;
      }

      const distance = Math.sqrt(distanceSquared);
      if (distance < separationRadius) {
        const strength = (1 - distance / separationRadius) / Math.max(distance, 0.001);
        separationX += dx * strength;
        separationY += dy * strength;
        separationZ += dz * strength;
        separationCount += 1;
      }

      if (distance < alignmentRadius) {
        alignmentX += other.vx;
        alignmentY += other.vy;
        alignmentZ += other.vz;
        alignmentCount += 1;
      }

      cohesionX += other.x;
      cohesionY += other.y;
      cohesionZ += other.z;
      cohesionCount += 1;
    }

    let forceX = 0;
    let forceY = 0;
    let forceZ = 0;

    if (separationCount > 0) {
      const desired = normalize3(separationX, separationY, separationZ);
      forceX += desired.x * settings.separationWeight;
      forceY += desired.y * settings.separationWeight;
      forceZ += desired.z * settings.separationWeight;
    }

    if (alignmentCount > 0) {
      const average = normalize3(
        alignmentX / alignmentCount,
        alignmentY / alignmentCount,
        alignmentZ / alignmentCount,
      );
      const currentDirection = normalize3(current.vx, current.vy, current.vz);
      forceX += (average.x - currentDirection.x) * settings.alignmentWeight;
      forceY += (average.y - currentDirection.y) * settings.alignmentWeight;
      forceZ += (average.z - currentDirection.z) * settings.alignmentWeight;
    }

    if (cohesionCount > 0) {
      const desired = normalize3(
        cohesionX / cohesionCount - current.x,
        cohesionY / cohesionCount - current.y,
        cohesionZ / cohesionCount - current.z,
      );
      forceX += desired.x * settings.cohesionWeight;
      forceY += desired.y * settings.cohesionWeight;
      forceZ += desired.z * settings.cohesionWeight;
    } else {
      const desired = normalize3(center.x - current.x, center.y - current.y, center.z - current.z);
      forceX += desired.x * settings.cohesionWeight * 0.55;
      forceY += desired.y * settings.cohesionWeight * 0.55;
      forceZ += desired.z * settings.cohesionWeight * 0.55;
    }

    const boundary = getBoundaryForce3D(current, bounds);
    forceX += boundary.x;
    forceY += boundary.y;
    forceZ += boundary.z;

    const predatorForce = getPredatorForce3D(current, predators, settings);
    forceX += predatorForce.x;
    forceY += predatorForce.y;
    forceZ += predatorForce.z;

    const decoyForce = getDecoyForce3D(current, decoys, settings);
    forceX += decoyForce.x;
    forceY += decoyForce.y;
    forceZ += decoyForce.z;

    const blackHoleForce = getBlackHoleForce3D(current, predators[0], settings, blackHoleActive);
    forceX += blackHoleForce.x;
    forceY += blackHoleForce.y;
    forceZ += blackHoleForce.z;

    const collective = getCollectiveIntent3D(current, center, threat, collectivePhase);
    forceX += collective.x;
    forceY += collective.y;
    forceZ += collective.z;

    const wander = getWanderForce3D(current.id, elapsed);
    forceX += wander.x;
    forceY += wander.y;
    forceZ += wander.z;

    const totalThreat = Math.max(predatorForce.intensity, decoyForce.intensity, blackHoleForce.intensity);

    const limited = limitMagnitude3(
      forceX * settings.maxForce,
      forceY * settings.maxForce,
      forceZ * settings.maxForce,
      settings.maxForce * (1 + totalThreat * 1.25),
    );

    current.vx += limited.x * safeDt;
    current.vy += limited.y * safeDt;
    current.vz += limited.z * safeDt;

    const speed = limitSpeed3(
      current.vx,
      current.vy,
      current.vz,
      minSpeed,
      maxSpeed * (1 + totalThreat * 0.32),
    );
    current.vx = speed.x;
    current.vy = speed.y;
    current.vz = speed.z;

    current.x += current.vx * safeDt;
    current.y += current.vy * safeDt;
    current.z += current.vz * safeDt;

    for (const predator of predators) {
      resolvePredatorSurfaceCollision(current, predator, settings, safeDt);
    }

    current.x = clamp(current.x, -bounds.width / 2 + 0.25, bounds.width / 2 - 0.25);
    current.y = clamp(current.y, -bounds.height / 2 + 0.25, bounds.height / 2 - 0.25);
    current.z = clamp(current.z, -bounds.depth / 2 + 0.25, bounds.depth / 2 - 0.25);
    current.panic += (totalThreat - current.panic) * (1 - Math.exp(-safeDt * 4.8));
  }

  return center;
}

export function applyScatterPulse3D(
  fish: Fish3D[],
  predator: Predator3D,
  settings: { scatterRadius: number; scatterStrength: number },
): void {
  if (!predator.active) {
    return;
  }

  for (const item of fish) {
    const dx = item.x - predator.x;
    const dy = item.y - predator.y;
    const dz = item.z - predator.z;
    const distance = Math.hypot(dx, dy, dz);
    if (distance === 0 || distance > settings.scatterRadius) {
      continue;
    }
    const away = normalize3(dx, dy, dz);
    const falloff = (1 - distance / settings.scatterRadius) ** 1.35;
    item.vx += away.x * settings.scatterStrength * falloff;
    item.vy += away.y * settings.scatterStrength * falloff;
    item.vz += away.z * settings.scatterStrength * falloff;
    item.panic = Math.max(item.panic, 0.95 * falloff);
  }
}

export function getSchoolCenter3D(fish: Fish3D[]): Vec3 {
  if (fish.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  let x = 0;
  let y = 0;
  let z = 0;
  for (const item of fish) {
    x += item.x;
    y += item.y;
    z += item.z;
  }
  return { x: x / fish.length, y: y / fish.length, z: z / fish.length };
}

function getBoundaryForce3D(fish: Fish3D, bounds: TankBounds3D): Vec3 {
  const margin = 3.2;
  const halfX = bounds.width / 2;
  const halfY = bounds.height / 2;
  const halfZ = bounds.depth / 2;
  const projectedX = fish.x + normalize3(fish.vx, fish.vy, fish.vz).x * margin;
  const projectedY = fish.y + normalize3(fish.vx, fish.vy, fish.vz).y * margin;
  const projectedZ = fish.z + normalize3(fish.vx, fish.vy, fish.vz).z * margin;
  let x = 0;
  let y = 0;
  let z = 0;

  if (projectedX < -halfX + margin) x += 1 - (projectedX + halfX) / margin;
  if (projectedX > halfX - margin) x -= 1 - (halfX - projectedX) / margin;
  if (projectedY < -halfY + margin) y += 1 - (projectedY + halfY) / margin;
  if (projectedY > halfY - margin) y -= 1 - (halfY - projectedY) / margin;
  if (projectedZ < -halfZ + margin) z += 1 - (projectedZ + halfZ) / margin;
  if (projectedZ > halfZ - margin) z -= 1 - (halfZ - projectedZ) / margin;

  return { x: x * 1.95, y: y * 1.95, z: z * 1.95 };
}

function getPredatorForce3D(
  fish: Fish3D,
  predators: Predator3D[],
  settings: { predatorRadius: number; predatorStrength: number; maxForce: number },
): Vec3 & { intensity: number } {
  let x = 0;
  let y = 0;
  let z = 0;
  let intensity = 0;

  for (const predator of predators) {
    if (!predator.active) {
      continue;
    }
    const dx = fish.x - predator.x;
    const dy = fish.y - predator.y;
    const dz = fish.z - predator.z;
    const distance = Math.hypot(dx, dy, dz);
    if (distance === 0 || distance > settings.predatorRadius) {
      continue;
    }
    const falloff = (1 - distance / settings.predatorRadius) ** 1.55;
    const away = normalize3(dx, dy, dz);
    const sprintBonus = predator.sprintTimer > 0 ? 1.32 : 1;
    const strength = (settings.predatorStrength * sprintBonus / Math.max(settings.maxForce, 1)) * falloff;
    x += away.x * strength;
    y += away.y * strength;
    z += away.z * strength;
    intensity = Math.max(intensity, clamp(falloff * 1.25, 0, 1));
  }

  return { x, y, z, intensity };
}

function getPredatorThreat(
  predators: Predator3D[],
  center: Vec3,
  predatorRadius: number,
): number {
  let threat = 0;
  for (const predator of predators) {
    if (!predator.active) {
      continue;
    }
    const distance = Math.hypot(predator.x - center.x, predator.y - center.y, predator.z - center.z);
    threat = Math.max(threat, clamp(1 - distance / Math.max(predatorRadius * 3.4, 1), 0, 1));
  }
  return threat;
}

function getCollectiveIntent3D(
  fish: Fish3D,
  center: Vec3,
  threat: number,
  phase: number,
): Vec3 {
  const radial = normalize3(fish.x - center.x, fish.y - center.y, fish.z - center.z);
  const axis = normalize3(0.2, 1, 0.38);
  const tangent = normalize3(
    axis.y * radial.z - axis.z * radial.y,
    axis.z * radial.x - axis.x * radial.z,
    axis.x * radial.y - axis.y * radial.x,
  );
  const towardCenter = normalize3(center.x - fish.x, center.y - fish.y, center.z - fish.z);
  const cruise = normalize3(0.85, Math.sin(phase * Math.PI * 2) * 0.18, 0.42);
  const milling = threat * 0.62 + phase * 0.18;

  return {
    x: cruise.x * 0.16 + tangent.x * milling + towardCenter.x * threat * 0.24,
    y: cruise.y * 0.16 + tangent.y * milling + towardCenter.y * threat * 0.24,
    z: cruise.z * 0.16 + tangent.z * milling + towardCenter.z * threat * 0.24,
  };
}

function getDecoyForce3D(
  fish: Fish3D,
  decoys: Decoy3D[],
  settings: { decoyEnabled: boolean; decoyRadius: number; decoyStrength: number; maxForce: number },
): Vec3 & { intensity: number } {
  if (!settings.decoyEnabled || decoys.length === 0) {
    return { x: 0, y: 0, z: 0, intensity: 0 };
  }

  let x = 0;
  let y = 0;
  let z = 0;
  let intensity = 0;
  for (const decoy of decoys) {
    const dx = fish.x - decoy.x;
    const dy = fish.y - decoy.y;
    const dz = fish.z - decoy.z;
    const distance = Math.hypot(dx, dy, dz);
    if (distance === 0 || distance > settings.decoyRadius) {
      continue;
    }
    const falloff = (1 - distance / settings.decoyRadius) ** 1.25;
    const away = normalize3(dx, dy, dz);
    const strength = (settings.decoyStrength / Math.max(settings.maxForce, 1)) * falloff;
    x += away.x * strength;
    y += away.y * strength;
    z += away.z * strength;
    intensity = Math.max(intensity, falloff);
  }
  return { x, y, z, intensity };
}

function getBlackHoleForce3D(
  fish: Fish3D,
  predator: Predator3D,
  settings: { blackHoleEnabled: boolean; blackHoleRadius: number; blackHolePullStrength: number; maxForce: number },
  active: boolean,
): Vec3 & { intensity: number } {
  if (!active || !settings.blackHoleEnabled || !predator.active) {
    return { x: 0, y: 0, z: 0, intensity: 0 };
  }

  const dx = predator.x - fish.x;
  const dy = predator.y - fish.y;
  const dz = predator.z - fish.z;
  const distance = Math.hypot(dx, dy, dz);
  if (distance === 0 || distance > settings.blackHoleRadius) {
    return { x: 0, y: 0, z: 0, intensity: 0 };
  }

  const falloff = (1 - distance / settings.blackHoleRadius) ** 1.18;
  const toward = normalize3(dx, dy, dz);
  const strength = (settings.blackHolePullStrength / Math.max(settings.maxForce, 1)) * falloff;
  return {
    x: toward.x * strength,
    y: toward.y * strength,
    z: toward.z * strength,
    intensity: falloff,
  };
}

export function resolvePredatorSurfaceCollision(
  fish: Fish3D,
  predator: Predator3D,
  settings: { predatorBodyRadius: number; predatorSurfacePush: number },
  dt: number,
): void {
  if (!predator.active) {
    return;
  }

  const fishRadius = 0.38;
  const collisionRadius = settings.predatorBodyRadius + fishRadius;
  let dx = fish.x - predator.x;
  let dy = fish.y - predator.y;
  let dz = fish.z - predator.z;
  let distance = Math.hypot(dx, dy, dz);
  if (distance >= collisionRadius) {
    return;
  }

  if (distance < 0.0001) {
    const fallback = normalize3(fish.vx, fish.vy, fish.vz);
    dx = fallback.x || 1;
    dy = fallback.y;
    dz = fallback.z;
    distance = Math.hypot(dx, dy, dz);
  }

  const away = normalize3(dx, dy, dz);
  fish.x = predator.x + away.x * collisionRadius;
  fish.y = predator.y + away.y * collisionRadius;
  fish.z = predator.z + away.z * collisionRadius;

  const inwardSpeed = fish.vx * away.x + fish.vy * away.y + fish.vz * away.z;
  if (inwardSpeed < 0) {
    fish.vx -= away.x * inwardSpeed * 1.35;
    fish.vy -= away.y * inwardSpeed * 1.35;
    fish.vz -= away.z * inwardSpeed * 1.35;
  }

  const predatorVx = (predator.x - predator.previousX) / Math.max(dt, 0.001);
  const predatorVy = (predator.y - predator.previousY) / Math.max(dt, 0.001);
  const predatorVz = (predator.z - predator.previousZ) / Math.max(dt, 0.001);
  const approachSpeed = predatorVx * away.x + predatorVy * away.y + predatorVz * away.z;
  const penetration = collisionRadius - distance;
  const push = settings.predatorSurfacePush * penetration + Math.max(0, approachSpeed) * 0.42;
  fish.vx += away.x * push;
  fish.vy += away.y * push;
  fish.vz += away.z * push;
  fish.panic = Math.max(fish.panic, 0.92);
  fish.hitTimer = Math.max(fish.hitTimer, 0.46);
}

function getWanderForce3D(id: number, elapsed: number): Vec3 {
  const t = elapsed * 0.44 + id * 1.37;
  return {
    x: Math.sin(t) * 0.14,
    y: Math.sin(t * 0.71) * 0.08,
    z: Math.cos(t * 0.83) * 0.14,
  };
}

type Grid3D = {
  cellSize: number;
  cells: Map<string, number[]>;
};

function buildGrid3D(fish: Fish3D[], cellSize: number): Grid3D {
  const grid: Grid3D = {
    cellSize: Math.max(0.001, cellSize),
    cells: new Map(),
  };

  for (let index = 0; index < fish.length; index += 1) {
    const item = fish[index];
    const key = getCellKey3D(item.x, item.y, item.z, grid.cellSize);
    const bucket = grid.cells.get(key);
    if (bucket) {
      bucket.push(index);
    } else {
      grid.cells.set(key, [index]);
    }
  }

  return grid;
}

function queryGrid3D(grid: Grid3D, x: number, y: number, z: number, result: number[]): void {
  result.length = 0;
  const cx = Math.floor(x / grid.cellSize);
  const cy = Math.floor(y / grid.cellSize);
  const cz = Math.floor(z / grid.cellSize);

  for (let oz = -1; oz <= 1; oz += 1) {
    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        const bucket = grid.cells.get(`${cx + ox},${cy + oy},${cz + oz}`);
        if (bucket) {
          result.push(...bucket);
        }
      }
    }
  }
}

function getCellKey3D(x: number, y: number, z: number, cellSize: number): string {
  return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)},${Math.floor(z / cellSize)}`;
}
