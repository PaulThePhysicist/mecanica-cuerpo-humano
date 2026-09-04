import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Cap2ZoomHandler from './Cap2ZoomHandler';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { DclTag, DclReadout, type DclRow } from './DclReadout';

interface NewtonCanvasProps {
  f1: number;               // Magnitud F1 en N (Deltoides / Músculo)
  theta1: number;           // Ángulo F1 en grados
  f2: number;               // Magnitud F2 en N (Carga / Gravedad)
  theta2: number;           // Ángulo F2 en grados
  armAbductionDeg: number;  // Abducción anatómica del húmero respecto al tronco
  autoEquilibrium: boolean; // Si es true, calcula R = -(F1 + F2) para ΣF = 0
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
  symbol = 'F',
  showComponents = false,
  isDashed = false,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  symbol: string;
  showComponents?: boolean;
  isDashed?: boolean;
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
          emissiveIntensity={0.35}
          transparent={isDashed}
          opacity={isDashed ? 0.75 : 1.0}
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
          emissiveIntensity={0.5}
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

      {/* Etiqueta mínima: sólo el símbolo; las cifras van en el panel de esquina. */}
      <DclTag
        position={[tipPos.x + dir.x * 0.14, tipPos.y + dir.y * 0.14, tipPos.z + dir.z * 0.14]}
        color={color}
        symbol={symbol}
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
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}) {
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

  // El polígono se dibuja algo más grande para que se lea el cierre.
  const VP = V * 1.7;
  const F1p: [number, number, number] = [f1x * VP, f1y * VP, 0];
  const F2p: [number, number, number] = [f2x * VP, f2y * VP, 0];
  const Rp: [number, number, number] = [rx * VP, ry * VP, 0];
  const Fnetp: [number, number, number] = [sumFx * VP, sumFy * VP, 0];
  // Punto común (cola de F₁), centrado y ligeramente arriba del modelo.
  const polyP: [number, number, number] = [0.06, 0.12, Z_BIAS + 0.06];
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
      <group position={[-0.16, 0.04, 0]}>
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
          <Html position={[0.48, 0.42, 0]} center zIndexRange={[70, 0]}>
            <span style={{ color: '#5d6b76', fontSize: '0.52rem', fontFamily: 'Karla, sans-serif', fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none', background: 'rgba(251,248,240,0.7)', padding: '1px 4px', borderRadius: 3 }}>
              DCL · húmero aislado
            </span>
          </Html>
        </>
      )}

      {showPolygon ? (
        <>
          {/* ── Polígono de fuerzas: punta con cola; si ΣF = 0 el triángulo cierra ── */}
          <ForceVector3D origin={polyP} vector={F1p} color="#0d9488" symbol="F₁" />
          <ForceVector3D origin={polyF2Tail} vector={F2p} color="#d97706" symbol="F₂" />
          {autoEquilibrium ? (
            <ForceVector3D origin={polyRTail} vector={Rp} color="#dc2626" symbol="R" />
          ) : (
            fNet > 1 && (
              <>
                <ForceVector3D origin={polyRTail} vector={Fnetp} color="#8b5cf6" symbol="ΣF ≠ 0" isDashed />
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
          <ForceVector3D origin={deltInsW} vector={F1vec} color="#0d9488" symbol="F₁" showComponents={showComponents} />

          {/* F₂ · peso del brazo + carga → desde el centro de masa */}
          <ForceVector3D origin={armComW} vector={F2vec} color="#d97706" symbol="F₂" showComponents={showComponents} />

          {/* R · reacción glenoidea → desde el centro de la cabeza humeral */}
          {autoEquilibrium && rMag > 1 && (
            <ForceVector3D origin={headW} vector={Rvec} color="#dc2626" symbol="R" />
          )}

          {/* ΣF ≠ 0 · el segmento acelera / se subluxa */}
          {!autoEquilibrium && fNet > 1 && (
            <ForceVector3D origin={headW} vector={Fnetvec} color="#8b5cf6" symbol="ΣF ≠ 0" isDashed />
          )}
        </>
      )}
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
}: NewtonCanvasProps) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [showPolygon, setShowPolygon] = useState(false);

  // Estática del DCL glenohumeral para el panel de lecturas (fuera del 3D).
  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = (theta2 * Math.PI) / 180;
  const sumFx = f1 * Math.cos(rad1) + f2 * Math.cos(rad2);
  const sumFy = f1 * Math.sin(rad1) + f2 * Math.sin(rad2);
  const rMag = Math.hypot(sumFx, sumFy);
  const dclRows: DclRow[] = [
    { symbol: 'F₁', color: '#0d9488', value: `${f1.toFixed(0)} N`, hint: `${theta1}° · deltoides` },
    { symbol: 'F₂', color: '#d97706', value: `${f2.toFixed(0)} N`, hint: `${theta2}° · peso + carga` },
    autoEquilibrium
      ? { symbol: 'R', color: '#dc2626', value: `${rMag.toFixed(0)} N`, hint: 'reacción glenoidea', strong: true }
      : { symbol: 'ΣF', color: '#8b5cf6', value: `${rMag.toFixed(1)} N`, hint: 'el húmero acelera (m·a)', strong: true },
  ];
  const [showAnatomy, setShowAnatomy] = useState(true);

  return (
    <div className="cap2-webgl-canvas" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0.02, 0.06, 2.62], fov: 40 }}
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
          initialPosition={[0.02, 0.06, 2.62]}
          target={[0, 0, 0]}
          minDistance={1.4}
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
            orbitRef={orbitRef}
          />
        </Suspense>
      </Canvas>
      <div
        aria-live="polite"
        style={{
          position: 'absolute',
          left: '12px',
          top: '12px',
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
      <SceneControlPad controlsRef={orbitRef} />

      {/* Lecturas del DCL ancladas a la esquina (fuera del 3D) */}
      <div
        style={{
          position: 'absolute',
          left: '12px',
          bottom: '12px',
          zIndex: 10,
          transform: 'scale(0.82)',
          transformOrigin: 'bottom left',
          pointerEvents: 'none',
        }}
      >
        <DclReadout
          title="DCL glenohumeral"
          tone={autoEquilibrium ? '#0d6e64' : '#8b5cf6'}
          rows={dclRows}
          note={
            autoEquilibrium
              ? 'Tres fuerzas concurrentes en equilibrio: R cierra el polígono (ΣF = 0).'
              : 'ΣF ≠ 0: el polígono no cierra y el segmento se acelera / subluxa.'
          }
        />
      </div>

      {/* Controles flotantes en la esquina superior derecha */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          aria-pressed={showPolygon}
          title="Mostrar u ocultar el polígono de fuerzas; útil para comprobar ΣF = 0"
          onClick={() => setShowPolygon((p) => !p)}
          style={{
            background: showPolygon ? 'rgba(13, 148, 136, 0.9)' : 'rgba(255, 255, 255, 0.88)',
            color: showPolygon ? '#ffffff' : '#22303c',
            border: '1px solid rgba(13, 148, 136, 0.35)',
            borderRadius: '6px',
            padding: '5px 9px',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {showPolygon ? '✓ Polígono' : '△ Polígono'}
        </button>
        <button
          type="button"
          aria-pressed={showComponents}
          title="Mostrar u ocultar las componentes ortogonales Fx y Fy"
          onClick={() => setShowComponents((c) => !c)}
          style={{
            background: showComponents ? 'rgba(13, 110, 100, 0.9)' : 'rgba(255, 255, 255, 0.88)',
            color: showComponents ? '#ffffff' : '#22303c',
            border: '1px solid rgba(13, 110, 100, 0.35)',
            borderRadius: '6px',
            padding: '5px 9px',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {showComponents ? '✓ Componentes' : '+ Componentes'}
        </button>
        <button
          type="button"
          aria-pressed={showAnatomy}
          title="Mostrar u ocultar huesos, cartílago y deltoides"
          onClick={() => setShowAnatomy((a) => !a)}
          style={{
            background: showAnatomy ? 'rgba(176, 35, 24, 0.9)' : 'rgba(255, 255, 255, 0.88)',
            color: showAnatomy ? '#ffffff' : '#22303c',
            border: '1px solid rgba(176, 35, 24, 0.35)',
            borderRadius: '6px',
            padding: '5px 9px',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {showAnatomy ? '✓ Anatomía' : '+ Anatomía'}
        </button>
      </div>
    </div>
  );
}
