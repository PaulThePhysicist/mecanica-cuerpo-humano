import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';
import { DclTag } from './DclReadout';

interface HipCanvasProps {
  bodyMassKg: number;        // Masa total en kg (40 a 120, default 70)
  trendelenburg: boolean;    // Si es true, simula insuficiencia del glúteo medio (pelvis cae)
  showBreakdown: boolean;    // Si es true, desglosa componentes x e y de la fuerza articular
}

// ── Colores y Paleta Anatómica de Grado Médico ──
const BONE_IVORY = '#ede5d0';
const BONE_DEEP = '#c5b593';
const CARTILAGE_ICE = '#68c5b8';
const MUSCLE_CARMINE = '#a92a1e';
const MUSCLE_INACTIVE = '#e28880';
const TENDON_PEARL = '#f5f0e6';
const TEAL_ACCENT = '#0d6e64';
const AMBER_ACCENT = '#d97706';
const RED_ACCENT = '#b02318';

// Pivot anatómico de la cabeza femoral derecha en el espacio del modelo 3D
const P_HIP_R = new THREE.Vector3(-0.039, 0.002, -0.003);

// ── 1. Vector de Fuerza 3D de Alta Fidelidad con Tubo, Cono y Badge HTML ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  symbol = 'F',
  showComponents = false,
  isDashed = false,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  symbol: string;
  showComponents?: boolean;
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

      {/* Proyecciones ortogonales Fx, Fy */}
      {showComponents && (
        <group>
          <Line
            points={[
              origin,
              [origin[0] + v.x, origin[1], origin[2]],
              [origin[0] + v.x, origin[1] + v.y, origin[2]],
            ]}
            color={color}
            lineWidth={1.6}
            dashed
            dashScale={12}
            dashSize={0.06}
            gapSize={0.04}
          />
        </group>
      )}

      {/* Etiqueta mínima: sólo el símbolo; las cifras van en las tarjetas de esquina. */}
      <DclTag
        position={[tipPos.x + dir.x * 0.07, tipPos.y + dir.y * 0.07, tipPos.z + dir.z * 0.07]}
        color={color}
        symbol={symbol}
      />
    </group>
  );
}

