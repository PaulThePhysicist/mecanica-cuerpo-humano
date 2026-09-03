import React, { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';

interface MultiMuscleCanvasProps {
  handLoadKg?: number;       // Carga en mano (1 a 20 kg, default: 7)
  activeMuscleCount?: 1 | 3; // 1 (solo bíceps aislado) o 3 (bíceps + braquial + braquiorradial sinergia)
}

// ── Paleta de Materiales Anatómicos PBR de Grado Médico ──
const BONE_IVORY = new THREE.Color('#ede5d0');
const BONE_DEEP = new THREE.Color('#ded3be');
const CARTILAGE_ICE = new THREE.Color('#68c5b8');
const TENDON_NACRE = new THREE.Color('#f5f0e6');

// Centro anatómico de rotación troclear del codo
const P_ELBOW = new THREE.Vector3(-0.128, 0.142, -0.016);

// ── Vector 3D de Fuerza de Alta Fidelidad con Badges Frosted Glass ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  label = 'F',
  sublabel = '',
  screenOffset = [0, 0] as [number, number],
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  label: string;
  sublabel?: string;
  screenOffset?: [number, number];
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

  const headLen = Math.min(0.042, Math.max(0.024, len * 0.22));
  const headRadius = headLen * 0.30;
  const shaftLen = Math.max(0.005, len - headLen);
  const shaftRadius = 0.0055;

  const midPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen * 0.5));
  const headPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen + headLen * 0.5));
  const tipPos = new THREE.Vector3(...origin).add(v);

  return (
    <group>
      {/* Fuste cilíndrico del vector */}
      <mesh position={[midPos.x, midPos.y, midPos.z]} quaternion={quat} renderOrder={20}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.22}
          metalness={0.25}
          emissive={color}
          emissiveIntensity={0.40}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Cabeza cónica del vector */}
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat} renderOrder={21}>
        <coneGeometry args={[headRadius, headLen, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.18}
          metalness={0.35}
          emissive={color}
          emissiveIntensity={0.60}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Badge Flotante HTML Calibrado */}
      <Html
        position={[tipPos.x + dir.x * 0.038, tipPos.y + dir.y * 0.038, tipPos.z + dir.z * 0.038]}
        center
        zIndexRange={[100, 0]}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(6px)',
            border: `1.6px solid ${color}`,
            borderRadius: '5px',
            padding: '4px 8px',
            boxShadow: '0 3px 10px rgba(20,28,36,0.18)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            transform: `translate(${screenOffset[0]}px, ${screenOffset[1] - 2}px)`,
          }}
        >
          <span style={{ color: '#17212b', fontSize: '0.64rem', lineHeight: 1.15, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
            {label}
          </span>
          {sublabel && (
            <span style={{ color: '#334155', fontSize: '0.55rem', lineHeight: 1.15, fontWeight: 600, fontFamily: 'Karla, sans-serif' }}>
              {sublabel}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── 3. Banda 3D Anatómica del Músculo Braquiorradial (Shunt Stabilizer) ──
function BrachioradialisAnatomicalBand({
  origin,
  insertion,
  isActive,
  forceN,
}: {
  origin: [number, number, number];
  insertion: [number, number, number];
  isActive: boolean;
  forceN: number;
}) {
  const { muscleGeom, proximalTendonGeom, distalTendonGeom } = useMemo(() => {
    const p0 = new THREE.Vector3(...origin);
    const p2 = new THREE.Vector3(...insertion);

    // Curvatura anatómica abrazando el compartimento lateral del antebrazo
    const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
    mid.x += 0.024;
    mid.y += 0.012;
    mid.z += 0.008;

    const fullCurve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    const pts = fullCurve.getPoints(36);

    const proxIdx = Math.floor(pts.length * 0.15);
    const distIdx = Math.floor(pts.length * 0.82);

    const proxPts = pts.slice(0, proxIdx + 1);
    const bellyPts = pts.slice(proxIdx, distIdx + 1);
    const distPts = pts.slice(distIdx);

    const proxCurve = new THREE.CatmullRomCurve3(proxPts);
    const bellyCurve = new THREE.CatmullRomCurve3(bellyPts);
    const distCurve = new THREE.CatmullRomCurve3(distPts);

    const bellyRadius = isActive
      ? 0.010 + Math.min(0.004, (forceN / 450) * 0.004)
      : 0.0065;
    const tendonRadius = 0.005;

    const mGeom = new THREE.TubeGeometry(bellyCurve, 24, bellyRadius, 14, false);
    const ptGeom = new THREE.TubeGeometry(proxCurve, 8, tendonRadius, 10, false);
    const dtGeom = new THREE.TubeGeometry(distCurve, 10, tendonRadius, 10, false);

    return {
      muscleGeom: mGeom,
      proximalTendonGeom: ptGeom,
      distalTendonGeom: dtGeom,
    };
  }, [origin, insertion, isActive, forceN]);

  const muscleEmissive = isActive ? Math.min(0.9, 0.40 + (forceN / 400) * 0.50) : 0;

  const bellyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isActive ? '#d97706' : '#718096',
        roughness: 0.54,
        metalness: 0.06,
        emissive: isActive ? '#d97706' : '#000000',
        emissiveIntensity: muscleEmissive,
      }),
    [isActive, muscleEmissive]
  );

  const tendonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: TENDON_NACRE,
        roughness: 0.40,
        metalness: 0.08,
      }),
    []
  );

  return (
    <group>
      {/* Tendón proximal de inserción en cresta supracondílea lateral */}
      <mesh geometry={proximalTendonGeom} material={tendonMat} />

      {/* Vientre carnoso activo / inactivo */}
      <mesh geometry={muscleGeom} material={bellyMat} />

      {/* Tendón distal insertando en la apófisis estiloides del radio */}
      <mesh geometry={distalTendonGeom} material={tendonMat} />
    </group>
  );
}

