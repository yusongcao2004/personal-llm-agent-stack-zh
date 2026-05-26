import type { Decoy, Fish, Predator, SimulationSettings } from './types';
import { clamp, limitMagnitude, limitSpeed, normalize } from './vector';

export type StepBounds = {
  width: number;
  height: number;
};

export function stepBoids(
  fish: Fish[],
  predator: Predator,
  settings: SimulationSettings,
  bounds: StepBounds,
  dt: number,
  elapsed: number,
  decoys: Decoy[] = [],
): void {
  const safeDt = Math.min(dt, 0.033);
  const minSpeed = settings.speed * 0.58;
  const baseMaxSpeed = settings.speed * 1.62;
  const schoolCenter = getSchoolCenter(fish);
  const grid = buildGrid(fish, settings.cohesionRadius);
  const effectiveMode = getEffectiveMode(settings.schoolMode, elapsed);

  for (let i = 0; i < fish.length; i += 1) {
    const current = fish[i];
    let separationX = 0;
    let separationY = 0;
    let alignmentX = 0;
    let alignmentY = 0;
    let cohesionX = 0;
    let cohesionY = 0;
    let separationCount = 0;
    let alignmentCount = 0;
    let cohesionCount = 0;
    let densityCount = 0;

    const neighborIndices = queryGrid(grid, current.x, current.y);
    for (const j of neighborIndices) {
      if (i === j) {
        continue;
      }

      const other = fish[j];
      const dx = current.x - other.x;
      const dy = current.y - other.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared === 0 || distanceSquared > settings.cohesionRadius * settings.cohesionRadius) {
        continue;
      }

      const distance = Math.sqrt(distanceSquared);
      if (distance < settings.separationRadius) {
        const strength = (1 - distance / settings.separationRadius) / Math.max(distance, 0.001);
        separationX += dx * strength;
        separationY += dy * strength;
        separationCount += 1;
      }

      if (distance < settings.alignmentRadius) {
        alignmentX += other.vx;
        alignmentY += other.vy;
        alignmentCount += 1;
        densityCount += 1;
      }

      cohesionX += other.x;
      cohesionY += other.y;
      cohesionCount += 1;
    }

    let forceX = 0;
    let forceY = 0;

    if (separationCount > 0) {
      const desired = normalize(separationX, separationY);
      forceX += desired.x * settings.separationWeight;
      forceY += desired.y * settings.separationWeight;
    }

    if (alignmentCount > 0) {
      const average = normalize(alignmentX / alignmentCount, alignmentY / alignmentCount);
      const currentDirection = normalize(current.vx, current.vy);
      forceX += (average.x - currentDirection.x) * settings.alignmentWeight;
      forceY += (average.y - currentDirection.y) * settings.alignmentWeight;
    }

    if (cohesionCount > 0) {
      const centerX = cohesionX / cohesionCount;
      const centerY = cohesionY / cohesionCount;
      const desired = normalize(centerX - current.x, centerY - current.y);
      forceX += desired.x * settings.cohesionWeight;
      forceY += desired.y * settings.cohesionWeight;
    } else {
      const desired = normalize(schoolCenter.x - current.x, schoolCenter.y - current.y);
      forceX += desired.x * settings.cohesionWeight * 0.45;
      forceY += desired.y * settings.cohesionWeight * 0.45;
    }

    const boundary = getBoundaryForce(current, settings, bounds);
    forceX += boundary.x;
    forceY += boundary.y;

    const schoolIntent = getSchoolIntent(current, schoolCenter, settings, bounds, effectiveMode, elapsed);
    forceX += schoolIntent.x;
    forceY += schoolIntent.y;

    const predatorForce = getPredatorForce(current, predator, settings);
    forceX += predatorForce.x;
    forceY += predatorForce.y;

    const decoyForce = getDecoyForce(current, decoys, settings);
    forceX += decoyForce.x;
    forceY += decoyForce.y;

    const threatIntensity = Math.max(predatorForce.intensity, decoyForce.intensity);
    const forceLimit = settings.maxForce * (1 + threatIntensity * 1.35);
    const limitedForce = limitMagnitude(
      {
        x: forceX * settings.maxForce,
        y: forceY * settings.maxForce,
      },
      forceLimit,
    );

    current.vx += limitedForce.x * safeDt;
    current.vy += limitedForce.y * safeDt;

    const densityRatio = clamp(densityCount / 14, 0, 1);
    current.density += (densityRatio - current.density) * (1 - Math.exp(-safeDt * 4.5));
    const dragBonus = 0.72 + current.density * 0.55;
    const panicBonus = 1 + current.panic * 0.34;
    const speed = limitSpeed(
      current.vx,
      current.vy,
      minSpeed * (0.78 + current.density * 0.28),
      baseMaxSpeed * dragBonus * panicBonus,
    );
    current.vx = speed.x;
    current.vy = speed.y;
    current.x += current.vx * safeDt;
    current.y += current.vy * safeDt;

    current.x = clamp(current.x, 4, bounds.width - 4);
    current.y = clamp(current.y, 4, bounds.height - 4);

    const targetPanic = threatIntensity;
    current.panic += (targetPanic - current.panic) * (1 - Math.exp(-safeDt * 5.2));
  }
}

