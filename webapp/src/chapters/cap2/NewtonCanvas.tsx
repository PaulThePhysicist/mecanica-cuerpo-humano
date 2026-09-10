import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Cap2ZoomHandler from './Cap2ZoomHandler';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
  useLabelsVisible,
} from '../cap1/three/Callouts';

/** Fuerza del DCL que el texto ha puesto en foco (las otras se atenúan). */
export type FocusForce = 'F1' | 'F2' | 'R' | null;

interface NewtonCanvasProps {
  f1: number;               // Magnitud F1 en N (Deltoides / Músculo)
  theta1: number;           // Ángulo F1 en grados
  f2: number;               // Magnitud F2 en N (Carga / Gravedad)
  theta2: number;           // Ángulo F2 en grados
  armAbductionDeg: number;  // Abducción anatómica del húmero respecto al tronco
  autoEquilibrium: boolean; // Si es true, calcula R = -(F1 + F2) para ΣF = 0
  // ── Estado de presentación: lo gobierna la columna de teoría del slide ──
  // Estos cuatro eran `useState` locales con su fila de botones sobre el lienzo.
  // Ahora los pulsa el propio texto (ver Slide1.tsx), que es quien explica cada
  // uno; el lienzo se queda solo con el modelo y el pad ⚙.
  showLabels: boolean;
  showPolygon: boolean;
  showComponents: boolean;
  showAnatomy: boolean;
  focusForce: FocusForce;
}

const BONE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#ede5d0'),
  roughness: 0.65,
  metalness: 0.05,
});

const CARTILAGE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#68c5b8'),
  roughness: 0.25,
  metalness: 0.1,
  transparent: true,
  opacity: 0.85,
});

// Deltoides / manguito en reposo. Mismo tono que el cap. 1 (BodyParts3D) para
// coherencia visual entre capítulos.
const MUSCLE_NEUTRAL_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#9e473e'),
  roughness: 0.62,
  metalness: 0.04,
});

// Deltoides bajo tensión alta (F₁ grande): se ilumina para leerse como el
// generador de la fuerza principal del DCL.
const MUSCLE_ACTIVE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#c0392b'),
  roughness: 0.5,
  metalness: 0.06,
  emissive: new THREE.Color('#5a140d'),
  emissiveIntensity: 0.5,
});

// Landmarks anatómicos en el espacio del GLB human_body.glb (idénticos a cap. 1).
const P_SHOULDER = new THREE.Vector3(-0.096, 0.306, -0.018); // centro glenohumeral
const P_ELBOW = new THREE.Vector3(-0.128, 0.142, -0.016);    // centro del codo

// ── 1. Vector de Fuerza 3D con Tubo, Cono y Badge HTML ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  label,
  sub,
  emphasis,
  showComponents = false,
  isDashed = false,
  dim = false,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  /** Letrero para el riel lateral (símbolo = valor). */
  label: string;
  sub?: string;
  emphasis?: 'strong' | 'muted';
  showComponents?: boolean;
  isDashed?: boolean;
  /** El texto ha puesto el foco en OTRA fuerza: esta se apaga a segundo plano. */
  dim?: boolean;
}) {
  const v = useMemo(() => new THREE.Vector3(...vector), [vector]);
  const len = v.length();

  const dir = useMemo(() => (len > 0.001 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0)), [v, len]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  if (len < 0.05) return null;

  const headLen = Math.min(0.28, Math.max(0.14, len * 0.22));
  const headRadius = headLen * 0.38;
  const shaftLen = Math.max(0.01, len - headLen);
  const shaftRadius = 0.024;

  const midPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen * 0.5));
  const headPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen + headLen * 0.5));
  const tipPos = new THREE.Vector3(...origin).add(v);

  return (
    <group>
      {/* Vástago cilíndrico */}
      <mesh position={[midPos.x, midPos.y, midPos.z]} quaternion={quat}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLen, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={dim ? 0.1 : 0.35}
          transparent={isDashed || dim}
          opacity={dim ? 0.22 : isDashed ? 0.75 : 1.0}
        />
      </mesh>

      {/* Cabeza cónica del vector */}
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat}>
        <coneGeometry args={[headRadius, headLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={dim ? 0.15 : 0.5}
          transparent={dim}
          opacity={dim ? 0.22 : 1}
        />
      </mesh>

      {/* Proyecciones ortogonales Fx, Fy */}
      {showComponents && (
        <group>
          <Line
            points={[
              origin,
              [origin[0] + v.x, origin[1], origin[2]],
              [origin[0] + v.x, origin[1] + v.y, origin[2]],
            ]}
            color={color}
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.06}
            gapSize={0.04}
          />
        </group>
      )}

      {/* Letrero → riel lateral (símbolo = valor), con línea a la punta.
          `Callout` se apaga solo cuando el provider lleva visible={false}. */}
      <Callout
        position={[tipPos.x + dir.x * 0.14, tipPos.y + dir.y * 0.14, tipPos.z + dir.z * 0.14]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
        dim={dim}
      />
    </group>
  );
}

