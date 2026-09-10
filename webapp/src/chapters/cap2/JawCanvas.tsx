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

interface JawCanvasProps {
  biteMode: 'incisor' | 'molar'; // Mordida incisiva (anterior) vs molar (posterior)
  muscleForceN: number;          // Fuerza del masetero/temporal en N (100 a 800 N, default 450 N)
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

interface FractureParticle3D {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  vRot: THREE.Vector3;
  size: number;
  color: THREE.Color;
  life: number;
  maxLife: number;
}

// ── 1. Vector de Fuerza 3D Profesional con Shaft, Cono y Badge HTML ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [0, 1, 0] as [number, number, number],
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

  const headLen = Math.min(0.20, Math.max(0.065, len * 0.20));
  const headRadius = headLen * 0.32;
  const shaftLen = Math.max(0.015, len - headLen);
  const shaftRadius = 0.014;

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

      {/* Cabeza cónica */}
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
        position={[tipPos.x + dir.x * 0.10, tipPos.y + dir.y * 0.10, tipPos.z + dir.z * 0.10]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── 2. Manómetro / Dinamómetro Analógico de Mordida Mandibular ──
function BiteDynamometerGauge({
  fBiteN,
  fBiteKgf,
  muscleForceN,
  biteMode,
  rAtmN,
}: {
  fBiteN: number;
  fBiteKgf: number;
  muscleForceN: number;
  biteMode: 'incisor' | 'molar';
  rAtmN: number;
}) {
  const maxScale = 1200;
  const normVal = Math.min(1, Math.max(0, fBiteN / maxScale));
  const needleAngle = -135 + normVal * 270;

  const isCrushing = fBiteN > 600;
  const statusColor = isCrushing ? '#ef4444' : (fBiteN > 300 ? '#f59e0b' : '#10b981');

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        border: `1.5px solid ${isCrushing ? '#ef4444' : '#cbd5e1'}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: isCrushing ? '0 8px 24px rgba(239, 68, 68, 0.25)' : '0 8px 24px rgba(35, 44, 54, 0.12)',
        minWidth: '175px',
        textAlign: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {biteMode === 'molar' ? 'Dinamometría Molar (Trituración)' : 'Dinamometría Incisiva (Corte)'}
      </div>

      {/* SVG Dial */}
      <svg width="130" height="78" viewBox="0 0 130 78" style={{ margin: '4px auto 0', display: 'block' }}>
        <path d="M 18 68 A 47 47 0 0 1 112 68" fill="none" stroke="#e2e8f0" strokeWidth="8.5" strokeLinecap="round" />

        {/* Sector Verde (0 - 300 N) */}
        <path d="M 18 68 A 47 47 0 0 1 48 27" fill="none" stroke="#10b981" strokeWidth="8.5" opacity={0.35} />
        {/* Sector Ámbar (300 - 600 N) */}
        <path d="M 48 27 A 47 47 0 0 1 82 27" fill="none" stroke="#f59e0b" strokeWidth="8.5" opacity={0.35} />
        {/* Sector Rojo (> 600 N Trituración Máxima) */}
        <path d="M 82 27 A 47 47 0 0 1 112 68" fill="none" stroke="#ef4444" strokeWidth="8.5" opacity={0.35} />

        {/* Arco dinámico */}
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

        {/* Aguja indicadora */}
        <g transform={`rotate(${needleAngle} 65 68)`} style={{ transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="65" y1="68" x2="65" y2="26" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="65" cy="68" r="5" fill="#1e293b" />
          <circle cx="65" cy="68" r="2.2" fill="#ffffff" />
        </g>

        <text x="14" y="76" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace" fontWeight="600">0</text>
        <text x="56" y="16" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace" fontWeight="600">600N</text>
        <text x="96" y="76" fontSize="7" fill="#64748b" fontFamily="JetBrains Mono, monospace" fontWeight="600">1200N</text>
      </svg>

      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColor, fontFamily: 'JetBrains Mono, monospace', margin: '2px 0 0' }}>
        {fBiteN.toFixed(0)} N
      </div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: statusColor, fontFamily: 'JetBrains Mono, monospace' }}>
        ({fBiteKgf.toFixed(1)} kgf)
      </div>

      <div
        style={{
          fontSize: '0.58rem',
          fontWeight: 800,
          color: statusColor,
          marginTop: '4px',
          background: isCrushing ? 'rgba(239,68,68,0.10)' : (fBiteN > 300 ? 'rgba(245,158,11,0.10)' : 'rgba(16,185,129,0.10)'),
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        {isCrushing ? '💥 TRITURACIÓN MÁXIMA (>600 N)' : (fBiteN > 300 ? '⚡ Masticación Fuerte' : '🦷 Corte Fisiológico')}
      </div>
      <div style={{ fontSize: '0.52rem', color: '#64748b', marginTop: '3px' }}>
        Fm: <b>{muscleForceN} N</b> · R_atm: <b>{rAtmN.toFixed(0)} N</b>
      </div>
    </div>
  );
}

// ── 3. Músculo Masetero 3D Contorneado con Estrías y Abombamiento Dinámico ──
function MasseterMuscle3D({
  zygomaPos,
  gonionPos,
  muscleForceN,
  side = 1,
}: {
  zygomaPos: [number, number, number];
  gonionPos: [number, number, number];
  muscleForceN: number;
  side?: number; // 1 para derecho, -1 para izquierdo
}) {
  const pOrigin = useMemo(() => new THREE.Vector3(...zygomaPos), [zygomaPos]);
  const pInsert = useMemo(() => new THREE.Vector3(...gonionPos), [gonionPos]);

  const dir = useMemo(() => new THREE.Vector3().subVectors(pInsert, pOrigin), [pInsert, pOrigin]);
  const len = dir.length();
  const mid = useMemo(() => new THREE.Vector3().addVectors(pOrigin, pInsert).multiplyScalar(0.5), [pOrigin, pInsert]);

  // Abultamiento muscular fisiológico proporcional a Fm
  const bulgeRatio = 1.0 + (muscleForceN / 800) * 0.45;
  const lateralOffset = 0.045 * side * bulgeRatio;

  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    if (len > 0.001) {
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    }
    return q;
  }, [dir, len]);

  const muscleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b91c1c'),
        roughness: 0.48,
        metalness: 0.08,
        emissive: new THREE.Color('#7f1d1d'),
        emissiveIntensity: 0.35 + (muscleForceN / 800) * 0.35,
      }),
    [muscleForceN]
  );

  const tendonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f5f0e6'),
        roughness: 0.35,
        metalness: 0.1,
      }),
    []
  );

  return (
    <group>
      {/* Vientre muscular principal elipsoide/cilíndrico con abombamiento lateral */}
      <mesh
        position={[mid.x + lateralOffset, mid.y, mid.z]}
        quaternion={quat}
        scale={[1.3 * bulgeRatio, 1.0, 0.9 * bulgeRatio]}
      >
        <cylinderGeometry args={[0.075, 0.065, len * 0.75, 20]} />
        <primitive object={muscleMat} attach="material" />
      </mesh>

      {/* Tendón de origen en el arco cigomático */}
      <mesh
        position={[pOrigin.x + lateralOffset * 0.4, pOrigin.y - len * 0.08, pOrigin.z]}
        quaternion={quat}
      >
        <cylinderGeometry args={[0.068, 0.075, len * 0.20, 16]} />
        <primitive object={tendonMat} attach="material" />
      </mesh>

      {/* Tendón de inserción en el ángulo goníaco mandibular */}
      <mesh
        position={[pInsert.x + lateralOffset * 0.4, pInsert.y + len * 0.08, pInsert.z]}
        quaternion={quat}
      >
        <cylinderGeometry args={[0.065, 0.055, len * 0.20, 16]} />
        <primitive object={tendonMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── 4. Escena 3D del Complejo Mandíbula - ATM - Cráneo con Mallas Reales ──
/** Palanca mandibular (determinista). */
function jawStats(biteMode: JawCanvasProps['biteMode'], muscleForceN: number) {
  const dMuscM = 0.050;
  const dBiteM = biteMode === 'incisor' ? 0.075 : 0.035;
  const fBiteN = (muscleForceN * dMuscM) / dBiteM;
  const rAtmN = Math.abs(muscleForceN - fBiteN);
  return { fBiteN, fBiteKgf: fBiteN / 9.81, rAtmN, rAtmKgf: rAtmN / 9.81 };
}

function Jaw3DScene({
  biteMode,
  muscleForceN,
}: JawCanvasProps) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;

  const mandibleGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const particlesDataRef = useRef<FractureParticle3D[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);

  // Física del sistema de palanca mandibular
  const dMuscM = 0.050; // 5.0 cm inserción masetero respecto a ATM
  const dBiteM = biteMode === 'incisor' ? 0.075 : 0.035; // 7.5 cm (incisivos) vs 3.5 cm (molares)
  const mechAdv = dMuscM / dBiteM; // 0.667 vs 1.429

  // Equilibrio de momentos (Σ M_ATM = 0):
  const fBiteN = (muscleForceN * dMuscM) / dBiteM;
  const fBiteKgf = fBiteN / 9.81;

  // Reacción condilar ATM (Σ Fy = 0):
  const rAtmN = Math.abs(muscleForceN - fBiteN);
  const rAtmKgf = rAtmN / 9.81;

  // Letreros del riel lateral (mismos valores que llenaban el DclReadout de esquina).
  const lFm = `Fm = ${muscleForceN.toFixed(0)} N`;
  const lFmord = `F_mord = ${fBiteN.toFixed(0)} N`;
  const lRatm = `R_ATM = ${rAtmN.toFixed(0)} N`;

  // Escala anatómica general
  const SKULL_SCALE = 16.0;

  // TMJ Condyle pivot en coordenadas de human_body.glb
  const TMJ_PIVOT_X = 0.0042;
  const TMJ_PIVOT_Y = 0.4230;
  const TMJ_PIVOT_Z = 0.0040;

  // Materiales anatómicos
  const boneSkullMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f5ecd8'),
        roughness: 0.58,
        metalness: 0.04,
      }),
    []
  );

  const boneMandibleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ede2ca'),
        roughness: 0.60,
        metalness: 0.04,
      }),
    []
  );

  const cartilageAtmMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#34d399'),
        roughness: 0.22,
        metalness: 0.12,
        transparent: true,
        opacity: 0.88,
        emissive: new THREE.Color('#059669'),
        emissiveIntensity: 0.4,
      }),
    []
  );

  const toothMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffffff'),
        roughness: 0.30,
        metalness: 0.05,
      }),
    []
  );

  // Apertura angular de la mandíbula según modo de mordida
  // Al masticar, la mandíbula se cierra más fuertemente contra el alimento
  const foodCompression = Math.min(0.40, (fBiteN / 1200) * 0.40);
  const baseJawAngle = biteMode === 'incisor' ? 0.075 : 0.055;
  const targetJawAngle = Math.max(0.015, baseJawAngle * (1 - foodCompression * 0.6));

  const curJawAngleRef = useRef<number>(0.06);

  // Posición del alimento (Incisivos vs Molares)
  // Incisor: Z ~ 0.72, Molar: Z ~ 0.35, Y ~ -0.45
  const foodPos = useMemo<[number, number, number]>(() => {
    if (biteMode === 'incisor') {
      return [0.08, -0.44, 0.71];
    } else {
      return [0.28, -0.42, 0.34];
    }
  }, [biteMode]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    curJawAngleRef.current += (targetJawAngle - curJawAngleRef.current) * Math.min(1, delta * 10);

    if (mandibleGroupRef.current) {
      mandibleGroupRef.current.rotation.x = curJawAngleRef.current;
    }

    // Partículas de fractura en 3D
    const particles = particlesDataRef.current;
    const now = performance.now();

    if (fBiteN > 350 && now - lastSpawnTimeRef.current > 70) {
      lastSpawnTimeRef.current = now;
      const spawnCount = biteMode === 'molar' && fBiteN > 600 ? 5 : 3;
      const palette =
        biteMode === 'incisor'
          ? ['#86efac', '#bbf7d0', '#ffffff', '#4ade80', '#22c55e']
          : ['#fed7aa', '#ffedd5', '#ea580c', '#fdba74', '#c2410c'];

      for (let i = 0; i < spawnCount; i++) {
        const pColor = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
        const angleTheta = Math.random() * Math.PI * 2;
        const anglePhi = (Math.random() - 0.5) * Math.PI * 0.8;
        const speed = (0.6 + Math.random() * 1.4) * (fBiteN / 600);

        particles.push({
          pos: new THREE.Vector3(
            foodPos[0] + (Math.random() - 0.5) * 0.08,
            foodPos[1] + (Math.random() - 0.5) * 0.05,
            foodPos[2] + (Math.random() - 0.5) * 0.08
          ),
          vel: new THREE.Vector3(
            Math.cos(angleTheta) * Math.cos(anglePhi) * speed,
            Math.sin(anglePhi) * speed + 0.5,
            Math.sin(angleTheta) * Math.cos(anglePhi) * speed
          ),
          rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
          vRot: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10),
          size: 0.018 + Math.random() * 0.024,
          color: pColor,
          life: 0,
          maxLife: 0.45 + Math.random() * 0.35,
        });
      }
    }

    // Actualizar física de partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }
      p.pos.addScaledVector(p.vel, delta);
      p.vel.y -= 4.2 * delta; // Gravedad
      p.rot.x += p.vRot.x * delta;
      p.rot.y += p.vRot.y * delta;
    }
  });

  // Puntos clave de vectores 3D
  // Origen del masetero (en arco cigomático derecho): [0.44, 0.12, 0.44]
  // Inserción del masetero (en ángulo mandibular derecho): [0.42, -0.62, 0.10]
  const zygomaRightPos: [number, number, number] = [0.44, 0.12, 0.44];
  const gonionRightPos: [number, number, number] = [0.42, -0.62, 0.10];

  const zygomaLeftPos: [number, number, number] = [-0.44, 0.12, 0.44];
  const gonionLeftPos: [number, number, number] = [-0.42, -0.62, 0.10];

  // Vectores DCL
  const fmVecLen = Math.min(0.90, 0.25 + (muscleForceN / 800) * 0.65);
  const dirFm = new THREE.Vector3().subVectors(new THREE.Vector3(...zygomaRightPos), new THREE.Vector3(...gonionRightPos)).normalize();
  const vFm: [number, number, number] = [dirFm.x * fmVecLen, dirFm.y * fmVecLen, dirFm.z * fmVecLen];

  const biteVecLen = Math.min(0.95, 0.28 + (fBiteN / 1200) * 0.65);
  const vBite: [number, number, number] = [0, -biteVecLen, 0];

  const rAtmVecLen = Math.min(0.70, 0.18 + (rAtmN / 800) * 0.48);
  const isAtmDownward = muscleForceN > fBiteN;
  const vRAtm: [number, number, number] = [0, isAtmDownward ? -rAtmVecLen : rAtmVecLen, 0];

  return (
    <group position={[0, 0.1, 0]}>
      {/* ── 1. CRÁNEO Y MAXILAR SUPERIOR FIJO (Segmento Estático) ── */}
      <group position={[0, 0, 0]}>
        {/* Mallas del cráneo de human_body.glb */}
        <group scale={SKULL_SCALE} position={[-TMJ_PIVOT_X * SKULL_SCALE, -TMJ_PIVOT_Y * SKULL_SCALE, -TMJ_PIVOT_Z * SKULL_SCALE]}>
          {nodes?.frontal && <mesh geometry={nodes.frontal.geometry} material={boneSkullMat} />}
          {nodes?.parietal_L && <mesh geometry={nodes.parietal_L.geometry} material={boneSkullMat} />}
          {nodes?.parietal_R && <mesh geometry={nodes.parietal_R.geometry} material={boneSkullMat} />}
          {nodes?.temporal_L && <mesh geometry={nodes.temporal_L.geometry} material={boneSkullMat} />}
          {nodes?.temporal_R && <mesh geometry={nodes.temporal_R.geometry} material={boneSkullMat} />}
          {nodes?.occipital && <mesh geometry={nodes.occipital.geometry} material={boneSkullMat} />}
          {nodes?.sphenoid && <mesh geometry={nodes.sphenoid.geometry} material={boneSkullMat} />}
          {nodes?.zygomatic_L && <mesh geometry={nodes.zygomatic_L.geometry} material={boneSkullMat} />}
          {nodes?.zygomatic_R && <mesh geometry={nodes.zygomatic_R.geometry} material={boneSkullMat} />}
          {nodes?.maxilla_L && <mesh geometry={nodes.maxilla_L.geometry} material={boneSkullMat} />}
          {nodes?.maxilla_R && <mesh geometry={nodes.maxilla_R.geometry} material={boneSkullMat} />}
          {nodes?.nasal_L && <mesh geometry={nodes.nasal_L.geometry} material={boneSkullMat} />}
          {nodes?.nasal_R && <mesh geometry={nodes.nasal_R.geometry} material={boneSkullMat} />}
        </group>

        {/* Articulación Temporomandibular (ATM): Menisco / Disco Articular de Fibrocartílago Bicóncavo */}
        {/* ATM Derecha */}
        <group position={[0.38, 0.02, 0.05]}>
          <mesh rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.028, 20]} />
            <primitive object={cartilageAtmMat} attach="material" />
          </mesh>
          <DclTag position={[0.22, 0.08, 0]} color="#047857" symbol="ATM · fulcro" />
        </group>

        {/* ATM Izquierda */}
        <group position={[-0.38, 0.02, 0.05]}>
          <mesh rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.028, 20]} />
            <primitive object={cartilageAtmMat} attach="material" />
          </mesh>
        </group>

      </group>

      {/* ── 2. MANDÍBULA MÓVIL (Pivota en el eje de la ATM) ── */}
      <group ref={mandibleGroupRef} position={[0, 0, 0]}>
        {/* Malla de la Mandíbula de human_body.glb */}
        {nodes?.mandible ? (
          <group scale={SKULL_SCALE} position={[-TMJ_PIVOT_X * SKULL_SCALE, -TMJ_PIVOT_Y * SKULL_SCALE, -TMJ_PIVOT_Z * SKULL_SCALE]}>
            <mesh geometry={nodes.mandible.geometry} material={boneMandibleMat} />
          </group>
        ) : (
          /* Fallback mandibular anatómico */
          <group position={[0, -0.45, 0.35]}>
            <mesh>
              <boxGeometry args={[0.65, 0.25, 0.65]} />
              <primitive object={boneMandibleMat} attach="material" />
            </mesh>
          </group>
        )}

      </group>

      {/* ── 3. MÚSCULO MASETERO ACTIVO (Bilateral con Contracción y Abombamiento) ── */}
      <MasseterMuscle3D
        zygomaPos={zygomaRightPos}
        gonionPos={gonionRightPos}
        muscleForceN={muscleForceN}
        side={1}
      />
      <MasseterMuscle3D
        zygomaPos={zygomaLeftPos}
        gonionPos={gonionLeftPos}
        muscleForceN={muscleForceN}
        side={-1}
      />

      {/* ── 4. ALIMENTO ENTRE LOS DIENTES Y FRACTURA FÍSICA ── */}
      <group position={foodPos}>
        {/* Pieza de Alimento comprimida dinámicamente */}
        <mesh scale={[1.0 + foodCompression * 0.4, Math.max(0.35, 1.0 - foodCompression * 0.7), 1.0 + foodCompression * 0.4]}>
          {biteMode === 'incisor' ? (
            /* Alimento Incisivo: Rodaja vegetal / manzana verde */
            <cylinderGeometry args={[0.075, 0.075, 0.065, 20]} />
          ) : (
            /* Alimento Molar: Nuez / Galleta dura / Crack */
            <boxGeometry args={[0.11, 0.08, 0.11]} />
          )}
          <meshStandardMaterial
            color={biteMode === 'incisor' ? '#22c55e' : '#f97316'}
            roughness={0.45}
            metalness={0.05}
            emissive={biteMode === 'incisor' ? '#15803d' : '#c2410c'}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Líneas de fractura sobre el alimento si la fuerza supera 350 N */}
        {fBiteN > 350 && (
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.09, 0.05]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} wireframe />
          </mesh>
        )}

        {/* Punto de mordida · brazo de resistencia según el diente */}
        <DclTag
          position={[0, 0.14, 0]}
          color={biteMode === 'incisor' ? '#16a34a' : '#ea580c'}
          symbol={biteMode === 'incisor' ? '🥕 d 7,5 cm' : '🥜 d 3,5 cm'}
        />
      </group>

      {/* Partículas 3D de fractura eyectadas */}
      <group ref={particlesGroupRef}>
        {particlesDataRef.current.map((p, idx) => (
          <mesh
            key={idx}
            position={[p.pos.x, p.pos.y, p.pos.z]}
            rotation={[p.rot.x, p.rot.y, p.rot.z]}
            scale={[p.size, p.size, p.size]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={p.color} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ── 5. VECTORES BIOMECÁNICOS DCL (Fm, F_mord, R_ATM) ── */}
      <ForceVector3D origin={gonionRightPos} vector={vFm} color="#b91c1c" label={lFm} sub="masetero" />
      <ForceVector3D origin={[foodPos[0], foodPos[1] + 0.05, foodPos[2]]} vector={vBite} color="#0d6e64" label={lFmord} sub={`${fBiteKgf.toFixed(0)} kgf`} emphasis="strong" />
      <ForceVector3D origin={[0.38, 0.02, 0.05]} vector={vRAtm} color="#43505c" label={lRatm} sub="reacción del cóndilo" />

      <CalloutSource />

      {/* Sombra de contacto en el suelo */}
      <ContactShadows position={[0, -1.35, 0]} opacity={0.62} scale={4.0} blur={1.9} far={3.0} color="#241d12" />
    </group>
  );
}

// ── 5. Componente Principal Exportado JawCanvas ──
export default function JawCanvas({
  showLabels = false,
  biteMode = 'incisor',
  muscleForceN = 450,
}: JawCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const j = jawStats(biteMode, muscleForceN);
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
        camera={{ position: [2.05, 0.62, 2.32], fov: 46 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: STUDIO_BG_DEEP }}
      >
        <StudioLights keyIntensity={1.6} />

        <Suspense fallback={null}>
          <Jaw3DScene
            biteMode={biteMode}
            muscleForceN={muscleForceN}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.4}
          maxDistance={5.5}
          maxPolarAngle={Math.PI / 2 + 0.15}
          dampingFactor={0.08}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas del DCL → riel lateral con línea guía a cada flecha */}
      <CalloutRail
        store={callouts}
        side="left"
        note={
          biteMode === 'incisor'
            ? 'Incisivos (d ≈ 7,5 cm): brazo de resistencia largo ⟹ mordida débil.'
            : 'Molares (d ≈ 3,5 cm): muy cerca del fulcro (ATM) ⟹ mordida potente.'
        }
      />

      {/* Dinamómetro anclado a la esquina (fuera del 3D) */}
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
        <BiteDynamometerGauge
          fBiteN={j.fBiteN}
          fBiteKgf={j.fBiteKgf}
          muscleForceN={muscleForceN}
          biteMode={biteMode}
          rAtmN={j.rAtmN}
        />
      </div>
    </div>
    </CalloutProvider>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
