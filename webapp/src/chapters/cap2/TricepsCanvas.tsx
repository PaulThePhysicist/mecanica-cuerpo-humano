import React, { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';
import { FitCameraResize as FitCamera } from './three/FitCameraResize';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

/** Estática de la extensión de codo (palanca de 1ª clase). Fuente única. */
function tricepsSolve(pushLoadKg: number, insertCm: number) {
  const g = 9.81;
  const wPushN = pushLoadKg * g;
  const dHandM = 0.35;
  const dM = insertCm / 100;
  const mechanicalRatio = dHandM / dM;
  const fTricepsN = wPushN * mechanicalRatio;
  const rJointN = fTricepsN + wPushN; // aditiva (misma dirección)
  return { g, wPushN, mechanicalRatio, fTricepsN, fTricepsKgf: fTricepsN / g, rJointN, rJointKgf: rJointN / g };
}

interface TricepsCanvasProps {
  pushLoadKg?: number; // Fuerza de empuje en mano en kg (1 a 25 kg, default: 6)
  insertCm?: number;   // Brazo del olécranon d (2.0 a 4.0 cm, default: 2.5 cm)
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

// ── Paleta de Materiales Anatómicos PBR de Grado Médico ──
const BONE_IVORY = new THREE.Color('#ede5d0');
const BONE_DEEP = new THREE.Color('#ded3be');
const CARTILAGE_PURPLE = new THREE.Color('#7c3aed');
const TENDON_NACRE = new THREE.Color('#f5f0e6');

// Centro anatómico de rotación troclear del codo
const P_ELBOW = new THREE.Vector3(-0.128, 0.142, -0.016);

// ── Vector 3D de Fuerza; su letrero va al riel lateral ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  label,
  sub,
  emphasis,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  label: string;
  sub?: string;
  emphasis?: 'strong' | 'muted';
}) {
  const v = useMemo(() => new THREE.Vector3(...vector), [vector]);
  const len = v.length();

  const dir = useMemo(() => (len > 0.001 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0)), [v, len]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  if (len < 0.018) return null;

  const headLen = Math.min(0.046, Math.max(0.024, len * 0.25));
  const headRadius = headLen * 0.36;
  const shaftLen = Math.max(0.005, len - headLen);
  const shaftRadius = 0.009;

  const midPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen * 0.5));
  const headPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen + headLen * 0.5));
  const tipPos = new THREE.Vector3(...origin).add(v);

  return (
    <group>
      {/* Fuste cilíndrico */}
      <mesh position={[midPos.x, midPos.y, midPos.z]} quaternion={quat}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.22}
          metalness={0.25}
          emissive={color}
          emissiveIntensity={0.40}
        />
      </mesh>

      {/* Cabeza cónica */}
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat}>
        <coneGeometry args={[headRadius, headLen, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.18}
          metalness={0.35}
          emissive={color}
          emissiveIntensity={0.60}
        />
      </mesh>

      <Callout
        position={[tipPos.x + dir.x * 0.038, tipPos.y + dir.y * 0.038, tipPos.z + dir.z * 0.038]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── Línea de Caliper 3D para Visualizar Brazos de Palanca (d y D) ──
function LeverArmCaliper3D({
  start,
  end,
  color,
  label,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  label: string;
}) {
  const { curve, midPos } = useMemo(() => {
    const p0 = new THREE.Vector3(...start);
    const p1 = new THREE.Vector3(...end);
    const c = new THREE.LineCurve3(p0, p1);
    const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
    return { curve: c, midPos: mid };
  }, [start, end]);

  const geom = useMemo(() => new THREE.TubeGeometry(curve, 10, 0.0025, 8, false), [curve]);

  return (
    <group>
      <mesh geometry={geom}>
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
      <Callout position={[midPos.x, midPos.y, midPos.z]} label={label} color={color} emphasis="muted" />
    </group>
  );
}

// ── Escena 3D del Tríceps Braquial con Palanca de 1ª Clase ──
function RealArmTricepsScene({
  pushLoadKg,
  insertCm,
}: {
  pushLoadKg: number;
  insertCm: number;
}) {
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  // ── Física del Tríceps (Palanca de 1ª Clase) — fuente única ──
  const { wPushN, mechanicalRatio, fTricepsN } = tricepsSolve(pushLoadKg, insertCm);
  const rJointN = fTricepsN + wPushN;
  const lFt = `F_t = ${fTricepsN.toFixed(0)} N`;
  const sFt = `${mechanicalRatio.toFixed(1)}× W`;
  const lW = `W = ${wPushN.toFixed(0)} N`;
  const sW = `${pushLoadKg} kg`;
  const lRj = `R_j = ${rJointN.toFixed(0)} N`;

  // Abultamiento muscular y activación EMG proporcional a Ft
  const tricepsBulge = Math.min(1.45, 0.96 + (fTricepsN / 450) * 0.38);
  const tricepsEmissive = Math.min(1.0, 0.38 + (fTricepsN / 550) * 0.62);

  // Materiales anatómicos PBR
  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedBoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );

  // Material Tríceps Activo (Carmine con brillo EMG)
  const tricepsMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#dc2626',
        roughness: 0.52,
        metalness: 0.06,
        emissive: '#dc2626',
        emissiveIntensity: tricepsEmissive,
      }),
    [tricepsEmissive]
  );

  // Material Músculos Neutros de Contexto
  const neutralMuscleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8c534b', roughness: 0.65, metalness: 0.04, opacity: 0.70, transparent: true }),
    []
  );

  const ARM_SCALE = 4.0;

  // Posición del pico del olécranon relativo al fulcro troclear
  const olecranonOffset: [number, number, number] = [
    -0.022 * (insertCm / 2.5),
    0.032,
    -0.012,
  ];

  // Vectores de fuerza calibrados
  const ftLen = Math.min(0.120, Math.max(0.035, fTricepsN * 0.000072));
  const vFt: [number, number, number] = [-ftLen * 0.14, ftLen * 0.98, ftLen * 0.08];

  const wLen = Math.min(0.095, Math.max(0.030, wPushN * 0.00035));
  const vWpush: [number, number, number] = [0, -wLen, 0];

  const rjLen = Math.min(0.130, Math.max(0.040, rJointN * 0.000072));
  const vRj: [number, number, number] = [0, -rjLen, 0];

  // 90° de flexión / posición neutra
  const angleRad = (90 * Math.PI) / 180;

  return (
    <group position={[-0.05, 0.05, 0]} scale={ARM_SCALE}>
      {/* ── Segmento Fijo: Húmero, Escápula y Clavícula ── */}
      <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
        {boneNodes?.scapula_R && <mesh geometry={boneNodes.scapula_R.geometry} material={fixedBoneMat} />}
        {boneNodes?.clavicle_R && <mesh geometry={boneNodes.clavicle_R.geometry} material={fixedBoneMat} />}
        {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={boneMat} />}

        {/* ── Las 3 Cabezas del Tríceps Braquial Activo ── */}
        {/* 1. Cabeza Larga (Tubérculo infraglenoideo escapular) */}
        {muscleNodes?.triceps_brachii_long_head_R && (
          <mesh
            geometry={muscleNodes.triceps_brachii_long_head_R.geometry}
            material={tricepsMat}
            scale={[tricepsBulge, 1.0, tricepsBulge]}
          />
        )}
        {/* 2. Cabeza Lateral (Cara posterior proximal humeral) */}
        {muscleNodes?.triceps_brachii_lateral_head_R && (
          <mesh
            geometry={muscleNodes.triceps_brachii_lateral_head_R.geometry}
            material={tricepsMat}
            scale={[tricepsBulge, 1.0, tricepsBulge]}
          />
        )}
        {/* 3. Cabeza Medial (Cara posterior distal humeral) */}
        {muscleNodes?.triceps_brachii_medial_head_R && (
          <mesh
            geometry={muscleNodes.triceps_brachii_medial_head_R.geometry}
            material={tricepsMat}
            scale={[tricepsBulge, 1.0, tricepsBulge]}
          />
        )}

        {/* Músculos flexores inactivos de referencia */}
        {muscleNodes?.biceps_brachii_long_head_R && (
          <mesh geometry={muscleNodes.biceps_brachii_long_head_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.biceps_brachii_short_head_R && (
          <mesh geometry={muscleNodes.biceps_brachii_short_head_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.brachialis_R && (
          <mesh geometry={muscleNodes.brachialis_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_clavicular_R && (
          <mesh geometry={muscleNodes.deltoideus_clavicular_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_acromial_R && (
          <mesh geometry={muscleNodes.deltoideus_acromial_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_spinal_R && (
          <mesh geometry={muscleNodes.deltoideus_spinal_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.coracobrachialis_R && (
          <mesh geometry={muscleNodes.coracobrachialis_R.geometry} material={neutralMuscleMat} />
        )}
      </group>

      {/* Cartílago Articular Troclear (Fulcro O y Zona de Compresión Intensa #7c3aed) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.024, 20, 20]} />
        <meshStandardMaterial
          color={CARTILAGE_PURPLE}
          roughness={0.20}
          metalness={0.10}
          emissive="#7c3aed"
          emissiveIntensity={0.50}
          transparent
          opacity={0.90}
        />
      </mesh>

      {/* Vector Reacción Articular ADITIVA R_j en la Tróclea */}
      <ForceVector3D origin={[0, 0, 0]} vector={vRj} color="#7c3aed" label={lRj} sub="troclear (aditiva)" emphasis="strong" />

      {/* ── Segmento Móvil: Antebrazo con Olécranon Posterior ── */}
      <group rotation={[angleRad, 0, 0]}>
        <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
          {boneNodes?.ulna_R && <mesh geometry={boneNodes.ulna_R.geometry} material={boneMat} />}
          {boneNodes?.radius_R && <mesh geometry={boneNodes.radius_R.geometry} material={boneMat} />}
          {boneNodes?.scaphoid_R && <mesh geometry={boneNodes.scaphoid_R.geometry} material={boneMat} />}
          {boneNodes?.lunate_R && <mesh geometry={boneNodes.lunate_R.geometry} material={boneMat} />}
          {boneNodes?.triquetral_R && <mesh geometry={boneNodes.triquetral_R.geometry} material={boneMat} />}
          {boneNodes?.pisiform_R && <mesh geometry={boneNodes.pisiform_R.geometry} material={boneMat} />}
          {boneNodes?.trapezium_R && <mesh geometry={boneNodes.trapezium_R.geometry} material={boneMat} />}
          {boneNodes?.trapezoid_R && <mesh geometry={boneNodes.trapezoid_R.geometry} material={boneMat} />}
          {boneNodes?.capitate_R && <mesh geometry={boneNodes.capitate_R.geometry} material={boneMat} />}
          {boneNodes?.hamate_R && <mesh geometry={boneNodes.hamate_R.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_1 && <mesh geometry={boneNodes.metacarpal_1.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_2 && <mesh geometry={boneNodes.metacarpal_2.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_3 && <mesh geometry={boneNodes.metacarpal_3.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_4 && <mesh geometry={boneNodes.metacarpal_4.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_5 && <mesh geometry={boneNodes.metacarpal_5.geometry} material={boneMat} />}
        </group>

        {/* Calipers 3D de Brazos de Palanca */}
        <LeverArmCaliper3D
          start={[0, 0, 0]}
          end={olecranonOffset}
          color="#dc2626"
          label={`d = ${insertCm.toFixed(1)} cm`}
        />
        <LeverArmCaliper3D
          start={[0, 0, 0]}
          end={[-0.040, -0.350, 0.045]}
          color="#d97706"
          label="D = 35,0 cm"
        />

        {/* Vector de Tracción del Tríceps Ft en el Pico del Olécranon */}
        <ForceVector3D origin={olecranonOffset} vector={vFt} color="#dc2626" label={lFt} sub={sFt} />

        {/* Vector de Fuerza de Empuje W en la Palma de la Mano */}
        <ForceVector3D origin={[-0.040, -0.350, 0.045]} vector={vWpush} color="#d97706" label={lW} sub={sW} />
      </group>
    </group>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_arm.glb');

export default function TricepsCanvas({
  showLabels = false,
  pushLoadKg = 6,
  insertCm = 2.5,
}: TricepsCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const callouts = useCalloutStore();
  const [cameraView, setCameraView] = useState<'default' | 'lateral' | 'posterior' | 'anterior'>('default');
  const [showTelemetry, setShowTelemetry] = useState(false);

  const { wPushN, mechanicalRatio, fTricepsN, fTricepsKgf, rJointN, rJointKgf } = tricepsSolve(pushLoadKg, insertCm);

  const setView = (view: 'default' | 'lateral' | 'posterior' | 'anterior') => {
    setCameraView(view);
    if (!controlsRef.current) return;
    if (view === 'default') {
      controlsRef.current.object.position.set(1.8, 0.4, 2.4);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'lateral') {
      controlsRef.current.object.position.set(2.8, 0.1, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'posterior') {
      controlsRef.current.object.position.set(0.1, 0.3, -2.8);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'anterior') {
      controlsRef.current.object.position.set(0.1, 0.1, 3.0);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  // Nivel de estrés articular
  const stressColor = rJointN < 1000 ? '#0d6e64' : rJointN < 2000 ? '#d97706' : '#dc2626';
  const stressLevel = rJointN < 1000 ? 'Normal / Fisiológico' : rJointN < 2000 ? 'Elevado' : 'Sobrecarga Articular Aguda';

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="cap2-webgl-canvas" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [1.45, 0.3, 2.15], fov: 42 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: STUDIO_BG_DEEP,
        }}
      >
        <StudioLights keyIntensity={1.6} />

        <gridHelper args={[6, 12, '#bdb199', '#d3c9b4']} position={[0, -1.2, 0]} />

        <Suspense fallback={null}>
          <group name="fit-root">
            <RealArmTricepsScene
              pushLoadKg={pushLoadKg}
              insertCm={insertCm}
            />
          </group>

          <ContactShadows
            position={[0, -1.19, 0]}
            opacity={0.5}
            scale={4.5}
            blur={2.2}
            far={3.5}
            color="#241d12"
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={0.8}
          maxDistance={5.0}
          target={[0, 0, 0]}
        />
        <FitCamera padding={1.35} lookTarget={[0, 0, 0]} refit={cameraView} />
        <CalloutSource />
      </Canvas>

      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      <CalloutRail
        store={callouts}
        side="left"
        note={`Palanca de 1ª clase: brazos ${insertCm.toFixed(1)} cm vs 35 cm → el tríceps tira ${mechanicalRatio.toFixed(1)}× la carga; la reacción troclear es aditiva.`}
      />

      {/* Selector de Vistas de Cámara en Esquina Superior Izquierda */}
      <div
        style={{
          position: 'absolute',
          top: '44px',
          left: '10px',
          display: 'flex',
          gap: '4px',
          zIndex: 10,
        }}
      >
        {(['default', 'lateral', 'posterior', 'anterior'] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setView(view)}
            style={{
              background: cameraView === view ? '#7c3aed' : 'rgba(255, 255, 255, 0.88)',
              color: cameraView === view ? '#ffffff' : '#43505c',
              border: '1px solid rgba(207, 195, 169, 0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: '4px',
              padding: '3px 7px',
              fontSize: '0.54rem',
              fontWeight: cameraView === view ? 700 : 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {view === 'default' ? '3D Iso' : view === 'lateral' ? 'Lateral (Palanca 1ª)' : view === 'posterior' ? 'Posterior (Tríceps)' : 'Frontal'}
          </button>
        ))}
      </div>

      {/* Widget HUD Flotante Superior Derecho con Análisis de Palanca de 1ª Clase */}
      <button
        type="button"
        onClick={() => setShowTelemetry((visible) => !visible)}
        aria-expanded={showTelemetry}
        aria-controls="triceps-telemetry-hud"
        style={{
          position: 'absolute',
          top: '10px',
          right: showTelemetry ? '232px' : '10px',
          zIndex: 12,
          border: '1px solid rgba(207, 195, 169, 0.9)',
          borderRadius: '7px',
          background: 'rgba(255, 253, 248, 0.95)',
          color: '#232c36',
          padding: '7px 9px',
          fontSize: '0.58rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 3px 12px rgba(35, 44, 54, 0.12)',
        }}
      >
        {showTelemetry ? '× Ocultar información' : '☷ Información'}
      </button>
      {showTelemetry && (
      <div
        id="triceps-telemetry-hud"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '215px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(207, 195, 169, 0.9)',
          borderRadius: '7px',
          padding: '7px 9px',
          boxShadow: '0 3px 12px rgba(35, 44, 54, 0.12)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#232c36', letterSpacing: '0.02em' }}>
            PALANCA DE 1ª CLASE
          </span>
          <span style={{ fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace', color: '#7c3aed', fontWeight: 700 }}>
            D/d = {mechanicalRatio.toFixed(1)}×
          </span>
        </div>

        {/* Diagrama conceptual de balancín */}
        <div
          style={{
            background: 'rgba(245, 240, 228, 0.75)',
            border: '1px solid rgba(207, 195, 169, 0.8)',
            borderRadius: '4px',
            padding: '4px 6px',
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.50rem',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span style={{ color: '#dc2626', fontWeight: 700 }}>▲ Ft ({insertCm.toFixed(1)}cm)</span>
          <span style={{ color: '#7c3aed', fontWeight: 800 }}>▼ FULCRO (O)</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>▼ W (35cm)</span>
        </div>

        {/* Filas de telemetría */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.53rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
            <span>■ Tracción Tríceps (Ft):</span>
            <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {fTricepsN.toFixed(0)} N ({fTricepsKgf.toFixed(1)} kgf)
            </b>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
            <span>■ Fuerza Empuje (W):</span>
            <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {wPushN.toFixed(0)} N ({pushLoadKg} kg)
            </b>
          </div>

          {/* Reacción Articular Aditiva */}
          <div
            style={{
              borderTop: '1px solid rgba(67, 80, 92, 0.20)',
              paddingTop: '3px',
              marginTop: '1px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7c3aed' }}>
              <span style={{ fontWeight: 700 }}>Compresión Troclear (Rj):</span>
              <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {rJointN.toFixed(0)} N ({rJointKgf.toFixed(1)} kgf)
              </b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.48rem', marginTop: '1px' }}>
              <span style={{ color: '#43505c' }}>Estrés troclear:</span>
              <span
                style={{
                  background: `${stressColor}18`,
                  color: stressColor,
                  border: `1px solid ${stressColor}50`,
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontWeight: 700,
                }}
              >
                {stressLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
    </CalloutProvider>
  );
}
