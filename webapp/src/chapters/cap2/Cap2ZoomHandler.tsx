import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type Cap2ZoomAction = 'in' | 'out' | 'reset';

export const CAP2_ZOOM_EVENT = 'cap2:zoom-camera';

interface Cap2ZoomHandlerProps {
  initialPosition: [number, number, number];
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
}

export default function Cap2ZoomHandler({
  initialPosition,
  target = [0, 0, 0],
  minDistance = 0.45,
  maxDistance = 5,
}: Cap2ZoomHandlerProps) {
  const { camera } = useThree();

  useEffect(() => {
    const focus = new THREE.Vector3(...target);
    const initial = new THREE.Vector3(...initialPosition);

    const onZoom = (event: Event) => {
      const action = (event as CustomEvent<{ action?: Cap2ZoomAction }>).detail?.action;
      if (!action) return;

      if (action === 'reset') {
        camera.position.copy(initial);
        camera.lookAt(focus);
        camera.updateProjectionMatrix();
        return;
      }

      const direction = camera.position.clone().sub(focus);
      const distance = THREE.MathUtils.clamp(
        direction.length() * (action === 'in' ? 0.78 : 1.28),
        minDistance,
        maxDistance,
      );
      camera.position.copy(focus).add(direction.normalize().multiplyScalar(distance));
      camera.lookAt(focus);
      camera.updateProjectionMatrix();
    };

    window.addEventListener(CAP2_ZOOM_EVENT, onZoom);
    return () => window.removeEventListener(CAP2_ZOOM_EVENT, onZoom);
  }, [camera, initialPosition, target, minDistance, maxDistance]);

  return null;
}