// ── 2. Dial Manométrico Analógico de Reacción Acetabular (SVG Gauge) ──
function AcetabularGauge({
  rJointN,
  rJointKgf,
  trendelenburg,
  maxR = 3000,
}: {
  rJointN: number;
  rJointKgf: number;
  trendelenburg: boolean;
  maxR?: number;
}) {
  const normVal = Math.min(1, Math.max(0, rJointN / maxR));
  // Ángulo de -135° a +135°
  const needleAngle = -135 + normVal * 270;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${trendelenburg ? RED_ACCENT : '#cbd5e1'}`,
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 6px 20px rgba(35, 44, 54, 0.14)',
        minWidth: '160px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.60rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Reacción Acetabular (R)
      </div>

      {/* Indicador analógico circular SVG */}
      <svg width="120" height="74" viewBox="0 0 120 74" style={{ margin: '4px auto 0', display: 'block' }}>
        {/* Arco de fondo */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Sector Verde (0 - 1500 N) */}
        <path
          d="M 15 65 A 45 45 0 0 1 60 20"
          fill="none"
          stroke="#0d6e64"
          strokeWidth="8"
          strokeDasharray="4 2"
          opacity={0.35}
        />
        {/* Sector Ámbar (1500 - 2400 N) */}
        <path
          d="M 60 20 A 45 45 0 0 1 95 38"
          fill="none"
          stroke="#d97706"
          strokeWidth="8"
          strokeDasharray="4 2"
          opacity={0.35}
        />
        {/* Sector Rojo (> 2400 N) */}
        <path
          d="M 95 38 A 45 45 0 0 1 105 65"
          fill="none"
          stroke="#b02318"
          strokeWidth="8"
          strokeDasharray="4 2"
          opacity={0.35}
        />

        {/* Arco de valor activo */}
        <path
          d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none"
          stroke={trendelenburg ? RED_ACCENT : (rJointN > 2400 ? '#b02318' : (rJointN > 1500 ? '#0d6e64' : '#0d6e64'))}
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
        <text x="56" y="16" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">1.5k</text>
        <text x="96" y="72" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace">3kN</text>
      </svg>

      {/* Lecturas numéricas digitales */}
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: trendelenburg ? RED_ACCENT : TEAL_ACCENT, fontFamily: 'JetBrains Mono, monospace', margin: '2px 0 0' }}>
        {rJointN.toFixed(0)} N
      </div>
      <div style={{ fontSize: '0.64rem', fontWeight: 600, color: trendelenburg ? RED_ACCENT : TEAL_ACCENT }}>
        {rJointKgf.toFixed(1)} kgf en cabeza femoral
      </div>
      <div style={{ fontSize: '0.54rem', color: '#64748b', marginTop: '4px' }}>
        {trendelenburg ? '⚠️ Basculación activa (Caída contralateral)' : '✓ Equilibrio monopodal estable'}
      </div>
    </div>
  );
}

// ── 3. Diagrama de Polígono Vectorial Cerrado ΣF = 0 (SVG Interactivo) ──
function VectorPolygonCard({
  fAbductorN,
  wbN,
  rJointN,
  trendelenburg,
}: {
  fAbductorN: number;
  wbN: number;
  rJointN: number;
  trendelenburg: boolean;
}) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${trendelenburg ? RED_ACCENT : '#cbd5e1'}`,
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 6px 20px rgba(35, 44, 54, 0.14)',
        minWidth: '160px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: trendelenburg ? RED_ACCENT : '#232c36', marginBottom: '6px', textAlign: 'center' }}>
        {trendelenburg ? '⚠️ POLÍGONO ABIERTO (ΣF ≠ 0)' : 'POLÍGONO VECTORIAL (ΣF = 0)'}
      </div>

      {/* Dibujo Vectorial SVG de Triángulo Cerrado */}
      <svg width="140" height="90" viewBox="0 0 140 90" style={{ display: 'block', margin: '0 auto' }}>
        {/* Origen (0,0) proyectado en el SVG */}
        <defs>
          <marker id="arrow-fa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={RED_ACCENT} />
          </marker>
          <marker id="arrow-wb" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={AMBER_ACCENT} />
          </marker>
          <marker id="arrow-r" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={TEAL_ACCENT} />
          </marker>
        </defs>

        {!trendelenburg ? (
          // Polígono cerrado perfecto
          <g>
            {/* Vector Wb (Hacia abajo) */}
            <line x1="95" y1="12" x2="95" y2="78" stroke={AMBER_ACCENT} strokeWidth="2.5" markerEnd="url(#arrow-wb)" />
            <text x="100" y="48" fontSize="8" fill={AMBER_ACCENT} fontWeight="bold" fontFamily="JetBrains Mono, monospace">Wb</text>

            {/* Vector Fa (Hacia arriba-izquierda a 70°) */}
            <line x1="95" y1="78" x2="32" y2="12" stroke={RED_ACCENT} strokeWidth="2.5" markerEnd="url(#arrow-fa)" />
            <text x="48" y="58" fontSize="8" fill={RED_ACCENT} fontWeight="bold" fontFamily="JetBrains Mono, monospace">Fa (70°)</text>

            {/* Vector R (Cierra hacia abajo-derecha) */}
            <line x1="32" y1="12" x2="95" y2="12" stroke={TEAL_ACCENT} strokeWidth="2.5" markerEnd="url(#arrow-r)" />
            <text x="60" y="9" fontSize="8" fill={TEAL_ACCENT} fontWeight="bold" fontFamily="JetBrains Mono, monospace">R</text>

            <circle cx="95" cy="12" r="3" fill="#232c36" />
            <circle cx="95" cy="78" r="3" fill={AMBER_ACCENT} />
            <circle cx="32" cy="12" r="3" fill={TEAL_ACCENT} />
          </g>
        ) : (
          // Polígono abierto con brecha de momento no compensado
          <g>
            {/* Vector Wb (Hacia abajo) */}
            <line x1="95" y1="12" x2="95" y2="78" stroke={AMBER_ACCENT} strokeWidth="2.5" markerEnd="url(#arrow-wb)" />
            <text x="100" y="48" fontSize="8" fill={AMBER_ACCENT} fontWeight="bold" fontFamily="JetBrains Mono, monospace">Wb</text>

            {/* Vector Fa reducido/débil */}
            <line x1="95" y1="78" x2="80" y2="60" stroke={RED_ACCENT} strokeWidth="2" strokeDasharray="3 2" markerEnd="url(#arrow-fa)" />
            <text x="56" y="70" fontSize="7" fill={RED_ACCENT} fontFamily="JetBrains Mono, monospace">Fa (25%)</text>

            {/* Brecha / Desbalance */}
            <line x1="80" y1="60" x2="95" y2="12" stroke="#e11d48" strokeWidth="2" strokeDasharray="2 2" />
            <text x="42" y="32" fontSize="7.5" fill="#e11d48" fontWeight="bold">Δτ ≠ 0 (Caída)</text>
          </g>
        )}
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.56rem', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
        <div style={{ color: RED_ACCENT, display: 'flex', justifyContent: 'space-between' }}>
          <span>Fa (Glúteos):</span> <b>{fAbductorN.toFixed(0)} N</b>
        </div>
        <div style={{ color: AMBER_ACCENT, display: 'flex', justifyContent: 'space-between' }}>
          <span>Wb (5/6 W):</span> <b>{wbN.toFixed(0)} N</b>
        </div>
        <div style={{ color: TEAL_ACCENT, display: 'flex', justifyContent: 'space-between' }}>
          <span>R (Acetábulo):</span> <b>{rJointN.toFixed(0)} N</b>
        </div>
      </div>
    </div>
  );
}

