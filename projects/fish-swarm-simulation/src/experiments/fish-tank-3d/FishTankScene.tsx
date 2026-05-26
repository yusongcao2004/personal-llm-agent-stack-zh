import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Debug3DOverlay } from './Debug3DOverlay';
import { FishInstances3D } from './FishInstances3D';
import { PredatorCursor3D } from './PredatorCursor3D';
import { TankBounds } from './TankBounds';
import { applyScatterPulse3D, getSchoolCenter3D, stepBoids3D } from './simulation/boids3d';
import { createFish3D } from './simulation/createFish3d';
import { getMinimumCameraDistance, tankBounds3D } from './simulation/settings3d';
import type { Debug3D, Decoy3D, Fish3D, FishTankSettings3D, Predator3D, TankBounds3D, Vec3 } from './simulation/types';
import { clamp, normalize3 } from './simulation/vector3';

export type CameraControls3D = {
  yaw: number;
  pitch: number;
  distance: number;
};

export type MouseControlState3D = {
  dx: number;
  dy: number;
  leftDown: boolean;
  leftPressed: boolean;
};

export type AbilityState3D = {
  blackHole: boolean;
  scatterPulse: number;
  decoyPulse: number;
};

type FishTankSceneProps = {
  settings: FishTankSettings3D;
  resetSeed: number;
  pointerLocked: boolean;
  cameraControlsRef: MutableRefObject<CameraControls3D>;
  mouseControlRef: MutableRefObject<MouseControlState3D>;
  abilitiesRef: MutableRefObject<AbilityState3D>;
  onFpsChange: (fps: number) => void;
};

const initialDebug: Debug3D = {
  rayStart: { x: 0, y: 0, z: 0 },
  rayEnd: { x: 0, y: 0, z: 0 },
  target: { x: 0, y: 0, z: 0 },
  schoolCenter: { x: 0, y: 0, z: 0 },
  selected: [],
  cameraMinDistance: getMinimumCameraDistance(tankBounds3D),
};

export function FishTankScene({
  settings,
  resetSeed,
  pointerLocked,
  cameraControlsRef,
  mouseControlRef,
  abilitiesRef,
  onFpsChange,
}: FishTankSceneProps) {
  const fishRef = useRef<Fish3D[]>(createFish3D(settings.fishCount, tankBounds3D, resetSeed));
  const predatorsRef = useRef<Predator3D[]>(createPredators(settings.predatorCount));
  const decoysRef = useRef<Decoy3D[]>([]);
  const debugRef = useRef<Debug3D>({ ...initialDebug });
  const settingsRef = useRef(settings);
  const fpsRef = useRef({ frames: 0, elapsed: 0 });

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    fishRef.current = createFish3D(settings.fishCount, tankBounds3D, resetSeed);
    predatorsRef.current = createPredators(settings.predatorCount);
    decoysRef.current = [];
  }, [settings.fishCount, settings.predatorCount, resetSeed]);

  return (
    <Canvas
      className="tank3d-canvas"
      camera={{ position: [0, 8, settings.cameraDistance], fov: 42, near: 0.1, far: 260 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'absolute', inset: 0, zIndex: 1, background: '#dff8ff' }}
    >
      <color attach="background" args={['#dff8ff']} />
      <fog attach="fog" args={['#dff8ff', 70, 145]} />
      <ambientLight intensity={1.75} />
      <hemisphereLight args={['#ffffff', '#7fcbe4', 1.65]} />
      <directionalLight position={[18, 28, 22]} intensity={3.1} />
      <pointLight position={[-20, 14, -18]} intensity={1.2} color="#8fd8ff" />
      <WaterVolume bounds={tankBounds3D} />
      <SceneLoop
        fishRef={fishRef}
        predatorsRef={predatorsRef}
        debugRef={debugRef}
        settingsRef={settingsRef}
        pointerLocked={pointerLocked}
        cameraControlsRef={cameraControlsRef}
        mouseControlRef={mouseControlRef}
        abilitiesRef={abilitiesRef}
        decoysRef={decoysRef}
        fpsRef={fpsRef}
        onFpsChange={onFpsChange}
      />
      <TankBounds bounds={tankBounds3D} visible={settings.showTankBounds} />
      <FishInstances3D fishRef={fishRef} settings={settings} />
      <PredatorCursor3D predatorsRef={predatorsRef} settings={settings} />
      <DecoySpheres decoysRef={decoysRef} settings={settings} />
      <Debug3DOverlay debugRef={debugRef} settings={settings} />
    </Canvas>
  );
}

