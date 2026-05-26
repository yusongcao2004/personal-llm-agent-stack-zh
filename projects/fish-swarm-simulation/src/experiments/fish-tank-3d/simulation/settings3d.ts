import type { FishTankSettings3D, TankBounds3D } from './types';

export const tankBounds3D: TankBounds3D = {
  width: 70,
  height: 36,
  depth: 42,
};

export const defaultSettings3D: FishTankSettings3D = {
  fishCount: 500,
  paused: false,
  fishSpeed: 3.2,
  maxForce: 8.5,
  separationWeight: 1.75,
  alignmentWeight: 1.08,
  cohesionWeight: 0.86,
  predatorRadius: 4.2,
  predatorBodyRadius: 0.9,
  predatorStrength: 12,
  predatorSurfacePush: 8,
  predatorKeyboardSpeed: 7.2,
  predatorFollowSpeed: 8,
  autoDepthRadius: 2.8,
  predatorCount: 3,
  predatorStrategy: 'orcaCarousel',
  predatorColor: '#ff6a3d',
  predatorAutoSpeed: 7.2,
  predatorSprintChance: 0.22,
  predatorSprintMultiplier: 2.35,
  predatorSprintDuration: 0.9,
  predatorSprintCooldown: 2.7,
  predatorChaseSpread: 12,
  blackHoleEnabled: false,
  blackHoleRadius: 4.8,
  blackHolePullStrength: 16,
  scatterEnabled: false,
  scatterRadius: 5.2,
  scatterStrength: 13,
  decoyEnabled: false,
  decoyRadius: 4.8,
  decoyStrength: 10,
  decoyLifetime: 8,
  cameraDistance: 64,
  showTankBounds: true,
  showPredatorSphere: false,
  showMouseRay: false,
  showAutoDepthFish: false,
  showTargetPoint: false,
  showSchoolCenter: false,
  showCameraSafety: false,
};

export function getMinimumCameraDistance(bounds: TankBounds3D): number {
  const radius = Math.hypot(bounds.width / 2, bounds.height / 2, bounds.depth / 2);
  return radius + 5;
}
