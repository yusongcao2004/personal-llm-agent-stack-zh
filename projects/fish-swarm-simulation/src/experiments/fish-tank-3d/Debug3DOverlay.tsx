import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { Debug3D, FishTankSettings3D } from './simulation/types';

type Debug3DOverlayProps = {
  debugRef: MutableRefObject<Debug3D>;
  settings: FishTankSettings3D;
};

export function Debug3DOverlay({ debugRef, settings }: Debug3DOverlayProps) {
  const rayRef = useRef<THREE.LineSegments>(null);
  const targetRef = useRef<THREE.Mesh>(null);
  const centerRef = useRef<THREE.Mesh>(null);
  const selectedRef = useRef<THREE.InstancedMesh>(null);
  const safetyRef = useRef<THREE.Mesh>(null);
  const rayGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const debug = debugRef.current;
    const ray = rayRef.current;
    if (ray) {
      ray.visible = settings.showMouseRay;
    }
    const attribute = rayGeometry.getAttribute('position') as THREE.BufferAttribute;
    attribute.setXYZ(0, debug.rayStart.x, debug.rayStart.y, debug.rayStart.z);
    attribute.setXYZ(1, debug.rayEnd.x, debug.rayEnd.y, debug.rayEnd.z);
    attribute.needsUpdate = true;

    if (targetRef.current) {
      targetRef.current.visible = settings.showTargetPoint;
      targetRef.current.position.set(debug.target.x, debug.target.y, debug.target.z);
    }

    if (centerRef.current) {
      centerRef.current.visible = settings.showSchoolCenter;
      centerRef.current.position.set(debug.schoolCenter.x, debug.schoolCenter.y, debug.schoolCenter.z);
    }

    if (safetyRef.current) {
      safetyRef.current.visible = settings.showCameraSafety;
      safetyRef.current.scale.setScalar(debug.cameraMinDistance);
    }

    const selected = selectedRef.current;
    if (selected) {
      selected.visible = settings.showAutoDepthFish;
      selected.count = Math.min(debug.selected.length, 32);
      for (let i = 0; i < selected.count; i += 1) {
        const item = debug.selected[i];
        dummy.position.set(item.x, item.y, item.z);
        dummy.scale.setScalar(0.18);
        dummy.updateMatrix();
        selected.setMatrixAt(i, dummy.matrix);
      }
      selected.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <lineSegments ref={rayRef} geometry={rayGeometry}>
        <lineBasicMaterial color="#f06b38" transparent opacity={0.72} />
      </lineSegments>
      <mesh ref={targetRef}>
        <sphereGeometry args={[0.22, 16, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={centerRef}>
        <sphereGeometry args={[0.25, 16, 10]} />
        <meshBasicMaterial color="#2b8fc0" />
      </mesh>
      <instancedMesh ref={selectedRef} args={[undefined, undefined, 32]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial color="#ffd66b" transparent opacity={0.78} />
      </instancedMesh>
      <mesh ref={safetyRef}>
        <sphereGeometry args={[1, 36, 20]} />
        <meshBasicMaterial color="#2d7fa8" transparent opacity={0.045} wireframe depthWrite={false} />
      </mesh>
    </group>
  );
}
