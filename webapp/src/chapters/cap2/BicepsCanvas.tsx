import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Cap2ZoomHandler from './Cap2ZoomHandler';
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

/** Estática del codo en flexión (fuente única: escena + panel de lecturas). */
function elbowSolve(handLoadKg: number, insertCm: number, elbowAngleDeg: number) {
  const g = 9.81;
  const wForearmN = 1.5 * g;
  const wHandN = handLoadKg * g;
  const flexRad = (elbowAngleDeg * Math.PI) / 180;
  const tauResNm = (wForearmN * 0.14 + wHandN * 0.35) * Math.sin(flexRad);
  const dM = insertCm / 100;
  const fMuscN = tauResNm / (dM * Math.max(0.2, Math.sin(flexRad)));
  const rJointN = Math.max(0, fMuscN - (wForearmN + wHandN));
  return { g, wForearmN, wHandN, flexRad, tauResNm, fMuscN, fMuscKgf: fMuscN / g, rJointN };
}

interface BicepsCanvasProps {
  handLoadKg: number;    // Carga en mano (0 a 25 kg)
  insertCm: number;      // Distancia de inserción del tendón d (3 a 6 cm)
  elbowAngleDeg: number; // Ángulo de flexión del codo (45 a 135 grados)
  cameraTarget?: [number, number, number];
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

// ── Paleta de Materiales Anatómicos PBR de Grado Médico ──
const BONE_IVORY = new THREE.Color('#ede5d0');
const BONE_DEEP = new THREE.Color('#ded3be');
const CARTILAGE_ICE = new THREE.Color('#68c5b8');
const MUSCLE_ACTIVE_BASE = new THREE.Color('#b02318');
const MUSCLE_ACTIVE_EMISSIVE = new THREE.Color('#4a0e08');
const MUSCLE_NEUTRAL = new THREE.Color('#9e473e');

// Centro anatómico de rotación troclear del codo en human_body.glb
const P_ELBOW = new THREE.Vector3(-0.128, 0.142, -0.016);
const P_SHOULDER = new THREE.Vector3(-0.096, 0.306, -0.018);

function BicepsLoading() {
  return (
    <Html center>
      <div style={{ background: 'rgba(255,253,248,.94)', border: '1px solid #c8bea9', borderRadius: 6, padding: '6px 10px', color: '#43505c', font: '600 .68rem Karla, sans-serif', whiteSpace: 'nowrap' }}>
        Cargando anatomía del codo…
      </div>
    </Html>
  );
}

// ── Vector 3D con Tubo, Cono y letrero en el riel lateral ──
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

  if (len < 0.02) return null;

  const headLen = Math.min(0.042, Math.max(0.024, len * 0.22));
  const headRadius = headLen * 0.30;
  const shaftLen = Math.max(0.005, len - headLen);
  const shaftRadius = 0.0055;

