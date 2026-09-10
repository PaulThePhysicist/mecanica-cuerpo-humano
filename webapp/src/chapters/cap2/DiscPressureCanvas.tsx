import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';
import { DclTag } from './DclReadout';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

interface DiscPressureCanvasProps {
  posture: 'upright' | 'seated' | 'knees' | 'bent_back'; // 4 posturas ergonómicas
  loadKg: number;                                        // Carga levantada (0 a 30 kg)
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

interface PostureInfo {
  id: 'upright' | 'seated' | 'knees' | 'bent_back';
  name: string;
  emoji: string;
  basePressureMPa: number;
  compMultiplier: number;
  shearMultiplier: number;
  tiltAngle: number;
  nucleusOffset: number;
}

const POSTURES: Record<string, PostureInfo> = {
  upright: {
    id: 'upright',
    name: 'De pie erguido',
    emoji: '🚶',
    basePressureMPa: 0.50,
    compMultiplier: 1.0,
    shearMultiplier: 0.2,
    tiltAngle: 0.0,
    nucleusOffset: 0.0,
  },
  seated: {
    id: 'seated',
    name: 'Sentado sin respaldo',
    emoji: '🪑',
    basePressureMPa: 0.85,
    compMultiplier: 1.4,
    shearMultiplier: 0.5,
    tiltAngle: 0.09,
    nucleusOffset: -0.07,
  },
  knees: {
    id: 'knees',
    name: 'Levantar con rodillas flexionadas (Ergonómico)',
    emoji: '🏋️',
    basePressureMPa: 1.30,
    compMultiplier: 2.2,
    shearMultiplier: 0.4,
    tiltAngle: 0.04,
    nucleusOffset: -0.03,
  },
  bent_back: {
    id: 'bent_back',
    name: 'Levantar con espalda curva (Lesivo)',
    emoji: '⚠️',
    basePressureMPa: 2.40,
    compMultiplier: 4.8,
    shearMultiplier: 1.9,
    tiltAngle: 0.24,
    nucleusOffset: -0.21,
  },
};

// ── 1. Vector de Fuerza 3D Profesional con Eje, Cono y Badge HTML ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [0, -1, 0] as [number, number, number],
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

