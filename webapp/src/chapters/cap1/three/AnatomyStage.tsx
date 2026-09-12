import React, { Suspense, useEffect, useId, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { AccessibleOrbitControls, SceneControlPad } from '../AccessibleOrbitControls';
import { STUDIO_BG } from './materials';
import { StudioLights } from './StudioLights';
import { FitCamera } from './FitCamera';
import { sharedGLEnabled } from './sharedGL';
import { useSharedStage } from './SharedStage';

// ── Boundary + detección de WebGL (impl. de referencia: BodyScene.tsx) ──
class ThreeErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[AnatomyStage] Falló inicialización WebGL/3D:', error);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl') || c.getContext('webgl2');
    return !!(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
}

const WebGLFallback = (
  <div
    className="three-container"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: STUDIO_BG,
      padding: '2rem',
      textAlign: 'center',
    }}
  >
    <div style={{ maxWidth: '380px', background: '#fff', border: '1px solid #d4c7b0', borderRadius: '14px', padding: '1.8rem', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#232c36', marginBottom: '0.6rem' }}>Aceleración Gráfica Desactivada</h3>
      <p style={{ fontSize: '0.82rem', color: '#43505c', lineHeight: 1.5, marginBottom: '1rem' }}>
        Tu navegador o sistema no tiene habilitado <strong>WebGL</strong>. Para interactuar con las escenas 3D:
      </p>
      <ol style={{ fontSize: '0.78rem', color: '#6b7885', textAlign: 'left', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
        <li>Abre los Ajustes de tu navegador.</li>
        <li>En <em>Sistema</em>, activa <strong>"Usar aceleración por hardware"</strong>.</li>
        <li>O abre la plataforma desde Chrome o Firefox actualizado.</li>
      </ol>
    </div>
  </div>
);

function DefaultLoader() {
  return (
    <Html center style={{ pointerEvents: 'none' }}>
      <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', border: '1px solid #d4c7b0', borderRadius: '12px', padding: '1rem 1.4rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', fontFamily: 'system-ui, sans-serif', minWidth: '200px' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #e0d7c7', borderTopColor: '#0d6e64', borderRadius: '50%', animation: 'anatstage-spin 0.8s linear infinite', margin: '0 auto 0.55rem' }} />
        <style>{'@keyframes anatstage-spin{to{transform:rotate(360deg)}}'}</style>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#232c36' }}>Cargando anatomía 3D…</div>
      </div>
    </Html>
  );
}

// ── Rig interno de cámara: reset y zoom por señal ──
type ZoomSignal = { type: 'in' | 'out'; time: number } | null;

function CameraRig({
  position,
  target,
  resetSignal,
  fit,
}: {
  position: [number, number, number];
  target: [number, number, number];
  resetSignal: number;
  fit: boolean;
}) {
  const { camera, controls } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: { target: THREE.Vector3; update: () => void } | null;
  };
  useEffect(() => {
    if (fit) return; // FitCamera es dueño de la cámara
    camera.position.set(...position);
    if (controls?.target) {
      controls.target.set(...target);
      controls.update();
    } else {
      camera.lookAt(...target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);
  return null;
}

function ZoomHandler({ zoomSignal }: { zoomSignal: ZoomSignal }) {
  const { camera, controls } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: { target: THREE.Vector3; update: () => void } | null;
  };
  useEffect(() => {
    if (!zoomSignal) return;
    const t = controls?.target ? controls.target.clone() : new THREE.Vector3();
    const factor = zoomSignal.type === 'in' ? 0.78 : 1.28;
    const dir = new THREE.Vector3().subVectors(camera.position, t);
    const dist = THREE.MathUtils.clamp(dir.length() * factor, 1.5, 40);
    dir.normalize().multiplyScalar(dist);
    camera.position.copy(t).add(dir);
    camera.updateProjectionMatrix();
    controls?.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomSignal]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modo «GL compartido»: en vez de un <Canvas> (contexto WebGL) por stage, todos
// los stages de cap1 comparten un único <Canvas> persistente (ver
// three/SharedStage.tsx). Cada stage visible REGISTRA su escena; el host la
// renderiza en ese Canvas y mueve el lienzo a su contenedor. Evita el
// `THREE.WebGLRenderer: Context Lost.` al acumularse contextos con la ventana de
// diapositivas ±1. Detrás del flag `sharedGLEnabled()`; apagado → <Canvas>
// clásico por stage (más abajo).
// ─────────────────────────────────────────────────────────────────────────────

interface SharedGLStageProps {
  id?: string;
  className?: string;
  overlay?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.MutableRefObject<any>;
  cameraPos: [number, number, number];
  cameraFov: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  target: [number, number, number];
  onPointerMissed?: () => void;
  children: React.ReactNode;
}

function SharedGLStage({
  id,
  className,
  overlay,
  controlsRef,
  cameraPos,
  cameraFov,
  minDistance,
  maxDistance,
  minPolarAngle,
  maxPolarAngle,
  autoRotate,
  autoRotateSpeed,
  target,
  onPointerMissed,
  children,
}: SharedGLStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageId = useId();
  const { register, unregister } = useSharedStage();

  // Sub-árbol r3f de la escena: mismo contenido y orden que el camino clásico,
  // pero se lo entregamos al <Canvas> compartido en vez de montar uno propio.
  const sceneNode = (
    <>
      <PerspectiveCamera makeDefault position={cameraPos} fov={cameraFov} near={0.1} far={1000} />
      {children}
      <AccessibleOrbitControls
        controlsRef={controlsRef}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        target={target}
      />
    </>
  );

  // Re-registra la escena en cada render de este stage (que ocurre al cambiar sus
  // props: resetSignal, zoomSignal, mode, ángulos…). `register` repinta el host
  // de forma aislada — NO re-renderiza este componente, así que el efecto no se
  // realimenta. El provider sólo se re-renderiza al navegar de slide.
  useEffect(() => {
    const el = wrapRef.current;
    if (el) register(stageId, { el, node: sceneNode, onPointerMissed });
  });
  useEffect(() => () => unregister(stageId), [stageId, unregister]);

  return (
    <div
      ref={wrapRef}
      id={id}
      className={`three-container${className ? ` ${className}` : ''}`}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      {/* El <Canvas> compartido se inserta como primer hijo por SharedStageHost. */}
      <SceneControlPad controlsRef={controlsRef} />
      {overlay}
    </div>
  );
}

export interface AnatomyStageProps {
  camera: { position: [number, number, number]; fov?: number };
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  /** Cuadrícula de piso. */
  grid?: boolean;
  gridY?: number;
  gridArgs?: [number, number, string, string];
  /** Sombra de contacto. */
  shadow?: boolean;
  shadowY?: number;
  shadowScale?: number;
  shadowOpacity?: number;
  /** Señales estándar de los slides. */
  resetSignal?: number;
  zoomSignal?: ZoomSignal;
  /** Auto-encuadre a los límites del contenido (grupo `fit-root`). */
  fit?: boolean;
  fitPadding?: number;
  /** Encuadra un grupo nombrado más pequeño que `fit-root` (p.ej. la
   *  articulación activa) en vez de todo el contenido de la escena. Ese grupo
   *  debe existir dentro de `children`. */
  targetName?: string;
  /** Cuando cambia, se re-encuadra (además de reset). */
  refit?: unknown;
  loader?: React.ReactNode;
  onPointerMissed?: () => void;
  className?: string;
  id?: string;
  /** HTML superpuesto (telemetría, badges) — hermano del `<Canvas>`, no dentro de él. */
  overlay?: React.ReactNode;
  /** Contenido de referencia (planos translúcidos, conos de recorrido, huesos de
   *  contexto) que debe verse pero NO debe contar para el encuadre — por eso
   *  vive fuera de `fit-root`. Sin esto, una lámina de referencia más grande
   *  que el objetivo lo empequeñecía (V2-01, B3: el plano dominaba la caja). */
  contextChildren?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Escenario 3D estándar del atlas anatómico: `<Canvas>` + fondo de estudio +
 * rig de 3 luces + sombra de contacto + cuadrícula + OrbitControls accesibles +
 * SceneControlPad + ErrorBoundary/fallback WebGL. Reemplaza ~120 líneas de
 * boilerplate por escena. Ver BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md §5.
 */
export function AnatomyStage({
  camera,
  target = [0, 0, 0],
  minDistance = 2,
  maxDistance = 32,
  minPolarAngle = Math.PI / 6,
  maxPolarAngle = Math.PI / 1.8,
  autoRotate = false,
  autoRotateSpeed = 1.2,
  grid = true,
  gridY = -3.24,
  gridArgs = [8, 16, '#c6bca6', '#ded6c5'],
  shadow = true,
  shadowY = -3.24,
  shadowScale = 8,
  shadowOpacity = 0.46,
  resetSignal = 0,
  zoomSignal = null,
  fit = false,
  fitPadding = 1.35,
  targetName,
  refit,
  loader,
  onPointerMissed,
  className,
  id,
  overlay,
  contextChildren,
  children,
}: AnatomyStageProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(checkWebGLSupport()), []);
  // En modo «GL compartido» varias escenas viven en el mismo THREE.Scene; un
  // nombre fijo "fit-root" haría que scene.getObjectByName devolviera el de
  // OTRA diapositiva ya montada (el primero que encuentre en el árbol), no el
  // de esta. Cada instancia necesita su propio nombre.
  const fitRootName = `fit-root-${useId()}`;

  useEffect(() => {
    controlsRef.current?.reset?.();
  }, [resetSignal]);

  if (!webgl) return <div id={id}>{WebGLFallback}</div>;

  // Rig 3D común a los dos caminos (Canvas propio / View compartido). Mismo árbol
  // y mismo orden que antes; solo se ha izado a una variable para no duplicarlo.
  const sceneChildren = (
    <>
      <CameraRig position={camera.position} target={target} resetSignal={resetSignal} fit={fit} />
      <ZoomHandler zoomSignal={zoomSignal} />

      {/* Rig de estudio compartido (ambiente bajo + principal + contra). */}
      <StudioLights keyIntensity={1.55} />

      {grid && <gridHelper args={gridArgs} position={[0, gridY, 0]} />}

      <Suspense fallback={loader ?? <DefaultLoader />}>
        <group name={fitRootName}>{children}</group>
        {contextChildren}
        {shadow && (
          <ContactShadows position={[0, shadowY, 0]} opacity={shadowOpacity} scale={shadowScale} blur={2.4} far={5} color="#232c36" />
        )}
        {/* resetSignal siempre entra en la clave: si un slide ya usa `refit` para
            reencuadrar al cambiar de selección, «Restablecer» debe reencuadrar
            también, no solo cuando cambia esa selección. */}
        {/* Con un `targetName` propio (p.ej. la articulación activa en vez de
            fit-root), mirar al centro de ESE grupo, no al `target` fijo de la
            escena entera — si no, el objetivo queda descentrado en el visor. */}
        {fit && (
          <FitCamera
            targetName={targetName ?? fitRootName}
            padding={fitPadding}
            lookTarget={targetName ? undefined : target}
            refit={`${String(refit)}:${resetSignal}`}
          />
        )}
      </Suspense>
    </>
  );

  // Camino «GL compartido»: <View> sobre el <Canvas> anfitrión de Capitulo1.
  if (sharedGLEnabled()) {
    return (
      <SharedGLStage
        id={id}
        className={className}
        overlay={overlay}
        controlsRef={controlsRef}
        cameraPos={camera.position}
        cameraFov={camera.fov ?? 42}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        target={target}
        onPointerMissed={onPointerMissed}
      >
        {sceneChildren}
      </SharedGLStage>
    );
  }

  // Camino clásico: un <Canvas> (contexto WebGL) por stage.
  return (
    <div id={id} className={`three-container${className ? ` ${className}` : ''}`} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <ThreeErrorBoundary fallback={WebGLFallback}>
        <Canvas
          camera={{ position: camera.position, fov: camera.fov ?? 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false, alpha: true }}
          style={{ width: '100%', height: '100%', display: 'block', background: STUDIO_BG }}
          onPointerMissed={onPointerMissed}
        >
          {sceneChildren}

          <AccessibleOrbitControls
            controlsRef={controlsRef}
            minDistance={minDistance}
            maxDistance={maxDistance}
            minPolarAngle={minPolarAngle}
            maxPolarAngle={maxPolarAngle}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            target={target}
          />
        </Canvas>
      </ThreeErrorBoundary>
      <SceneControlPad controlsRef={controlsRef} />
      {overlay}
    </div>
  );
}