  const midPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen * 0.5));
  const headPos = new THREE.Vector3(...origin).add(dir.clone().multiplyScalar(shaftLen + headLen * 0.5));
  const tipPos = new THREE.Vector3(...origin).add(v);

  return (
    <group>
      <mesh position={[midPos.x, midPos.y, midPos.z]} quaternion={quat} renderOrder={20}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLen, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.35}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat} renderOrder={21}>
        <coneGeometry args={[headRadius, headLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.5}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <Callout
        position={[tipPos.x + dir.x * 0.04, tipPos.y + dir.y * 0.04, tipPos.z + dir.z * 0.04]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── Modelo 3D de Brazo Real con Huesos y Bíceps BodyParts3D ──
function RealArmBicepsScene({
  handLoadKg,
  insertCm,
  elbowAngleDeg,
}: {
  handLoadKg: number;
  insertCm: number;
  elbowAngleDeg: number;
}) {
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  // Física del codo (fuente única)
  const { wHandN, fMuscN, fMuscKgf, rJointN } = elbowSolve(handLoadKg, insertCm, elbowAngleDeg);
  const lFm = `F_m = ${fMuscN.toFixed(0)} N`;
  const sFm = `${fMuscKgf.toFixed(1)} kgf`;
  const lW = `W = ${wHandN.toFixed(0)} N`;
  const sW = `${handLoadKg} kg`;
  const lRj = `R_j = ${rJointN.toFixed(0)} N`;

  // Ángulo de rotación del antebrazo en Three.js
  const angleRad = ((180 - elbowAngleDeg) * Math.PI) / 180;

  // Abultamiento muscular proporcional a Fm
  const muscleBulge = Math.min(1.45, 0.95 + (fMuscN / 400) * 0.40);
  const muscleEmissiveIntensity = Math.min(1.0, 0.35 + (fMuscN / 500) * 0.65);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedBoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const bicepsMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: MUSCLE_ACTIVE_BASE,
        roughness: 0.55,
        metalness: 0.06,
        emissive: MUSCLE_ACTIVE_EMISSIVE,
        emissiveIntensity: muscleEmissiveIntensity,
      }),
    [muscleEmissiveIntensity]
  );
  const neutralMuscleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: MUSCLE_NEUTRAL, roughness: 0.64, metalness: 0.04 }),
    []
  );

  const ARM_SCALE = 4.0;

  // Vectores calibrados proporcionalmente a los huesos reales (máx 1/4 - 1/3 del hueso)
  const fmLen = Math.min(0.11, Math.max(0.035, fMuscN * 0.00015));
  const vFm: [number, number, number] = [fmLen * 0.14, fmLen * 0.97, -fmLen * 0.18];

  const whLen = Math.min(0.09, Math.max(0.030, wHandN * 0.00035));
  const vWh: [number, number, number] = [0, -whLen, 0];

  const rjLen = Math.min(0.10, Math.max(0.030, rJointN * 0.00014));
  const vRj: [number, number, number] = [0, -rjLen, 0];

  return (
    <group position={[-0.05, 0.05, 0]} scale={ARM_SCALE}>
      {/* ── Segmento Fijo: Húmero, Escápula y Clavícula ── */}
      <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
        {boneNodes?.scapula_R && <mesh geometry={boneNodes.scapula_R.geometry} material={fixedBoneMat} />}
        {boneNodes?.clavicle_R && <mesh geometry={boneNodes.clavicle_R.geometry} material={fixedBoneMat} />}
        {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={boneMat} />}

        {/* Músculos del Hombro */}
        {muscleNodes?.deltoideus_clavicular_R && (
          <mesh geometry={muscleNodes.deltoideus_clavicular_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_acromial_R && (
          <mesh geometry={muscleNodes.deltoideus_acromial_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_spinal_R && (
          <mesh geometry={muscleNodes.deltoideus_spinal_R.geometry} material={neutralMuscleMat} />
        )}

        {/* Bíceps Braquial Activo con Abombamiento y Tensión Fisiológica */}
        {muscleNodes?.biceps_brachii_long_head_R && (
          <mesh
            geometry={muscleNodes.biceps_brachii_long_head_R.geometry}
            material={bicepsMat}
            scale={[muscleBulge, 1.0, muscleBulge]}
          />
        )}
        {muscleNodes?.biceps_brachii_short_head_R && (
          <mesh
            geometry={muscleNodes.biceps_brachii_short_head_R.geometry}
            material={bicepsMat}
            scale={[muscleBulge, 1.0, muscleBulge]}
          />
        )}

        {/* Braquial Anterior */}
        {muscleNodes?.brachialis_R && (
          <mesh geometry={muscleNodes.brachialis_R.geometry} material={bicepsMat} />
        )}
        {muscleNodes?.coracobrachialis_R && (
          <mesh geometry={muscleNodes.coracobrachialis_R.geometry} material={neutralMuscleMat} />
        )}

        {/* Tríceps Inactivo */}
        {muscleNodes?.triceps_brachii_long_head_R && (
          <mesh geometry={muscleNodes.triceps_brachii_long_head_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.triceps_brachii_lateral_head_R && (
          <mesh geometry={muscleNodes.triceps_brachii_lateral_head_R.geometry} material={neutralMuscleMat} />
        )}
      </group>

      {/* Cartílago Articular Troclear (Ice Mint) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial color={CARTILAGE_ICE} roughness={0.25} transparent opacity={0.85} />
      </mesh>

      {/* Vector Reacción Articular R_j en la Tróclea */}
      <ForceVector3D origin={[0, 0, 0]} vector={vRj} color="#dc2626" label={lRj} sub="troclear" emphasis="strong" />

      {/* ── Segmento Móvil: Antebrazo y Mano Rotatorio ── */}
      <group rotation={[angleRad, 0, 0]}>
        <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
          {boneNodes?.ulna_R && <mesh geometry={boneNodes.ulna_R.geometry} material={boneMat} />}
          {boneNodes?.radius_R && <mesh geometry={boneNodes.radius_R.geometry} material={boneMat} />}
          {boneNodes?.scaphoid_R && <mesh geometry={boneNodes.scaphoid_R.geometry} material={boneMat} />}
          {boneNodes?.lunate_R && <mesh geometry={boneNodes.lunate_R.geometry} material={boneMat} />}
          {boneNodes?.capitate_R && <mesh geometry={boneNodes.capitate_R.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_2 && <mesh geometry={boneNodes.metacarpal_2.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_4 && <mesh geometry={boneNodes.metacarpal_4.geometry} material={boneMat} />}

          {/* Pronador Redondo */}
          {muscleNodes?.pronator_teres_humeral_head_R && (
            <mesh geometry={muscleNodes.pronator_teres_humeral_head_R.geometry} material={neutralMuscleMat} />
          )}
        </group>

        {/* Vector de Fuerza Muscular Fm en la tuberosidad bicipital */}
        <ForceVector3D origin={[0, 0, 0]} vector={vFm} color="#0d9488" label={lFm} sub={sFm} />

        {/* Vector de Carga W en la mano */}
        <ForceVector3D origin={[0, 0, 0]} vector={vWh} color="#d97706" label={lW} sub={sW} />
      </group>
    </group>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_arm.glb');

export default function BicepsCanvas({
  showLabels = false,
  handLoadKg = 5,
  insertCm = 4.0,
  elbowAngleDeg = 90,
  cameraTarget = [0, 0, 0],
}: BicepsCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const callouts = useCalloutStore();

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

        <Suspense fallback={<BicepsLoading />}>
          <group name="fit-root">
            <RealArmBicepsScene
              handLoadKg={handLoadKg}
              insertCm={insertCm}
              elbowAngleDeg={elbowAngleDeg}
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
        <FitCamera padding={1.35} lookTarget={cameraTarget} refit={elbowAngleDeg} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={0.8}
          maxDistance={5.0}
          target={cameraTarget}
        />
        <Cap2ZoomHandler initialPosition={[1.45, 0.3, 2.15]} target={cameraTarget} minDistance={0.8} maxDistance={5} />
        <CalloutSource />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      <CalloutRail
        store={callouts}
        side="left"
        note="Palanca de 3ª clase: el bíceps sacrifica fuerza (d ≈ 4 cm) por velocidad y rango de la mano (D ≈ 35 cm)."
      />
    </div>
    </CalloutProvider>
  );
}
