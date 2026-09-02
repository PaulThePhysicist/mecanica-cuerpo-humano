import React, { useMemo } from 'react';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { AnatomyStage } from './three/AnatomyStage';
import { useAnatomyNodes } from './three/useAnatomyNodes';
import { materials } from './three/materials';

export type AntagonistMode = 'eye' | 'arm';

export type EyeGaze =
  | 'center'
  | 'right'
  | 'left'
  | 'up'
  | 'down'
  | 'up_right'
  | 'up_left'
  | 'down_right'
  | 'down_left';

interface AntagonistCanvasProps {
  mode: AntagonistMode;
  gaze: { x: number; y: number }; // -1 a 1 (horizontal, vertical)
  selectedMuscle?: string | null;
  armFlexion: number; // 0 a 1
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
}

// ── Paleta y Materiales Anatómicos de Grado Médico ──
const MUSCLE_ACTIVE = '#b02318';
const MUSCLE_ACTIVE_EMISSIVE = '#4a0e08';
const MUSCLE_INACTIVE = '#8c534b';
const TENDON_COLOR = '#f5f0e6';
const CARTILAGE_ICE = '#68c5b8';

// ── 1. Componente de Banda Muscular Extraocular 3D ──
function ExtraocularMuscleBand({
  origin,
  insertion,
  via,
  isActive = false,
  width = 0.12,
  thickness = 0.038,
  tendonFraction = 0.22,
}: {
  origin: [number, number, number];
  insertion: [number, number, number];
  via?: [number, number, number];
  isActive?: boolean;
  width?: number;
  thickness?: number;
  tendonFraction?: number;
}) {
  const { muscleGeom, tendonGeom } = useMemo(() => {
    const p0 = new THREE.Vector3(...origin);
    const p2 = new THREE.Vector3(...insertion);

    let curve: THREE.Curve<THREE.Vector3>;
    if (via) {
      const p1 = new THREE.Vector3(...via);
      curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    } else {
      const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
      const radial = mid.clone().normalize().multiplyScalar(0.12);
      mid.add(radial);
      curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    }

    const points = curve.getPoints(32);
    const splitIdx = Math.floor(points.length * (1 - tendonFraction));

    const musclePoints = points.slice(0, splitIdx + 1);
    const tendonPoints = points.slice(splitIdx);

    const muscleCurve = new THREE.CatmullRomCurve3(musclePoints);
    const tendonCurve = new THREE.CatmullRomCurve3(tendonPoints);

    const currentThick = isActive ? thickness * 1.35 : thickness;
    const currentWidth = isActive ? width * 1.25 : width;

    const mGeom = new THREE.TubeGeometry(muscleCurve, 20, (currentWidth + currentThick) * 0.5, 10, false);
    const tGeom = new THREE.TubeGeometry(tendonCurve, 10, (width * 0.85 + thickness * 0.7) * 0.5, 8, false);

    return { muscleGeom: mGeom, tendonGeom: tGeom };
  }, [origin, insertion, via, isActive, width, thickness, tendonFraction]);

  return (
    <group>
      {/* Vientre muscular estriado */}
      <mesh geometry={muscleGeom}>
        <meshStandardMaterial
          color={isActive ? MUSCLE_ACTIVE : MUSCLE_INACTIVE}
          roughness={0.60}
          metalness={0.05}
          emissive={isActive ? MUSCLE_ACTIVE_EMISSIVE : '#000000'}
          emissiveIntensity={isActive ? 0.55 : 0}
        />
      </mesh>

      {/* Tendón nacarado de inserción escleral */}
      <mesh geometry={tendonGeom}>
        <meshStandardMaterial color={TENDON_COLOR} roughness={0.35} metalness={0.08} />
      </mesh>
    </group>
  );
}

