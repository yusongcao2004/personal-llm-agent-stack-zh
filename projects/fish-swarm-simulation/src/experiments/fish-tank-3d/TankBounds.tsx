import { useMemo } from 'react';
import * as THREE from 'three';
import type { TankBounds3D } from './simulation/types';

type TankBoundsProps = {
  bounds: TankBounds3D;
  visible: boolean;
};

export function TankBounds({ bounds, visible }: TankBoundsProps) {
  const edgesGeometry = useMemo(() => createBoxEdges(bounds), [bounds]);

  if (!visible) {
    return null;
  }

  return (
    <group>
      <mesh>
        <boxGeometry args={[bounds.width, bounds.height, bounds.depth]} />
        <meshPhysicalMaterial
          color="#b8e7f7"
          transparent
          opacity={0.18}
          roughness={0.08}
          transmission={0.46}
          thickness={0.2}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#19779f" transparent opacity={0.78} />
      </lineSegments>
    </group>
  );
}

function createBoxEdges(bounds: TankBounds3D): THREE.BufferGeometry {
  const x = bounds.width / 2;
  const y = bounds.height / 2;
  const z = bounds.depth / 2;
  const points = [
    [-x, -y, -z], [x, -y, -z],
    [x, -y, -z], [x, y, -z],
    [x, y, -z], [-x, y, -z],
    [-x, y, -z], [-x, -y, -z],
    [-x, -y, z], [x, -y, z],
    [x, -y, z], [x, y, z],
    [x, y, z], [-x, y, z],
    [-x, y, z], [-x, -y, z],
    [-x, -y, -z], [-x, -y, z],
    [x, -y, -z], [x, -y, z],
    [x, y, -z], [x, y, z],
    [-x, y, -z], [-x, y, z],
  ].flat();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}
