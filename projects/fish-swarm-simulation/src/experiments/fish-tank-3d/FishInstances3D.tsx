import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { Fish3D, FishTankSettings3D } from './simulation/types';

type FishInstances3DProps = {
  fishRef: MutableRefObject<Fish3D[]>;
  settings: FishTankSettings3D;
};

const FORWARD = new THREE.Vector3(0, 0, 1);

export function FishInstances3D({ fishRef, settings }: FishInstances3DProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createFishGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const fish = fishRef.current;
    mesh.count = fish.length;
    for (let i = 0; i < fish.length; i += 1) {
      const item = fish[i];
      direction.set(item.vx, item.vy, item.vz).normalize();
      dummy.position.set(item.x, item.y, item.z);
      dummy.quaternion.setFromUnitVectors(FORWARD, direction.lengthSq() > 0 ? direction : FORWARD);
      const scale = 1.04 + item.panic * 0.12;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (item.hitTimer > 0) {
        const hit = Math.min(1, item.hitTimer / 0.46);
        color.setRGB(1, 0.12 + (1 - hit) * 0.34, 0.08 + (1 - hit) * 0.5);
      } else if (settings.showAutoDepthFish && item.autoDepthSelected) {
        color.setRGB(1, 0.74, 0.34);
      } else {
        const panic = item.panic;
        const shimmer = 0.08 + ((item.id % 7) / 7) * 0.08;
        color.setRGB(0.45 + shimmer + panic * 0.28, 0.68 + shimmer + panic * 0.12, 0.78 + shimmer);
      }
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, Math.max(settings.fishCount, 6000)]}>
      <meshStandardMaterial
        color="#b9eef7"
        emissive="#75bdd4"
        emissiveIntensity={0.42}
        roughness={0.24}
        metalness={0.44}
        side={THREE.DoubleSide}
        vertexColors
      />
    </instancedMesh>
  );
}

function createFishGeometry(): THREE.BufferGeometry {
  const vertices = new Float32Array([
    0, 0, 0.48,
    0, 0.15, -0.16,
    0.14, 0, -0.16,
    0, -0.15, -0.16,
    -0.14, 0, -0.16,
    0, 0, -0.36,
    0, 0.24, -0.62,
    0, -0.24, -0.62,
    0.24, 0, -0.58,
    -0.24, 0, -0.58,
  ]);
  const indices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 1,
    5, 2, 1,
    5, 3, 2,
    5, 4, 3,
    5, 1, 4,
    5, 6, 7,
    5, 8, 9,
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
