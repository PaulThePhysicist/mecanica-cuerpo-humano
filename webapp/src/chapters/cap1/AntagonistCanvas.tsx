import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Center, ContactShadows, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { AccessibleOrbitControls, SceneControlPad } from './AccessibleOrbitControls';

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
const BONE_IVORY = '#ede5d0';
const BONE_DEEP = '#ded3be';
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
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  // Ángulo de flexión: 0° a 130°
  const angleDeg = flexion * 130;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Centro anatómico de rotación del codo en human_body.glb
  const P_elbow = useMemo(() => new THREE.Vector3(-0.128, 0.142, -0.016), []);
  const P_shoulder = useMemo(() => new THREE.Vector3(-0.096, 0.306, -0.018), []);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedBoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );

  const bicepsActive = flexion > 0.35;
  const tricepsActive = flexion <= 0.35;

  const agonistMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: MUSCLE_ACTIVE,
        roughness: 0.60,
        metalness: 0.05,
        emissive: MUSCLE_ACTIVE_EMISSIVE,
        emissiveIntensity: 0.5,
      }),
    []
  );

  const antagonistMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: MUSCLE_INACTIVE,
        roughness: 0.68,
        metalness: 0.02,
      }),
    []
  );

  const neutralMuscleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#9e473e',
        roughness: 0.64,
        metalness: 0.04,
      }),
    []
  );

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

// ── Manejador de Cámara y Transición entre Modos ──
function CameraManager({
  mode,
  zoomSignal,
  resetSignal,
  controlsRef,
}: {
  mode: AntagonistMode;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
  resetSignal?: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const targetPos = mode === 'eye' ? new THREE.Vector3(0.9, 0.45, 5.6) : new THREE.Vector3(1.5, 0.35, 4.8);
    const targetLookAt = mode === 'eye' ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(0.1, 0.05, 0);

    camera.position.copy(targetPos);
    camera.lookAt(targetLookAt);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(targetLookAt);
      controlsRef.current.update();
      controlsRef.current.saveState();
    }
  }, [mode, resetSignal, camera, controlsRef]);

  useEffect(() => {
    if (!zoomSignal) return;
    const target = controlsRef.current?.target ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);
    const factor = zoomSignal.type === 'in' ? 0.8 : 1.25;
    const dir = new THREE.Vector3().subVectors(camera.position, target);
    const newDist = THREE.MathUtils.clamp(dir.length() * factor, 1.5, 20.0);
    dir.normalize().multiplyScalar(newDist);
    camera.position.copy(target).add(dir);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [zoomSignal, camera, controlsRef]);

  return null;
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

useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_arm.glb');

export default function AntagonistCanvas({
  mode,
  gaze,
  selectedMuscle,
  armFlexion,
  resetSignal = 0,
  zoomSignal = null,
}: AntagonistCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetSignal]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0.9, 0.45, 5.6], fov: 42 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #faf6ee 55%, #eee4d2 100%)',
        }}
      >
        <CameraManager
          mode={mode}
          zoomSignal={zoomSignal}
          resetSignal={resetSignal}
          controlsRef={controlsRef}
        />
        <ambientLight intensity={0.88} color="#fffcf5" />
        <directionalLight position={[10, 15, 8]} intensity={1.35} color="#fff8eb" />
        <directionalLight position={[-10, 8, -6]} intensity={0.65} color="#e8f4f8" />
        <directionalLight position={[0, -5, 5]} intensity={0.25} color="#faf0e6" />

        <gridHelper args={[6, 12, '#c6bca6', '#ded6c5']} position={[0, -1.2, 0]} />

        <Suspense fallback={null}>
          <Center position={[0, 0, 0]}>
            {mode === 'eye' ? (
              <EyeModel gaze={gaze} selectedMuscle={selectedMuscle} />
            ) : (
              <RealArmAntagonistModel flexion={armFlexion} />
            )}
          </Center>

          {/* Sombra de contacto difusa */}
          <ContactShadows
            position={[0, -1.19, 0]}
            opacity={0.42}
            scale={4.5}
            blur={2.0}
            far={3.5}
            color="#232c36"
          />
        </Suspense>

        <AccessibleOrbitControls
          controlsRef={controlsRef}
          minDistance={1.5}
          maxDistance={20}
          minPolarAngle={Math.PI * 0.08}
          maxPolarAngle={Math.PI * 0.92}
          target={[0, 0, 0]}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Telemetría Discreta */}
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
    </div>
  );
}