function getBoundaryForce(
  fish: Fish,
  settings: SimulationSettings,
  bounds: StepBounds,
): { x: number; y: number } {
  const margin = settings.boundaryMargin;
  const heading = normalize(fish.vx, fish.vy);
  const projectedX = fish.x + heading.x * margin * 0.55;
  const projectedY = fish.y + heading.y * margin * 0.55;
  let x = 0;
  let y = 0;

  if (projectedX < margin) {
    x += settings.boundaryStrength * (1 - projectedX / margin);
  }
  if (projectedX > bounds.width - margin) {
    x -= settings.boundaryStrength * (1 - (bounds.width - projectedX) / margin);
  }
  if (projectedY < margin) {
    y += settings.boundaryStrength * (1 - projectedY / margin);
  }
  if (projectedY > bounds.height - margin) {
    y -= settings.boundaryStrength * (1 - (bounds.height - projectedY) / margin);
  }

  return {
    x: x / Math.max(settings.maxForce, 1),
    y: y / Math.max(settings.maxForce, 1),
  };
}

function getSchoolIntent(
  fish: Fish,
  schoolCenter: { x: number; y: number },
  settings: SimulationSettings,
  bounds: StepBounds,
  mode: 'free' | 'centerOrbit' | 'tankLoop',
  elapsed: number,
): { x: number; y: number } {
  if (mode === 'free') {
    return getWanderIntent(fish, elapsed, 0.18);
  }

  const tankCenter = { x: bounds.width / 2, y: bounds.height / 2 };
  if (mode === 'centerOrbit') {
    const dx = fish.x - tankCenter.x;
    const dy = fish.y - tankCenter.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const desiredRadius = Math.min(bounds.width, bounds.height) * 0.25;
    const radialError = clamp((distance - desiredRadius) / desiredRadius, -1, 1);
    const tangent = normalize(-dy, dx);
    const radial = normalize(-dx, -dy);
    const schoolPull = normalize(schoolCenter.x - fish.x, schoolCenter.y - fish.y);
    return {
      x: tangent.x * 0.64 + radial.x * radialError * 0.4 + schoolPull.x * 0.1,
      y: tangent.y * 0.64 + radial.y * radialError * 0.4 + schoolPull.y * 0.1,
    };
  }

  const dx = fish.x - tankCenter.x;
  const dy = fish.y - tankCenter.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const loopRadius = Math.min(bounds.width, bounds.height) * 0.36;
  const tangent = normalize(-dy, dx);
  const towardLoop = normalize(tankCenter.x - fish.x, tankCenter.y - fish.y);
  const stayWithSchool = normalize(schoolCenter.x - fish.x, schoolCenter.y - fish.y);
  const radiusError = clamp((distance - loopRadius) / loopRadius, -1, 1);
  return {
    x: tangent.x * 0.74 + towardLoop.x * radiusError * 0.34 + stayWithSchool.x * settings.cohesionWeight * 0.12,
    y: tangent.y * 0.74 + towardLoop.y * radiusError * 0.34 + stayWithSchool.y * settings.cohesionWeight * 0.12,
  };
}

