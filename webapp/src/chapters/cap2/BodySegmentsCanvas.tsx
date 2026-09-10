import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import { DclTag } from './DclReadout';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';

interface BodySegmentsCanvasProps {
  posture: 'standing' | 'arms_up' | 'bent_forward' | 'squat'; // Postura del cuerpo
  bodyHeightCm: number;                                       // Estatura en cm (150 a 200, default 175)
  bodyMassKg: number;                                         // Masa corporal en kg (70 kg default)
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

// ── Paleta y Materiales de Grado Museo Anatómico ──
const BONE_IVORY = '#ede5d0';
const BONE_DEEP = '#ded3be';
const BONE_ACCENT = '#7c6a4e';
const CARTILAGE_ICE = '#68c5b8';
const TEAL_ACCENT = '#0d6e64';
const AMBER_ACCENT = '#d97706';
const RED_ACCENT = '#dc2626';
const GOLD_PLUMB = '#f59e0b';
const BRASS_DARK = '#b45309';

// ── Segmentos Corporales Estándar de Dempster (7 Masas Principales) ──
interface SegmentDempster {
  id: string;
  name: string;
  shortName: string;
  massPct: number; // Coeficiente de masa corporal (Dempster)
}

const DEMPSTER_SEGMENTS: SegmentDempster[] = [
  { id: 'head', name: 'Cabeza y Cuello', shortName: 'Cabeza', massPct: 0.07 },
  { id: 'thorax', name: 'Tórax y Tronco Sup.', shortName: 'Tórax', massPct: 0.25 },
  { id: 'pelvis', name: 'Pelvis y Tronco Inf.', shortName: 'Pelvis', massPct: 0.18 },
  { id: 'arms', name: 'Brazos Superiores', shortName: 'Brazos', massPct: 0.06 },
  { id: 'forearms', name: 'Antebrazos y Manos', shortName: 'Manos', massPct: 0.04 },
  { id: 'thighs', name: 'Muslos (Fémur)', shortName: 'Muslos', massPct: 0.24 },
  { id: 'legs', name: 'Piernas y Pies', shortName: 'Piernas', massPct: 0.16 },
];

// ── Configuraciones Cinemáticas por Postura (Ángulos en Radianes y Posiciones) ──
interface KinematicPose {
  ankleAngle: number;    // Dorsiflexión / Plantarflexión
  kneeAngle: number;     // Flexión de rodilla
  hipAngle: number;      // Flexión de cadera
  spineAngle: number;    // Flexión del tronco / columna
  headAngle: number;     // Flexión / extensión cervical
  shoulderAngle: number; // Flexión / elevación de hombro
  shoulderYaw: number;   // Abducción de hombro
  elbowAngle: number;    // Flexión de codo
  pelvisOffsetY: number; // Descenso vertical de pelvis
  pelvisOffsetZ: number; // Desplazamiento antero-posterior de pelvis
}

const POSE_PRESETS: Record<'standing' | 'arms_up' | 'bent_forward' | 'squat', KinematicPose> = {
  standing: {
    ankleAngle: 0.0,
    kneeAngle: 0.0,
    hipAngle: 0.0,
    spineAngle: 0.0,
    headAngle: 0.0,
    shoulderAngle: 0.08,
    shoulderYaw: 0.12,
    elbowAngle: 0.08,
    pelvisOffsetY: 0.0,
    pelvisOffsetZ: 0.0,
  },
  arms_up: {
    ankleAngle: 0.0,
    kneeAngle: 0.0,
    hipAngle: 0.0,
    spineAngle: -0.05, // Ligera extensión lumbar
    headAngle: -0.10,  // Vista al frente / arriba
    shoulderAngle: -2.85, // Elevación completa de brazos (165°)
    shoulderYaw: 0.18,
    elbowAngle: 0.12,
    pelvisOffsetY: 0.0,
    pelvisOffsetZ: 0.0,
  },
  bent_forward: {
    ankleAngle: -0.12, // Ligero retroceso de tobillos para contrarrestar
    kneeAngle: 0.12,   // Desbloqueo leve de rodillas
    hipAngle: 1.10,    // Flexión profunda de cadera (~63°)
    spineAngle: 0.45,  // Cifosis / flexión lumbar adicional (~26°)
    headAngle: -0.55,  // Extensión cervical para mantener la mirada al frente
    shoulderAngle: 1.15, // Brazos colgando verticalmente hacia el suelo
    shoulderYaw: 0.10,
    elbowAngle: 0.18,
    pelvisOffsetY: -0.08,
    pelvisOffsetZ: -0.14, // Retropulsión de pelvis
  },
  squat: {
    ankleAngle: 0.48,  // Dorsiflexión de tobillo (~28°)
    kneeAngle: 1.80,   // Flexión profunda de rodilla (~103°)
    hipAngle: 1.65,    // Flexión profunda de cadera (~95°)
    spineAngle: 0.58,  // Inclinación anterior compensatoria del tronco (~33°)
    headAngle: -0.42,  // Extensión cervical de orientación visual
    shoulderAngle: 1.35, // Brazos extendidos al frente como contrapeso (~77°)
    shoulderYaw: 0.14,
    elbowAngle: 0.20,
    pelvisOffsetY: -0.42, // Drástico descenso del baricentro
    pelvisOffsetZ: -0.12,
  },
};

/**
 * Cadena cinemática Dempster → centro de gravedad global y margen de
 * estabilidad. Determinista para (postura asentada, estatura); el 3D anima
 * hacia estos valores, así que el gauge muestra el valor final.
 */
function bodySegmentStats(
  posture: BodySegmentsCanvasProps['posture'],
  bodyHeightCm: number,
) {
  const pose = POSE_PRESETS[posture];
  const h = bodyHeightCm / 175;
  const ankleY = 0.085 * h;
  const shankLen = 0.44 * h;
  const thighLen = 0.46 * h;
  const kneeY = ankleY + shankLen * Math.cos(pose.ankleAngle);
  const kneeZ = shankLen * Math.sin(pose.ankleAngle);
  const hipAngleTotal = pose.ankleAngle - pose.kneeAngle;
  const hipY = kneeY + thighLen * Math.cos(hipAngleTotal) + pose.pelvisOffsetY;
  const hipZ = kneeZ - thighLen * Math.sin(hipAngleTotal) + pose.pelvisOffsetZ;
  const trunkLen = 0.42 * h;
  const trunkAngleTotal = hipAngleTotal + pose.hipAngle + pose.spineAngle;
  const thoraxY = hipY + trunkLen * 0.55 * Math.cos(trunkAngleTotal);
  const thoraxZ = hipZ + trunkLen * 0.55 * Math.sin(trunkAngleTotal);
  const shoulderY = hipY + trunkLen * Math.cos(trunkAngleTotal);
  const shoulderZ = hipZ + trunkLen * Math.sin(trunkAngleTotal);
  const neckLen = 0.24 * h;
  const headAngleTotal = trunkAngleTotal + pose.headAngle;
  const headY = shoulderY + neckLen * Math.cos(headAngleTotal);
  const headZ = shoulderZ + neckLen * Math.sin(headAngleTotal);
  const armLen = 0.30 * h;
  const armAngleTotal = trunkAngleTotal + pose.shoulderAngle;
  const armMidY = shoulderY - armLen * 0.5 * Math.cos(armAngleTotal);
  const armMidZ = shoulderZ + armLen * 0.5 * Math.sin(armAngleTotal);
  const elbowY = shoulderY - armLen * Math.cos(armAngleTotal);
  const elbowZ = shoulderZ + armLen * Math.sin(armAngleTotal);
  const forearmLen = 0.28 * h;
  const forearmAngleTotal = armAngleTotal + pose.elbowAngle;
  const forearmMidY = elbowY - forearmLen * 0.5 * Math.cos(forearmAngleTotal);
  const forearmMidZ = elbowZ + forearmLen * 0.5 * Math.sin(forearmAngleTotal);
  const cms: [number, number][] = [
    [headY, headZ],
    [thoraxY, thoraxZ],
    [hipY + 0.05, hipZ],
    [armMidY, armMidZ],
    [forearmMidY, forearmMidZ],
    [(kneeY + hipY) / 2, (kneeZ + hipZ) / 2],
    [(ankleY + kneeY) / 2, (0 + kneeZ) / 2],
  ];
  let sumY = 0, sumZ = 0, sumM = 0;
  cms.forEach(([y, z], i) => {
    const m = DEMPSTER_SEGMENTS[i].massPct;
    sumY += y * m;
    sumZ += z * m;
    sumM += m;
  });
  const cgGlobalY = sumY / sumM;
  const cgGlobalZ = sumZ / sumM;
  const totalHeightM = bodyHeightCm / 100;
  const cgHeightCm = cgGlobalY * 100;
  const cgHeightPct = (cgGlobalY / totalHeightM) * 100;
  const bosAntZ = 0.13;
  const bosPostZ = -0.14;
  const minMarginZ = Math.min(bosAntZ - cgGlobalZ, cgGlobalZ - bosPostZ);
  const isStable = cgGlobalZ >= bosPostZ - 0.02 && cgGlobalZ <= bosAntZ + 0.02;
  const isWarning = isStable && minMarginZ < 0.035;
  const stabilityMarginPct = Math.max(0, Math.min(100, (minMarginZ / ((bosAntZ - bosPostZ) / 2)) * 100));
  return { cgHeightCm, cgHeightPct, stabilityMarginPct, isStable, isWarning };
}

// ── 1. Marcador 3D de Centro de Masa Segmentario (CM_i) ──
function SegmentMassMarker3D({
  position,
  massPct,
  shortName,
  labelOffset = [0, 0.045, 0] as [number, number, number],
}: {
  position: [number, number, number];
  massPct: number;
  shortName: string;
  labelOffset?: [number, number, number];
}) {
  const r = 0.016 + Math.sqrt(massPct) * 0.038;

  return (
    <group position={position}>
      {/* Esfera marfil brillante */}
      <mesh>
        <sphereGeometry args={[r, 20, 20]} />
        <meshStandardMaterial
          color="#ede2ca"
          roughness={0.35}
          metalness={0.25}
          emissive="#d5c4a1"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Anillo ecuatorial contrastante */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 1.05, 0.002, 12, 32]} />
        <meshBasicMaterial color="#7c6a4e" />
      </mesh>