// ── 2. Modelo 3D del Globo Ocular con 6 Músculos Extraoculares y Vértice Orbitario ──
function EyeModel({ gaze, selectedMuscle }: { gaze: { x: number; y: number }; selectedMuscle?: string | null }) {
  const R = 0.85; // Radio normalizado calibrado para encuadre nítido

  const yaw = (gaze.x * 35 * Math.PI) / 180;
  // El polo anterior mira hacia +Z; con la convención de Three.js una
  // rotación X positiva lo baja. Invertimos el signo para que y positiva
  // represente elevación en pantalla y en la anatomía.
  const pitch = (-gaze.y * 30 * Math.PI) / 180;

  const isRL = gaze.x > 0.20 || selectedMuscle === 'lateral';
  const isRM = gaze.x < -0.20 || selectedMuscle === 'medial';
  const isRS = gaze.y > 0.20 || selectedMuscle === 'superior';
  const isRI = gaze.y < -0.20 || selectedMuscle === 'inferior';
  // En mirada vertical pura también colaboran los oblicuos: OI con RS
  // para elevar y OS con RI para deprimir. En aducción pasan a ser los
  // motores verticales principales, como en las diagonales clínicas.
  const isOS = ((gaze.x < -0.10 && gaze.y < -0.10) || (Math.abs(gaze.x) <= 0.10 && gaze.y < -0.20)) || selectedMuscle === 'osuperior';
  const isOI = ((gaze.x < -0.10 && gaze.y > 0.10) || (Math.abs(gaze.x) <= 0.10 && gaze.y > 0.20)) || selectedMuscle === 'oinferior';

  const zinnApex: [number, number, number] = [0, 0, -2.1];
  const trochlea: [number, number, number] = [-0.68, 0.76, -0.22];

  const rotMatrix = useMemo(() => {
    const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    return new THREE.Matrix4().makeRotationFromEuler(euler);
  }, [pitch, yaw]);

  const getRotPos = (local: [number, number, number]): [number, number, number] => {
    const v = new THREE.Vector3(...local).applyMatrix4(rotMatrix);
    return [v.x, v.y, v.z];
  };

  const insRL = getRotPos([R * 0.96, 0, 0.20]);
  const insRM = getRotPos([-R * 0.96, 0, 0.20]);
  const insRS = getRotPos([0, R * 0.96, 0.20]);
  const insRI = getRotPos([0, -R * 0.96, 0.20]);
  const insOS = getRotPos([0.34, 0.68, -0.50]);
  const insOI = getRotPos([0.68, -0.28, -0.46]);
  const origOI: [number, number, number] = [-0.58, -0.74, 0.24];

  return (
    <group position={[0, 0, 0]}>
      {/* Vértice orbitario posterior: Anillo de Zinn */}
      <group position={zinnApex}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.20, 0.05, 16, 28]} />
          <meshStandardMaterial color="#475569" roughness={0.65} metalness={0.1} />
        </mesh>
      </group>

      {/* Polea de la Tróclea superomedial */}
      <group position={trochlea}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.07, 0.022, 12, 20]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.15} />
        </mesh>
      </group>

      {/* ── Globo Ocular Rotatorio ── */}
      <group rotation={[pitch, yaw, 0]}>
        {/* Esclera blanca marfil brillante */}
        <mesh>
          <sphereGeometry args={[R, 40, 36]} />
          <meshStandardMaterial color="#faf8f4" roughness={0.18} metalness={0.04} />
        </mesh>

        {/* Córnea transparente abombada anterior */}
        <mesh position={[0, 0, R * 0.82]} scale={[0.56, 0.56, 0.44]}>
          <sphereGeometry args={[0.78, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.05}
            metalness={0.15}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* Iris y Pupila */}
        <mesh position={[0, 0, R * 0.945]}>
          <circleGeometry args={[0.36, 36]} />
          <meshStandardMaterial color="#0d6e64" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, R * 0.955]}>
          <circleGeometry args={[0.15, 36]} />
          <meshBasicMaterial color="#0b0e12" />
        </mesh>

        {/* Nervio óptico posterior */}
        <mesh position={[0, 0, -R * 1.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.7, 20]} />
          <meshStandardMaterial color="#e5dcc7" roughness={0.65} />
        </mesh>
      </group>

      {/* ── Los 6 Músculos Extraoculares ── */}
      <ExtraocularMuscleBand origin={zinnApex} insertion={insRL} isActive={isRL} width={0.12} thickness={0.038} />
      <ExtraocularMuscleBand origin={zinnApex} insertion={insRM} isActive={isRM} width={0.12} thickness={0.038} />
      <ExtraocularMuscleBand origin={zinnApex} insertion={insRS} isActive={isRS} width={0.12} thickness={0.038} />
      <ExtraocularMuscleBand origin={zinnApex} insertion={insRI} isActive={isRI} width={0.12} thickness={0.038} />
      <ExtraocularMuscleBand origin={zinnApex} insertion={insOS} via={trochlea} isActive={isOS} width={0.09} thickness={0.032} tendonFraction={0.45} />
      <ExtraocularMuscleBand origin={origOI} insertion={insOI} isActive={isOI} width={0.10} thickness={0.034} tendonFraction={0.25} />
    </group>
  );
}