// ── 2. Articulación glenohumeral real (BodyParts3D) + deltoides visible ──
// `human_muscles_arm.glb` se hornea con el transform canónico de
// `bp3d_transform.json` (ver scripts/gen_bp3d_system.py), así que comparte el
// sistema de coordenadas de `human_body.glb` al milímetro: los vientres
// musculares se montan como hermanos directos de las mallas óseas, sin ningún
// ajuste en runtime.

function GlenohumeralJointGLB({
  armAngle,
  deltoidActivation,
  showAnatomy,
}: {
  armAngle: number;          // rad; negativo = brazo elevado (abducción)
  deltoidActivation: number; // 0..1 según F₁; ilumina el deltoides
  showAnatomy: boolean;
}) {
  const showLabels = useLabelsVisible();
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  const shift: [number, number, number] = [-P_SHOULDER.x, -P_SHOULDER.y, -P_SHOULDER.z];

  if (!showAnatomy) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.05, 24, 24]} />
          <meshStandardMaterial
            color="#0d6e64"
            emissive="#0d6e64"
            emissiveIntensity={0.35}
            transparent
            opacity={0.78}
          />
        </mesh>
        {showLabels && (
          <Html position={[0.10, 0.09, 0.04]} center zIndexRange={[80, 0]}>
            <span
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid #0d6e64',
                borderRadius: '4px',
                padding: '2px 5px',
                color: '#0a5a52',
                fontSize: '0.52rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              Centro articular (pivote)
            </span>
          </Html>
        )}
      </group>
    );
  }

  const deltMat = deltoidActivation > 0.55 ? MUSCLE_ACTIVE_MATERIAL : MUSCLE_NEUTRAL_MATERIAL;

  return (
    <group>
      {/* ── Base fija: escápula, clavícula y manguito rotador ── */}
      <group position={shift}>
        {boneNodes?.scapula_R && <mesh geometry={boneNodes.scapula_R.geometry} material={BONE_MATERIAL} />}
        {boneNodes?.clavicle_R && <mesh geometry={boneNodes.clavicle_R.geometry} material={BONE_MATERIAL} />}
        {muscleNodes?.supraspinatus_R && (
          <mesh geometry={muscleNodes.supraspinatus_R.geometry} material={MUSCLE_NEUTRAL_MATERIAL} />
        )}
        {muscleNodes?.infraspinatus_R && (
          <mesh geometry={muscleNodes.infraspinatus_R.geometry} material={MUSCLE_NEUTRAL_MATERIAL} />
        )}
        {muscleNodes?.subscapularis_R && (
          <mesh geometry={muscleNodes.subscapularis_R.geometry} material={MUSCLE_NEUTRAL_MATERIAL} />
        )}
      </group>

      {/* ── Cartílago glenoideo: esfera discreta en el centro articular ── */}
      <mesh>
        <sphereGeometry args={[0.02, 20, 20]} />
        <primitive object={CARTILAGE_MATERIAL} attach="material" />
      </mesh>

      {/* ── Segmento móvil: húmero + deltoides rotan juntos sobre el centro GH ── */}
      <group rotation={[0, 0, armAngle]}>
        <group position={shift}>
          {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={BONE_MATERIAL} />}
          {muscleNodes?.deltoideus_clavicular_R && (
            <mesh geometry={muscleNodes.deltoideus_clavicular_R.geometry} material={deltMat} />
          )}
          {muscleNodes?.deltoideus_acromial_R && (
            <mesh geometry={muscleNodes.deltoideus_acromial_R.geometry} material={deltMat} />
          )}
          {muscleNodes?.deltoideus_spinal_R && (
            <mesh geometry={muscleNodes.deltoideus_spinal_R.geometry} material={deltMat} />
          )}
        </group>
      </group>
    </group>
  );
}