      {/* Punto nuclear */}
      <mesh>
        <sphereGeometry args={[0.005, 12, 12]} />
        <meshBasicMaterial color="#232c36" />
      </mesh>

      <DclTag
        position={[labelOffset[0], labelOffset[1], labelOffset[2]]}
        color="#7c6a4e"
        symbol={`${shortName} ${(massPct * 100).toFixed(0)}%`}
      />
    </group>
  );
}

// ── 2. Plomada Cónica de Bronce Latonado y Retículo Podal ──
function PlumbBob3D({
  cgPos,
  isStable,
  isWarning,
}: {
  cgPos: [number, number, number];
  isStable: boolean;
  isWarning: boolean;
}) {
  const plumbColor = !isStable ? RED_ACCENT : (isWarning ? AMBER_ACCENT : TEAL_ACCENT);
  const plumbY = cgPos[1];
  const plumbX = cgPos[0];
  const plumbZ = cgPos[2];

  // Micro-vibración pendular sutil
  const bobRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bobRef.current) {
      bobRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group position={[plumbX, 0, plumbZ]}>
      {/* Cuerda de plomada trenzada (Línea de Gravedad) */}
      <mesh position={[0, plumbY / 2, 0]}>
        <cylinderGeometry args={[0.002, 0.002, plumbY, 8]} />
        <meshStandardMaterial
          color={plumbColor}
          emissive={plumbColor}
          emissiveIntensity={0.65}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Pesa de la plomada de bronce torneada justo sobre el suelo (Y = 0.04) */}
      <group ref={bobRef} position={[0, 0.045, 0]}>
        {/* Cuerpo cónico invertido terminado en punta fina */}
        <mesh position={[0, 0.012, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.024, 0.048, 24]} />
          <meshStandardMaterial
            color={GOLD_PLUMB}
            roughness={0.22}
            metalness={0.88}
            emissive={BRASS_DARK}
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* Cuello cilíndrico superior */}
        <mesh position={[0, 0.038, 0]}>
          <cylinderGeometry args={[0.014, 0.022, 0.012, 24]} />
          <meshStandardMaterial color={GOLD_PLUMB} roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Anillo de fijación */}
        <mesh position={[0, 0.048, 0]}>
          <torusGeometry args={[0.006, 0.002, 12, 20]} />
          <meshStandardMaterial color={GOLD_PLUMB} roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Retículo de contacto y diana en el suelo */}
      <group position={[0, 0.002, 0]}>
        {/* Círculo central de contacto */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.022, 32]} />
          <meshBasicMaterial color={plumbColor} transparent opacity={0.7} />
        </mesh>
        {/* Anillo concéntrico */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.035, 0.042, 32]} />
          <meshBasicMaterial color={plumbColor} transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ── 3. Dial Manométrico Analógico de Altura de CG y Margen de Estabilidad ──
