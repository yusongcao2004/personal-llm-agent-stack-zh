export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type Fish3D = {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  panic: number;
  hitTimer: number;
  autoDepthSelected: boolean;
};

export type Predator3D = {
  id: number;
  x: number;
  y: number;
  z: number;
  previousX: number;
  previousY: number;
  previousZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  active: boolean;
  sprintTimer: number;
  sprintCooldown: number;
  phase: number;
};

export type PredatorStrategy3D = 'orcaCarousel' | 'dolphinDrive' | 'sharkStrike' | 'sealAmbush';

export type Decoy3D = {
  id: number;
  x: number;
  y: number;
  z: number;
  life: number;
};

export type TankBounds3D = {
  width: number;
  height: number;
  depth: number;
};

export type FishTankSettings3D = {
  fishCount: number;
  paused: boolean;
  fishSpeed: number;
  maxForce: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  predatorRadius: number;
  predatorBodyRadius: number;
  predatorStrength: number;
  predatorSurfacePush: number;
  predatorKeyboardSpeed: number;
  predatorFollowSpeed: number;
  autoDepthRadius: number;
  predatorCount: number;
  predatorStrategy: PredatorStrategy3D;
  predatorColor: string;
  predatorAutoSpeed: number;
  predatorSprintChance: number;
  predatorSprintMultiplier: number;
  predatorSprintDuration: number;
  predatorSprintCooldown: number;
  predatorChaseSpread: number;
  blackHoleEnabled: boolean;
  blackHoleRadius: number;
  blackHolePullStrength: number;
  scatterEnabled: boolean;
  scatterRadius: number;
  scatterStrength: number;
  decoyEnabled: boolean;
  decoyRadius: number;
  decoyStrength: number;
  decoyLifetime: number;
  cameraDistance: number;
  showTankBounds: boolean;
  showPredatorSphere: boolean;
  showMouseRay: boolean;
  showAutoDepthFish: boolean;
  showTargetPoint: boolean;
  showSchoolCenter: boolean;
  showCameraSafety: boolean;
};

export type Debug3D = {
  rayStart: Vec3;
  rayEnd: Vec3;
  target: Vec3;
  schoolCenter: Vec3;
  selected: Vec3[];
  cameraMinDistance: number;
};
