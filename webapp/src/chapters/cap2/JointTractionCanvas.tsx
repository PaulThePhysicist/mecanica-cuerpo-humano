import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';

interface JointTractionCanvasProps {
  tractionKg: number;    // Masa de tracción en kg (1 a 15 kg)
  angleDeg: number;      // Ángulo del cable respecto al eje axial (10 a 60 grados, default 25°)
  tractionType?: 'cervical' | 'lumbar';
}

// ── Paleta Anatómica y Materiales de Grado Médico ──
const BONE_IVORY = '#ede5d0';
const BONE_DEEP = '#ded3be';
const BONE_ACCENT = '#7c6a4e';
const CARTILAGE_ICE = '#68c5b8';
const TEAL_ACCENT = '#0d8577';
const EMERALD_DECOMP = '#059669';
const AMBER_ACCENT = '#d97706';
const RED_OVERLOAD = '#b02318';
const STEEL_CABLE = '#374151';
const BRASS_RING = '#fbbf24';

// ── 1. Vector de Fuerza 3D con Vástago, Cono y Badge HTML Flotante ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = TEAL_ACCENT,
  label = 'F',
  sublabel = '',
  isDashed = false,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  label: string;
  sublabel?: string;
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

  if (len < 0.01) return null;

  const headLen = Math.min(0.09, Math.max(0.035, len * 0.20));
  const headRadius = headLen * 0.36;
  const shaftLen = Math.max(0.01, len - headLen);
  const shaftRadius = 0.008;

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
          roughness={0.25}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.35}
          transparent={isDashed}
          opacity={isDashed ? 0.75 : 1.0}
        />
      </mesh>

      {/* Cabeza cónica */}
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat}>
        <coneGeometry args={[headRadius, headLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* Badge Flotante 3D */}
      <Html
        position={[tipPos.x + dir.x * 0.05, tipPos.y + dir.y * 0.05, tipPos.z + dir.z * 0.05]}
        center
        zIndexRange={[100, 0]}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(6px)',
            border: `1.5px solid ${color}`,
            borderRadius: '6px',
            padding: '3px 7px',
            boxShadow: `0 2px 10px ${color}33`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
          }}
        >
          <span style={{ color: color, fontSize: '0.62rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {label}
          </span>
          {sublabel && (
            <span style={{ color: '#55606d', fontSize: '0.52rem', fontFamily: 'system-ui, sans-serif' }}>
              {sublabel}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── 2. Dial Manométrico Analógico de Dosimetría de Tracción ──
function TractionDosimetryGauge({
  tN,
  fAxialN,
  fTransN,
  deltaH_mm,
  tractionKg,
  isTherapeutic,
}: {
  tN: number;
  fAxialN: number;
  fTransN: number;
  deltaH_mm: number;
  tractionKg: number;
  isTherapeutic: boolean;
}) {
  const normVal = Math.min(1, Math.max(0, tractionKg / 15));
  const needleAngle = -135 + normVal * 270;
  const isOverload = tractionKg > 8;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${isOverload ? RED_OVERLOAD : (isTherapeutic ? EMERALD_DECOMP : '#cbd5e1')}`,
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 6px 20px rgba(35, 44, 54, 0.12)',
        width: '168px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Dosimetría de Tracción
      </div>

      {/* SVG Dial */}
      <svg width="116" height="70" viewBox="0 0 120 74" style={{ margin: '2px auto 0', display: 'block' }}>
        <path d="M 15 65 A 45 45 0 0 1 105 65" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        {/* Sector Sub-terapéutico (0 - 4 kg) */}
        <path d="M 15 65 A 45 45 0 0 1 45 28" fill="none" stroke="#94a3b8" strokeWidth="8" strokeDasharray="4 2" opacity={0.4} />
        {/* Sector Terapéutico Óptimo (5 - 8 kg) */}
        <path d="M 45 28 A 45 45 0 0 1 80 28" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="4 2" opacity={0.45} />
        {/* Sector Sobrecarga (> 8 kg) */}
        <path d="M 80 28 A 45 45 0 0 1 105 65" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="4 2" opacity={0.45} />

        {/* Arco dinámico */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke={isOverload ? RED_OVERLOAD : (isTherapeutic ? EMERALD_DECOMP : '#94a3b8')}
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
        <text x="12" y="72" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="54" y="16" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">6kg</text>
        <text x="94" y="72" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">15kg</text>
      </svg>

      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isTherapeutic ? EMERALD_DECOMP : (isOverload ? RED_OVERLOAD : TEAL_ACCENT), fontFamily: 'JetBrains Mono, monospace', margin: '0' }}>
        {fAxialN.toFixed(0)} N
      </div>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isTherapeutic ? EMERALD_DECOMP : (isOverload ? RED_OVERLOAD : '#64748b') }}>
        {isTherapeutic ? '✓ Rango Terapéutico Óptimo' : (isOverload ? '⚠️ Sobrecarga Ligamentosa' : 'Fuerza Sub-terapéutica')}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: '#475569', marginTop: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '3px' }}>
        <span>Δh Foraminal:</span>
        <b style={{ color: EMERALD_DECOMP, fontFamily: 'JetBrains Mono, monospace' }}>+{deltaH_mm.toFixed(2)} mm</b>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: '#475569', marginTop: '1px' }}>
        <span>Momento Flexor:</span>
        <b style={{ color: AMBER_ACCENT, fontFamily: 'JetBrains Mono, monospace' }}>{fTransN.toFixed(0)} N</b>
      </div>
    </div>
  );
}

// ── 3. Raquis Cervical C1-C7 con Apertura Discal Real-Time y Raíces Nerviosas Iluminadas ──
/** Cifras de la tracción cervical (deterministas: sólo dependen de kg y ángulo). */
function tractionStats(tractionKg: number, angleDeg: number) {
  const g = 9.81;
  const tN = tractionKg * g;
  const angleRad = (angleDeg * Math.PI) / 180;
  const fAxialN = tN * Math.cos(angleRad);
  const fTransN = tN * Math.sin(angleRad);
  const deltaH_mm = Math.min(2.5, 0.35 + (fAxialN / 150) * 1.85);
  const isTherapeutic = tractionKg >= 5 && tractionKg <= 8;
  return { tN, angleRad, fAxialN, fTransN, deltaH_mm, isTherapeutic };
}

function CervicalSpineRig3D({
  tractionKg,
  angleDeg,
}: {
  tractionKg: number;
  angleDeg: number;
}) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;

  const { tN, angleRad, fAxialN, fTransN, deltaH_mm, isTherapeutic } = tractionStats(tractionKg, angleDeg);

  // LERP suave y vibración de cable
  const cableVibeRef = useRef<number>(0);
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    cableVibeRef.current = Math.sin(t * 18) * 0.002 * (tractionKg / 8);
  });

  // Materiales Anatómicos
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_IVORY),
        roughness: 0.55,
        metalness: 0.05,
      }),
    []
  );

  const skullMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f2ebe0'),
        roughness: 0.58,
        metalness: 0.05,
      }),
    []
  );

  const baseVertMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_DEEP),
        roughness: 0.65,
        metalness: 0.05,
      }),
    []
  );

  const discMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        emissive: new THREE.Color('#059669'),
        emissiveIntensity: 0.40,
        roughness: 0.28,
        metalness: 0.1,
        transparent: true,
        opacity: 0.90,
      }),
    []
  );

  const nerveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(isTherapeutic ? '#10b981' : '#f59e0b'),
        emissive: new THREE.Color(isTherapeutic ? '#059669' : '#d97706'),
        emissiveIntensity: isTherapeutic ? 0.75 : 0.45,
        roughness: 0.3,
      }),
    [isTherapeutic]
  );

  const harnessMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0d8577'),
        roughness: 0.45,
        metalness: 0.15,
      }),
    []
  );

  const steelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#475569'),
        roughness: 0.25,
        metalness: 0.85,
      }),
    []
  );

  const ironMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1e293b'),
        roughness: 0.70,
        metalness: 0.35,
      }),
    []
  );

  const brassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BRASS_RING),
        roughness: 0.25,
        metalness: 0.8,
      }),
    []
  );

  // Escala anatómica del modelo y anclaje
  const S = 12.0;
  // Offset base C7 en GLB
  const c7Origin = new THREE.Vector3(0.0044, 0.3507, -0.0247);

  // Apertura discal acumulativa (en metros en el espacio del rig)
  const dH_rig = (deltaH_mm * 0.001) * 2.8; // Escala visual proporcional
  const flexAnglePerLevel = (angleRad * 0.18) / 7; // Ligera flexión anterior que aplana lordosis y abre forámenes

  // Coordenadas calculadas para el arnés y polea
  // Punto de enganche de tracción superior (anillo sobre la cabeza)
  const headTopY = 0.64 + dH_rig * 7;
  const headTopZ = 0.06 - angleRad * 0.08;
  const attachPoint: [number, number, number] = [0, headTopY, headTopZ];

  // Distancia a la polea y ángulo beta
  const pulleyDist = 0.85;
  const pulleyX = 0;
  const pulleyY = attachPoint[1] + pulleyDist * Math.cos(angleRad);
  const pulleyZ = attachPoint[2] + pulleyDist * Math.sin(angleRad);
  const pulleyR = 0.065;

  // Pesa suspendida verticalmente desde el borde anterior de la polea
  const weightDropZ = pulleyZ + pulleyR;
  const weightDropY = pulleyY - 0.42;

  return (
    <group position={[0, -0.28, 0]}>
      {/* ── A. BASE FIJA: T1 - T2 y Primera Costilla Ancladas ── */}
      <group position={[0, 0, 0]}>
        <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
          {nodes?.thoracic1 && <mesh geometry={nodes.thoracic1.geometry} material={baseVertMat} />}
          {nodes?.thoracic2 && <mesh geometry={nodes.thoracic2.geometry} material={baseVertMat} />}
          {nodes?.rib_1 && <mesh geometry={nodes.rib_1.geometry} material={baseVertMat} />}
          {nodes?.rib_2 && <mesh geometry={nodes.rib_2.geometry} material={baseVertMat} />}
        </group>
      </group>

      {/* ── B. COLUMNA CERVICAL ARTICULADA C7 a C1 CON APERTURA DISCAL ── */}
      {/* Nivel C7 */}
      <group position={[0, dH_rig * 1, 0]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
        <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
          {nodes?.cervical7 && <mesh geometry={nodes.cervical7.geometry} material={boneMat} />}
        </group>

        {/* Disco C7-T1 & Raíz Nerviosa C8 */}
        <mesh position={[0, -0.015, -0.01]} scale={[1, 1 + deltaH_mm * 0.5, 1]}>
          <cylinderGeometry args={[0.075, 0.082, 0.020, 20]} />
          <primitive object={discMat} attach="material" />
        </mesh>
        {/* Raíces nerviosas bilaterales C8 con DRG */}
        <group position={[0, -0.015, -0.01]}>
          <mesh position={[-0.095, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.007 + deltaH_mm * 0.002, 0.045, 8, 16]} />
            <primitive object={nerveMat} attach="material" />
          </mesh>
          <mesh position={[0.095, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.007 + deltaH_mm * 0.002, 0.045, 8, 16]} />
            <primitive object={nerveMat} attach="material" />
          </mesh>
          <mesh position={[-0.12, 0, 0.01]}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <primitive object={nerveMat} attach="material" />
          </mesh>
          <mesh position={[0.12, 0, 0.01]}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <primitive object={nerveMat} attach="material" />
          </mesh>
        </group>

        {/* Nivel C6 */}
        <group position={[0, 0.052 + dH_rig * 1, 0.003]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
          <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
            {nodes?.cervical6 && <mesh geometry={nodes.cervical6.geometry} material={boneMat} />}
          </group>

          {/* Disco C6-C7 & Raíz Nerviosa C7 */}
          <mesh position={[0, -0.014, -0.008]} scale={[1, 1 + deltaH_mm * 0.5, 1]}>
            <cylinderGeometry args={[0.072, 0.078, 0.020, 20]} />
            <primitive object={discMat} attach="material" />
          </mesh>
          <group position={[0, -0.014, -0.008]}>
            <mesh position={[-0.092, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.007 + deltaH_mm * 0.002, 0.042, 8, 16]} />
              <primitive object={nerveMat} attach="material" />
            </mesh>
            <mesh position={[0.092, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.007 + deltaH_mm * 0.002, 0.042, 8, 16]} />
              <primitive object={nerveMat} attach="material" />
            </mesh>
            <mesh position={[-0.115, 0, 0.01]}>
              <sphereGeometry args={[0.012, 12, 12]} />
              <primitive object={nerveMat} attach="material" />
            </mesh>
            <mesh position={[0.115, 0, 0.01]}>
              <sphereGeometry args={[0.012, 12, 12]} />
              <primitive object={nerveMat} attach="material" />
            </mesh>
          </group>

          {/* Nivel C5 */}
          <group position={[0, 0.052 + dH_rig * 1, 0.004]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
            <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
              {nodes?.cervical5 && <mesh geometry={nodes.cervical5.geometry} material={boneMat} />}
            </group>

            {/* Disco C5-C6 (Sitio clásico de radiculopatía) */}
            <mesh position={[0, -0.013, -0.006]} scale={[1, 1 + deltaH_mm * 0.6, 1]}>
              <cylinderGeometry args={[0.070, 0.075, 0.021, 20]} />
              <primitive object={discMat} attach="material" />
            </mesh>
            <group position={[0, -0.013, -0.006]}>
              <mesh position={[-0.090, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.0075 + deltaH_mm * 0.002, 0.042, 8, 16]} />
                <primitive object={nerveMat} attach="material" />
              </mesh>
              <mesh position={[0.090, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.0075 + deltaH_mm * 0.002, 0.042, 8, 16]} />
                <primitive object={nerveMat} attach="material" />
              </mesh>
              <mesh position={[-0.112, 0, 0.01]}>
                <sphereGeometry args={[0.013, 12, 12]} />
                <primitive object={nerveMat} attach="material" />
              </mesh>
              <mesh position={[0.112, 0, 0.01]}>
                <sphereGeometry args={[0.013, 12, 12]} />
                <primitive object={nerveMat} attach="material" />
              </mesh>
            </group>

            {/* Nivel C4 */}
            <group position={[0, 0.050 + dH_rig * 1, 0.004]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
              <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
                {nodes?.cervical4 && <mesh geometry={nodes.cervical4.geometry} material={boneMat} />}
              </group>

              {/* Disco C4-C5 */}
              <mesh position={[0, -0.012, -0.005]} scale={[1, 1 + deltaH_mm * 0.5, 1]}>
                <cylinderGeometry args={[0.068, 0.072, 0.020, 20]} />
                <primitive object={discMat} attach="material" />
              </mesh>
              <group position={[0, -0.012, -0.005]}>
                <mesh position={[-0.088, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.007 + deltaH_mm * 0.002, 0.040, 8, 16]} />
                  <primitive object={nerveMat} attach="material" />
                </mesh>
                <mesh position={[0.088, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.007 + deltaH_mm * 0.002, 0.040, 8, 16]} />
                  <primitive object={nerveMat} attach="material" />
                </mesh>
                <mesh position={[-0.11, 0, 0.01]}>
                  <sphereGeometry args={[0.012, 12, 12]} />
                  <primitive object={nerveMat} attach="material" />
                </mesh>
                <mesh position={[0.11, 0, 0.01]}>
                  <sphereGeometry args={[0.012, 12, 12]} />
                  <primitive object={nerveMat} attach="material" />
                </mesh>
              </group>

              {/* Nivel C3 */}
              <group position={[0, 0.048 + dH_rig * 1, 0.003]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
                <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
                  {nodes?.cervical3 && <mesh geometry={nodes.cervical3.geometry} material={boneMat} />}
                </group>

                {/* Disco C3-C4 */}
                <mesh position={[0, -0.012, -0.004]} scale={[1, 1 + deltaH_mm * 0.5, 1]}>
                  <cylinderGeometry args={[0.065, 0.070, 0.019, 20]} />
                  <primitive object={discMat} attach="material" />
                </mesh>

                {/* Nivel C2 (Axis con proceso Odontoides / Dens) */}
                <group position={[0, 0.048 + dH_rig * 1, 0.002]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
                  {/* Cuerpo vertebral de C2 Axis */}
                  <mesh position={[0, 0.005, 0.008]}>
                    <boxGeometry args={[0.14, 0.038, 0.10]} />
                    <primitive object={boneMat} attach="material" />
                  </mesh>
                  {/* Apófisis Odontoides (Dens) proyectándose hacia C1 Atlas */}
                  <mesh position={[0, 0.045, 0.024]}>
                    <cylinderGeometry args={[0.018, 0.022, 0.048, 16]} />
                    <primitive object={boneMat} attach="material" />
                  </mesh>
                  {/* Apófisis espinosa bífida posterior */}
                  <mesh position={[0, 0.004, -0.065]} rotation={[-0.35, 0, 0]}>
                    <boxGeometry args={[0.055, 0.032, 0.075]} />
                    <primitive object={boneMat} attach="material" />
                  </mesh>

                  {/* Nivel C1 (Atlas - Anillo óseo articulado con Cóndilos Occipitales) */}
                  <group position={[0, 0.044 + dH_rig * 1, 0.001]} rotation={[flexAnglePerLevel * 1, 0, 0]}>
                    {/* Anillo de Atlas */}
                    <mesh position={[0, 0.006, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[0.058, 0.018, 12, 24]} />
                      <primitive object={boneMat} attach="material" />
                    </mesh>
                    {/* Masas laterales */}
                    <mesh position={[-0.055, 0.008, 0.014]}>
                      <boxGeometry args={[0.042, 0.028, 0.048]} />
                      <primitive object={boneMat} attach="material" />
                    </mesh>
                    <mesh position={[0.055, 0.008, 0.014]}>
                      <boxGeometry args={[0.042, 0.028, 0.048]} />
                      <primitive object={boneMat} attach="material" />
                    </mesh>

                    {/* ── C. CRÁNEO Y MANDÍBULA COMPLETA ── */}
                    <group position={[0, 0.052 + dH_rig * 1, -0.005]}>
                      <group scale={S} position={[-c7Origin.x * S, -c7Origin.y * S, -c7Origin.z * S]}>
                        {nodes?.occipital && <mesh geometry={nodes.occipital.geometry} material={skullMat} />}
                        {nodes?.frontal && <mesh geometry={nodes.frontal.geometry} material={skullMat} />}
                        {nodes?.parietal_L && <mesh geometry={nodes.parietal_L.geometry} material={skullMat} />}
                        {nodes?.parietal_R && <mesh geometry={nodes.parietal_R.geometry} material={skullMat} />}
                        {nodes?.temporal_L && <mesh geometry={nodes.temporal_L.geometry} material={skullMat} />}
                        {nodes?.temporal_R && <mesh geometry={nodes.temporal_R.geometry} material={skullMat} />}
                        {nodes?.sphenoid && <mesh geometry={nodes.sphenoid.geometry} material={skullMat} />}
                        {nodes?.ethmoid && <mesh geometry={nodes.ethmoid.geometry} material={skullMat} />}
                        {nodes?.zygomatic_L && <mesh geometry={nodes.zygomatic_L.geometry} material={skullMat} />}
                        {nodes?.zygomatic_R && <mesh geometry={nodes.zygomatic_R.geometry} material={skullMat} />}
                        {nodes?.maxilla_L && <mesh geometry={nodes.maxilla_L.geometry} material={skullMat} />}
                        {nodes?.maxilla_R && <mesh geometry={nodes.maxilla_R.geometry} material={skullMat} />}
                        {nodes?.nasal_L && <mesh geometry={nodes.nasal_L.geometry} material={skullMat} />}
                        {nodes?.nasal_R && <mesh geometry={nodes.nasal_R.geometry} material={skullMat} />}
                        {nodes?.mandible && <mesh geometry={nodes.mandible.geometry} material={skullMat} />}
                      </group>

                      {/* ── D. ARNÉS SAYRE / HALTER CERVICAL 3D ── */}
                      {/* Mentonera anatómica acolchada (Submental cup) */}
                      <mesh position={[0, 0.045, 0.17]} rotation={[0.42, 0, 0]}>
                        <boxGeometry args={[0.18, 0.048, 0.09]} />
                        <primitive object={harnessMat} attach="material" />
                      </mesh>

                      {/* Soporte suboccipital acolchado */}
                      <mesh position={[0, 0.085, -0.155]} rotation={[-0.38, 0, 0]}>
                        <boxGeometry args={[0.22, 0.052, 0.08]} />
                        <primitive object={harnessMat} attach="material" />
                      </mesh>

                      {/* Correas laterales de tracción que ascienden a la barra separadora */}
                      <mesh position={[-0.14, 0.22, 0.02]} rotation={[0, 0, -0.12]}>
                        <cylinderGeometry args={[0.012, 0.016, 0.32, 12]} />
                        <primitive object={harnessMat} attach="material" />
                      </mesh>
                      <mesh position={[0.14, 0.22, 0.02]} rotation={[0, 0, 0.12]}>
                        <cylinderGeometry args={[0.012, 0.016, 0.32, 12]} />
                        <primitive object={harnessMat} attach="material" />
                      </mesh>

                      {/* Barra separadora metálica (Spreader bar) sobre el cráneo */}
                      <mesh position={[0, 0.38, 0.02]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.012, 0.012, 0.34, 16]} />
                        <primitive object={steelMat} attach="material" />
                      </mesh>

                      {/* Anillo de enganche D-Ring y mosquetón de bronce */}
                      <mesh position={[0, 0.395, 0.02]}>
                        <torusGeometry args={[0.022, 0.006, 12, 20]} />
                        <primitive object={brassMat} attach="material" />
                      </mesh>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ── E. MECANISMO DE POLEA Y TORRE DE SOPORTE ── */}
      <group position={[pulleyX, pulleyY, pulleyZ]}>
        {/* Poste soporte vertical montado en suelo */}
        <mesh position={[0.08, -(pulleyY + 0.28) / 2, 0]}>
          <cylinderGeometry args={[0.028, 0.028, pulleyY + 0.28, 20]} />
          <primitive object={steelMat} attach="material" />
        </mesh>

        {/* Brazo voladizo hacia la rueda */}
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.020, 0.020, 0.09, 16]} />
          <primitive object={steelMat} attach="material" />
        </mesh>

        {/* Rueda de la polea acanalada (Grooved pulley wheel) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[pulleyR, pulleyR, 0.032, 32]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        {/* Ranura central */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[pulleyR - 0.008, pulleyR - 0.008, 0.016, 32]} />
          <primitive object={ironMat} attach="material" />
        </mesh>
        {/* Rodamiento central y eje */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.045, 16]} />
          <primitive object={brassMat} attach="material" />
        </mesh>
      </group>

      {/* ── F. CABLE DE ACERO TRENZADO CON MICRO-VIBRACIÓN ── */}
      {/* 1. Tramo Cable: Arnés -> Polea */}
      {(() => {
        const p1 = new THREE.Vector3(...attachPoint);
        const p2 = new THREE.Vector3(pulleyX, pulleyY, pulleyZ);
        const cableVec = p2.clone().sub(p1);
        const cLen = cableVec.length();
        const cDir = cableVec.clone().normalize();
        const cMid = p1.clone().add(cDir.clone().multiplyScalar(cLen * 0.5));
        const cQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), cDir);

        return (
          <mesh position={[cMid.x, cMid.y, cMid.z]} quaternion={cQuat}>
            <cylinderGeometry args={[0.004, 0.004, cLen, 12]} />
            <primitive object={steelMat} attach="material" />
          </mesh>
        );
      })()}

      {/* 2. Tramo Cable: Polea -> Pesa Suspendida */}
      <mesh position={[0, (pulleyY + weightDropY) / 2, weightDropZ]}>
        <cylinderGeometry args={[0.004, 0.004, pulleyY - weightDropY, 12]} />
        <primitive object={steelMat} attach="material" />
      </mesh>

      {/* ── G. PESA CALIBRADA SUSPENDIDA (CAST-IRON WEIGHT STACK) ── */}
      <group position={[0, weightDropY, weightDropZ]}>
        {/* Placa superior de suspensión */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.024, 24]} />
          <primitive object={ironMat} attach="material" />
        </mesh>

        {/* Pila de discos ranurados individuales según kg */}
        {Array.from({ length: Math.min(8, Math.max(1, Math.round(tractionKg / 2))) }).map((_, idx) => (
          <mesh key={idx} position={[0, -0.028 * (idx + 1), 0]}>
            <cylinderGeometry args={[0.070, 0.070, 0.022, 24]} />
            <primitive object={ironMat} attach="material" />
          </mesh>
        ))}

        {/* Pasador selector magnético de masa */}
        <mesh position={[0.065, -0.028 * Math.round(tractionKg / 2), 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.05, 12]} />
          <primitive object={brassMat} attach="material" />
        </mesh>

        {/* Etiqueta 3D en la pesa */}
        <Html position={[0, -0.028 * Math.round(tractionKg / 2) - 0.05, 0.08]} center>
          <div
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '4px',
              padding: '2px 6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.60rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {tractionKg} kg ({tN.toFixed(0)} N)
          </div>
        </Html>
      </group>

      {/* ── H. DESCOMPOSICIÓN ORTOGONAL DE FUERZAS 3D (VECTORES CALIBRADOS) ── */}
      {(() => {
        // Longitud visual calibrada del vector T
        const scaleVec = 0.0035;
        const tLen = Math.max(0.18, tN * scaleVec);

        // Vector Tensión Total T en dirección del cable
        const tVecX = 0;
        const tVecY = tLen * Math.cos(angleRad);
        const tVecZ = tLen * Math.sin(angleRad);

        // Componente Axial F_axial (vertical)
        const axVecY = tVecY;
        // Componente Transversal F_trans (horizontal anterior)
        const trVecZ = tVecZ;

        return (
          <group position={attachPoint}>
            {/* 1. Vector Resultante T (Tensión total en cable) */}
            <ForceVector3D
              origin={[0, 0, 0]}
              vector={[tVecX, tVecY, tVecZ]}
              color={TEAL_ACCENT}
              label={`T = ${tN.toFixed(0)} N`}
              sublabel={`Cable (β = ${angleDeg}°)`}
            />

            {/* 2. Vector F_axial (Descompresión raquídea longitudinal) */}
            <ForceVector3D
              origin={[0, 0, 0]}
              vector={[0, axVecY, 0]}
              color={EMERALD_DECOMP}
              label={`F_axial = ${fAxialN.toFixed(0)} N`}
              sublabel={`Δh = +${deltaH_mm.toFixed(2)} mm`}
            />

            {/* 3. Vector F_trans (Momento flexor anterior) */}
            <ForceVector3D
              origin={[0, axVecY, 0]}
              vector={[0, 0, trVecZ]}
              color={AMBER_ACCENT}
              label={`F_trans = ${fTransN.toFixed(0)} N`}
              sublabel="Flexión Cefálica"
            />

            {/* Líneas de proyección ortogonal punteadas */}
            <mesh position={[0, axVecY / 2, trVecZ]}>
              <cylinderGeometry args={[0.002, 0.002, axVecY, 8]} />
              <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, trVecZ / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.002, 0.002, trVecZ, 8]} />
              <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
            </mesh>

            {/* Símbolo de ángulo recto en la esquina ortogonal */}
            <mesh position={[0, axVecY - 0.02, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.025, 0.025]} />
              <meshBasicMaterial color="#64748b" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>

            {/* Arco indicador del ángulo beta */}
            <mesh position={[0, 0.12 * Math.cos(angleRad / 2), 0.12 * Math.sin(angleRad / 2)]}>
              <sphereGeometry args={[0.006, 12, 12]} />
              <meshBasicMaterial color="#2563eb" />
            </mesh>
          </group>
        );
      })()}

    </group>
  );
}

// ── 4. Escena Principal 3D con React Three Fiber ──
export default function JointTractionCanvas({
  tractionKg = 6,
  angleDeg = 25,
  tractionType = 'cervical',
}: JointTractionCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const stats = tractionStats(tractionKg, angleDeg);

  return (
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
        camera={{ position: [0.90, 0.48, 1.55], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <StudioLights keyIntensity={1.55} />

        <Suspense fallback={null}>
          <CervicalSpineRig3D tractionKg={tractionKg} angleDeg={angleDeg} />
        </Suspense>

        {/* Sombra de contacto suave en el suelo */}
        <ContactShadows
          position={[0, -0.68, 0]}
          opacity={0.55}
          scale={2.4}
          blur={2.0}
          far={1.5}
          color="#241d12"
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={0.5}
          maxDistance={3.5}
          target={[0, 0.22, 0.05]}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Dosímetro anclado a la esquina (fuera del 3D → nunca se recorta ni tapa la anatomía) */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          zIndex: 9,
          transform: 'scale(0.74)',
          transformOrigin: 'bottom right',
          pointerEvents: 'none',
        }}
      >
        <TractionDosimetryGauge
          tN={stats.tN}
          fAxialN={stats.fAxialN}
          fTransN={stats.fTransN}
          deltaH_mm={stats.deltaH_mm}
          tractionKg={tractionKg}
          isTherapeutic={stats.isTherapeutic}
        />
      </div>
    </div>
  );
}
