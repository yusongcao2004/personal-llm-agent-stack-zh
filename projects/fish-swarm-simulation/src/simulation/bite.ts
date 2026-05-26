import type { Fish, Predator, SimulationSettings } from './types';

export type BiteResult = {
  killedIds: Set<number>;
  candidates: number;
};

export function resolveBite(
  fish: Fish[],
  predator: Predator,
  settings: SimulationSettings,
): BiteResult {
  if (!predator.active) {
    return { killedIds: new Set(), candidates: 0 };
  }

  const killedIds = new Set<number>();
  let candidates = 0;
  const neighborRadiusSquared = settings.alignmentRadius * settings.alignmentRadius;

  for (const item of fish) {
    const dx = item.x - predator.x;
    const dy = item.y - predator.y;
    const distance = Math.hypot(dx, dy);
    if (distance > settings.biteRadius) {
      continue;
    }

    candidates += 1;
    const speed = Math.hypot(item.vx, item.vy);
    const companionCount = countCompanions(fish, item, neighborRadiusSquared);

    if (
      speed <= settings.biteKillSpeedThreshold
      && companionCount <= settings.biteKillCompanionThreshold
    ) {
      killedIds.add(item.id);
    }
  }

  return { killedIds, candidates };
}

function countCompanions(fish: Fish[], target: Fish, radiusSquared: number): number {
  let count = 0;
  for (const other of fish) {
    if (other.id === target.id) {
      continue;
    }
    const dx = target.x - other.x;
    const dy = target.y - other.y;
    if (dx * dx + dy * dy <= radiusSquared) {
      count += 1;
    }
  }
  return count;
}