// ── Escena 3D Multi-Músculo Real con Modelos GLB ──
function MultiMuscleScene({
  handLoadKg,
  activeMuscleCount,
}: {
  handLoadKg: number;
  activeMuscleCount: 1 | 3;
}) {
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  // ── Biomecánica y Torque Neto ──
  const g = 9.81;
  const wHandN = handLoadKg * g;
  const wForearmN = 1.5 * g; // Peso medio de antebrazo y mano (~1.5 kg)
  const dForearmM = 0.14;
  const dHandM = 0.35;

  const totalTauNm = wHandN * dHandM + wForearmN * dForearmM;

  let fBrachialisN = 0;
  let fBicepsN = 0;
  let fBrachioradialisN = 0;

  if (activeMuscleCount === 1) {
    // Modo aislado: el bíceps asume el 100% de la carga de flexión
    fBicepsN = totalTauNm / (0.040 * Math.sin((80 * Math.PI) / 180));
    fBrachialisN = 0;
    fBrachioradialisN = 0;
  } else {
    // Modo sinérgico cooperativo (45% Braquial, 40% Bíceps, 15% Braquiorradial)
    const tauBrachialis = totalTauNm * 0.45;
    const tauBiceps = totalTauNm * 0.40;
    const tauBrachioradialis = totalTauNm * 0.15;

    fBrachialisN = tauBrachialis / (0.025 * Math.sin((85 * Math.PI) / 180));
    fBicepsN = tauBiceps / (0.040 * Math.sin((80 * Math.PI) / 180));
    fBrachioradialisN = tauBrachioradialis / (0.250 * Math.sin((15 * Math.PI) / 180));
  }

  // Reacción articular neta
  const verticalMuscleForce =
    fBrachialisN * Math.sin((85 * Math.PI) / 180) +
    fBicepsN * Math.sin((80 * Math.PI) / 180) +
    fBrachioradialisN * Math.sin((15 * Math.PI) / 180);
  const rJointN = Math.max(0, verticalMuscleForce - (wHandN + wForearmN));

  // Deformación volumétrica y EMG dinámico
  const bicepsBulge =
    activeMuscleCount === 1
      ? Math.min(1.48, 1.0 + (fBicepsN / 420) * 0.45)
      : Math.min(1.24, 0.98 + (fBicepsN / 420) * 0.26);

  const brachialisBulge =
    activeMuscleCount === 3
      ? Math.min(1.30, 0.98 + (fBrachialisN / 450) * 0.32)
      : 0.94;

  const bicepsEmissive =
    activeMuscleCount === 1
      ? Math.min(1.0, 0.50 + (fBicepsN / 500) * 0.50)
      : Math.min(0.85, 0.35 + (fBicepsN / 400) * 0.50);

  const brachialisEmissive =
    activeMuscleCount === 3
      ? Math.min(0.95, 0.35 + (fBrachialisN / 450) * 0.60)
      : 0.02;

  // Materiales memoizados
  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedBoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );

  // Material Braquial Anterior (Emerald #2e8b57)
  const brachialisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: activeMuscleCount === 3 ? '#2e8b57' : '#64748b',
        roughness: 0.54,
        metalness: 0.06,
        emissive: activeMuscleCount === 3 ? '#2e8b57' : '#000000',
        emissiveIntensity: brachialisEmissive,
      }),
    [activeMuscleCount, brachialisEmissive]
  );

  // Material Bíceps Braquial (Carmine #dc2626)
  const bicepsMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#dc2626',
        roughness: 0.52,
        metalness: 0.06,
        emissive: '#dc2626',
        emissiveIntensity: bicepsEmissive,
      }),
    [bicepsEmissive]
  );

  // Material Músculos Neutros de Contexto
  const neutralMuscleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8c534b', roughness: 0.65, metalness: 0.04, opacity: 0.75, transparent: true }),
    []
  );

  const ARM_SCALE = 4.0;

  // 90° de flexión en el codo
  const angleRad = (90 * Math.PI) / 180;

  // Longitudes y direcciones de vectores
  const brachLen = Math.min(0.095, Math.max(0.028, fBrachialisN * 0.00016));
  const bicLen = Math.min(0.115, Math.max(0.032, fBicepsN * 0.00015));
  const bradLen = Math.min(0.085, Math.max(0.025, fBrachioradialisN * 0.00045));
  const wLen = Math.min(0.095, Math.max(0.030, wHandN * 0.00035));
  const rjLen = Math.min(0.105, Math.max(0.030, rJointN * 0.00014));

  return (
    <group position={[-0.05, 0.05, 0]} scale={ARM_SCALE}>
      {/* ── Segmento Fijo: Húmero, Escápula y Clavícula ── */}
      <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
        {/* B3 se centra en el codo; se omiten escápula y clavícula para no
            dejar piezas proximales flotando fuera del encuadre. */}
        {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={boneMat} />}

        {/* 1. BRAQUIAL ANTERIOR (Emerald #2e8b57 · Monoarticular profundo) */}
        {muscleNodes?.brachialis_R && (
          <mesh
            geometry={muscleNodes.brachialis_R.geometry}
            material={brachialisMat}
            scale={[brachialisBulge, 1.0, brachialisBulge]}
          />
        )}

        {/* 2. BÍCEPS BRAQUIAL: Cabeza larga y corta (Carmine #dc2626) */}
        {muscleNodes?.biceps_brachii_long_head_R && (
          <mesh
            geometry={muscleNodes.biceps_brachii_long_head_R.geometry}
            material={bicepsMat}
            scale={[bicepsBulge, 1.0, bicepsBulge]}
          />
        )}
        {muscleNodes?.biceps_brachii_short_head_R && (
          <mesh
            geometry={muscleNodes.biceps_brachii_short_head_R.geometry}
            material={bicepsMat}
            scale={[bicepsBulge, 1.0, bicepsBulge]}
          />
        )}

        {/* Músculos anatómicos de referencia */}
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
        {muscleNodes?.triceps_brachii_long_head_R && (
          <mesh geometry={muscleNodes.triceps_brachii_long_head_R.geometry} material={neutralMuscleMat} />
        )}
      </group>

      {/* Cartílago Articular Troclear (Ice Mint Glow) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.022, 20, 20]} />
        <meshStandardMaterial color={CARTILAGE_ICE} roughness={0.22} transparent opacity={0.88} />
      </mesh>

      {/* Vector Reacción Articular R_j en la Tróclea */}
      <ForceVector3D
        origin={[0, 0, 0]}
        vector={[0, -rjLen, 0]}
        color="#0d9488"
        label={`R_j = ${rJointN.toFixed(0)} N`}
        sublabel="compresión articular"
        screenOffset={[-52, 70]}
      />

      {/* ── Segmento Móvil: Antebrazo a 90° de Flexión ── */}
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
          {boneNodes?.metacarpal_6 && <mesh geometry={boneNodes.metacarpal_6.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_4 && <mesh geometry={boneNodes.metacarpal_4.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_8 && <mesh geometry={boneNodes.metacarpal_8.geometry} material={boneMat} />}

          {/* Pronador Redondo */}
          {muscleNodes?.pronator_teres_humeral_head_R && (
            <mesh geometry={muscleNodes.pronator_teres_humeral_head_R.geometry} material={neutralMuscleMat} />
          )}
        </group>

        {/* 3. BRAQUIORRADIAL (Amber #d97706 · d = 25 cm) */}
        <BrachioradialisAnatomicalBand
          origin={[-0.042, 0.052, -0.016]}
          insertion={[-0.022, -0.252, 0.018]}
          isActive={activeMuscleCount === 3}
          forceN={fBrachioradialisN}
        />

        {/* Vector 1: Braquial Anterior (Emerald) */}
        {activeMuscleCount === 3 && (
          <ForceVector3D
            origin={[-0.018, -0.025, 0.010]}
            vector={[brachLen * 0.08, brachLen * 0.98, -brachLen * 0.12]}
            color="#2e8b57"
            label={`Braquial = ${fBrachialisN.toFixed(0)} N`}
            sublabel="45% τ · d 2,5 cm"
            screenOffset={[-58, 40]}
          />
        )}

        {/* Vector 2: Bíceps Braquial (Carmine) */}
        <ForceVector3D
          origin={[0.030, -0.040, 0.020]}
          vector={[bicLen * 0.14, bicLen * 0.97, -bicLen * 0.18]}
          color="#dc2626"
          label={`Bíceps = ${fBicepsN.toFixed(0)} N`}
          sublabel={activeMuscleCount === 3 ? '40% τ · d 4,0 cm' : '⚠ 100% aislado'}
          screenOffset={[0, 56]}
        />

        {/* Vector 3: Braquiorradial (Amber) */}
        {activeMuscleCount === 3 && (
          <ForceVector3D
            origin={[-0.022, -0.250, 0.018]}
            vector={[-bradLen * 0.12, bradLen * 0.98, bradLen * 0.08]}
            color="#d97706"
            label={`Braquiorradial = ${fBrachioradialisN.toFixed(0)} N`}
            sublabel="15% τ · shunt d 25 cm"
            screenOffset={[58, 40]}
          />
        )}

        {/* Vector de Carga W en mano */}
        <ForceVector3D
          origin={[-0.040, -0.350, 0.045]}
          vector={[0, -wLen, 0]}
          color="#232c36"
          label={`W = ${wHandN.toFixed(0)} N (${handLoadKg} kg)`}
          sublabel="carga · D 35 cm"
          screenOffset={[52, 66]}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_arm.glb');

export default function MultiMuscleCanvas({
  handLoadKg = 7,
  activeMuscleCount = 3,
}: MultiMuscleCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [cameraView, setCameraView] = useState<'default' | 'lateral' | 'anterior' | 'top'>('default');
  const [showTelemetry, setShowTelemetry] = useState(false);

  const g = 9.81;
  const wHandN = handLoadKg * g;
  const wForearmN = 1.5 * g;
  const totalTauNm = wHandN * 0.35 + wForearmN * 0.14;

  let fBrachN = 0;
  let fBicN = 0;
  let fBradN = 0;

  if (activeMuscleCount === 1) {
    fBicN = totalTauNm / (0.040 * Math.sin((80 * Math.PI) / 180));
  } else {
    fBrachN = (totalTauNm * 0.45) / (0.025 * Math.sin((85 * Math.PI) / 180));
    fBicN = (totalTauNm * 0.40) / (0.040 * Math.sin((80 * Math.PI) / 180));
    fBradN = (totalTauNm * 0.15) / (0.250 * Math.sin((15 * Math.PI) / 180));
  }

  const totalMuscleForceN = fBrachN + fBicN + fBradN;
  const verticalMuscleForce =
    fBrachN * Math.sin((85 * Math.PI) / 180) +
    fBicN * Math.sin((80 * Math.PI) / 180) +
    fBradN * Math.sin((15 * Math.PI) / 180);
  const rJointN = Math.max(0, verticalMuscleForce - (wHandN + wForearmN));

  const setView = (view: 'default' | 'lateral' | 'anterior' | 'top') => {
    setCameraView(view);
    if (!controlsRef.current) return;
    if (view === 'default') {
      controlsRef.current.object.position.set(1.8, 0.4, 2.4);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'lateral') {
      controlsRef.current.object.position.set(2.8, 0.1, 0.2);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'anterior') {
      controlsRef.current.object.position.set(0.1, 0.1, 3.0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'top') {
      controlsRef.current.object.position.set(0.2, 3.2, 0.5);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
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
          <MultiMuscleScene
            handLoadKg={handLoadKg}
            activeMuscleCount={activeMuscleCount}
          />

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
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Selector de Vistas de Cámara en Esquina Superior Izquierda */}
      <div
        style={{
          position: 'absolute',
          top: '44px',
          left: '10px',
          display: 'flex',
          gap: '4px',
          zIndex: 12,
        }}
      >
        {(['default', 'lateral', 'anterior', 'top'] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setView(view)}
            style={{
              background: cameraView === view ? '#0d6e64' : 'rgba(255, 255, 255, 0.88)',
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
            {view === 'default' ? '3D Iso' : view === 'lateral' ? 'Lateral (Brazos d)' : view === 'anterior' ? 'Frontal' : 'Cenital'}
          </button>
        ))}
      </div>

      {/* Widget HUD Flotante Superior Derecho con Gráfico de Barras Apiladas 3D */}
      <button
        type="button"
        aria-expanded={showTelemetry}
        aria-controls="b3-torque-hud"
        onClick={() => setShowTelemetry((value) => !value)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 13,
          pointerEvents: 'auto',
          border: '1px solid rgba(207, 195, 169, 0.9)',
          borderRadius: '5px',
          background: showTelemetry ? '#0d6e64' : 'rgba(255,253,248,.96)',
          color: showTelemetry ? '#fff' : '#43505c',
          padding: '4px 8px',
          font: '700 .58rem Karla, sans-serif',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(35,44,54,.14)',
        }}
      >
        {showTelemetry ? '× Ocultar información' : '☷ Información'}
      </button>
      <div
        id="b3-torque-hud"
        style={{
          position: 'absolute',
          top: '42px',
          right: '10px',
          width: '210px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(207, 195, 169, 0.9)',
          borderRadius: '7px',
          padding: '7px 9px',
          boxShadow: '0 3px 12px rgba(35, 44, 54, 0.12)',
          zIndex: 10,
          pointerEvents: showTelemetry ? 'none' : 'none',
          display: showTelemetry ? 'block' : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#232c36', letterSpacing: '0.02em' }}>
            DISTRIBUCIÓN DE TORQUE
          </span>
          <span style={{ fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace', color: '#0d6e64', fontWeight: 700 }}>
            Στ = {totalTauNm.toFixed(1)} N·m
          </span>
        </div>

        {/* Barra apilada segmentada con animación visual */}
        <div
          style={{
            display: 'flex',
            height: '12px',
            width: '100%',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid #43505c',
            marginBottom: '6px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
          }}
        >
          {activeMuscleCount === 1 ? (
            <div
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #b91c1c, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.50rem',
                fontWeight: 800,
              }}
            >
              BÍCEPS 100%
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '45%',
                  background: '#2e8b57',
                  borderRight: '1px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.48rem',
                  fontWeight: 800,
                }}
                title="Braquial 45%"
              >
                45%
              </div>
              <div
                style={{
                  width: '40%',
                  background: '#dc2626',
                  borderRight: '1px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.48rem',
                  fontWeight: 800,
                }}
                title="Bíceps 40%"
              >
                40%
              </div>
              <div
                style={{
                  width: '15%',
                  background: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.48rem',
                  fontWeight: 800,
                }}
                title="Braquiorradial 15%"
              >
                15%
              </div>
            </>
          )}
        </div>

        {/* Filas de telemetría EMG por músculo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px', fontSize: '0.53rem' }}>
          {/* Braquial */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#2e8b57' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeMuscleCount === 3 ? '#2e8b57' : '#94a3b8' }} />
              Braquial (d = 2,5 cm):
            </span>
            <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {activeMuscleCount === 3 ? `${fBrachN.toFixed(0)} N (${(fBrachN / 9.81).toFixed(1)} kgf)` : '0 N (Inactivo)'}
            </b>
          </div>

          {/* Bíceps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }} />
              Bíceps (d = 4,0 cm):
            </span>
            <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {fBicN.toFixed(0)} N ({(fBicN / 9.81).toFixed(1)} kgf)
            </b>
          </div>

          {/* Braquiorradial */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#d97706' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeMuscleCount === 3 ? '#d97706' : '#94a3b8' }} />
              Braquiorradial (d = 25 cm):
            </span>
            <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {activeMuscleCount === 3 ? `${fBradN.toFixed(0)} N (${(fBradN / 9.81).toFixed(1)} kgf)` : '0 N (Inactivo)'}
            </b>
          </div>

          {/* Fuerza Muscular Total & Compresión */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#232c36' }}>
              <span style={{ fontWeight: 600 }}>Fuerza Muscular Total:</span>
              <b style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0d6e64' }}>
                {totalMuscleForceN.toFixed(0)} N ({(totalMuscleForceN / 9.81).toFixed(1)} kgf)
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#43505c' }}>
              <span>Compresión Articular (Rj):</span>
              <b style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0d9488' }}>
                {rJointN.toFixed(0)} N
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
