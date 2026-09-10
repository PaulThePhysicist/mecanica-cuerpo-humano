import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
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

interface SpineCanvasProps {
  trunkAngleDeg: number; // Ángulo de inclinación del tronco (0 a 90 grados, 0 = erguido, 90 = horizontal)
  handLoadKg: number;    // Carga en manos en kg (0 a 40 kg)
  bodyMassKg: number;    // Masa corporal (70 kg default)
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

// ── Colores y Paleta Anatómica de Grado Médico ──
const BONE_IVORY = '#ede5d0';
const BONE_DEEP = '#c5b593';
const CARTILAGE_ICE = '#68c5b8';
const MUSCLE_CARMINE = '#a92a1e';
const MUSCLE_HEAVY = '#dc2626';
const DISC_HEALTHY = '#88d4d0';
const DISC_STRAINED = '#fca5a5';
const TEAL_ACCENT = '#0d6e64';
const AMBER_ACCENT = '#d97706';
const RED_ACCENT = '#b02318';

// Pivot anatómico de L5-S1 en el modelo
const P_SACRUM = new THREE.Vector3(0.006, 0.028, -0.029);

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
        position={[tipPos.x + dir.x * 0.08, tipPos.y + dir.y * 0.08, tipPos.z + dir.z * 0.08]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── 2. Dial Manométrico Analógico de Tensión Muscular Lumbar ──
function LumbarTensionGauge({
  fErectorN,
  fErectorKgf,
  rCompN,
  rShearN,
  isHighTension,
  isExtremeTension,
}: {
  fErectorN: number;
  fErectorKgf: number;
  rCompN: number;
  rShearN: number;
  isHighTension: boolean;
  isExtremeTension: boolean;
}) {
  const normVal = Math.min(1, Math.max(0, fErectorN / 4500));
  const needleAngle = -135 + normVal * 270;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${isExtremeTension ? '#991b1b' : (isHighTension ? RED_ACCENT : '#cbd5e1')}`,
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 6px 20px rgba(35, 44, 54, 0.14)',
        minWidth: '165px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.60rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Tensión Erector Espinal
      </div>

      {/* SVG Dial */}
      <svg width="120" height="74" viewBox="0 0 120 74" style={{ margin: '4px auto 0', display: 'block' }}>
        <path d="M 15 65 A 45 45 0 0 1 105 65" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        {/* Sector Verde (< 1500 N) */}
        <path d="M 15 65 A 45 45 0 0 1 52 22" fill="none" stroke="#0d6e64" strokeWidth="8" strokeDasharray="4 2" opacity={0.35} />
        {/* Sector Ámbar (1500 - 2800 N) */}
        <path d="M 52 22 A 45 45 0 0 1 88 32" fill="none" stroke="#d97706" strokeWidth="8" strokeDasharray="4 2" opacity={0.35} />
        {/* Sector Rojo (> 2800 N) */}
        <path d="M 88 32 A 45 45 0 0 1 105 65" fill="none" stroke="#b02318" strokeWidth="8" strokeDasharray="4 2" opacity={0.35} />

        {/* Arco dinámico */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke={isExtremeTension ? '#991b1b' : (isHighTension ? RED_ACCENT : (fErectorN > 1500 ? '#d97706' : '#0d6e64'))}
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
        <text x="12" y="72" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="52" y="16" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">2.2k</text>
        <text x="94" y="72" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">4.5kN</text>
      </svg>

      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isHighTension ? RED_ACCENT : TEAL_ACCENT, fontFamily: 'JetBrains Mono, monospace', margin: '2px 0 0' }}>
        {fErectorN.toFixed(0)} N
      </div>
      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: isHighTension ? RED_ACCENT : TEAL_ACCENT }}>
        {fErectorKgf.toFixed(0)} kgf en musculatura lumbar
      </div>

      <div style={{ fontSize: '0.54rem', color: isExtremeTension ? '#b91c1c' : '#64748b', marginTop: '4px', fontWeight: isExtremeTension ? 700 : 500 }}>
        {isExtremeTension ? '⚠️ Sobrecarga crítica (Fasciculaciones)' : (isHighTension ? 'Demanda muscular severa' : 'Carga muscular fisiológica')}
      </div>
      <div style={{ fontSize: '0.52rem', color: '#64748b', marginTop: '2px' }}>
        Desventaja mecánica: <b>~10:1 (5 cm vs 50 cm)</b>
      </div>
    </div>
  );
}

// ── 3. Modelo 3D de Columna Lumbar L1-L5 Articulada con Cuñamiento Discal y Erector Espinal ──
/** Biomecánica lumbar L5-S1 (determinista). */
function spineStats(trunkAngleDeg: number, handLoadKg: number, bodyMassKg: number) {
  const g = 9.81;
  const wTrunkN = 0.65 * bodyMassKg * g;
  const wLoadN = handLoadKg * g;
  const alphaRad = (trunkAngleDeg * Math.PI) / 180;
  const sinAlpha = Math.sin(alphaRad);
  const cosAlpha = Math.cos(alphaRad);
  const dMuscM = 0.05;
  const thetaMRad = (12 * Math.PI) / 180;
  const sinThetaM = Math.sin(thetaMRad);
  const cosThetaM = Math.cos(thetaMRad);
  const tauResNm = (wTrunkN * 0.38 + wLoadN * 0.50) * sinAlpha;
  const fErectorN = Math.max(25, tauResNm / (dMuscM * sinThetaM));
  const rCompN = fErectorN * cosThetaM + (wTrunkN + wLoadN) * cosAlpha;
  const rShearN = Math.abs((wTrunkN + wLoadN) * sinAlpha - fErectorN * sinThetaM);
  return {
    wTrunkN, wLoadN,
    tauResNm, fErectorN, fErectorKgf: fErectorN / g, rCompN, rCompKgf: rCompN / g, rShearN,
    isHighTension: fErectorN > 2400, isExtremeTension: fErectorN > 3200,
  };
}

function LumbarSpine3D({
  trunkAngleDeg,
  handLoadKg,
  bodyMassKg,
}: SpineCanvasProps) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;

  const spineAngleRef = useRef<number>(60);
  const muscleVibeRef = useRef<THREE.Group | null>(null);

  // Materiales óseos
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_IVORY),
        roughness: 0.60,
        metalness: 0.05,
      }),
    []
  );

  const sacrumMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e5dac2'),
        roughness: 0.62,
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

  const discHealthyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(DISC_HEALTHY),
        roughness: 0.38,
        metalness: 0.05,
        transparent: true,
        opacity: 0.90,
      }),
    []
  );

  const discStrainedMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(DISC_STRAINED),
        roughness: 0.38,
        metalness: 0.05,
        transparent: true,
        opacity: 0.95,
        emissive: new THREE.Color('#7f1d1d'),
        emissiveIntensity: 0.25,
      }),
    []
  );

  // ── Cálculos Biomecánicos de la Columna Lumbar (L5-S1) ──
  const g = 9.81;
  const totalWeightN = bodyMassKg * g;
  const wTrunkN = 0.65 * totalWeightN; // Peso torso, cabeza y brazos
  const wLoadN = handLoadKg * g;

  const alphaRad = (trunkAngleDeg * Math.PI) / 180;
  const sinAlpha = Math.sin(alphaRad);
  const cosAlpha = Math.cos(alphaRad);

  const dTrunkM = 0.38; // 38 cm al centro de gravedad del tronco
  const dLoadM = 0.50;  // 50 cm a la carga en manos

  // Erector de la espina: brazo dm = 5 cm, theta_m = 12°
  const dMuscM = 0.05;
  const thetaMRad = (12 * Math.PI) / 180;
  const sinThetaM = Math.sin(thetaMRad);
  const cosThetaM = Math.cos(thetaMRad);

  // Momento flexor total
  const tauResNm = (wTrunkN * dTrunkM + wLoadN * dLoadM) * sinAlpha;

  // Tensión requerida en el erector espinal
  const fErectorN = Math.max(25, tauResNm / (dMuscM * sinThetaM));
  const fErectorKgf = fErectorN / g;

  const isHighTension = fErectorN > 2400;
  const isExtremeTension = fErectorN > 3200;

  // Reacción sobre el disco L5-S1 (misma fórmula que `spineStats`).
  const rCompN = fErectorN * cosThetaM + (wTrunkN + wLoadN) * cosAlpha;
  const rShearN = Math.abs((wTrunkN + wLoadN) * sinAlpha - fErectorN * sinThetaM);

  // Letreros del riel lateral (mismos valores que llenaban el DclReadout de esquina).
  const lFm = `Fm = ${fErectorN.toFixed(0)} N`;
  const lW1 = `W₁ = ${wTrunkN.toFixed(0)} N`;
  const lW2 = `W₂ = ${wLoadN.toFixed(0)} N`;
  const lRn = `Rn = ${rCompN.toFixed(0)} N`;
  const lRt = `Rt = ${rShearN.toFixed(0)} N`;

  // LERP suave de inclinación del tronco y micro-vibraciones musculares de fatiga/alta carga
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    spineAngleRef.current += (trunkAngleDeg - spineAngleRef.current) * Math.min(1, delta * 7);

    if (muscleVibeRef.current && isHighTension) {
      const vibeFreq = isExtremeTension ? 55 : 35;
      const vibeAmp = isExtremeTension ? 0.010 : 0.004;
      muscleVibeRef.current.position.z = Math.sin(t * vibeFreq) * vibeAmp;
      muscleVibeRef.current.position.x = Math.cos(t * (vibeFreq * 0.8)) * (vibeAmp * 0.5);
    }
  });

  const curAngle = spineAngleRef.current;
  const curAlphaRad = (curAngle * Math.PI) / 180;
  // Flexión angular por cada nivel intervertebral
  const anglePerLevel = curAlphaRad / 5.2;

  // Cuñamiento discal: el borde anterior se comprime hasta un 45% a 90° de flexión
  const wedgeRatio = Math.max(0.55, 1.0 - (curAngle / 90) * 0.45);

  const MODEL_SCALE = 14.5;
  const vScale = 0.00018;

  // Espesor anatómico del erector espinal con hipertrofia por contracción
  const muscleThickness = Math.min(0.060, 0.024 + (fErectorN / 4500) * 0.032);

  return (
    <group position={[0, -0.65, 0]}>
      {/* ── 1. BASE FIJA: Sacro y Pelvis Ósea ── */}
      <group scale={MODEL_SCALE} position={[0, 0, 0]}>
        <group position={[-P_SACRUM.x, -P_SACRUM.y, -P_SACRUM.z]}>
          {nodes?.sacrum && <mesh geometry={nodes.sacrum.geometry} material={sacrumMat} />}
          {nodes?.hip_R && <mesh geometry={nodes.hip_R.geometry} material={sacrumMat} />}
          {nodes?.hip_L && <mesh geometry={nodes.hip_L.geometry} material={sacrumMat} />}
        </group>

        {/* Platillo cartilaginoso superior S1 inclinado a 30° */}
        <mesh position={[0, 0.065, -0.015]} rotation={[-0.35, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.024, 0.004, 20]} />
          <primitive object={cartilageMat} attach="material" />
        </mesh>
      </group>

      {/* ── 2. COLUMNA LUMBAR ARTICULADA (L5 a L1 con cuñamiento dinámico) ── */}
      <group position={[0, 0.95, -0.22]}>
        {/* L5 */}
        <group rotation={[anglePerLevel * 1, 0, 0]}>
          <group scale={MODEL_SCALE} position={[-P_SACRUM.x * MODEL_SCALE, -P_SACRUM.y * MODEL_SCALE, -P_SACRUM.z * MODEL_SCALE]}>
            {nodes?.lumbar5 && <mesh geometry={nodes.lumbar5.geometry} material={boneMat} />}
          </group>

          {/* Disco L5-S1 intervertebral con cuñamiento anterior */}
          <group position={[0, -0.06, 0.04]} rotation={[anglePerLevel * 0.5, 0, 0]} scale={[1, wedgeRatio, 1]}>
            <mesh>
              <cylinderGeometry args={[0.34, 0.36, 0.12, 24]} />
              <primitive object={isHighTension ? discStrainedMat : discHealthyMat} attach="material" />
            </mesh>
          </group>

          {/* L4 */}
          <group position={[0, 0.32, 0.03]} rotation={[anglePerLevel * 1, 0, 0]}>
            <group scale={MODEL_SCALE} position={[-P_SACRUM.x * MODEL_SCALE, -P_SACRUM.y * MODEL_SCALE, -P_SACRUM.z * MODEL_SCALE]}>
              {nodes?.lumbar4 && <mesh geometry={nodes.lumbar4.geometry} material={boneMat} />}
            </group>

            {/* Disco L4-L5 */}
            <group position={[0, -0.05, 0.03]} scale={[1, wedgeRatio, 1]}>
              <mesh>
                <cylinderGeometry args={[0.33, 0.35, 0.11, 24]} />
                <primitive object={isHighTension ? discStrainedMat : discHealthyMat} attach="material" />
              </mesh>
            </group>

            {/* L3 */}
            <group position={[0, 0.32, 0.02]} rotation={[anglePerLevel * 1, 0, 0]}>
              <group scale={MODEL_SCALE} position={[-P_SACRUM.x * MODEL_SCALE, -P_SACRUM.y * MODEL_SCALE, -P_SACRUM.z * MODEL_SCALE]}>
                {nodes?.lumbar3 && <mesh geometry={nodes.lumbar3.geometry} material={boneMat} />}
              </group>

              {/* Disco L3-L4 */}
              <group position={[0, -0.05, 0.02]} scale={[1, wedgeRatio, 1]}>
                <mesh>
                  <cylinderGeometry args={[0.32, 0.34, 0.11, 24]} />
                  <primitive object={discHealthyMat} attach="material" />
                </mesh>
              </group>

              {/* L2 */}
              <group position={[0, 0.32, 0.01]} rotation={[anglePerLevel * 1, 0, 0]}>
                <group scale={MODEL_SCALE} position={[-P_SACRUM.x * MODEL_SCALE, -P_SACRUM.y * MODEL_SCALE, -P_SACRUM.z * MODEL_SCALE]}>
                  {nodes?.lumbar2 && <mesh geometry={nodes.lumbar2.geometry} material={boneMat} />}
                </group>

                {/* Disco L2-L3 */}
                <group position={[0, -0.05, 0.01]} scale={[1, wedgeRatio, 1]}>
                  <mesh>
                    <cylinderGeometry args={[0.31, 0.33, 0.11, 24]} />
                    <primitive object={discHealthyMat} attach="material" />
                  </mesh>
                </group>

                {/* L1 */}
                <group position={[0, 0.32, 0.01]} rotation={[anglePerLevel * 1, 0, 0]}>
                  <group scale={MODEL_SCALE} position={[-P_SACRUM.x * MODEL_SCALE, -P_SACRUM.y * MODEL_SCALE, -P_SACRUM.z * MODEL_SCALE]}>
                    {nodes?.lumbar1 && <mesh geometry={nodes.lumbar1.geometry} material={boneMat} />}
                    {nodes?.thoracic12 && <mesh geometry={nodes.thoracic12.geometry} material={boneMat} />}
                  </group>

                  {/* Disco L1-L2 */}
                  <group position={[0, -0.05, 0.01]} scale={[1, wedgeRatio, 1]}>
                    <mesh>
                      <cylinderGeometry args={[0.30, 0.32, 0.10, 24]} />
                      <primitive object={discHealthyMat} attach="material" />
                    </mesh>
                  </group>

                  {/* Torso Superior, Cabeza y Brazos con Palanca */}
                  <group position={[0, 0.45, 0]}>
                    {/* Caja torácica esquemática translúcida */}
                    <mesh position={[0, 0.35, 0.18]}>
                      <sphereGeometry args={[0.42, 20, 16]} />
                      <meshStandardMaterial color="#ebdcc0" roughness={0.7} transparent opacity={0.35} />
                    </mesh>

                    {/* Vector Peso del Tronco W1 en Centro de Gravedad d1 = 38 cm */}
                    <ForceVector3D origin={[0, 0.25, 0.22]} vector={[0, -wTrunkN * vScale * 1.1, 0]} color={AMBER_ACCENT} label={lW1} sub="0,65 W · tronco" />

                    {/* Brazos y Caja de Carga Levantada en Manos (d2 = 50 cm) */}
                    {handLoadKg > 0 && (
                      <group position={[0, 0.15, 0.75]}>
                        {/* Caja 3D Ergonómica */}
                        <mesh position={[0, -0.15, 0]}>
                          <boxGeometry args={[0.36, 0.24, 0.28]} />
                          <meshStandardMaterial color="#d4b584" roughness={0.48} metalness={0.08} />
                        </mesh>

                        {/* Vector Peso Carga W2 */}
                        <ForceVector3D origin={[0, -0.15, 0]} vector={[0, -wLoadN * vScale * 1.1, 0]} color="#232c36" label={lW2} sub="carga en manos" />
                      </group>
                    )}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ── 3. MÚSCULO ERECTOR DE LA ESPINA 3D (Tensión Masiva y Micro-vibraciones) ── */}
      <group ref={muscleVibeRef} position={[0, 0.65, -0.45]}>
        {/* Par de vientres musculares paravertebrales */}
        <mesh position={[-0.14, 0.65 * Math.cos(curAlphaRad * 0.5), -0.65 * Math.sin(curAlphaRad * 0.5)]} rotation={[curAlphaRad * 0.5, 0, 0]}>
          <cylinderGeometry args={[muscleThickness * 0.7, muscleThickness, 1.45, 16]} />
          <meshStandardMaterial
            color={isExtremeTension ? '#991b1b' : (isHighTension ? MUSCLE_HEAVY : MUSCLE_CARMINE)}
            roughness={0.48}
            metalness={0.08}
            emissive={isExtremeTension ? '#991b1b' : (isHighTension ? '#7f1d1d' : '#500e08')}
            emissiveIntensity={isExtremeTension ? 0.85 : (isHighTension ? 0.65 : 0.35)}
          />
        </mesh>
        <mesh position={[0.14, 0.65 * Math.cos(curAlphaRad * 0.5), -0.65 * Math.sin(curAlphaRad * 0.5)]} rotation={[curAlphaRad * 0.5, 0, 0]}>
          <cylinderGeometry args={[muscleThickness * 0.7, muscleThickness, 1.45, 16]} />
          <meshStandardMaterial
            color={isExtremeTension ? '#991b1b' : (isHighTension ? MUSCLE_HEAVY : MUSCLE_CARMINE)}
            roughness={0.48}
            metalness={0.08}
            emissive={isExtremeTension ? '#991b1b' : (isHighTension ? '#7f1d1d' : '#500e08')}
            emissiveIntensity={isExtremeTension ? 0.85 : (isHighTension ? 0.65 : 0.35)}
          />
        </mesh>

        {/* Vector Fuerza Muscular Fm */}
        <ForceVector3D
          origin={[0, 1.10 * Math.cos(curAlphaRad * 0.55), -1.10 * Math.sin(curAlphaRad * 0.55)]}
          vector={[0, -fErectorN * vScale * 0.75, -fErectorN * vScale * 0.20]}
          color={RED_ACCENT}
          label={lFm}
          sub="erector espinal"
        />
      </group>

      {/* Reacción sobre el disco L5-S1: sin flecha propia, pero su valor y punto
          de aplicación (la unión lumbosacra) van al riel. */}
      <Callout position={[0, 0.92, 0.02]} label={lRn} sub="compresión axial" color="#1e293b" emphasis="strong" />
      <Callout position={[0, 0.78, 0.02]} label={lRt} sub="cizallamiento" color={AMBER_ACCENT} emphasis="muted" />

      <CalloutSource />

      {/* Sombra de contacto */}
      <ContactShadows position={[0, -2.45, 0]} opacity={0.62} scale={4} blur={1.7} far={4} color="#241d12" />
    </group>
  );
}

// ── 4. Componente Principal SpineCanvas con R3F ──
export default function SpineCanvas({
  showLabels = false,
  trunkAngleDeg = 60,
  handLoadKg = 15,
  bodyMassKg = 70,
}: SpineCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const s = spineStats(trunkAngleDeg, handLoadKg, bodyMassKg);
  const callouts = useCalloutStore();

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
        camera={{ position: [2.15, 1.05, 4.55], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: STUDIO_BG_DEEP }}
      >
        <StudioLights keyIntensity={1.55} />

        <Suspense fallback={null}>
          <LumbarSpine3D
            trunkAngleDeg={trunkAngleDeg}
            handLoadKg={handLoadKg}
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
          target={[0, 0.4, 0]}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      <CalloutRail
        store={callouts}
        side="left"
        note={`Desventaja de palanca 10:1 (dm ≈ 5 cm): torque flexor ${s.tauResNm.toFixed(0)} N·m ⟹ el erector tira ${s.fErectorN.toFixed(0)} N.`}
      />

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
        <LumbarTensionGauge
          fErectorN={s.fErectorN}
          fErectorKgf={s.fErectorKgf}
          rCompN={s.rCompN}
          rShearN={s.rShearN}
          isHighTension={s.isHighTension}
          isExtremeTension={s.isExtremeTension}
        />
      </div>
    </div>
    </CalloutProvider>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
