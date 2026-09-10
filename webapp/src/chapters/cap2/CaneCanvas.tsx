import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

interface CaneCanvasProps {
  caneHand: 'contra' | 'ipsi' | 'none'; // Mano contralateral, ipsilateral o sin bastón
  caneForceKg: number;                   // Fuerza de apoyo en el bastón (0 a 25 kgf)
  bodyMassKg: number;                    // Masa corporal en kg (70 kg default)
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

// ── Colores y Paleta Anatómica de Grado Médico ──
const BONE_IVORY = '#ede5d0';
const CARTILAGE_ICE = '#68c5b8';
const MUSCLE_CARMINE = '#a92a1e';
const MUSCLE_RELAXED = '#ce7b74';
const TENDON_PEARL = '#f5f0e6';
const TEAL_ACCENT = '#0d6e64';
const AMBER_ACCENT = '#d97706';
const RED_ACCENT = '#b02318';
const CANE_TEAL = '#0d8577';

// Pivot anatómico de la cabeza femoral derecha
const P_HIP_R = new THREE.Vector3(-0.039, 0.002, -0.003);

// ── 1. Vector de Fuerza 3D con Tubo, Cono y Badge HTML Flotante ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  label,
  sub,
  emphasis,
  isDashed = false,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  /** Letrero para el riel lateral (símbolo = valor). */
  label: string;
  sub?: string;
  emphasis?: 'strong' | 'muted';
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

  if (len < 0.02) return null;

  const headLen = Math.min(0.12, Math.max(0.045, len * 0.18));
  const headRadius = headLen * 0.32;
  const shaftLen = Math.max(0.01, len - headLen);
  const shaftRadius = 0.011;

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
          emissiveIntensity={0.55}
        />
      </mesh>