// ── 4. Modelo Anatómico 3D de Cadera, Pelvis y Músculos Abductores ──
function HipAnatomy3D({
  bodyMassKg,
  trendelenburg,
  showBreakdown,
}: HipCanvasProps) {
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_hip_leg.glb') as any;

  const pelvisGroupRef = useRef<THREE.Group | null>(null);
  const currentTiltRef = useRef<number>(0);

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

  const tendonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(TENDON_PEARL),
        roughness: 0.35,
        metalness: 0.1,
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

  const muscleWeakMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(MUSCLE_INACTIVE),
        roughness: 0.72,
        metalness: 0.05,
        transparent: true,
        opacity: 0.55,
      }),
    []
  );

  // ── Cálculos Biomecánicos de Apoyo Monopodal (Pauwels) ──
  const g = 9.81;
  const totalWeightN = bodyMassKg * g;
  // Peso suprayacente + pierna suspendida = Wb = (5/6) * W
  const wbN = (5 / 6) * totalWeightN;

  const bwM = 0.18; // 18 cm al centro de gravedad
  const bmM = 0.07; // 7 cm al trocánter mayor
  const thetaMRad = (70 * Math.PI) / 180;
  const sin70 = Math.sin(thetaMRad);
  const cos70 = Math.cos(thetaMRad);

  // Fuerza de abductores Fa
  const fAbductorN = trendelenburg
    ? (wbN * bwM * 0.25) / (bmM * sin70)
    : (wbN * bwM) / (bmM * sin70);

  // Reacción acetabular R
  const rxN = fAbductorN * cos70;
  const ryN = fAbductorN * sin70 + wbN;
  const rJointN = Math.hypot(rxN, ryN);

  // Animación suave del signo de Trendelenburg (LERP senoidal)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const targetTilt = trendelenburg ? 0.24 + 0.025 * Math.sin(t * 3.5) : 0;
    currentTiltRef.current += (targetTilt - currentTiltRef.current) * Math.min(1, delta * 6);

    if (pelvisGroupRef.current) {
      // Rotación en eje Z alrededor de la cabeza femoral derecha de apoyo
      pelvisGroupRef.current.rotation.z = -currentTiltRef.current;
    }
  });

  // Escala calibrada para los vectores 3D en la anatomía ósea
  const vectorScale = 0.00030;

  // Vectores 3D orientados anatómicamente
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

  const MODEL_SCALE = 4.7;

  return (
    <group position={[0, -0.05, 0]}>
      {/* ── 1. SEGMENTO FIJO DE APOYO: Fémur Derecho y Extremidad Inferior ── */}
      <group scale={MODEL_SCALE} position={[0, 0, 0]}>
        <group position={[-P_HIP_R.x, -P_HIP_R.y, -P_HIP_R.z]}>
          {boneNodes?.femur_R && <mesh geometry={boneNodes.femur_R.geometry} material={boneMat} />}
          {boneNodes?.patella_R && <mesh geometry={boneNodes.patella_R.geometry} material={boneMat} />}
          {boneNodes?.tibia_R && <mesh geometry={boneNodes.tibia_R.geometry} material={boneMat} />}
          {boneNodes?.fibula_R && <mesh geometry={boneNodes.fibula_R.geometry} material={boneMat} />}
        </group>

        {/* Cartílago articular esférico en cabeza femoral */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.0195, 24, 24]} />
          <primitive object={cartilageMat} attach="material" />
        </mesh>
      </group>

      {/* ── 2. SEGMENTO MÓVIL: Pelvis Completa y Pierna Libre (Bascula con Trendelenburg) ── */}
      <group ref={pelvisGroupRef} position={[0, 0, 0]}>
        <group scale={MODEL_SCALE}>
          <group position={[-P_HIP_R.x, -P_HIP_R.y, -P_HIP_R.z]}>
            {/* Pelvis Ósea */}
            {boneNodes?.hip_R && <mesh geometry={boneNodes.hip_R.geometry} material={pelvisMat} />}
            {boneNodes?.hip_L && <mesh geometry={boneNodes.hip_L.geometry} material={pelvisMat} />}
            {boneNodes?.sacrum && <mesh geometry={boneNodes.sacrum.geometry} material={pelvisMat} />}
            {boneNodes?.lumbar5 && <mesh geometry={boneNodes.lumbar5.geometry} material={pelvisMat} />}

            {/* Pierna contralateral libre (suspendida) */}
            {boneNodes?.femur_L && (
              <mesh
                geometry={boneNodes.femur_L.geometry}
                material={boneMat}
                position={[0, 0.015, -0.01]}
                rotation={[0.12, 0, -0.05]}
              />
            )}

            {/* Músculo Glúteo Medio y Menor Real de BodyParts3D con tendón */}
            {muscleNodes?.gluteus_medius_R && (
              <mesh
                geometry={muscleNodes.gluteus_medius_R.geometry}
                material={trendelenburg ? muscleWeakMat : muscleActiveMat}
              />
            )}
            {muscleNodes?.gluteus_minimus_R && (
              <mesh
                geometry={muscleNodes.gluteus_minimus_R.geometry}
                material={trendelenburg ? muscleWeakMat : muscleActiveMat}
              />
            )}
          </group>
        </group>

        {/* Marcador del Centro de Gravedad CG (Wb) */}
        <mesh position={wbOrigin3D}>
          <sphereGeometry args={[0.028, 20, 20]} />
          <meshStandardMaterial color={AMBER_ACCENT} emissive={AMBER_ACCENT} emissiveIntensity={0.5} />
        </mesh>

        {/* Vector Peso del Cuerpo Wb */}
        <ForceVector3D origin={wbOrigin3D} vector={wbVec3D} color={AMBER_ACCENT} symbol="Wb" />

        {/* Guía acotada del brazo de palanca bw = 18 cm */}
        <Line
          points={[
            [0, 0.22, 0],
            wbOrigin3D,
          ]}
          color={AMBER_ACCENT}
          lineWidth={1.4}
          dashed
          dashScale={14}
          dashSize={0.05}
          gapSize={0.03}
        />
      </group>

      {/* ── 3. VECTORES DE FUERZA Y REACCIÓN EN 3D ── */}

      {/* Vector Fa (Abductores / Glúteo Medio) a 70° */}
      <ForceVector3D
        origin={[-0.30, 0.06, 0]}
        vector={faVec3D}
        color={trendelenburg ? '#e28880' : RED_ACCENT}
        symbol={trendelenburg ? 'Fa ⚠' : 'Fa'}
      />

      {/* Guía acotada del brazo bm = 7 cm */}
      <Line
        points={[
          [0, 0, 0],
          [-0.30, 0.06, 0],
        ]}
        color={RED_ACCENT}
        lineWidth={1.4}
        dashed
        dashScale={14}
        dashSize={0.05}
        gapSize={0.03}
      />

      {/* Vector Reacción Articular R (Cabeza Femoral / Acetábulo) */}
      <ForceVector3D
        origin={[0, 0, 0]}
        vector={rVec3D}
        color={TEAL_ACCENT}
        symbol="R"
        showComponents={showBreakdown}
      />

      {/* Desglose Rx y Ry si showBreakdown es true */}
      {showBreakdown && (
        <group>
          {/* Componente Rx */}
          <ForceVector3D
            origin={[0, 0, 0]}
            vector={[-rxN * vectorScale, 0, 0]}
            color="#0284c7"
            symbol="Rx"
            isDashed
          />
          {/* Componente Ry */}
          <ForceVector3D
            origin={[-rxN * vectorScale, 0, 0]}
            vector={[0, -ryN * vectorScale, 0]}
            color={TEAL_ACCENT}
            symbol="Ry"
            isDashed
          />
        </group>
      )}

      {/* Sombra de contacto del pie derecho en el suelo */}
      <ContactShadows position={[0, -2.45, 0]} opacity={0.62} scale={3.6} blur={1.6} far={4} color="#241d12" />
    </group>
  );
}