function getWanderIntent(fish: Fish, elapsed: number, strength: number): { x: number; y: number } {
  const phase = elapsed * 0.8 + fish.id * 1.618;
  return {
    x: Math.cos(phase) * strength,
    y: Math.sin(phase * 0.73) * strength,
  };
}

function getEffectiveMode(
  mode: SimulationSettings['schoolMode'],
  elapsed: number,
): 'free' | 'centerOrbit' | 'tankLoop' {
  if (mode !== 'auto') {
    return mode;
  }
  const phase = Math.floor(elapsed / 18) % 3;
  if (phase === 0) {
    return 'centerOrbit';
  }
  if (phase === 1) {
    return 'tankLoop';
  }
  return 'free';
}

function getPredatorForce(
  fish: Fish,
  predator: Predator,
  settings: SimulationSettings,
): { x: number; y: number; intensity: number } {
  if (!predator.active) {
    return { x: 0, y: 0, intensity: 0 };
  }

  const dx = fish.x - predator.x;
  const dy = fish.y - predator.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || distance > settings.predatorRadius) {
    return { x: 0, y: 0, intensity: 0 };
  }

  const normalizedDistance = distance / settings.predatorRadius;
  const falloff = (1 - normalizedDistance) ** 1.45;
  const away = normalize(dx, dy);
  const strength = (settings.predatorStrength / Math.max(settings.maxForce, 1)) * falloff;

  return {
    x: away.x * strength,
    y: away.y * strength,
    intensity: clamp(falloff * 1.35, 0, 1),
  };
}

function getDecoyForce(
  fish: Fish,
  decoys: Decoy[],
  settings: SimulationSettings,
): { x: number; y: number; intensity: number } {
  if (!settings.decoyEnabled || decoys.length === 0) {
    return { x: 0, y: 0, intensity: 0 };
  }

  let x = 0;
  let y = 0;
  let intensity = 0;
  for (const decoy of decoys) {
    const dx = fish.x - decoy.x;
    const dy = fish.y - decoy.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0 || distance > settings.decoyRadius) {
      continue;
    }

    const falloff = (1 - distance / settings.decoyRadius) ** 1.25;
    const away = normalize(dx, dy);
    const strength = (settings.decoyStrength / Math.max(settings.maxForce, 1)) * falloff;
    x += away.x * strength;
    y += away.y * strength;
    intensity = Math.max(intensity, clamp(falloff * 1.15, 0, 1));
  }

  return { x, y, intensity };
}

function getSchoolCenter(fish: Fish[]): { x: number; y: number } {
  if (fish.length === 0) {
    return { x: 0, y: 0 };
  }

  let x = 0;
  let y = 0;
  for (const item of fish) {
    x += item.x;
    y += item.y;
  }
  return { x: x / fish.length, y: y / fish.length };
}

type Grid = {
  cellSize: number;
  cells: Map<string, number[]>;
};

function buildGrid(fish: Fish[], cellSize: number): Grid {
  const grid: Grid = {
    cellSize: Math.max(1, cellSize),
    cells: new Map(),
  };

  for (let index = 0; index < fish.length; index += 1) {
    const item = fish[index];
    const key = getCellKey(item.x, item.y, grid.cellSize);
    const bucket = grid.cells.get(key);
    if (bucket) {
      bucket.push(index);
    } else {
      grid.cells.set(key, [index]);
    }
  }

  return grid;
}

function queryGrid(grid: Grid, x: number, y: number): number[] {
  const cx = Math.floor(x / grid.cellSize);
  const cy = Math.floor(y / grid.cellSize);
  const result: number[] = [];

  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      const bucket = grid.cells.get(`${cx + ox},${cy + oy}`);
      if (bucket) {
        result.push(...bucket);
      }
    }
  }

  return result;
}

function getCellKey(x: number, y: number, cellSize: number): string {
  return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
}
