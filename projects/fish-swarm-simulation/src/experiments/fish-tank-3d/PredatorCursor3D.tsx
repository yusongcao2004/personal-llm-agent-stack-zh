import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { FishTankSettings3D, Predator3D } from './simulation/types';

type PredatorCursor3DProps = {
  predatorsRef: MutableRefObject<Predator3D[]>;
  settings: FishTankSettings3D;
};

export function PredatorCursor3D({ predatorsRef, settings }: PredatorCursor3DProps) {
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const finRef = useRef<THREE.InstancedMesh>(null);
  const influenceRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const model = useMemo(() => getPredatorModel(settings.predatorStrategy), [settings.predatorStrategy]);
  const finGeometry = useMemo(() => createPredatorFinGeometry(settings.predatorStrategy), [settings.predatorStrategy]);
  const coreMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: settings.predatorColor,
    emissive: settings.predatorColor,
    emissiveIntensity: 0.88,
    roughness: 0.16,
    metalness: 0.1,
  }), [settings.predatorColor]);
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: settings.predatorColor,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  }), [settings.predatorColor]);
  const sphereMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: settings.predatorColor,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  }), [settings.predatorColor]);
  const finMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: model.finColor,
    emissive: settings.predatorColor,
    emissiveIntensity: 0.28,
    roughness: 0.28,
    metalness: 0.08,
    side: THREE.DoubleSide,
  }), [model.finColor, settings.predatorColor]);

  useFrame(() => {
    const predators = predatorsRef.current;
    for (const mesh of [coreRef.current, glowRef.current, finRef.current, influenceRef.current]) {
      if (mesh) {
        mesh.count = predators.length;
      }
    }

    for (let i = 0; i < predators.length; i += 1) {
      const predator = predators[i];
      direction
        .set(predator.x - predator.previousX, predator.y - predator.previousY, predator.z - predator.previousZ)
        .normalize();
      dummy.quaternion.setFromUnitVectors(FORWARD, direction.lengthSq() > 0 ? direction : FORWARD);
      dummy.position.set(predator.x, predator.y, predator.z);

      if (coreRef.current) {
        const sprintScale = predator.sprintTimer > 0 ? 1.14 : 1;
        dummy.scale.set(
          settings.predatorBodyRadius * model.bodyScale.x * sprintScale,
          settings.predatorBodyRadius * model.bodyScale.y,
          settings.predatorBodyRadius * model.bodyScale.z * sprintScale,
        );
        dummy.updateMatrix();
        coreRef.current.setMatrixAt(i, dummy.matrix);
      }

      if (glowRef.current) {
        dummy.scale.setScalar(settings.predatorBodyRadius * (predator.sprintTimer > 0 ? 2.2 : 1.55));
        dummy.updateMatrix();
        glowRef.current.setMatrixAt(i, dummy.matrix);
      }

      if (finRef.current) {
        dummy.scale.setScalar(settings.predatorBodyRadius * model.finScale);
        dummy.updateMatrix();
        finRef.current.setMatrixAt(i, dummy.matrix);
      }

      if (influenceRef.current) {
        dummy.scale.setScalar(settings.predatorRadius);
        dummy.updateMatrix();
        influenceRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    if (coreRef.current) coreRef.current.instanceMatrix.needsUpdate = true;
    if (glowRef.current) glowRef.current.instanceMatrix.needsUpdate = true;
    if (finRef.current) finRef.current.instanceMatrix.needsUpdate = true;
    if (influenceRef.current) {
      influenceRef.current.visible = settings.showPredatorSphere;
      influenceRef.current.instanceMatrix.needsUpdate = true;
    }

    const first = predators[0];
    if (lightRef.current && first) {
      lightRef.current.color.set(settings.predatorColor);
      lightRef.current.position.set(first.x, first.y, first.z);
      lightRef.current.intensity = first.sprintTimer > 0 ? 7 : 4.6;
    }
  });

  return (
    <group>
      <instancedMesh ref={influenceRef} args={[undefined, undefined, 8]}>
        <sphereGeometry args={[1, 32, 18]} />
        <primitive object={sphereMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, 8]}>
        <sphereGeometry args={[1, 36, 20]} />
        <primitive object={glowMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh ref={coreRef} args={[undefined, undefined, 8]}>
        <sphereGeometry args={[1, 48, 28]} />
        <primitive object={coreMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh ref={finRef} args={[finGeometry, undefined, 8]}>
        <primitive object={finMaterial} attach="material" />
      </instancedMesh>
      <pointLight ref={lightRef} color={settings.predatorColor} intensity={4.6} distance={9} />
    </group>
  );
}

const FORWARD = new THREE.Vector3(0, 0, 1);

function getPredatorModel(strategy: FishTankSettings3D['predatorStrategy']) {
  if (strategy === 'dolphinDrive') {
    return {
      bodyScale: { x: 0.72, y: 0.58, z: 1.78 },
      finScale: 0.86,
      finColor: '#2f718a',
    };
  }
  if (strategy === 'sharkStrike') {
    return {
      bodyScale: { x: 0.86, y: 0.62, z: 2.08 },
      finScale: 1.15,
      finColor: '#14384f',
    };
  }
  if (strategy === 'sealAmbush') {
    return {
      bodyScale: { x: 0.88, y: 0.72, z: 1.34 },
      finScale: 0.78,
      finColor: '#4b6470',
    };
  }
  return {
    bodyScale: { x: 0.98, y: 0.72, z: 1.72 },
    finScale: 1.08,
    finColor: '#101820',
  };
}

function createPredatorFinGeometry(strategy: FishTankSettings3D['predatorStrategy']): THREE.BufferGeometry {
  const tall = strategy === 'orcaCarousel' || strategy === 'sharkStrike';
  const sideFins = strategy === 'sealAmbush';
  const dorsalHeight = tall ? 1.1 : 0.62;
  const tail = strategy === 'dolphinDrive' ? 1.05 : 0.82;
  const vertices = sideFins
    ? new Float32Array([
      -0.82, 0, -0.2, -1.36, -0.34, -0.72, -0.58, -0.06, -0.52,
      0.82, 0, -0.2, 1.36, -0.34, -0.72, 0.58, -0.06, -0.52,
      0, 0, -0.94, -0.48, 0.22, -1.42, 0.48, 0.22, -1.42,
    ])
    : new Float32Array([
      0, 0.55, -0.12, 0, 0.55 + dorsalHeight, -0.58, 0, 0.08, -0.44,
      -0.5, 0, -0.82, -0.98, 0.16, -1.28 * tail, -0.2, 0, -1.02,
      0.5, 0, -0.82, 0.98, 0.16, -1.28 * tail, 0.2, 0, -1.02,
    ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  geometry.computeVertexNormals();
  return geometry;
}