// ── 3. Modelo 3D del Brazo con Huesos y Músculos Auténticos de BodyParts3D ──
function RealArmAntagonistModel({ flexion }: { flexion: number }) {
  const boneNodes = useAnatomyNodes('body');
  const muscleNodes = useAnatomyNodes('muscles_arm');

  // Ángulo de flexión: 0° a 130°
  const angleDeg = flexion * 130;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Centro anatómico de rotación del codo en human_body.glb
  const P_elbow = useMemo(() => new THREE.Vector3(-0.128, 0.142, -0.016), []);
  const P_shoulder = useMemo(() => new THREE.Vector3(-0.096, 0.306, -0.018), []);

  const boneMat = materials.bone;
  const fixedBoneMat = materials.boneContext;

  const bicepsActive = flexion > 0.35;
  const tricepsActive = flexion <= 0.35;

  const agonistMat = materials.muscleActive;
  const antagonistMat = materials.muscleIdle;
  const neutralMuscleMat = materials.muscleNeutral;

  // Escala anatómica 1.7x para encuadre óptimo en Three.js
  const ARM_SCALE = 1.75;

  return (
    <group scale={ARM_SCALE} position={[0.2, 0.0, 0]}>
      {/* ── Segmento Fijo: Húmero, Escápula y Clavícula ── */}
      <group position={[-P_elbow.x, -P_elbow.y, -P_elbow.z]}>
        {/* Giro de 180° con el pivote del hombro dentro del mismo sistema del brazo. */}
        <group position={[P_shoulder.x, P_shoulder.y, P_shoulder.z]} rotation={[0, Math.PI, 0]}>
          <group position={[-P_shoulder.x, -P_shoulder.y, -P_shoulder.z]}>
            {boneNodes?.scapula_R && <mesh geometry={boneNodes.scapula_R.geometry} material={fixedBoneMat} />}
            {boneNodes?.clavicle_R && <mesh geometry={boneNodes.clavicle_R.geometry} material={fixedBoneMat} />}
          </group>
        </group>
        {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={boneMat} />}

        {/* Músculos del Hombro y Brazo de BodyParts3D */}
        {muscleNodes?.deltoideus_clavicular_R && (
          <mesh geometry={muscleNodes.deltoideus_clavicular_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_acromial_R && (
          <mesh geometry={muscleNodes.deltoideus_acromial_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.deltoideus_spinal_R && (
          <mesh geometry={muscleNodes.deltoideus_spinal_R.geometry} material={neutralMuscleMat} />
        )}

        {/* Manguito Rotador */}
        {muscleNodes?.supraspinatus_R && (
          <mesh geometry={muscleNodes.supraspinatus_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.infraspinatus_R && (
          <mesh geometry={muscleNodes.infraspinatus_R.geometry} material={neutralMuscleMat} />
        )}
        {muscleNodes?.subscapularis_R && (
          <mesh geometry={muscleNodes.subscapularis_R.geometry} material={neutralMuscleMat} />
        )}

        {/* Bíceps Braquial (Cabeza larga y corta) */}
        {muscleNodes?.biceps_brachii_long_head_R && (
          <mesh
            geometry={muscleNodes.biceps_brachii_long_head_R.geometry}
            material={bicepsActive ? agonistMat : antagonistMat}
            scale={bicepsActive ? [1.06, 1.0, 1.08] : [0.96, 1.0, 0.96]}
          />
        )}
        {muscleNodes?.biceps_brachii_short_head_R && (
          <mesh
            geometry={muscleNodes.biceps_brachii_short_head_R.geometry}
            material={bicepsActive ? agonistMat : antagonistMat}
            scale={bicepsActive ? [1.06, 1.0, 1.08] : [0.96, 1.0, 0.96]}
          />
        )}

        {/* Braquial Anterior y Coracobraquial */}
        {muscleNodes?.brachialis_R && (
          <mesh
            geometry={muscleNodes.brachialis_R.geometry}
            material={bicepsActive ? agonistMat : antagonistMat}
          />
        )}
        {muscleNodes?.coracobrachialis_R && (
          <mesh geometry={muscleNodes.coracobrachialis_R.geometry} material={neutralMuscleMat} />
        )}

        {/* Tríceps Braquial (Cabeza larga, lateral y medial) */}
        {muscleNodes?.triceps_brachii_long_head_R && (
          <mesh
            geometry={muscleNodes.triceps_brachii_long_head_R.geometry}
            material={tricepsActive ? agonistMat : antagonistMat}
            scale={tricepsActive ? [1.06, 1.0, 1.08] : [0.95, 1.0, 0.95]}
          />
        )}
        {muscleNodes?.triceps_brachii_lateral_head_R && (
          <mesh
            geometry={muscleNodes.triceps_brachii_lateral_head_R.geometry}
            material={tricepsActive ? agonistMat : antagonistMat}
            scale={tricepsActive ? [1.06, 1.0, 1.08] : [0.95, 1.0, 0.95]}
          />
        )}
        {muscleNodes?.triceps_brachii_medial_head_R && (
          <mesh
            geometry={muscleNodes.triceps_brachii_medial_head_R.geometry}
            material={tricepsActive ? agonistMat : antagonistMat}
          />
        )}
      </group>

      {/* Cartílago Articular Troclear del Codo */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color={CARTILAGE_ICE} roughness={0.25} transparent opacity={0.8} />
      </mesh>

      {/* ── Segmento Móvil: Antebrazo y Mano Rotatorio ── */}
      <group rotation={[angleRad, 0, 0]}>
        <group position={[-P_elbow.x, -P_elbow.y, -P_elbow.z]}>
          {boneNodes?.ulna_R && <mesh geometry={boneNodes.ulna_R.geometry} material={boneMat} />}
          {boneNodes?.radius_R && <mesh geometry={boneNodes.radius_R.geometry} material={boneMat} />}
          {boneNodes?.scaphoid_R && <mesh geometry={boneNodes.scaphoid_R.geometry} material={boneMat} />}
          {boneNodes?.lunate_R && <mesh geometry={boneNodes.lunate_R.geometry} material={boneMat} />}
          {boneNodes?.capitate_R && <mesh geometry={boneNodes.capitate_R.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_2 && <mesh geometry={boneNodes.metacarpal_2.geometry} material={boneMat} />}
          {boneNodes?.metacarpal_4 && <mesh geometry={boneNodes.metacarpal_4.geometry} material={boneMat} />}

          {/* Pronador Redondo en Antebrazo */}
          {muscleNodes?.pronator_teres_humeral_head_R && (
            <mesh geometry={muscleNodes.pronator_teres_humeral_head_R.geometry} material={neutralMuscleMat} />
          )}
          {muscleNodes?.pronator_teres_ulnar_head_R && (
            <mesh geometry={muscleNodes.pronator_teres_ulnar_head_R.geometry} material={neutralMuscleMat} />
          )}
        </group>
      </group>
    </group>
  );
}

const badgeStyle = (color: string): React.CSSProperties => ({
  background: 'rgba(255, 253, 248, 0.94)',
  backdropFilter: 'blur(6px)',
  border: `1px solid ${color}66`,
  borderRadius: '6px',
  padding: '4px 9px',
  fontSize: '0.68rem',
  fontFamily: 'JetBrains Mono, monospace',
  color: '#22303c',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
});

const dotStyle = (color: string): React.CSSProperties => ({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: color,
  display: 'inline-block',
  boxShadow: `0 0 5px ${color}88`,
});

export default function AntagonistCanvas({
  mode,
  gaze,
  selectedMuscle,
  armFlexion,
  resetSignal = 0,
  zoomSignal = null,
}: AntagonistCanvasProps) {
  const telemetry = (
    <div
      style={{
        position: 'absolute',
        bottom: '52px',
        left: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        maxWidth: 'calc(100% - 24px)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
        {mode === 'eye' ? (
          <>
            <div style={badgeStyle('#0d6e64')}>
              <span style={dotStyle('#0d6e64')} /> Mirada: <b>{Math.round(gaze.x * 35)}° H, {Math.round(gaze.y * 30)}° V</b>
            </div>
            <div style={badgeStyle(MUSCLE_ACTIVE)}>
              <span style={dotStyle(MUSCLE_ACTIVE)} /> Músculo Activo: <b>{selectedMuscle || (gaze.x !== 0 || gaze.y !== 0 ? 'Contracción Agonista' : 'Tono Basal')}</b>
            </div>
          </>
        ) : (
          <>
            <div style={badgeStyle('#0d6e64')}>
              <span style={dotStyle('#0d6e64')} /> Ángulo Codo: <b>{Math.round(armFlexion * 130)}°</b>
            </div>
            <div style={badgeStyle(armFlexion > 0.35 ? MUSCLE_ACTIVE : MUSCLE_INACTIVE)}>
              <span style={dotStyle(armFlexion > 0.35 ? MUSCLE_ACTIVE : MUSCLE_INACTIVE)} /> Bíceps: <b>{armFlexion > 0.35 ? 'Agonista (Contraído)' : 'Relajado'}</b>
            </div>
            <div style={badgeStyle(armFlexion <= 0.35 ? MUSCLE_ACTIVE : MUSCLE_INACTIVE)}>
              <span style={dotStyle(armFlexion <= 0.35 ? MUSCLE_ACTIVE : MUSCLE_INACTIVE)} /> Tríceps: <b>{armFlexion <= 0.35 ? 'Agonista (Contraído)' : 'Antagonista (Relajado)'}</b>
            </div>
          </>
        )}
    </div>
  );

  return (
    <AnatomyStage
      camera={{ position: mode === 'eye' ? [0.9, 0.45, 5.6] : [1.5, 0.35, 4.8], fov: 42 }}
      target={mode === 'eye' ? [0, 0, 0] : [0.1, 0.05, 0]}
      minDistance={1.5}
      maxDistance={20}
      minPolarAngle={Math.PI * 0.08}
      maxPolarAngle={Math.PI * 0.92}
      gridArgs={[6, 12, '#c6bca6', '#ded6c5']}
      gridY={-1.2}
      shadowY={-1.19}
      shadowScale={4.5}
      shadowOpacity={0.42}
      resetSignal={resetSignal}
      zoomSignal={zoomSignal}
      fit
      fitPadding={1.7}
      refit={mode}
      overlay={telemetry}
    >
      <Center position={[0, 0, 0]}>
        {mode === 'eye' ? (
          <EyeModel gaze={gaze} selectedMuscle={selectedMuscle} />
        ) : (
          <RealArmAntagonistModel flexion={armFlexion} />
        )}
      </Center>
    </AnatomyStage>
  );
}
