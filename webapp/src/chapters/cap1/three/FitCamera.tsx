import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Encuadra la cámara a los límites de un objeto de la escena (por defecto el
 * grupo `fit-root` que `AnatomyStage` pone alrededor de sus children), sin tocar
 * el ángulo de observación actual. Evita el "modelo diminuto flotando".
 *
 * `refit` — cuando su valor cambia, se vuelve a encuadrar (p.ej. al alternar
 * pierna/brazo). Sin `refit`, encuadra una vez al montar.
 */
export function FitCamera({
  targetName = 'fit-root',
  padding = 1.35,
  lookTarget,
  refit,
}: {
  targetName?: string;
  padding?: number;
  lookTarget?: [number, number, number];
  refit?: unknown;
}) {
  const { camera, scene, controls } = useThree();

  useEffect(() => {
    // Esperar un par de frames a que las mallas GLB estén en la escena.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const obj = scene.getObjectByName(targetName);
        if (!obj) return;
        const box = new THREE.Box3().setFromObject(obj);
        if (box.isEmpty()) return;

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const persp = camera as THREE.PerspectiveCamera;
        const vFov = (persp.fov * Math.PI) / 180;
        const dist = (maxDim / 2 / Math.tan(vFov / 2)) * padding;

        const ctrlTarget = (controls as unknown as { target?: THREE.Vector3 })?.target;
        const dir = camera.position.clone().sub(ctrlTarget ?? center);
        if (dir.lengthSq() < 1e-6) dir.set(0.4, 0.25, 1);
        dir.normalize();

        camera.position.copy(center).addScaledVector(dir, dist);
        persp.near = Math.max(0.01, dist / 100);
        persp.far = dist * 100;
        persp.updateProjectionMatrix();

        const look = lookTarget ? new THREE.Vector3(...lookTarget) : center;
        if (ctrlTarget) {
          ctrlTarget.copy(look);
          (controls as unknown as { update: () => void }).update();
        } else {
          camera.lookAt(look);
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refit, targetName, padding, camera, scene, controls]);

  return null;
}