function StabilityGauge({
  cgHeightCm,
  cgHeightPct,
  stabilityMarginPct,
  isStable,
  isWarning,
  bodyMassKg,
}: {
  cgHeightCm: number;
  cgHeightPct: number;
  stabilityMarginPct: number;
  isStable: boolean;
  isWarning: boolean;
  bodyMassKg: number;
}) {
  const normVal = Math.min(1, Math.max(0, (cgHeightPct - 30) / 45));
  const needleAngle = -135 + normVal * 270;
  const statusColor = !isStable ? RED_ACCENT : (isWarning ? AMBER_ACCENT : TEAL_ACCENT);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${statusColor}`,
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 6px 20px rgba(35, 44, 54, 0.12)',
        width: '168px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Análisis de Estabilidad
      </div>

      {/* SVG Dial */}
      <svg width="116" height="70" viewBox="0 0 120 74" style={{ margin: '2px auto 0', display: 'block' }}>
        <path d="M 15 65 A 45 45 0 0 1 105 65" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        {/* Sector Óptimo / Estable (< 52%) */}
        <path d="M 15 65 A 45 45 0 0 1 60 20" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="4 2" opacity={0.4} />
        {/* Sector Neutro (52% - 58%) */}
        <path d="M 60 20 A 45 45 0 0 1 88 32" fill="none" stroke="#0d6e64" strokeWidth="8" strokeDasharray="4 2" opacity={0.4} />
        {/* Sector Alto / Inestable (> 58%) */}
        <path d="M 88 32 A 45 45 0 0 1 105 65" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="4 2" opacity={0.4} />

        {/* Arco dinámico */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke={statusColor}
          strokeWidth="8"
          strokeDasharray="141.37"
          strokeDashoffset={141.37 * (1 - normVal)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.25s ease, stroke 0.25s ease' }}
        />

        {/* Aguja indicadora analógica */}
        <g transform={`rotate(${needleAngle} 60 65)`} style={{ transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="60" y1="65" x2="60" y2="26" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="60" cy="65" r="4.2" fill="#1e293b" />
          <circle cx="60" cy="65" r="1.8" fill="#ffffff" />
        </g>

        {/* Marcas de escala */}
        <text x="12" y="72" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">30%</text>
        <text x="54" y="16" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">56%</text>
        <text x="94" y="72" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">75%</text>
      </svg>

      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: statusColor, fontFamily: 'JetBrains Mono, monospace', margin: '0' }}>
        {cgHeightCm.toFixed(1)} cm
      </div>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: statusColor }}>
        {!isStable ? '⚠️ Fuera de Base (Caída)' : (isWarning ? '⚠️ Límite Anterior' : '✓ Equilibrio Estable')}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: '#475569', marginTop: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '3px' }}>
        <span>Altura Baricentro:</span>
        <b style={{ color: statusColor, fontFamily: 'JetBrains Mono, monospace' }}>{cgHeightPct.toFixed(1)}% H</b>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: '#475569', marginTop: '1px' }}>
        <span>Margen Estabilidad:</span>
        <b style={{ color: TEAL_ACCENT, fontFamily: 'JetBrains Mono, monospace' }}>{stabilityMarginPct.toFixed(0)}%</b>
      </div>
    </div>
  );
}

// ── 4. Esqueleto 3D Completo Articulado con Método de Segmentos Dempster ──
function DempsterSkeletonRig3D({
  posture,
  bodyHeightCm,
  bodyMassKg,
}: BodySegmentsCanvasProps) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;

  // Estado cinemático interpolado suavemente (LERP)
  const currentPoseRef = useRef<KinematicPose>({ ...POSE_PRESETS[posture] });
  const pulseRef = useRef<number>(0);

  // Materiales Anatómicos
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_IVORY),
        roughness: 0.58,
        metalness: 0.05,
      }),
    []
  );

  const axialBoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f0e7d5'),
        roughness: 0.60,
        metalness: 0.05,
      }),
    []
  );

  const basePelvisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_DEEP),
        roughness: 0.62,
        metalness: 0.05,
      }),
    []
  );

  const cartilageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(CARTILAGE_ICE),
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  // Escala general del maniquí esqueletal (1.75m en bipedestación)
  const S = 3.65 * (bodyHeightCm / 175);
  // Escala fija del modelo GLB normalizado
  const GLB_SCALE = 3.65;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    pulseRef.current = Math.sin(t * 5) * 0.003;

    const targetPose = POSE_PRESETS[posture];
    const lerpRate = Math.min(1, delta * 7.5);

    currentPoseRef.current.ankleAngle += (targetPose.ankleAngle - currentPoseRef.current.ankleAngle) * lerpRate;
    currentPoseRef.current.kneeAngle += (targetPose.kneeAngle - currentPoseRef.current.kneeAngle) * lerpRate;
    currentPoseRef.current.hipAngle += (targetPose.hipAngle - currentPoseRef.current.hipAngle) * lerpRate;
    currentPoseRef.current.spineAngle += (targetPose.spineAngle - currentPoseRef.current.spineAngle) * lerpRate;
    currentPoseRef.current.headAngle += (targetPose.headAngle - currentPoseRef.current.headAngle) * lerpRate;
    currentPoseRef.current.shoulderAngle += (targetPose.shoulderAngle - currentPoseRef.current.shoulderAngle) * lerpRate;
    currentPoseRef.current.shoulderYaw += (targetPose.shoulderYaw - currentPoseRef.current.shoulderYaw) * lerpRate;
    currentPoseRef.current.elbowAngle += (targetPose.elbowAngle - currentPoseRef.current.elbowAngle) * lerpRate;
    currentPoseRef.current.pelvisOffsetY += (targetPose.pelvisOffsetY - currentPoseRef.current.pelvisOffsetY) * lerpRate;
    currentPoseRef.current.pelvisOffsetZ += (targetPose.pelvisOffsetZ - currentPoseRef.current.pelvisOffsetZ) * lerpRate;
  });

  const pose = currentPoseRef.current;

  // ── Cálculo Cinemático 3D de las 7 Masas Segmentarias (Dempster) ──
  // Alturas anatómicas en metros relativas al suelo (Y = 0)
  const ankleY = 0.085 * (bodyHeightCm / 175);
  const shankLen = 0.44 * (bodyHeightCm / 175);
  const thighLen = 0.46 * (bodyHeightCm / 175);

  // 1. Posición de Rodilla (Knee Joint)
  const kneeY = ankleY + shankLen * Math.cos(pose.ankleAngle);
  const kneeZ = shankLen * Math.sin(pose.ankleAngle);

  // 2. Posición de Cadera / Pelvis (Hip Joint)
  const hipAngleTotal = pose.ankleAngle - pose.kneeAngle;
  const hipY = kneeY + thighLen * Math.cos(hipAngleTotal) + pose.pelvisOffsetY;
  const hipZ = kneeZ - thighLen * Math.sin(hipAngleTotal) + pose.pelvisOffsetZ;

  // 3. Posición de Tórax y Tronco Superior
  const trunkLen = 0.42 * (bodyHeightCm / 175);
  const trunkAngleTotal = hipAngleTotal + pose.hipAngle + pose.spineAngle;
  const thoraxY = hipY + trunkLen * 0.55 * Math.cos(trunkAngleTotal);
  const thoraxZ = hipZ + trunkLen * 0.55 * Math.sin(trunkAngleTotal);
  const shoulderY = hipY + trunkLen * Math.cos(trunkAngleTotal);
  const shoulderZ = hipZ + trunkLen * Math.sin(trunkAngleTotal);

  // 4. Posición de Cabeza y Cuello
  const neckLen = 0.24 * (bodyHeightCm / 175);
  const headAngleTotal = trunkAngleTotal + pose.headAngle;
  const headY = shoulderY + neckLen * Math.cos(headAngleTotal);
  const headZ = shoulderZ + neckLen * Math.sin(headAngleTotal);

  // 5. Posición de Brazos Superiores (Húmero)
  const armLen = 0.30 * (bodyHeightCm / 175);
  const armAngleTotal = trunkAngleTotal + pose.shoulderAngle;
  const armMidY = shoulderY - armLen * 0.5 * Math.cos(armAngleTotal);
  const armMidZ = shoulderZ + armLen * 0.5 * Math.sin(armAngleTotal);
  const elbowY = shoulderY - armLen * Math.cos(armAngleTotal);
  const elbowZ = shoulderZ + armLen * Math.sin(armAngleTotal);

  // 6. Posición de Antebrazos y Manos
  const forearmLen = 0.28 * (bodyHeightCm / 175);
  const forearmAngleTotal = armAngleTotal + pose.elbowAngle;
  const forearmMidY = elbowY - forearmLen * 0.5 * Math.cos(forearmAngleTotal);
  const forearmMidZ = elbowZ + forearmLen * 0.5 * Math.sin(forearmAngleTotal);

  // 7. Centros de Masa Segmentarios (CM_i)
  const cmHead: [number, number, number] = [0, headY, headZ];
  const cmThorax: [number, number, number] = [0, thoraxY, thoraxZ];
  const cmPelvis: [number, number, number] = [0, hipY + 0.05, hipZ];
  const cmArms: [number, number, number] = [0, armMidY, armMidZ];
  const cmForearms: [number, number, number] = [0, forearmMidY, forearmMidZ];
  const cmThighs: [number, number, number] = [0, (kneeY + hipY) / 2, (kneeZ + hipZ) / 2];
  const cmLegs: [number, number, number] = [0, (ankleY + kneeY) / 2, (0 + kneeZ) / 2];

  const segmentCMs: { pos: [number, number, number]; massPct: number; shortName: string }[] = [
    { pos: cmHead, massPct: DEMPSTER_SEGMENTS[0].massPct, shortName: DEMPSTER_SEGMENTS[0].shortName },
    { pos: cmThorax, massPct: DEMPSTER_SEGMENTS[1].massPct, shortName: DEMPSTER_SEGMENTS[1].shortName },
    { pos: cmPelvis, massPct: DEMPSTER_SEGMENTS[2].massPct, shortName: DEMPSTER_SEGMENTS[2].shortName },
    { pos: cmArms, massPct: DEMPSTER_SEGMENTS[3].massPct, shortName: DEMPSTER_SEGMENTS[3].shortName },
    { pos: cmForearms, massPct: DEMPSTER_SEGMENTS[4].massPct, shortName: DEMPSTER_SEGMENTS[4].shortName },
    { pos: cmThighs, massPct: DEMPSTER_SEGMENTS[5].massPct, shortName: DEMPSTER_SEGMENTS[5].shortName },
    { pos: cmLegs, massPct: DEMPSTER_SEGMENTS[6].massPct, shortName: DEMPSTER_SEGMENTS[6].shortName },
  ];

  // ── Teorema de Varignon: Centro de Gravedad Global (CG) ──
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let sumM = 0;

  segmentCMs.forEach((sc) => {
    sumX += sc.pos[0] * sc.massPct;
    sumY += sc.pos[1] * sc.massPct;
    sumZ += sc.pos[2] * sc.massPct;
    sumM += sc.massPct;
  });

  const cgGlobalX = sumX / sumM;
  const cgGlobalY = sumY / sumM;
  const cgGlobalZ = sumZ / sumM;

  const totalHeightM = (bodyHeightCm / 100);
  const cgHeightCm = cgGlobalY * 100;
  const cgHeightPct = (cgGlobalY / totalHeightM) * 100;

  // ── Límites del Polígono de Sustentación Podal (BOS) ──
  // El polígono podal cubre los pies en el suelo: Z de -0.14m (talones) a +0.12m (dedos)
  const bosAntZ = 0.13;
  const bosPostZ = -0.14;
  const bosHalfW = 0.18;

  const minMarginZ = Math.min(bosAntZ - cgGlobalZ, cgGlobalZ - bosPostZ);
  const isStable = cgGlobalZ >= bosPostZ - 0.02 && cgGlobalZ <= bosAntZ + 0.02;
  const isWarning = isStable && minMarginZ < 0.035;
  const stabilityMarginPct = Math.max(0, Math.min(100, (minMarginZ / ((bosAntZ - bosPostZ) / 2)) * 100));

  // Letreros del riel lateral (la tabla de esquina «CG · estabilidad»).
  const lCG = `CG = ${cgHeightCm.toFixed(1)} cm`;
  const sCG = `${cgHeightPct.toFixed(0)}% de la estatura`;
  const lMargen = `margen = ${stabilityMarginPct.toFixed(0)} %`;
  const sMargen = isStable ? (isWarning ? 'al límite anterior' : 'dentro de la BoS') : 'fuera de la BoS';
  const cgColor = !isStable ? RED_ACCENT : isWarning ? AMBER_ACCENT : TEAL_ACCENT;

  return (
    <group position={[0, -0.78, 0]}>
      {/* ── A. SUELO Y POLÍGONO DE SUSTENTACIÓN PODAL 3D (BOS) ── */}
      <group position={[0, 0.001, 0]}>
        {/* Polígono podal translúcido (Base of Support) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[bosHalfW * 2, (bosAntZ - bosPostZ)]} />
          <meshBasicMaterial
            color={!isStable ? RED_ACCENT : (isWarning ? AMBER_ACCENT : TEAL_ACCENT)}
            transparent
            opacity={0.16}
          />
        </mesh>

        {/* Borde perimetral del BOS */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bosHalfW * 0.88, bosHalfW * 0.94, 32]} />
          <meshBasicMaterial
            color={!isStable ? RED_ACCENT : (isWarning ? AMBER_ACCENT : TEAL_ACCENT)}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Cuadrícula métrica milimetrada suave */}
        <gridHelper args={[2.4, 24, '#c5b593', '#e8dfcc']} position={[0, 0.001, 0]} />

        {/* Rótulo 3D del BOS */}
        <DclTag position={[0, 0.01, bosAntZ + 0.08]} color={!isStable ? RED_ACCENT : TEAL_ACCENT} symbol="BoS" />
      </group>

      {/* ── B. ESQUELETO COMPLETO ARTICULADO (MESHES REALES DE HUMAN_BODY.GLB) ── */}
      {/* 1. Pies y Tobillos (Fijos en suelo) */}
      <group position={[0, ankleY, 0]}>
        {/* Pie Izquierdo y Derecho */}
        <group position={[0.07, -ankleY + 0.02, 0]}>
          {nodes?.talus_L && <mesh geometry={nodes.talus_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.calcaneus_L && <mesh geometry={nodes.calcaneus_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.navicular_L && <mesh geometry={nodes.navicular_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.cuboid_L && <mesh geometry={nodes.cuboid_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal1_L && <mesh geometry={nodes.metatarsal1_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal2_L && <mesh geometry={nodes.metatarsal2_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal3_L && <mesh geometry={nodes.metatarsal3_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal4_L && <mesh geometry={nodes.metatarsal4_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal5_L && <mesh geometry={nodes.metatarsal5_L.geometry} material={boneMat} scale={GLB_SCALE} />}
        </group>
        <group position={[-0.07, -ankleY + 0.02, 0]}>
          {nodes?.talus_R && <mesh geometry={nodes.talus_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.calcaneus_R && <mesh geometry={nodes.calcaneus_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.navicular_R && <mesh geometry={nodes.navicular_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.cuboid_R && <mesh geometry={nodes.cuboid_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal1_R && <mesh geometry={nodes.metatarsal1_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal2_R && <mesh geometry={nodes.metatarsal2_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal3_R && <mesh geometry={nodes.metatarsal3_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal4_R && <mesh geometry={nodes.metatarsal4_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          {nodes?.metatarsal5_R && <mesh geometry={nodes.metatarsal5_R.geometry} material={boneMat} scale={GLB_SCALE} />}
        </group>

        {/* 2. Piernas y Tibias (Rotación en tobillo) */}
        <group rotation={[pose.ankleAngle, 0, 0]}>
          {/* Tibia y Peroné */}
          <group position={[0.07, 0.18, 0]}>
            {nodes?.tibia_L && <mesh geometry={nodes.tibia_L.geometry} material={boneMat} scale={GLB_SCALE} />}
            {nodes?.fibula_L && <mesh geometry={nodes.fibula_L.geometry} material={boneMat} scale={GLB_SCALE} />}
          </group>
          <group position={[-0.07, 0.18, 0]}>
            {nodes?.tibia_R && <mesh geometry={nodes.tibia_R.geometry} material={boneMat} scale={GLB_SCALE} />}
            {nodes?.fibula_R && <mesh geometry={nodes.fibula_R.geometry} material={boneMat} scale={GLB_SCALE} />}
          </group>

          {/* 3. Rodillas y Muslos (Fémur & Rótula) */}
          <group position={[0, shankLen, 0]} rotation={[-pose.kneeAngle, 0, 0]}>
            {/* Rótula / Patella */}
            <group position={[0.07, 0.02, 0.035]}>
              {nodes?.patella_L && <mesh geometry={nodes.patella_L.geometry} material={cartilageMat} scale={GLB_SCALE} />}
            </group>
            <group position={[-0.07, 0.02, 0.035]}>
              {nodes?.patella_R && <mesh geometry={nodes.patella_R.geometry} material={cartilageMat} scale={GLB_SCALE} />}
            </group>

            {/* Fémur L & R */}
            <group position={[0.07, 0.22, 0]}>
              {nodes?.femur_L && <mesh geometry={nodes.femur_L.geometry} material={boneMat} scale={GLB_SCALE} />}
            </group>
            <group position={[-0.07, 0.22, 0]}>
              {nodes?.femur_R && <mesh geometry={nodes.femur_R.geometry} material={boneMat} scale={GLB_SCALE} />}
            </group>

            {/* 4. Cadera, Pelvis y Sacro */}
            <group position={[0, thighLen + pose.pelvisOffsetY, pose.pelvisOffsetZ]} rotation={[pose.hipAngle, 0, 0]}>
              <group position={[0, 0.02, 0]}>
                {nodes?.sacrum && <mesh geometry={nodes.sacrum.geometry} material={basePelvisMat} scale={GLB_SCALE} />}
                {nodes?.hip_L && <mesh geometry={nodes.hip_L.geometry} material={basePelvisMat} scale={GLB_SCALE} />}
                {nodes?.hip_R && <mesh geometry={nodes.hip_R.geometry} material={basePelvisMat} scale={GLB_SCALE} />}
                {nodes?.lumbar5 && <mesh geometry={nodes.lumbar5.geometry} material={basePelvisMat} scale={GLB_SCALE} />}
                {nodes?.lumbar4 && <mesh geometry={nodes.lumbar4.geometry} material={basePelvisMat} scale={GLB_SCALE} />}
              </group>

              {/* 5. Columna Vertebral y Tórax Superior */}
              <group position={[0, 0.14, 0]} rotation={[pose.spineAngle, 0, 0]}>
                <group position={[0, 0.15, 0]}>
                  {nodes?.lumbar3 && <mesh geometry={nodes.lumbar3.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.lumbar2 && <mesh geometry={nodes.lumbar2.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.lumbar1 && <mesh geometry={nodes.lumbar1.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic12 && <mesh geometry={nodes.thoracic12.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic11 && <mesh geometry={nodes.thoracic11.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic10 && <mesh geometry={nodes.thoracic10.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic9 && <mesh geometry={nodes.thoracic9.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic8 && <mesh geometry={nodes.thoracic8.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic7 && <mesh geometry={nodes.thoracic7.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic6 && <mesh geometry={nodes.thoracic6.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic5 && <mesh geometry={nodes.thoracic5.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic4 && <mesh geometry={nodes.thoracic4.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic3 && <mesh geometry={nodes.thoracic3.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic2 && <mesh geometry={nodes.thoracic2.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.thoracic1 && <mesh geometry={nodes.thoracic1.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.sternum && <mesh geometry={nodes.sternum.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_1 && <mesh geometry={nodes.rib_1.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_2 && <mesh geometry={nodes.rib_2.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_3 && <mesh geometry={nodes.rib_3.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_4 && <mesh geometry={nodes.rib_4.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_5 && <mesh geometry={nodes.rib_5.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_6 && <mesh geometry={nodes.rib_6.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_7 && <mesh geometry={nodes.rib_7.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_8 && <mesh geometry={nodes.rib_8.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_9 && <mesh geometry={nodes.rib_9.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.rib_10 && <mesh geometry={nodes.rib_10.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.clavicle_L && <mesh geometry={nodes.clavicle_L.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.clavicle_R && <mesh geometry={nodes.clavicle_R.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.scapula_L && <mesh geometry={nodes.scapula_L.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                  {nodes?.scapula_R && <mesh geometry={nodes.scapula_R.geometry} material={axialBoneMat} scale={GLB_SCALE} />}
                </group>

                {/* 6. Extremidades Superiores (Hombro -> Codo -> Mano) */}
                {/* Brazo Izquierdo */}
                <group position={[0.16, 0.28, 0]} rotation={[pose.shoulderAngle, 0, pose.shoulderYaw]}>
                  {nodes?.humerus_L && <mesh geometry={nodes.humerus_L.geometry} material={boneMat} scale={GLB_SCALE} />}
                  <group position={[0, -armLen, 0]} rotation={[pose.elbowAngle, 0, 0]}>
                    {nodes?.radius_L && <mesh geometry={nodes.radius_L.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.ulna_L && <mesh geometry={nodes.ulna_L.geometry} material={boneMat} scale={GLB_SCALE} />}
                  </group>
                </group>

                {/* Brazo Derecho */}
                <group position={[-0.16, 0.28, 0]} rotation={[pose.shoulderAngle, 0, -pose.shoulderYaw]}>
                  {nodes?.humerus_R && <mesh geometry={nodes.humerus_R.geometry} material={boneMat} scale={GLB_SCALE} />}
                  <group position={[0, -armLen, 0]} rotation={[pose.elbowAngle, 0, 0]}>
                    {nodes?.radius_R && <mesh geometry={nodes.radius_R.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.ulna_R && <mesh geometry={nodes.ulna_R.geometry} material={boneMat} scale={GLB_SCALE} />}
                  </group>
                </group>

                {/* 7. Cuello y Cabeza */}
                <group position={[0, 0.32, 0]} rotation={[pose.headAngle, 0, 0]}>
                  <group position={[0, 0.08, 0]}>
                    {nodes?.cervical7 && <mesh geometry={nodes.cervical7.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.cervical6 && <mesh geometry={nodes.cervical6.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.cervical5 && <mesh geometry={nodes.cervical5.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.cervical4 && <mesh geometry={nodes.cervical4.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.cervical3 && <mesh geometry={nodes.cervical3.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.occipital && <mesh geometry={nodes.occipital.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.frontal && <mesh geometry={nodes.frontal.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.parietal_L && <mesh geometry={nodes.parietal_L.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.parietal_R && <mesh geometry={nodes.parietal_R.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.temporal_L && <mesh geometry={nodes.temporal_L.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.temporal_R && <mesh geometry={nodes.temporal_R.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.sphenoid && <mesh geometry={nodes.sphenoid.geometry} material={boneMat} scale={GLB_SCALE} />}
                    {nodes?.mandible && <mesh geometry={nodes.mandible.geometry} material={boneMat} scale={GLB_SCALE} />}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ── C. CENTROS DE MASA SEGMENTARIOS 3D (DEMPSTER) ── */}
      {segmentCMs.map((seg, idx) => (
        <SegmentMassMarker3D
          key={idx}
          position={seg.pos}
          massPct={seg.massPct}
          shortName={seg.shortName}
          labelOffset={idx === 0 ? [0, 0.06, 0] : (idx === 4 ? [0, -0.05, 0] : [0, 0.045, 0])}
        />
      ))}

      {/* ── D. BARICENTRO GLOBAL 3D (CENTROID CG) CON RETÍCULO PULSANTE ── */}
      <group position={[cgGlobalX, cgGlobalY, cgGlobalZ]}>
        {/* Esfera central del CG */}
        <mesh>
          <sphereGeometry args={[0.024, 24, 24]} />
          <meshStandardMaterial
            color="#ef4444"
            roughness={0.2}
            metalness={0.4}
            emissive="#dc2626"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Retículo ecuatorial */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.038 + pulseRef.current * 1.5, 0.003, 16, 32]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Retículo sagital */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.038 + pulseRef.current * 1.5, 0.003, 16, 32]} />
          <meshBasicMaterial color="#fca5a5" />
        </mesh>

        {/* Marcador del centro de gravedad global */}
        <DclTag position={[0.12, 0.02, 0]} color="#b91c1c" symbol="CG" />
      </group>

      {/* ── E. LÍNEA DE PLOMADA Y PLOMADA DE BRONCE AL SUELO ── */}
      <PlumbBob3D
        cgPos={[cgGlobalX, cgGlobalY, cgGlobalZ]}
        isStable={isStable}
        isWarning={isWarning}
      />

      {/* ── F. LECTURA CG · ESTABILIDAD → riel lateral (línea guía al contacto
             de la plomada con el suelo, el punto que se compara con la BoS) ── */}
      <Callout position={[cgGlobalX, 0.10, cgGlobalZ]} label={lCG} sub={sCG} color="#b91c1c" emphasis="strong" />
      <Callout position={[cgGlobalX, 0.03, cgGlobalZ]} label={lMargen} sub={sMargen} color={cgColor} />

      <CalloutSource />
    </group>
  );
}

// ── 5. Componente Principal 3D con React Three Fiber ──
export default function BodySegmentsCanvas({
  showLabels = false,
  posture = 'standing',
  bodyHeightCm = 175,
  bodyMassKg = 70,
}: BodySegmentsCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const b = bodySegmentStats(posture, bodyHeightCm);
  const callouts = useCalloutStore();

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div
      className="cap2-webgl-canvas"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: STUDIO_BG_DEEP,
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [1.35, 0.30, 2.20], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <StudioLights keyIntensity={1.6} />

        <Suspense fallback={null}>
          <DempsterSkeletonRig3D
            posture={posture}
            bodyHeightCm={bodyHeightCm}
            bodyMassKg={bodyMassKg}
          />
        </Suspense>

        {/* Sombra de contacto */}
        <ContactShadows
          position={[0, -0.78, 0]}
          opacity={0.58}
          scale={3.2}
          blur={2.0}
          far={1.6}
          color="#232c36"
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={0.8}
          maxDistance={4.5}
          target={[0, 0.10, 0]}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lectura CG · estabilidad → riel lateral con línea guía */}
      <CalloutRail
        store={callouts}
        side="left"
        note="El CG global es la media ponderada por masa de los centros de masa segmentarios (Dempster); debe caer dentro de la base de sustentación."
      />

      {/* Dial de estabilidad anclado a la esquina (fuera del 3D) */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          zIndex: 9,
          transform: 'scale(0.8)',
          transformOrigin: 'bottom right',
          pointerEvents: 'none',
        }}
      >
        <StabilityGauge
          cgHeightCm={b.cgHeightCm}
          cgHeightPct={b.cgHeightPct}
          stabilityMarginPct={b.stabilityMarginPct}
          isStable={b.isStable}
          isWarning={b.isWarning}
          bodyMassKg={bodyMassKg}
        />
      </div>
    </div>
    </CalloutProvider>
  );
}