      {/* Letrero → riel lateral (símbolo = valor), con línea guía a la punta. */}
      <Callout
        position={[tipPos.x + dir.x * 0.07, tipPos.y + dir.y * 0.07, tipPos.z + dir.z * 0.07]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── 2. Modelo 3D de Bastón de Alta Gama (Madera de Nogal, Latón Dorado, Empuñadura Derby) ──
function CaneModel3D({
  position,
  caneHand,
  fCaneN,
  caneForceKg,
}: {
  position: [number, number, number];
  caneHand: 'contra' | 'ipsi';
  fCaneN: number;
  caneForceKg: number;
}) {
  const caneHeight = 2.0;
  const shaftRadius = 0.015;

  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#442f1f'),
        roughness: 0.40,
        metalness: 0.06,
      }),
    []
  );

  const goldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d4af37'),
        roughness: 0.22,
        metalness: 0.88,
      }),
    []
  );

  const gripMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#26180f'),
        roughness: 0.38,
        metalness: 0.1,
      }),
    []
  );

  const rubberMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1e293b'),
        roughness: 0.88,
        metalness: 0.05,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Fuste cilíndrico de madera noble */}
      <mesh position={[0, caneHeight * 0.5, 0]}>
        <cylinderGeometry args={[shaftRadius * 0.88, shaftRadius, caneHeight, 20]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      {/* Collar de latón pulido */}
      <mesh position={[0, caneHeight - 0.02, 0]}>
        <cylinderGeometry args={[shaftRadius * 1.15, shaftRadius * 1.15, 0.025, 20]} />
        <primitive object={goldMat} attach="material" />
      </mesh>

      {/* Empuñadura curva Derby ergonómica */}
      <group position={[0, caneHeight + 0.02, 0]}>
        <mesh position={[caneHand === 'contra' ? -0.05 : 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[shaftRadius * 1.08, shaftRadius * 1.08, 0.19, 16]} />
          <primitive object={gripMat} attach="material" />
        </mesh>
        <mesh position={[caneHand === 'contra' ? -0.145 : 0.145, -0.015, 0]}>
          <sphereGeometry args={[shaftRadius * 1.18, 16, 16]} />
          <primitive object={gripMat} attach="material" />
        </mesh>
      </group>

      {/* Contera de goma amortiguadora en la base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[shaftRadius * 1.1, shaftRadius * 1.3, 0.04, 16]} />
        <primitive object={rubberMat} attach="material" />
      </mesh>

      {/* Sombra de contacto focalizada bajo la contera del bastón */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#1a140e" transparent opacity={0.55} />
      </mesh>

      {/* Vector Fuerza Fc (Empuje hacia arriba del bastón) */}
      {fCaneN > 5 && (
        <ForceVector3D
          origin={[0, caneHeight + 0.02, 0]}
          vector={[0, fCaneN * 0.00030 * 2.2, 0]}
          color={CANE_TEAL}
          label={`Fc = ${fCaneN.toFixed(0)} N`}
          sub={caneHand === 'contra' ? `${caneForceKg} kgf · apoyo` : `${caneForceKg} kgf · ipsilateral ⚠`}
        />
      )}
    </group>
  );
}

// ── 3. Dial Manométrico Analógico de Alivio Articular (%) ──
function ReliefGauge({
  rJointN,
  rBaseN,
  reliefPct,
  caneHand,
  fCaneN,
}: {
  rJointN: number;
  rBaseN: number;
  reliefPct: number;
  caneHand: 'contra' | 'ipsi' | 'none';
  fCaneN: number;
}) {
  const normVal = Math.min(1, Math.max(0, reliefPct / 100));
  // needle angle de -135° a +135°
  const needleAngle = -135 + normVal * 270;

  const isOptimal = caneHand === 'contra' && reliefPct > 10;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${isOptimal ? '#0d6e64' : (caneHand === 'ipsi' ? '#d97706' : '#cbd5e1')}`,
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 6px 20px rgba(35, 44, 54, 0.14)',
        minWidth: '165px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.60rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {caneHand === 'contra' ? '✓ Descarga Contralateral' : (caneHand === 'ipsi' ? '⚠️ Mano Ipsilateral' : 'Sin Bastón')}
      </div>

      {/* Dial SVG de Alivio Articular */}
      <svg width="120" height="74" viewBox="0 0 120 74" style={{ margin: '4px auto 0', display: 'block' }}>
        {/* Arco de fondo */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Sector Verde de Alivio (0 a 60%) */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke="#2e8b57"
          strokeWidth="8"
          strokeDasharray="4 2"
          opacity={0.3}
        />

        {/* Arco dinámico de alivio */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke={isOptimal ? '#2e8b57' : (caneHand === 'ipsi' ? '#d97706' : '#94a3b8')}
          strokeWidth="8"
          strokeDasharray="141.37"
          strokeDashoffset={141.37 * (1 - normVal)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />

        {/* Aguja indicadora analógica */}
        <g transform={`rotate(${needleAngle} 60 65)`} style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="60" y1="65" x2="60" y2="25" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="65" r="4.5" fill="#1e293b" />
          <circle cx="60" cy="65" r="2" fill="#ffffff" />
        </g>

        {/* Etiquetas de escala */}
        <text x="12" y="72" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">0%</text>
        <text x="54" y="16" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">−30%</text>
        <text x="94" y="72" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">−60%</text>
      </svg>

      {/* Lectura grande de alivio */}
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isOptimal ? '#2e8b57' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace', margin: '2px 0 0' }}>
        {rJointN.toFixed(0)} N
      </div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isOptimal ? '#2e8b57' : '#b02318' }}>
        {caneHand === 'contra' ? `−${reliefPct.toFixed(0)}% ALIVIO ARTICULAR` : '0% Alivio (Sin descarga)'}
      </div>

      {/* Barra de progreso comparativa */}
      <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '6px', width: '100%', margin: '6px 0 4px', overflow: 'hidden' }}>
        <div
          style={{
            background: isOptimal ? '#2e8b57' : (caneHand === 'ipsi' ? '#d97706' : '#b02318'),
            height: '100%',
            width: `${Math.min(100, (rJointN / rBaseN) * 100)}%`,
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      <div style={{ fontSize: '0.54rem', color: '#64748b' }}>
        Sin bastón: <b>{rBaseN.toFixed(0)} N</b> · Con bastón: <b>{rJointN.toFixed(0)} N</b>
      </div>
      <div style={{ fontSize: '0.54rem', color: '#0d8577', marginTop: '2px' }}>
        Torque de descarga: <b>{caneHand === 'contra' ? `+${(fCaneN * 0.30).toFixed(1)} N·m` : '0,0 N·m'}</b>
      </div>
    </div>
  );
}

/** Biomecánica del apoyo monopodal con bastón (determinista). */
function caneStats(caneHand: CaneCanvasProps['caneHand'], caneForceKg: number, bodyMassKg: number) {
  const g = 9.81;
  const wbN = (5 / 6) * bodyMassKg * g;
  const bwM = 0.18;
  const bmM = 0.07;
  const sin70 = Math.sin((70 * Math.PI) / 180);
  const cos70 = Math.cos((70 * Math.PI) / 180);
  const fCaneN = caneHand === 'none' ? 0 : caneForceKg * g;
  const dCaneM = caneHand === 'contra' ? 0.30 : (caneHand === 'ipsi' ? -0.05 : 0);
  const fAbductorN = Math.max(0, (wbN * bwM - fCaneN * dCaneM) / (bmM * sin70));
  const rJointN = Math.hypot(fAbductorN * cos70, fAbductorN * sin70 + wbN);
  const fAbductorBaseN = (wbN * bwM) / (bmM * sin70);
  const rBaseN = Math.hypot(fAbductorBaseN * cos70, fAbductorBaseN * sin70 + wbN);
  const reliefPct = Math.max(0, ((rBaseN - rJointN) / rBaseN) * 100);
  return { g, wbN, sin70, cos70, fCaneN, dCaneM, fAbductorN, fAbductorKgf: fAbductorN / g, rxN: fAbductorN * cos70, ryN: fAbductorN * sin70 + wbN, rJointN, rJointKgf: rJointN / g, rBaseN, reliefPct, wbKgf: wbN / g };
}

// ── 4. Escena Anatómica 3D con Descarga Articular ──
function CaneScene3D({
  caneHand,
  caneForceKg,
  bodyMassKg,
}: CaneCanvasProps) {
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_hip_leg.glb') as any;

  // Materiales anatómicos
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_IVORY),
        roughness: 0.60,
        metalness: 0.05,
      }),
    []
  );

  const pelvisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f2ebe0'),
        roughness: 0.58,
        metalness: 0.05,
      }),
    []
  );

  const cartilageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(CARTILAGE_ICE),
        roughness: 0.22,
        metalness: 0.12,
        transparent: true,
        opacity: 0.88,
      }),
    []
  );

  const muscleActiveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(MUSCLE_CARMINE),
        roughness: 0.48,
        metalness: 0.08,
        emissive: new THREE.Color('#500e08'),
        emissiveIntensity: 0.45,
      }),
    []
  );

  const muscleRelaxedMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(MUSCLE_RELAXED),
        roughness: 0.62,
        metalness: 0.05,
        emissive: new THREE.Color('#380905'),
        emissiveIntensity: 0.2,
      }),
    []
  );

  // ── Cálculos Biomecánicos con Bastón ──
  const g = 9.81;
  const totalWeightN = bodyMassKg * g;
  const wbN = (5 / 6) * totalWeightN; // Peso suprayacente + pierna libre
  const bwM = 0.18; // Brazo del peso (18 cm)
  const bmM = 0.07; // Brazo de abductores (7 cm)
  const sin70 = Math.sin((70 * Math.PI) / 180);
  const cos70 = Math.cos((70 * Math.PI) / 180);

  const fCaneN = caneHand === 'none' ? 0 : caneForceKg * g;
  // Distancia del bastón:
  // Contralateral: dc = +30 cm (torque asistencial a favor de abductores)
  // Ipsilateral: dc = -5 cm (desfavorable)
  const dCaneM = caneHand === 'contra' ? 0.30 : (caneHand === 'ipsi' ? -0.05 : 0);

  // Momento de equilibrio: Fa * bm * sin(70°) + Fc * dc = Wb * bw
  const fAbductorN = Math.max(0, (wbN * bwM - fCaneN * dCaneM) / (bmM * sin70));

  // Reacción articular en la cabeza femoral R
  const rxN = fAbductorN * cos70;
  const ryN = fAbductorN * sin70 + wbN;
  const rJointN = Math.hypot(rxN, ryN);

  const vectorScale = 0.00030;

  // Vectores 3D
  const faVec3D: [number, number, number] = [
    fAbductorN * cos70 * vectorScale,
    fAbductorN * sin70 * vectorScale,
    0,
  ];

  const wbOrigin3D: [number, number, number] = [0.18 * 3.5, 0.22, 0];
  const wbVec3D: [number, number, number] = [0, -wbN * vectorScale, 0];

  const rVec3D: [number, number, number] = [
    -rxN * vectorScale,
    -ryN * vectorScale,
    0,
  ];

  // Letreros del riel lateral (mismos valores que llenaban el DclReadout de esquina).
  const lWb = `Wb = ${wbN.toFixed(0)} N`;
  const lFa = `Fa = ${fAbductorN.toFixed(0)} N`;
  const lR = `R = ${rJointN.toFixed(0)} N`;

  const MODEL_SCALE = 6.2;

  // Posición 3D del bastón calibrada anatómicamente
  const canePos: [number, number, number] = [
    caneHand === 'contra' ? 1.25 : (caneHand === 'ipsi' ? -0.60 : 0),
    -2.45,
    0.08,
  ];

  return (
    <group position={[0, -0.4, 0]}>
      {/* ── 1. FÉMUR DERECHO DE APOYO VERTICAL ── */}
      <group scale={MODEL_SCALE} position={[0, 0, 0]}>
        <group position={[-P_HIP_R.x, -P_HIP_R.y, -P_HIP_R.z]}>
          {boneNodes?.femur_R && <mesh geometry={boneNodes.femur_R.geometry} material={boneMat} />}
          {boneNodes?.patella_R && <mesh geometry={boneNodes.patella_R.geometry} material={boneMat} />}
          {boneNodes?.tibia_R && <mesh geometry={boneNodes.tibia_R.geometry} material={boneMat} />}
          {boneNodes?.fibula_R && <mesh geometry={boneNodes.fibula_R.geometry} material={boneMat} />}
        </group>

        {/* Cartílago articular */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.0195, 24, 24]} />
          <primitive object={cartilageMat} attach="material" />
        </mesh>
      </group>

      {/* ── 2. PELVIS ESTABLE Y MÚSCULO GLÚTEO MEDIO ── */}
      <group position={[0, 0, 0]}>
        <group scale={MODEL_SCALE}>
          <group position={[-P_HIP_R.x, -P_HIP_R.y, -P_HIP_R.z]}>
            {boneNodes?.hip_R && <mesh geometry={boneNodes.hip_R.geometry} material={pelvisMat} />}
            {boneNodes?.hip_L && <mesh geometry={boneNodes.hip_L.geometry} material={pelvisMat} />}
            {boneNodes?.sacrum && <mesh geometry={boneNodes.sacrum.geometry} material={pelvisMat} />}
            {boneNodes?.lumbar5 && <mesh geometry={boneNodes.lumbar5.geometry} material={pelvisMat} />}

            {/* Pierna suspendida */}
            {boneNodes?.femur_L && (
              <mesh
                geometry={boneNodes.femur_L.geometry}
                material={boneMat}
                position={[0, 0.015, -0.01]}
                rotation={[0.12, 0, -0.05]}
              />
            )}

            {/* Músculo Glúteo Medio (se relaja visiblemente con bastón contralateral) */}
            {muscleNodes?.gluteus_medius_R && (
              <mesh
                geometry={muscleNodes.gluteus_medius_R.geometry}
                material={caneHand === 'contra' && caneForceKg > 5 ? muscleRelaxedMat : muscleActiveMat}
              />
            )}
            {muscleNodes?.gluteus_minimus_R && (
              <mesh
                geometry={muscleNodes.gluteus_minimus_R.geometry}
                material={caneHand === 'contra' && caneForceKg > 5 ? muscleRelaxedMat : muscleActiveMat}
              />
            )}
          </group>
        </group>

        {/* Marcador CG y Vector Peso Wb */}
        <mesh position={wbOrigin3D}>
          <sphereGeometry args={[0.028, 20, 20]} />
          <meshStandardMaterial color={AMBER_ACCENT} emissive={AMBER_ACCENT} emissiveIntensity={0.5} />
        </mesh>

        <ForceVector3D origin={wbOrigin3D} vector={wbVec3D} color={AMBER_ACCENT} label={lWb} sub="5/6 W · peso suprayacente" />
      </group>

      {/* ── 3. BASTÓN 3D TERAPÉUTICO ERGONÓMICO ── */}
      {caneHand !== 'none' && (
        <CaneModel3D
          position={canePos}
          caneHand={caneHand}
          fCaneN={fCaneN}
          caneForceKg={caneForceKg}
        />
      )}

      {/* ── 4. VECTORES DE FUERZA Y REACCIÓN ── */}
      {/* Vector Fa */}
      {fAbductorN > 15 && (
        <ForceVector3D
          origin={[-0.30, 0.06, 0]}
          vector={faVec3D}
          color={RED_ACCENT}
          label={lFa}
          sub={caneHand === 'contra' && caneForceKg > 5 ? 'glúteo medio · aliviado' : 'glúteo medio'}
        />
      )}

      {/* Vector R (Cabeza Femoral) */}
      <ForceVector3D
        origin={[0, 0, 0]}
        vector={rVec3D}
        color={TEAL_ACCENT}
        label={lR}
        sub={caneHand === 'contra' ? 'cabeza femoral · descarga' : 'cabeza femoral'}
        emphasis="strong"
      />

      {/* Línea de proyección de momento del bastón */}
      {caneHand === 'contra' && fCaneN > 5 && (
        <Line
          points={[
            [0, -0.4, 0],
            [1.25, -0.4, 0],
          ]}
          color={CANE_TEAL}
          lineWidth={1.5}
          dashed
          dashScale={14}
          dashSize={0.05}
          gapSize={0.03}
        />
      )}

      {/* Sombra de contacto principal */}
      <ContactShadows position={[0, -2.45, 0]} opacity={0.62} scale={3.8} blur={1.7} far={4} color="#241d12" />
    </group>
  );
}

// ── 5. Componente Principal CaneCanvas con Escena 3D ──
export default function CaneCanvas({
  showLabels = false,
  caneHand = 'contra',
  caneForceKg = 10,
  bodyMassKg = 70,
}: CaneCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const stats = caneStats(caneHand, caneForceKg, bodyMassKg);
  const callouts = useCalloutStore();

  const railNote =
    caneHand === 'contra'
      ? 'Bastón contralateral: su torque ayuda a los abductores y baja la reacción R de la cadera.'
      : caneHand === 'ipsi'
        ? 'Mano ipsilateral: el bastón casi no tiene brazo de palanca y no descarga la cadera.'
        : 'Sin bastón: los abductores cargan todo el momento del peso.';

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="cap2-webgl-canvas" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Botón flotante para reset de cámara */}
      <button
        type="button"
        onClick={handleResetCamera}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid var(--line, #cbd5e1)',
          borderRadius: '6px',
          padding: '4px 9px',
          fontSize: '0.62rem',
          fontWeight: 600,
          color: 'var(--ink, #232c36)',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(4px)',
        }}
      >
        📷 Restablecer Cámara
      </button>

      {/* Canvas 3D de React Three Fiber */}
      <Canvas
        camera={{ position: [0, 0.05, 3.7], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: STUDIO_BG_DEEP }}
      >
        <StudioLights keyIntensity={1.55} />

        <Suspense fallback={null}>
          <CaneScene3D
            caneHand={caneHand}
            caneForceKg={caneForceKg}
            bodyMassKg={bodyMassKg}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.8}
          maxDistance={6.5}
          maxPolarAngle={Math.PI / 2 + 0.15}
          dampingFactor={0.08}
        />

        {/* Proyecta cada <Callout> de la escena a píxeles para el riel lateral. */}
        <CalloutSource />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      <CalloutRail store={callouts} side="left" note={railNote} />

      {/* Comparador de alivio articular anclado a la esquina (fuera del 3D) */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          zIndex: 9,
          transform: 'scale(0.72)',
          transformOrigin: 'bottom right',
          pointerEvents: 'none',
        }}
      >
        <ReliefGauge
          rJointN={stats.rJointN}
          rBaseN={stats.rBaseN}
          reliefPct={stats.reliefPct}
          caneHand={caneHand}
          fCaneN={stats.fCaneN}
        />
      </div>
    </div>
    </CalloutProvider>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_hip_leg.glb');