// Física de Pauwels (idéntica a la de HipAnatomy3D) para las tarjetas overlay.
function hipStatics(bodyMassKg: number, trendelenburg: boolean) {
  const g = 9.81;
  const totalWeightN = bodyMassKg * g;
  const wbN = (5 / 6) * totalWeightN;
  const sin70 = Math.sin((70 * Math.PI) / 180);
  const cos70 = Math.cos((70 * Math.PI) / 180);
  const fAbductorN = trendelenburg
    ? (wbN * 0.18 * 0.25) / (0.07 * sin70)
    : (wbN * 0.18) / (0.07 * sin70);
  const rxN = fAbductorN * cos70;
  const ryN = fAbductorN * sin70 + wbN;
  const rJointN = Math.hypot(rxN, ryN);
  return { totalWeightN, wbN, fAbductorN, rJointN, rJointKgf: rJointN / g };
}

// ── 5. Componente Principal HipCanvas con Escena 3D y Controles ──
export default function HipCanvas({
  bodyMassKg = 70,
  trendelenburg = false,
  showBreakdown = true,
}: HipCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { wbN, fAbductorN, rJointN, rJointKgf } = hipStatics(bodyMassKg, trendelenburg);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
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
          fontSize: '0.6rem',
          fontWeight: 600,
          color: 'var(--ink, #232c36)',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(4px)',
        }}
      >
        📷 Cámara
      </button>

      {/* Canvas 3D de React Three Fiber */}
      <Canvas
        camera={{ position: [0.5, 0.15, 4.7], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: STUDIO_BG_DEEP }}
      >
        <StudioLights keyIntensity={1.55} />

        <Suspense fallback={null}>
          <HipAnatomy3D
            bodyMassKg={bodyMassKg}
            trendelenburg={trendelenburg}
            showBreakdown={showBreakdown}
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
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* ── Overlays de datos anclados a las esquinas (fuera del 3D, sin recortes) ── */}
      <div style={{ position: 'absolute', left: '10px', bottom: '10px', zIndex: 9, transform: 'scale(0.74)', transformOrigin: 'bottom left' }}>
        <VectorPolygonCard fAbductorN={fAbductorN} wbN={wbN} rJointN={rJointN} trendelenburg={trendelenburg} />
      </div>
      <div style={{ position: 'absolute', right: '10px', bottom: '10px', zIndex: 9, transform: 'scale(0.74)', transformOrigin: 'bottom right' }}>
        <AcetabularGauge rJointN={rJointN} rJointKgf={rJointKgf} trendelenburg={trendelenburg} maxR={3000} />
      </div>
    </div>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_hip_leg.glb');
