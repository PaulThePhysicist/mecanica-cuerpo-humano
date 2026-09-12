import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Encuadra la cámara a los límites de un objeto de la escena (por defecto el
 * grupo `fit-root` que `AnatomyStage` pone alrededor de sus children), sin tocar
 * el ángulo de observación actual. Evita el "modelo diminuto flotando".
 *
 * El encuadre proyecta los 8 vértices de la caja sobre los ejes «derecha» y
 * «arriba» de la propia cámara (no los del mundo): la caja está alineada a
 * los ejes del mundo, y la cámara casi nunca mira desde uno de esos ejes, así
 * que ninguna dimensión de la caja (`size.x/y/z`) coincide con lo que de
 * verdad ocupa en la pantalla. `Math.max(size.x,y,z)` subestimaba ese tamaño
 * en ángulos oblicuos (recortaba bordes); la esfera envolvente lo sobrestimaba
 * para objetos alargados o en «L» vistos de lado (los dejaba diminutos) — el
 * codo (compacto) encuadraba bien con la esfera, el hombro (escápula + húmero
 * completo, muy extendido) no. Proyectar sobre los ejes reales de la cámara
 * no tiene ninguno de los dos sesgos: mide exactamente lo que va a ocupar en
 * el visor, venga la forma y el ángulo que venga (B1/B2/B3 en la auditoría
 * V2-01).
 *
 * El reencuadre se anima (amortiguado, `THREE.MathUtils.damp`) en vez de
 * saltar de golpe. Al asentarse, guarda el estado en los controles
 * (`saveState`) para que el botón «Restablecer cámara» del panel flotante
 * — que solo sabe hacer `controls.reset()` — vuelva a este encuadre y no al
 * de montaje.
 *
 * `refit` — cuando su valor cambia, se vuelve a encuadrar (p.ej. al alternar
 * pierna/brazo, o al pulsar «Restablecer»). Sin `refit`, encuadra una vez al
 * montar.
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
  const goalPos = useRef<THREE.Vector3 | null>(null);
  const goalLook = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    // Esperar un par de frames a que las mallas GLB estén en la escena.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const obj = scene.getObjectByName(targetName);
        if (!obj) return;
        const box = new THREE.Box3().setFromObject(obj);
        if (box.isEmpty()) return;

        const center = box.getCenter(new THREE.Vector3());
        const persp = camera as THREE.PerspectiveCamera;
        const vFov = (persp.fov * Math.PI) / 180;
        const aspect = persp.aspect || 1;
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

        const ctrlTarget = (controls as unknown as { target?: THREE.Vector3 })?.target;
        const dir = camera.position.clone().sub(ctrlTarget ?? center);
        if (dir.lengthSq() < 1e-6) dir.set(0.4, 0.25, 1);
        dir.normalize();

        // Base ortonormal de la cámara: `dir` es su eje de profundidad, y
        // `right`/`up` el plano sobre el que de verdad se proyecta la caja.
        const worldUp = Math.abs(dir.y) > 0.999 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(worldUp, dir).normalize();
        const up = new THREE.Vector3().crossVectors(dir, right).normalize();

        let maxRight = 0;
        let maxUp = 0;
        const corner = new THREE.Vector3();
        for (let i = 0; i < 8; i++) {
          corner.set(
            i & 1 ? box.max.x : box.min.x,
            i & 2 ? box.max.y : box.min.y,
            i & 4 ? box.max.z : box.min.z,
          ).sub(center);
          maxRight = Math.max(maxRight, Math.abs(corner.dot(right)));
          maxUp = Math.max(maxUp, Math.abs(corner.dot(up)));
        }

        const dist = Math.max(maxUp / Math.tan(vFov / 2), maxRight / Math.tan(hFov / 2)) * padding;

        goalPos.current = center.clone().addScaledVector(dir, dist);
        goalLook.current = lookTarget ? new THREE.Vector3(...lookTarget) : center.clone();

        persp.near = Math.max(0.01, dist / 100);
        persp.far = dist * 100;
        persp.updateProjectionMatrix();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refit, targetName, padding, camera, scene, controls]);

  useFrame((_, delta) => {
    if (!goalPos.current || !goalLook.current) return;
    const lambda = 7; // amortiguación exponencial, independiente del framerate
    camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.current.x, lambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.current.y, lambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.current.z, lambda, delta);

    const ctrl = controls as unknown as { target?: THREE.Vector3; update?: () => void; saveState?: () => void } | null;
    if (ctrl?.target) {
      ctrl.target.x = THREE.MathUtils.damp(ctrl.target.x, goalLook.current.x, lambda, delta);
      ctrl.target.y = THREE.MathUtils.damp(ctrl.target.y, goalLook.current.y, lambda, delta);
      ctrl.target.z = THREE.MathUtils.damp(ctrl.target.z, goalLook.current.z, lambda, delta);
      ctrl.update?.();
    } else {
      camera.lookAt(goalLook.current);
    }

    if (
      camera.position.distanceToSquared(goalPos.current) < 1e-5 &&
      (!ctrl?.target || ctrl.target.distanceToSquared(goalLook.current) < 1e-5)
    ) {
      goalPos.current = null;
      goalLook.current = null;
      // El botón «↺» del panel flotante solo sabe hacer controls.reset(); sin
      // esto volvería al encuadre de montaje en vez del objetivo actual.
      ctrl?.saveState?.();
    }
  });

  return null;
}
