export type Vec2 = {
  x: number;
  y: number;
};

export type Fish = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  panic: number;
  density: number;
};

export type Predator = {
  x: number;
  y: number;
  active: boolean;
};

export type Decoy = {
  id: number;
  x: number;
  y: number;
  life: number;
};

export type SchoolMode = 'auto' | 'free' | 'centerOrbit' | 'tankLoop';
export type FishSpecies = 'sardine' | 'jackfish' | 'herring';
export type Difficulty = 'easy' | 'normal' | 'hard';

export type SimulationSettings = {
  difficulty: Difficulty;
  fishCount: number;
  fishSpecies: FishSpecies;
  schoolMode: SchoolMode;
  speed: number;
  maxForce: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  predatorRadius: number;
  predatorStrength: number;
  biteRadius: number;
  biteKillSpeedThreshold: number;
  biteKillCompanionThreshold: number;
  missSpawnCount: number;
  penaltyEnabled: boolean;
  penaltyContactRadius: number;
  penaltyContactCount: number;
  penaltyCost: number;
  penaltySpeedThreshold: number;
  penaltyDwellSeconds: number;
  blackHoleEnabled: boolean;
  blackHoleRadius: number;
  blackHolePullStrength: number;
  blackHoleKillRadius: number;
  scatterEnabled: boolean;
  scatterRadius: number;
  scatterStrength: number;
  decoyEnabled: boolean;
  decoyRadius: number;
  decoyStrength: number;
  decoyLifetime: number;
  showPredatorRadius: boolean;
  showBiteRadius: boolean;
  showVelocityVectors: boolean;
  showFps: boolean;
  separationRadius: number;
  alignmentRadius: number;
  cohesionRadius: number;
  boundaryMargin: number;
  boundaryStrength: number;
};