  const dir = useMemo(() => (len > 0.001 ? v.clone().normalize() : new THREE.Vector3(0, -1, 0)), [v, len]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  if (len < 0.03) return null;

  const headLen = Math.min(0.22, Math.max(0.08, len * 0.22));
  const headRadius = headLen * 0.32;
  const shaftLen = Math.max(0.02, len - headLen);
  const shaftRadius = 0.016;

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
          roughness={0.28}
          metalness={0.25}
          emissive={color}
          emissiveIntensity={0.4}
          transparent={isDashed}
          opacity={isDashed ? 0.75 : 1.0}
        />
      </mesh>

      {/* Cabeza cónica del vector */}
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat}>
        <coneGeometry args={[headRadius, headLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.22}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Letrero → riel lateral (símbolo = valor), con línea guía a la punta. */}
      <Callout
        position={[tipPos.x + dir.x * 0.12, tipPos.y + dir.y * 0.12, tipPos.z + dir.z * 0.12]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── 2. Manómetro Analógico de Presión Intradiscal (Dual MPa & BAR) ──
function PressureManometerGauge({
  totalPressureMPa,
  totalPressureBar,
  isCritical,
  loadKg,
}: {
  totalPressureMPa: number;
  totalPressureBar: number;
  isCritical: boolean;
  loadKg: number;
}) {
  const maxScale = 4.0;
  const normVal = Math.min(1, Math.max(0, totalPressureMPa / maxScale));
  const needleAngle = -135 + normVal * 270;

  const statusColor = isCritical ? '#b02318' : (totalPressureMPa > 1.2 ? '#d97706' : '#0d6e64');

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        border: `1.5px solid ${isCritical ? '#b02318' : '#cbd5e1'}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: isCritical ? '0 8px 24px rgba(176, 35, 24, 0.25)' : '0 8px 24px rgba(35, 44, 54, 0.12)',
        minWidth: '175px',
        textAlign: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        Presión Intradiscal L5-S1
      </div>

      {/* Dial SVG con sectores de seguridad y aguja amortiguada */}
      <svg width="130" height="78" viewBox="0 0 130 78" style={{ margin: '4px auto 0', display: 'block' }}>
        {/* Fondo del arco */}
        <path d="M 18 68 A 47 47 0 0 1 112 68" fill="none" stroke="#e2e8f0" strokeWidth="8.5" strokeLinecap="round" />

        {/* Sector Verde Fisiológico (< 1.2 MPa) */}
        <path d="M 18 68 A 47 47 0 0 1 52 26" fill="none" stroke="#0d6e64" strokeWidth="8.5" opacity={0.35} />
        {/* Sector Ámbar Carga Moderada (1.2 - 2.4 MPa) */}
        <path d="M 52 26 A 47 47 0 0 1 90 32" fill="none" stroke="#d97706" strokeWidth="8.5" opacity={0.35} />
        {/* Sector Rojo Riesgo Crítico (> 2.4 MPa) */}
        <path d="M 90 32 A 47 47 0 0 1 112 68" fill="none" stroke="#b02318" strokeWidth="8.5" opacity={0.35} />

        {/* Arco de presión dinámico activo */}
        <path
          d="M 18 68 A 47 47 0 0 1 112 68"
          fill="none"
          stroke={statusColor}
          strokeWidth="8.5"
          strokeDasharray="147.65"
          strokeDashoffset={147.65 * (1 - normVal)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.25s ease-out, stroke 0.25s ease' }}
        />

        {/* Aguja analógica con pivote central */}
        <g transform={`rotate(${needleAngle} 65 68)`} style={{ transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="65" y1="68" x2="65" y2="26" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="65" cy="68" r="5" fill="#1e293b" />
          <circle cx="65" cy="68" r="2.2" fill="#ffffff" />
        </g>

        {/* Marcas de escala numérica */}
        <text x="14" y="76" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace" fontWeight="600">0</text>
        <text x="56" y="16" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace" fontWeight="600">2.0M</text>
        <text x="100" y="76" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace" fontWeight="600">4.0M</text>
      </svg>

      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColor, fontFamily: 'JetBrains Mono, monospace', margin: '2px 0 0' }}>
        {totalPressureMPa.toFixed(2)} MPa
      </div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: statusColor, fontFamily: 'JetBrains Mono, monospace' }}>
        ({totalPressureBar.toFixed(1)} bar)
      </div>

      <div
        style={{
          fontSize: '0.58rem',
          fontWeight: 800,
          color: statusColor,
          marginTop: '4px',
          background: isCritical ? 'rgba(176,35,24,0.10)' : (totalPressureMPa > 1.2 ? 'rgba(217,119,6,0.10)' : 'rgba(13,110,100,0.10)'),
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        {isCritical ? '⚠️ RIESGO CRÍTICO DE HERNIA' : (totalPressureMPa > 1.2 ? '⚡ Carga Lumbar Elevada' : '🛡️ Zona Fisiológica Segura')}
      </div>
      <div style={{ fontSize: '0.52rem', color: '#64748b', marginTop: '3px' }}>
        Platillo L5-S1: <b>18,0 cm²</b> · Carga: <b>{loadKg} kg</b>
      </div>
    </div>
  );
}

// ── 3. Unidad Funcional Lumbo-Sacra 3D Real (L5 - S1) con Mallas Anatómicas ──
/** Presión intradiscal objetivo (determinista; el 3D la anima hacia este valor). */
function discStats(posture: DiscPressureCanvasProps['posture'], loadKg: number) {
  const p = POSTURES[posture] || POSTURES.bent_back;
  const loadFactor = loadKg / 20;
  const totalPressureMPa = p.basePressureMPa + p.compMultiplier * 0.65 * loadFactor;
  const compForceN = totalPressureMPa * 1800; // P · A (A ≈ 18 cm²)
  const shearForceN = p.shearMultiplier * 420 * (1 + loadFactor * 0.4);
  return {
    totalPressureMPa,
    totalPressureBar: totalPressureMPa * 10,
    compForceN,
    shearForceN,
    isCritical: totalPressureMPa >= 2.5,
  };
}

function SpinalFunctionalUnit3D({
  posture,
  loadKg,
}: DiscPressureCanvasProps) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;

  const painPulseRef = useRef<THREE.Mesh | null>(null);
  const nervePulseRef2 = useRef<THREE.Mesh | null>(null);
  const currentPressureRef = useRef<number>(2.4);

  const curPosture = POSTURES[posture] || POSTURES.bent_back;
  const loadFactor = loadKg / 20;
  const targetPressureMPa = curPosture.basePressureMPa + curPosture.compMultiplier * 0.65 * loadFactor;
  const isCritical = targetPressureMPa >= 2.50;

  // Materiales anatómicos cálidos / calidad museo
  const boneIvoryMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f5ecd8'),
        roughness: 0.58,
        metalness: 0.04,
      }),
    []
  );

  const sacrumBoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ede2ca'),
        roughness: 0.62,
        metalness: 0.04,
      }),
    []
  );

  const cartilagePlateMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#68c5b8'),
        roughness: 0.20,
        metalness: 0.12,
        transparent: true,
        opacity: 0.90,
      }),
    []
  );

  const nerveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#eab308'),
        roughness: 0.32,
        metalness: 0.15,
        emissive: new THREE.Color('#ca8a04'),
        emissiveIntensity: 0.65,
      }),
    []
  );

  const duralSacMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e2e8f0'),
        roughness: 0.65,
        metalness: 0.05,
        transparent: true,
        opacity: 0.70,
      }),
    []
  );

  const painPulseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ef4444'),
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
        emissive: new THREE.Color('#b02318'),
        emissiveIntensity: 1.2,
      }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    currentPressureRef.current += (targetPressureMPa - currentPressureRef.current) * Math.min(1, delta * 8.0);

    if (painPulseRef.current && isCritical) {
      const pulseScale = 1.0 + Math.sin(t * 9.0) * 0.35;
      painPulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    if (nervePulseRef2.current && isCritical) {
      const pulseScale2 = 1.0 + Math.cos(t * 9.0) * 0.35;
      nervePulseRef2.current.scale.set(pulseScale2, pulseScale2, pulseScale2);
    }
  });

  // `useFrame` sólo muta el ref (no re-renderiza), así que las etiquetas React se
  // quedaban congeladas en el valor inicial. Se usa el valor objetivo directo →
  // números correctos y consistentes con el overlay de la esquina.
  const totalPressureMPa = targetPressureMPa;

  // Mapa dinámico de color de estrés anular (Hoop Stress)
  const hoopStressColor = totalPressureMPa < 1.2 ? '#0d6e64' : (totalPressureMPa < 2.4 ? '#d97706' : '#b02318');

  // Deformación física del disco intervertebral L5-S1
  // Altura del disco se reduce con compresión (de 0.38 a 0.24)
  const discHeight = Math.max(0.24, 0.40 - (totalPressureMPa - 0.5) * 0.045);
  // El núcleo pulposo se desplaza hacia atrás (-Z) por efecto de flexión y compresión
  const nucleusZ = (curPosture.nucleusOffset * 1.8) * (1 + loadFactor * 0.35);
  const nucleusRadialScale = 1.0 + (totalPressureMPa - 0.5) * 0.10;
  const nucleusHeightScale = Math.max(0.52, 1.0 - (totalPressureMPa - 0.5) * 0.15);

  // Extrusión herniaria posterolateral crítica
  const herniationBulge = isCritical ? Math.min(0.28, 0.16 + (totalPressureMPa - 2.5) * 0.10) : 0;

  // Vectores de fuerza en 3D
  const compForceN = totalPressureMPa * 1800; // P * A (A = 18 cm² = 0.0018 m² -> F = P * 1800)
  const compVecLen = Math.min(0.95, 0.28 + (totalPressureMPa / 3.8) * 0.65);
  const shearForceN = curPosture.shearMultiplier * 420 * (1 + loadFactor * 0.4);
  const shearVecLen = Math.min(0.65, 0.15 + (shearForceN / 1200) * 0.45);

  // Letreros del riel lateral (la presión P vive en el manómetro de la esquina).
  const lFn = `Fn = ${compForceN.toFixed(0)} N`;
  const lFt = `Ft = ${shearForceN.toFixed(0)} N`;

  // Coordenadas de alineación con respecto al disco L5-S1 (centro del disco en [0, 0.15, 0])
  // En human_body.glb, lumbar5 está alrededor de Y: 0.058 - 0.088, sacrum alrededor de Y: -0.016 - 0.072
  const SPINE_SCALE = 20.0;
  const L5_OFFSET_Y = 0.0589;
  const SACRUM_OFFSET_Y = 0.0580;
  const SPINE_CENTER_Z = -0.017;

  return (
    <group position={[0, -0.35, 0]}>
      {/* ── 1. SEGMENTO INFERIOR: SACRO S1 (Base fija con platillo superior) ── */}
      <group position={[0, 0, 0]}>
        {nodes?.sacrum ? (
          <group scale={SPINE_SCALE} position={[-0.005 * SPINE_SCALE, -SACRUM_OFFSET_Y * SPINE_SCALE - 0.05, -SPINE_CENTER_Z * SPINE_SCALE]}>
            <mesh geometry={nodes.sacrum.geometry} material={sacrumBoneMat} />
          </group>
        ) : (
          /* Fallback geométrico de alta definición para Sacro S1 */
          <group position={[0, -0.45, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.92, 0.65, 0.85, 32]} />
              <primitive object={sacrumBoneMat} attach="material" />
            </mesh>
            <mesh position={[0, 0.15, -0.65]}>
              <boxGeometry args={[0.26, 0.6, 0.55]} />
              <primitive object={sacrumBoneMat} attach="material" />
            </mesh>
          </group>
        )}

        {/* Platillo cartilaginoso superior de S1 */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.03, 32]} />
          <primitive object={cartilagePlateMat} attach="material" />
        </mesh>

        <DclTag position={[0, -0.38, 0.95]} color="#5d6b76" symbol="S1" />
      </group>

      {/* ── 2. DISCO INTERVERTEBRAL L5-S1 (Deformable, Laminar y Viscoelástico) ── */}
      <group position={[0, 0.04 + discHeight * 0.5, 0]}>
        {/* Anillo Fibroso Exterior con Mapa de Esfuerzo de Tracción Circunferencial (Hoop Stress) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.86, 0.86, discHeight, 32]} />
          <meshStandardMaterial
            color={hoopStressColor}
            roughness={0.42}
            metalness={0.08}
            transparent
            opacity={0.88}
            emissive={hoopStressColor}
            emissiveIntensity={isCritical ? 0.55 : 0.12}
          />
        </mesh>

        {/* Laminillas concéntricas de colágeno tipo I en el anillo fibroso */}
        <mesh position={[0, 0, 0]} scale={[1, discHeight / 0.40, 1]}>
          <torusGeometry args={[0.66, 0.032, 16, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0, 0, 0]} scale={[1, discHeight / 0.40, 1]}>
          <torusGeometry args={[0.48, 0.028, 16, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} transparent opacity={0.65} />
        </mesh>

        {/* Núcleo Pulposo Hidrogel 3D (Translúcido esmeralda/cian con migración posterior) */}
        <group position={[0, 0, nucleusZ]}>
          <mesh scale={[nucleusRadialScale, nucleusHeightScale * (discHeight / 0.40), nucleusRadialScale]}>
            <sphereGeometry args={[0.34, 24, 24]} />
            <meshStandardMaterial
              color={isCritical ? '#ef4444' : '#68c5b8'}
              roughness={0.18}
              metalness={0.15}
              transparent
              opacity={0.90}
              emissive={isCritical ? '#991b1b' : '#0d9488'}
              emissiveIntensity={isCritical ? 0.70 : 0.35}
            />
          </mesh>

          {/* Extrusión Herniaria Crítica Posterolateral (> 2.5 MPa) */}
          {isCritical && (
            <group position={[0.18, 0, -0.36 - herniationBulge * 0.4]}>
              <mesh scale={[1.0 + herniationBulge * 0.6, 0.85, 1.2 + herniationBulge * 0.8]}>
                <sphereGeometry args={[0.18 + herniationBulge * 0.20, 20, 20]} />
                <meshStandardMaterial
                  color="#dc2626"
                  roughness={0.25}
                  metalness={0.2}
                  emissive="#7f1d1d"
                  emissiveIntensity={0.85}
                />
              </mesh>

              {/* Rótulo de Hernia Discal */}
              <DclTag position={[0.22, 0.15, -0.1]} color="#b02318" symbol="⚠ hernia" />
            </group>
          )}
        </group>

        {/* Vector de Esfuerzo de Cizallamiento Tangencial */}
        {curPosture.shearMultiplier > 0.25 && (
          <ForceVector3D origin={[0, 0, 0.86]} vector={[0, 0, shearVecLen]} color="#d97706" label={lFt} sub="cizallamiento" emphasis="muted" isDashed />
        )}
      </group>

      {/* ── 3. SEGMENTO SUPERIOR MÓVIL: VÉRTEBRA L5 (Bascula y desciende con carga) ── */}
      <group
        position={[0, 0.04 + discHeight, 0]}
        rotation={[curPosture.tiltAngle, 0, 0]}
      >
        {/* Platillo cartilaginoso inferior de L5 */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.03, 32]} />
          <primitive object={cartilagePlateMat} attach="material" />
        </mesh>

        {/* Malla anatómica real de Vértebra L5 de human_body.glb */}
        {nodes?.lumbar5 ? (
          <group scale={SPINE_SCALE} position={[-0.005 * SPINE_SCALE, -L5_OFFSET_Y * SPINE_SCALE + 0.03, -SPINE_CENTER_Z * SPINE_SCALE]}>
            <mesh geometry={nodes.lumbar5.geometry} material={boneIvoryMat} />
          </group>
        ) : (
          /* Fallback geométrico de alta fidelidad para L5 */
          <group position={[0, 0.32, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.90, 0.94, 0.60, 32]} />
              <primitive object={boneIvoryMat} attach="material" />
            </mesh>
            <mesh position={[0, 0.05, -0.85]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.26, 0.32, 0.70]} />
              <primitive object={boneIvoryMat} attach="material" />
            </mesh>
          </group>
        )}

        {/* Contexto anatómico superior: Vértebra L4 si está disponible */}
        {nodes?.lumbar4 && (
          <group scale={SPINE_SCALE} position={[-0.005 * SPINE_SCALE, -L5_OFFSET_Y * SPINE_SCALE + 0.03, -SPINE_CENTER_Z * SPINE_SCALE]}>
            <mesh geometry={nodes.lumbar4.geometry} material={boneIvoryMat} />
          </group>
        )}

        {/* Vector de Fuerza Compresiva Axial F_comp */}
        <ForceVector3D
          origin={[0, 0.75 + compVecLen, 0]}
          vector={[0, -compVecLen, 0]}
          color={isCritical ? '#b02318' : (totalPressureMPa > 1.2 ? '#d97706' : '#0d6e64')}
          label={lFn}
          sub="compresión axial"
          emphasis="strong"
        />

        {/* Badge Vértebra L5 (referencia anclada, se queda sobre el modelo) */}
        <DclTag position={[0, 0.50, 0.95]} color="#5d6b76" symbol="L5" />
      </group>

      {/* ── 4. CANAL NEURAL, SACO TECAL Y RAÍCES NERVIOSAS L5-S1 (Posterior) ── */}
      <group position={[0, 0.22, -0.92]}>
        {/* Saco tecal / Médula espinal */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 1.7, 20]} />
          <primitive object={duralSacMat} attach="material" />
        </mesh>

        {/* Raíz nerviosa espinal derecha L5 (sale posterolateralmente hacia la zona de hernia) */}
        <mesh position={[0.22, -0.05, 0.18]} rotation={[0.25, 0, -0.38]}>
          <cylinderGeometry args={[0.042, 0.042, 1.1, 16]} />
          <primitive object={nerveMat} attach="material" />
        </mesh>

        {/* Raíz nerviosa espinal izquierda L5 */}
        <mesh position={[-0.22, -0.05, 0.18]} rotation={[0.25, 0, 0.38]}>
          <cylinderGeometry args={[0.042, 0.042, 1.1, 16]} />
          <primitive object={nerveMat} attach="material" />
        </mesh>

        {/* Pulsos de Dolor Radicular / Ciatalgia sobre la raíz comprimida */}
        {isCritical && (
          <>
            <mesh ref={painPulseRef} position={[0.20, -0.02, 0.32]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <primitive object={painPulseMat} attach="material" />
            </mesh>
            <mesh ref={nervePulseRef2} position={[0.28, -0.22, 0.38]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <primitive object={painPulseMat} attach="material" />
            </mesh>
            <DclTag position={[0.45, -0.05, 0.35]} color="#b02318" symbol="⚡ ciatalgia" />
          </>
        )}
      </group>

      {/* Proyecta cada <Callout> de la escena a píxeles para el riel lateral. */}
      <CalloutSource />

      {/* Sombra de contacto suave en el suelo de estudio */}
      <ContactShadows position={[0, -1.35, 0]} opacity={0.62} scale={3.8} blur={1.9} far={3.0} color="#241d12" />
    </group>
  );
}

// ── 4. Componente Principal Exportado DiscPressureCanvas ──
export default function DiscPressureCanvas({
  showLabels = false,
  posture = 'bent_back',
  loadKg = 15,
}: DiscPressureCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const d = discStats(posture, loadKg);
  const callouts = useCalloutStore();

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="cap2-webgl-canvas" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Botón flotante para reset de cámara */}
      <button
        type="button"
        onClick={handleResetCamera}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid var(--line, #cbd5e1)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'var(--ink, #232c36)',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(6px)',
          transition: 'all 0.15s ease',
        }}
      >
        📷 Restablecer Cámara
      </button>

      {/* Canvas 3D de React Three Fiber */}
      <Canvas
        camera={{ position: [2.55, 1.25, 3.15], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: STUDIO_BG_DEEP }}
      >
        <StudioLights keyIntensity={1.6} />

        <Suspense fallback={null}>
          <SpinalFunctionalUnit3D
            posture={posture}
            loadKg={loadKg}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.5}
          maxDistance={6.0}
          maxPolarAngle={Math.PI / 2 + 0.12}
          dampingFactor={0.08}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      <CalloutRail
        store={callouts}
        side="left"
        note={
          d.isCritical
            ? 'Presión intradiscal crítica (> 2,5 MPa): riesgo de extrusión del núcleo pulposo.'
            : 'Presión sobre un área discal ≈ 18 cm²; la postura multiplica la carga axial.'
        }
      />

      {/* Manómetro anclado a la esquina (fuera del 3D) */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          zIndex: 9,
          transform: 'scale(0.78)',
          transformOrigin: 'bottom right',
          pointerEvents: 'none',
        }}
      >
        <PressureManometerGauge
          totalPressureMPa={d.totalPressureMPa}
          totalPressureBar={d.totalPressureBar}
          isCritical={d.isCritical}
          loadKg={loadKg}
        />
      </div>
    </div>
    </CalloutProvider>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