type SceneLoopProps = {
  fishRef: MutableRefObject<Fish3D[]>;
  predatorsRef: MutableRefObject<Predator3D[]>;
  debugRef: MutableRefObject<Debug3D>;
  settingsRef: MutableRefObject<FishTankSettings3D>;
  pointerLocked: boolean;
  cameraControlsRef: MutableRefObject<CameraControls3D>;
  mouseControlRef: MutableRefObject<MouseControlState3D>;
  abilitiesRef: MutableRefObject<AbilityState3D>;
  decoysRef: MutableRefObject<Decoy3D[]>;
  fpsRef: MutableRefObject<{ frames: number; elapsed: number }>;
  onFpsChange: (fps: number) => void;
};

function SceneLoop({
  fishRef,
  predatorsRef,
  debugRef,
  settingsRef,
  pointerLocked,
  cameraControlsRef,
  mouseControlRef,
  abilitiesRef,
  decoysRef,
  fpsRef,
  onFpsChange,
}: SceneLoopProps) {
  const { camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const cameraRight = useMemo(() => new THREE.Vector3(), []);
  const cameraUp = useMemo(() => new THREE.Vector3(), []);
  const lastScatterPulseRef = useRef(0);
  const lastDecoyPulseRef = useRef(0);
  const nextDecoyIdRef = useRef(1);
  const draggingIdRef = useRef<number | null>(null);

  useFrame((state, dt) => {
    const settings = settingsRef.current;
    const controls = cameraControlsRef.current;
    const mouse = mouseControlRef.current;
    const minDistance = getMinimumCameraDistance(tankBounds3D);
    const dx = mouse.dx;
    const dy = mouse.dy;
    mouse.dx = 0;
    mouse.dy = 0;

    controls.distance = clamp(controls.distance, minDistance, 110);
    controls.pitch = clamp(controls.pitch, -1.05, 1.05);

    if (pointerLocked && !settings.paused && draggingIdRef.current === null) {
      controls.yaw -= dx * 0.0052;
      controls.pitch = clamp(controls.pitch + dy * 0.0042, -1.05, 1.05);
    }

    const cosPitch = Math.cos(controls.pitch);
    camera.position.set(
      Math.sin(controls.yaw) * cosPitch * controls.distance,
      Math.sin(controls.pitch) * controls.distance,
      Math.cos(controls.yaw) * cosPitch * controls.distance,
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const predators = predatorsRef.current;
    const schoolCenter = getSchoolCenter3D(fishRef.current);
    const schoolHeading = getAverageHeading3D(fishRef.current);

    if (!settings.paused) {
      if (mouse.leftPressed) {
        draggingIdRef.current = pointerLocked
          ? findPredatorUnderReticle(predators, camera, raycaster, settings.predatorBodyRadius)
          : null;
        mouse.leftPressed = false;
      }
      if (!mouse.leftDown) {
        draggingIdRef.current = null;
      }

      if (draggingIdRef.current !== null) {
        dragPredatorWithMouse(
          predators,
          draggingIdRef.current,
          dx,
          dy,
          camera,
          cameraRight,
          cameraUp,
          settings,
          tankBounds3D,
        );
      }

      updateAutoPredators(
        predators,
        fishRef.current,
        schoolCenter,
        schoolHeading,
        settings,
        tankBounds3D,
        dt,
        state.clock.elapsedTime,
        draggingIdRef.current,
      );

      const primaryPredator = predators[0];
      if (abilitiesRef.current.scatterPulse !== lastScatterPulseRef.current) {
        lastScatterPulseRef.current = abilitiesRef.current.scatterPulse;
        if (settings.scatterEnabled && primaryPredator) {
          applyScatterPulse3D(fishRef.current, primaryPredator, settings);
        }
      }

      if (abilitiesRef.current.decoyPulse !== lastDecoyPulseRef.current) {
        lastDecoyPulseRef.current = abilitiesRef.current.decoyPulse;
        if (settings.decoyEnabled && primaryPredator) {
          decoysRef.current.push({
            id: nextDecoyIdRef.current,
            x: primaryPredator.x,
            y: primaryPredator.y,
            z: primaryPredator.z,
            life: settings.decoyLifetime,
          });
          nextDecoyIdRef.current += 1;
        }
      }

      updateDecoys(decoysRef.current, dt);

      const nextSchoolCenter = stepBoids3D(
        fishRef.current,
        predators,
        settings,
        tankBounds3D,
        dt,
        state.clock.elapsedTime,
        decoysRef.current,
        abilitiesRef.current.blackHole,
      );

      const debugTarget = primaryPredator ?? predators[0];
      debugRef.current = {
        rayStart: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        rayEnd: debugTarget
          ? { x: debugTarget.targetX, y: debugTarget.targetY, z: debugTarget.targetZ }
          : { x: 0, y: 0, z: 0 },
        target: debugTarget
          ? { x: debugTarget.targetX, y: debugTarget.targetY, z: debugTarget.targetZ }
          : { x: 0, y: 0, z: 0 },
        schoolCenter: nextSchoolCenter,
        selected: decoysRef.current.map((decoy) => ({ x: decoy.x, y: decoy.y, z: decoy.z })),
        cameraMinDistance: minDistance,
      };
    } else {
      const primaryPredator = predators[0];
      debugRef.current = {
        ...debugRef.current,
        rayStart: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        rayEnd: primaryPredator
          ? { x: primaryPredator.targetX, y: primaryPredator.targetY, z: primaryPredator.targetZ }
          : { x: 0, y: 0, z: 0 },
        target: primaryPredator
          ? { x: primaryPredator.targetX, y: primaryPredator.targetY, z: primaryPredator.targetZ }
          : { x: 0, y: 0, z: 0 },
        schoolCenter,
        cameraMinDistance: minDistance,
      };
    }

    fpsRef.current.frames += 1;
    fpsRef.current.elapsed += dt;
    if (fpsRef.current.elapsed >= 0.35) {
      onFpsChange(Math.round(fpsRef.current.frames / fpsRef.current.elapsed));
      fpsRef.current.frames = 0;
      fpsRef.current.elapsed = 0;
    }
  });

  return null;
}

function createPredators(count: number): Predator3D[] {
  return Array.from({ length: clamp(Math.round(count), 1, 8) }, (_, index) => {
    const angle = (index / Math.max(1, count)) * Math.PI * 2;
    const x = Math.cos(angle) * 16;
    const z = Math.sin(angle) * 11;
    const y = Math.sin(angle * 0.7) * 4.2;
    return {
      id: index + 1,
      x,
      y,
      z,
      previousX: x,
      previousY: y,
      previousZ: z,
      targetX: x,
      targetY: y,
      targetZ: z,
      active: true,
      sprintTimer: 0,
      sprintCooldown: 0.8 + index * 0.23,
      phase: angle,
    };
  });
}

function updateAutoPredators(
  predators: Predator3D[],
  fish: Fish3D[],
  schoolCenter: Vec3,
  schoolHeading: Vec3,
  settings: FishTankSettings3D,
  bounds: TankBounds3D,
  dt: number,
  elapsed: number,
  draggedId: number | null,
): void {
  for (let index = 0; index < predators.length; index += 1) {
    const predator = predators[index];
    predator.active = true;
    predator.previousX = predator.x;
    predator.previousY = predator.y;
    predator.previousZ = predator.z;

    if (predator.id === draggedId) {
      movePredatorTowardTarget(predator, settings.predatorAutoSpeed * 1.4, settings, bounds, dt);
      continue;
    }

    predator.sprintTimer = Math.max(0, predator.sprintTimer - dt);
    predator.sprintCooldown = Math.max(0, predator.sprintCooldown - dt);
    const target = getStrategyTarget(predator, index, predators.length, fish, schoolCenter, schoolHeading, settings, elapsed);
    predator.targetX = target.x;
    predator.targetY = target.y;
    predator.targetZ = target.z;
    clampPredatorTarget(predator, settings, bounds);

    const distanceToSchool = Math.hypot(predator.x - schoolCenter.x, predator.y - schoolCenter.y, predator.z - schoolCenter.z);
    const pulse = pseudoRandom(elapsed * 0.7 + predator.id * 13.17);
    if (
      predator.sprintCooldown <= 0
      && predator.sprintTimer <= 0
      && distanceToSchool < settings.predatorChaseSpread + settings.predatorRadius * 1.15
      && pulse < settings.predatorSprintChance * dt
    ) {
      predator.sprintTimer = settings.predatorSprintDuration;
      predator.sprintCooldown = settings.predatorSprintCooldown;
    }

    const speed = settings.predatorAutoSpeed * (predator.sprintTimer > 0 ? settings.predatorSprintMultiplier : 1);
    movePredatorTowardTarget(predator, speed, settings, bounds, dt);
  }
}

function getStrategyTarget(
  predator: Predator3D,
  index: number,
  count: number,
  fish: Fish3D[],
  center: Vec3,
  heading: Vec3,
  settings: FishTankSettings3D,
  elapsed: number,
): Vec3 {
  const angle = elapsed * 0.34 + predator.phase;
  const spread = settings.predatorChaseSpread;
  const phase = (index / Math.max(1, count)) * Math.PI * 2;
  const side = normalize3(-heading.z, 0, heading.x);

  if (settings.predatorStrategy === 'dolphinDrive') {
    const crescent = Math.sin(phase) * spread * 0.82;
    const vertical = Math.cos(phase) * spread * 0.22;
    return {
      x: center.x - heading.x * spread * 1.05 + side.x * crescent,
      y: center.y + vertical,
      z: center.z - heading.z * spread * 1.05 + side.z * crescent,
    };
  }

  if (settings.predatorStrategy === 'sharkStrike') {
    const wide = spread * (predator.sprintTimer > 0 ? 0.25 : 1.65);
    return {
      x: center.x + Math.cos(angle * 0.8 + phase) * wide,
      y: center.y + Math.sin(angle * 1.2 + phase) * spread * 0.28,
      z: center.z + Math.sin(angle * 0.8 + phase) * wide,
    };
  }

  if (settings.predatorStrategy === 'sealAmbush') {
    const edge = getEdgeFish(fish, center, phase + elapsed * 0.22);
    return {
      x: edge.x - heading.x * spread * 0.42 + Math.cos(angle) * 1.2,
      y: edge.y - 1.8 + Math.sin(angle * 1.3) * 1.2,
      z: edge.z - heading.z * spread * 0.42 + Math.sin(angle) * 1.2,
    };
  }

  const radius = spread * (predator.sprintTimer > 0 ? 0.36 : 1);
  return {
    x: center.x + Math.cos(angle + phase) * radius,
    y: center.y + Math.sin(angle * 0.76 + phase) * spread * 0.34,
    z: center.z + Math.sin(angle + phase) * radius,
  };
}

function movePredatorTowardTarget(
  predator: Predator3D,
  speed: number,
  settings: FishTankSettings3D,
  bounds: TankBounds3D,
  dt: number,
): void {
  clampPredatorTarget(predator, settings, bounds);
  const dx = predator.targetX - predator.x;
  const dy = predator.targetY - predator.y;
  const dz = predator.targetZ - predator.z;
  const distance = Math.hypot(dx, dy, dz);
  if (distance > 0.0001) {
    const step = Math.min(distance, speed * dt);
    predator.x += (dx / distance) * step;
    predator.y += (dy / distance) * step;
    predator.z += (dz / distance) * step;
  }
}

function clampPredatorTarget(predator: Predator3D, settings: FishTankSettings3D, bounds: TankBounds3D): void {
  const margin = settings.predatorBodyRadius;
  predator.targetX = clamp(predator.targetX, -bounds.width / 2 + margin, bounds.width / 2 - margin);
  predator.targetY = clamp(predator.targetY, -bounds.height / 2 + margin, bounds.height / 2 - margin);
  predator.targetZ = clamp(predator.targetZ, -bounds.depth / 2 + margin, bounds.depth / 2 - margin);
  predator.x = clamp(predator.x, -bounds.width / 2 + margin, bounds.width / 2 - margin);
  predator.y = clamp(predator.y, -bounds.height / 2 + margin, bounds.height / 2 - margin);
  predator.z = clamp(predator.z, -bounds.depth / 2 + margin, bounds.depth / 2 - margin);
}

function dragPredatorWithMouse(
  predators: Predator3D[],
  id: number,
  dx: number,
  dy: number,
  camera: THREE.Camera,
  right: THREE.Vector3,
  up: THREE.Vector3,
  settings: FishTankSettings3D,
  bounds: TankBounds3D,
): void {
  const predator = predators.find((item) => item.id === id);
  if (!predator) {
    return;
  }
  right.setFromMatrixColumn(camera.matrixWorld, 0);
  up.setFromMatrixColumn(camera.matrixWorld, 1);
  const scale = 0.018 * (settings.cameraDistance / 31);
  predator.targetX += (right.x * dx - up.x * dy) * scale;
  predator.targetY += (right.y * dx - up.y * dy) * scale;
  predator.targetZ += (right.z * dx - up.z * dy) * scale;
  predator.sprintTimer = 0;
  predator.sprintCooldown = Math.max(predator.sprintCooldown, 0.6);
  clampPredatorTarget(predator, settings, bounds);
}

function findPredatorUnderReticle(
  predators: Predator3D[],
  camera: THREE.Camera,
  raycaster: THREE.Raycaster,
  radius: number,
): number | null {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  let bestId: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  const point = new THREE.Vector3();
  for (const predator of predators) {
    point.set(predator.x, predator.y, predator.z);
    const distanceToRay = Math.sqrt(raycaster.ray.distanceSqToPoint(point));
    const distanceToCamera = camera.position.distanceTo(point);
    if (distanceToRay < radius * 1.55 && distanceToCamera < bestDistance) {
      bestDistance = distanceToCamera;
      bestId = predator.id;
    }
  }
  return bestId;
}

function getAverageHeading3D(fish: Fish3D[]): Vec3 {
  if (fish.length === 0) {
    return { x: 1, y: 0, z: 0 };
  }
  let x = 0;
  let y = 0;
  let z = 0;
  for (const item of fish) {
    x += item.vx;
    y += item.vy;
    z += item.vz;
  }
  const heading = normalize3(x, y, z);
  return heading.x === 0 && heading.y === 0 && heading.z === 0 ? { x: 1, y: 0, z: 0 } : heading;
}

function getEdgeFish(fish: Fish3D[], center: Vec3, phase: number): Vec3 {
  if (fish.length === 0) {
    return center;
  }
  const axis = normalize3(Math.cos(phase), Math.sin(phase * 0.7) * 0.35, Math.sin(phase));
  let best = fish[0];
  let bestDot = Number.NEGATIVE_INFINITY;
  for (const item of fish) {
    const dot = (item.x - center.x) * axis.x + (item.y - center.y) * axis.y + (item.z - center.z) * axis.z;
    if (dot > bestDot) {
      best = item;
      bestDot = dot;
    }
  }
  return { x: best.x, y: best.y, z: best.z };
}

function pseudoRandom(value: number): number {
  return Math.abs(Math.sin(value * 12.9898) * 43758.5453) % 1;
}

function updateDecoys(decoys: Decoy3D[], dt: number): void {
  for (const decoy of decoys) {
    decoy.life -= dt;
  }
  for (let index = decoys.length - 1; index >= 0; index -= 1) {
    if (decoys[index].life <= 0) {
      decoys.splice(index, 1);
    }
  }
}

function WaterVolume({ bounds }: { bounds: TankBounds3D }) {
  return (
    <group>
      <mesh position={[0, -bounds.height / 2 - 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[bounds.width * 1.35, bounds.depth * 1.35, 1, 1]} />
        <meshBasicMaterial color="#89d1e8" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -bounds.depth / 2 - 0.05]}>
        <planeGeometry args={[bounds.width * 1.08, bounds.height * 1.08, 1, 1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.11} depthWrite={false} />
      </mesh>
    </group>
  );
}

function DecoySpheres({
  decoysRef,
  settings,
}: {
  decoysRef: MutableRefObject<Decoy3D[]>;
  settings: FishTankSettings3D;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const decoys = decoysRef.current;
    mesh.visible = settings.decoyEnabled;
    mesh.count = decoys.length;
    for (let i = 0; i < decoys.length; i += 1) {
      const decoy = decoys[i];
      dummy.position.set(decoy.x, decoy.y, decoy.z);
      dummy.scale.setScalar(0.45 + Math.max(0, decoy.life / Math.max(settings.decoyLifetime, 0.1)) * 0.18);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 16]}>
      <sphereGeometry args={[1, 16, 10]} />
      <meshBasicMaterial color="#2b8fc0" transparent opacity={0.58} />
    </instancedMesh>
  );
}