// ── 3. Contenido de la Escena 3D ──
function SceneContent({
  f1,
  theta1,
  f2,
  theta2,
  armAbductionDeg,
  autoEquilibrium,
  showComponents,
  showPolygon,
  showAnatomy,
  focusForce,
  orbitRef,
}: {
  f1: number;
  theta1: number;
  f2: number;
  theta2: number;
  armAbductionDeg: number;
  autoEquilibrium: boolean;
  showComponents: boolean;
  showPolygon: boolean;
  showAnatomy: boolean;
  focusForce: FocusForce;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const showLabels = useLabelsVisible();
  // Foco puesto desde el texto: el resto de fuerzas pasa a segundo plano.
  const dimF1 = focusForce !== null && focusForce !== 'F1';
  const dimF2 = focusForce !== null && focusForce !== 'F2';
  const dimR = focusForce !== null && focusForce !== 'R';
  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = (theta2 * Math.PI) / 180;

  const f1x = f1 * Math.cos(rad1);
  const f1y = f1 * Math.sin(rad1);

  const f2x = f2 * Math.cos(rad2);
  const f2y = f2 * Math.sin(rad2);

  const rx = -(f1x + f2x);
  const ry = -(f1y + f2y);
  const rMag = Math.hypot(rx, ry);
  const rAngle = ((Math.atan2(ry, rx) * 180) / Math.PI + 360) % 360;

  const sumFx = autoEquilibrium ? 0 : f1x + f2x;
  const sumFy = autoEquilibrium ? 0 : f1y + f2y;
  const fNet = Math.hypot(sumFx, sumFy);

  // Letreros del riel (mismos valores que llenaban el DclReadout).
  const lF1 = `F₁ = ${f1.toFixed(0)} N`;
  const sF1 = `${theta1}° · deltoides`;
  const lF2 = `F₂ = ${f2.toFixed(0)} N`;
  const sF2 = `${theta2}° · peso + carga`;
  const lR = autoEquilibrium ? `R = ${rMag.toFixed(0)} N` : `ΣF = ${rMag.toFixed(1)} N`;
  const sR = autoEquilibrium ? 'reacción glenoidea' : 'el húmero acelera (m·a)';
  const cR = autoEquilibrium ? '#dc2626' : '#8b5cf6';

  // N → unidades de mundo. Calibrado para que ~120 N ≈ la longitud del húmero
  // renderizado (≈ 0,63 u), de modo que las flechas acompañen a la anatomía en
  // vez de aplastarla (antes: 0,015 → flechas 3× el modelo).
  const V = 0.0052;

  const armAngle = -(armAbductionDeg * Math.PI) / 180;

  // ── Anclajes anatómicos (unidades de mundo, tras el escalado del modelo) ──
  const S = 3.8;
  const rotZ = (p: [number, number, number], a: number): [number, number, number] => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  };
  const add = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[0] + b[0], a[1] + b[1], a[2] + b[2],
  ];
  // Eje del húmero (hombro → codo) en unidades de mundo.
  const humW: [number, number, number] = [
    (P_ELBOW.x - P_SHOULDER.x) * S,
    (P_ELBOW.y - P_SHOULDER.y) * S,
    (P_ELBOW.z - P_SHOULDER.z) * S,
  ];
  // Las flechas viven en un plano ligeramente por delante de la malla (Z_BIAS)
  // para que nunca queden ocultas dentro del deltoides o del húmero.
  const Z_BIAS = 0.16;
  const headW: [number, number, number] = [0, 0, Z_BIAS];               // centro glenohumeral
  const deltInsW = rotZ([humW[0] * 0.20, humW[1] * 0.20, Z_BIAS], armAngle); // tuberosidad deltoidea
  const armComW = rotZ([humW[0] * 0.78, humW[1] * 0.78, Z_BIAS], armAngle);  // CdM del brazo (peso)
  const acromionW: [number, number, number] = [-0.05, 0.10, Z_BIAS];    // acromion (fijo, en la escápula)

  // Vectores de fuerza anclados (plano XY, N × V).
  const F1vec: [number, number, number] = [f1x * V, f1y * V, 0];
  const F2vec: [number, number, number] = [f2x * V, f2y * V, 0];
  const Rvec: [number, number, number] = [rx * V, ry * V, 0];
  const Fnetvec: [number, number, number] = [sumFx * V, sumFy * V, 0];

  // ── Polígono de fuerzas: centrado y autoescalado ──
  // Antes usaba un factor fijo (V × 1,7) y una cola fija en [0.06, 0.12], así que
  // en cuanto F₁ crecía el triángulo se salía del encuadre por arriba. Ahora se
  // mide el recuadro que ocupa el recorrido cabeza-con-cola y se elige la escala
  // y el desplazamiento para que quepa siempre y quede centrado en el cuadro.
  // Recorrido en newtons: cola → F₁ → F₂ → (cierre con R, o ΣF si no hay equilibrio).
  const walk: [number, number][] = [
    [0, 0],
    [f1x, f1y],
    [f1x + f2x, f1y + f2y],
  ];
  if (!autoEquilibrium) walk.push([f1x + f2x + sumFx, f1y + f2y + sumFy]);
  const wx = walk.map((p) => p[0]);
  const wy = walk.map((p) => p[1]);
  const minX = Math.min(...wx), maxX = Math.max(...wx);
  const minY = Math.min(...wy), maxY = Math.max(...wy);
  // Lado útil del encuadre a la profundidad del polígono (cámara a 1,85 con fov 42).
  const POLY_FIT = 0.94;
  const VP = Math.min(
    V * 1.7,
    POLY_FIT / Math.max(maxX - minX, 1e-6),
    POLY_FIT / Math.max(maxY - minY, 1e-6),
  );
  const F1p: [number, number, number] = [f1x * VP, f1y * VP, 0];
  const F2p: [number, number, number] = [f2x * VP, f2y * VP, 0];
  const Rp: [number, number, number] = [rx * VP, ry * VP, 0];
  const Fnetp: [number, number, number] = [sumFx * VP, sumFy * VP, 0];
  // Cola de F₁ tal que el centro del recuadro caiga en el eje de cámara.
  const polyP: [number, number, number] = [
    -((minX + maxX) / 2) * VP,
    -((minY + maxY) / 2) * VP,
    Z_BIAS + 0.06,
  ];
  const polyF2Tail = add(polyP, F1p);
  const polyRTail = add(polyF2Tail, F2p);

  // Línea de acción del deltoides (guía tenue tuberosidad → acromion).
  const deltLine: [number, number, number][] = [deltInsW, acromionW];
  // Vertical de gravedad por el CdM del brazo.
  const gravLine: [number, number, number][] = [
    [armComW[0], armComW[1] + 0.12, armComW[2]],
    [armComW[0], armComW[1] - 0.5, armComW[2]],
  ];
  // Frontera del DCL: anillo discontinuo que "aísla" el húmero.
  const dclRing: [number, number, number][] = [];
  for (let i = 0; i <= 56; i++) {
    const a = (i / 56) * Math.PI * 2;
    dclRing.push([Math.cos(a) * 0.5 - 0.06, Math.sin(a) * 0.5 - 0.08, -0.12]);
  }

  return (
    <>
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={1.2}
        maxDistance={6.0}
        target={[0, 0, 0]}
      />

      {/* Iluminación con más modelado: menos ambiente (antes 0.92 aplanaba la
          forma), luz principal más intensa y una luz de contra que perfila la
          silueta contra el fondo. */}
      <ambientLight intensity={0.5} color="#fffcf5" />
      <directionalLight position={[3.5, 5, 3.5]} intensity={1.75} color="#fff6e6" castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#dcecf7" />
      <directionalLight position={[-1.2, 1.6, -4]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[0, -3, 2]} intensity={0.18} color="#faf0e6" />

      <ContactShadows
        position={[0, -0.56, 0]}
        opacity={0.55}
        scale={2.6}
        blur={2.6}
        far={2.2}
        color="#241d12"
      />

      {/* Grupo de encuadre: centra articulación + brazo + vectores en el cuadro. */}
      <group position={[-0.14, -0.12, 0]}>
      <group scale={S} position={[0, 0, 0]}>
        <GlenohumeralJointGLB
          armAngle={armAngle}
          deltoidActivation={Math.max(0, Math.min(1, (f1 - 20) / 80))}
          showAnatomy={showAnatomy}
        />
      </group>

      {/* ── Frontera del DCL (sólo en la vista anclada) ── */}
      {!showPolygon && (
        <>
          <Line points={dclRing} color="#7a8a99" lineWidth={1.2} dashed dashScale={26} dashSize={0.05} gapSize={0.04} transparent opacity={0.68} />
          {showLabels && (
            <Html position={[0.48, 0.42, 0]} center zIndexRange={[70, 0]}>
              <span style={{ color: '#5d6b76', fontSize: '0.52rem', fontFamily: 'Karla, sans-serif', fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none', background: 'rgba(251,248,240,0.7)', padding: '1px 4px', borderRadius: 3 }}>
                DCL · húmero aislado
              </span>
            </Html>
          )}
        </>
      )}

      {showPolygon ? (
        <>
          {/* ── Polígono de fuerzas: punta con cola; si ΣF = 0 el triángulo cierra ── */}
          <ForceVector3D origin={polyP} vector={F1p} color="#0d9488" label={lF1} sub={sF1} />
          <ForceVector3D origin={polyF2Tail} vector={F2p} color="#d97706" label={lF2} sub={sF2} />
          {autoEquilibrium ? (
            <ForceVector3D origin={polyRTail} vector={Rp} color={cR} label={lR} sub={sR} emphasis="strong" />
          ) : (
            fNet > 1 && (
              <>
                <ForceVector3D origin={polyRTail} vector={Fnetp} color={cR} label={lR} sub={sR} emphasis="strong" isDashed />
                <Line points={[polyRTail, polyP]} color="#8b5cf6" lineWidth={1.4} dashed dashScale={22} dashSize={0.05} gapSize={0.04} />
              </>
            )
          )}
        </>
      ) : (
        <>
          {/* ── Vista anclada: cada fuerza en su punto de aplicación real ── */}
          <Line points={deltLine} color="#0d9488" lineWidth={1} dashed dashScale={30} dashSize={0.04} gapSize={0.03} transparent opacity={0.55} />
          <Line points={gravLine} color="#b8860b" lineWidth={1} dashed dashScale={30} dashSize={0.04} gapSize={0.03} transparent opacity={0.45} />

          {/* F₁ · deltoides → desde la tuberosidad deltoidea */}
          <ForceVector3D origin={deltInsW} vector={F1vec} color="#0d9488" label={lF1} sub={sF1} showComponents={showComponents} dim={dimF1} />

          {/* F₂ · peso del brazo + carga → desde el centro de masa */}
          <ForceVector3D origin={armComW} vector={F2vec} color="#d97706" label={lF2} sub={sF2} showComponents={showComponents} dim={dimF2} />

          {/* R · reacción glenoidea → desde el centro de la cabeza humeral */}
          {autoEquilibrium && rMag > 1 && (
            <ForceVector3D origin={headW} vector={Rvec} color={cR} label={lR} sub={sR} emphasis="strong" dim={dimR} />
          )}

          {/* ΣF ≠ 0 · el segmento acelera / se subluxa */}
          {!autoEquilibrium && fNet > 1 && (
            <ForceVector3D origin={headW} vector={Fnetvec} color={cR} label={lR} sub={sR} emphasis="strong" isDashed dim={dimR} />
          )}
        </>
      )}
      {/* Sin letreros no hay nada que proyectar: el bucle por frame ni se monta. */}
      <CalloutSource />
      </group>
    </>
  );
}

// Pre-carga de modelos GLB
useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_arm.glb');

export default function NewtonCanvas({
  f1,
  theta1,
  f2,
  theta2,
  armAbductionDeg,
  autoEquilibrium,
  showLabels,
  showPolygon,
  showComponents,
  showAnatomy,
  focusForce,
}: NewtonCanvasProps) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const callouts = useCalloutStore();

  const railNote = autoEquilibrium
    ? 'Tres fuerzas concurrentes en equilibrio: R cierra el polígono (ΣF = 0).'
    : 'ΣF ≠ 0: el polígono no cierra y el segmento se acelera / subluxa.';

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="cap2-webgl-canvas" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0.02, -0.02, 1.85], fov: 42 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          // Viñeta más marcada: centro cálido apagado, bordes claramente más
          // oscuros. Separa la anatomía marfil del fondo (antes el centro era
          // blanco puro y el hueso "desaparecía").
          background: 'radial-gradient(circle at 50% 38%, #ece3ce 0%, #ddd1b6 52%, #c6b697 100%)',
        }}
      >
        <Cap2ZoomHandler
          initialPosition={[0.02, -0.02, 1.85]}
          target={[0, 0, 0]}
          minDistance={1.1}
          maxDistance={6}
        />
        <Suspense fallback={null}>
          <SceneContent
            f1={f1}
            theta1={theta1}
            f2={f2}
            theta2={theta2}
            armAbductionDeg={armAbductionDeg}
            autoEquilibrium={autoEquilibrium}
            showComponents={showComponents}
            showPolygon={showPolygon}
            showAnatomy={showAnatomy}
            focusForce={focusForce}
            orbitRef={orbitRef}
          />
        </Suspense>
      </Canvas>
      {showLabels && (
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            left: '12px',
            // Debajo del pad «⚙ Controles 3D», que ocupa la esquina hasta y≈39.
            top: '52px',
            zIndex: 10,
            padding: '5px 9px',
            border: '1px solid rgba(13, 110, 100, 0.35)',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.88)',
            color: '#0a5a52',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          Húmero · abducción {armAbductionDeg}°
        </div>
      )}
      {showLabels && (
        <div
          role="note"
          style={{
            position: 'absolute',
            right: '12px',
            bottom: '12px',
            zIndex: 10,
            padding: '4px 8px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.82)',
            color: '#55606d',
            fontSize: '0.56rem',
            fontFamily: 'Karla, sans-serif',
            pointerEvents: 'none',
          }}
        >
          Arrastra · rueda: zoom · doble clic: enfoca
        </div>
      )}
      <SceneControlPad controlsRef={orbitRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      {showLabels && <CalloutRail store={callouts} side="left" note={railNote} />}

    </div>
    </CalloutProvider>
  );
}
