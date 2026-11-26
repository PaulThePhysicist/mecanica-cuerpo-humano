import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AnatomyStage } from '../cap1/three/AnatomyStage';
import { useAnatomyScene } from '../cap1/three/useAnatomyNodes';
import { materials } from '../cap1/three/materials';
import { setStabProjector } from './sims';
import CanvasReserveState from './CanvasReserveState';

/**
 * Escena 3D de estabilidad (S1) sobre el escenario estándar `AnatomyStage`
 * (BIOMECHANICAL_3D_STANDARD §5): esqueleto de BodyParts3D en el espacio
 * canónico (1,0 de alto, de pie sobre +Y, anterior = +Z), con el material PBR
 * compartido `materials.bone`.
 *
 * Cambios frente a la versión anterior (AUDITORIA_CAP3 T-09/T-10):
 *  · vista de PERFIL (anterior → +X) para que la inclinación sea adelante/atrás,
 *    coherente con el talón/dedos de la proyección 2D;
 *  · `rotation.z = −θ`: θ > 0 inclina hacia adelante (antes iba al revés);
 *  · no muta los materiales cacheados del GLB (eran compartidos con cap1);
 *  · `frameloop="demand"`: no hay render continuo; solo se pinta al cambiar θ/H
 *    o al orbitar (OrbitControls invalida mientras amortigua);
 *  · la proyección mundo→pantalla se registra con `setStabProjector` en vez de
 *    un objeto global `window.__stab3d`.
 */

/** Del modelo canónico: el talón (calcáneo) queda en z ≈ −0,054 del eje del cuerpo. */
const HEEL_Z = -0.054;
/** Talón del modelo de una línea del Prob. 3.1: 0,25 · 0,152 = 0,038 de la estatura. */
const MODEL_HEEL = 0.038;

function readToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * `AnatomyStage` no expone `frameloop` y el `<Canvas>` de R3F vuelve a aplicar
 * su `frameloop="always"` por defecto cada vez que se re-renderiza (cambio de
 * θ/H, fin de carga…). Por eso se re-impone «demand» en el primer frame que
 * llegue a correr en modo continuo: como mucho se cuela UN frame extra.
 */
function DemandFrameloop() {
  useFrame((state) => {
    if (state.frameloop !== 'demand') state.setFrameloop('demand');
  });
  return null;
}

/** Publica la proyección y avisa al lienzo 2D cuando cambia la vista. */
function ProjectionBridge({ onView }: { onView: () => void }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const last = useRef<number[]>([]);
  const onViewRef = useRef(onView);
  onViewRef.current = onView;

  useEffect(() => {
    const v = new THREE.Vector3();
    setStabProjector((x, y, z) => {
      v.set(x, y, z).project(camera);
      return { x: (v.x * 0.5 + 0.5) * size.width, y: (-v.y * 0.5 + 0.5) * size.height };
    });
    onViewRef.current();
    return () => {
      setStabProjector(null);
      onViewRef.current();
    };
  }, [camera, size]);

  // Solo corre en los frames que se renderizan (demand): coste 0 en reposo.
  useFrame(() => {
    const e = camera.matrixWorld.elements;
    const prev = last.current;
    let changed = prev.length !== 16;
    for (let i = 0; !changed && i < 16; i++) changed = Math.abs(prev[i] - e[i]) > 1e-6;
    if (changed) {
      last.current = Array.from(e);
      onViewRef.current();
    }
  });
  return null;
}

function Skeleton({ theta, H, onReady }: { theta: number; H: number; onReady: () => void }) {
  const scene = useAnatomyScene('body');
  const invalidate = useThree((s) => s.invalidate);
  const model = useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = materials.bone;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return m;
  }, [scene]);

  useLayoutEffect(() => {
    onReady();
  }, [onReady]);
  useEffect(() => {
    invalidate();
  }, [theta, H, invalidate]);

  // Pivote en el suelo bajo el CM (x = 0); el cuerpo gira alrededor de él.
  return (
    <group rotation={[0, 0, -THREE.MathUtils.degToRad(theta)]}>
      <group position={[(-HEEL_Z - MODEL_HEEL) * H, 0.5 * H, 0]} rotation={[0, Math.PI / 2, 0]} scale={H}>
        <primitive object={model} />
      </group>
    </group>
  );
}

class LocalBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('[cap3/StabScene3D] escena 3D no disponible:', err);
  }
  render() {
    return this.state.failed ? <CanvasReserveState label="esqueleto 3D (se muestra el esquema 2D)" /> : this.props.children;
  }
}

export default function StabScene3D({ theta, H, onView }: { theta: number; H: number; onView: () => void }) {
  const [ready, setReady] = useState(false);
  const grid = useMemo(
    () => [6, 12, readToken('--line', '#cfc3a9'), readToken('--line-soft', '#e2d9c4')] as [number, number, string, string],
    [],
  );
  const onReady = React.useCallback(() => setReady(true), []);

  return (
    <div className="cap3-three-stage" aria-label="Escena 3D: esqueleto de perfil sobre su base de sustentación">
      <LocalBoundary>
        <AnatomyStage
          camera={{ position: [0.15, 1.05, 4.3], fov: 36 }}
          target={[0.05, 0.86, 0]}
          minDistance={2.2}
          maxDistance={8}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.9}
          grid
          gridY={0.001}
          gridArgs={grid}
          shadowY={0.002}
          shadowScale={3}
          shadowOpacity={0.35}
          overlay={
            <div className={`cap3-three-loading${ready ? ' is-ready' : ''}`} aria-live="polite">
              {ready ? 'Esqueleto listo · arrastra para orbitar' : 'Cargando esqueleto 3D…'}
            </div>
          }
        >
          <DemandFrameloop />
          <ProjectionBridge onView={onView} />
          <Skeleton theta={theta} H={H} onReady={onReady} />
        </AnatomyStage>
      </LocalBoundary>
    </div>
  );
}
