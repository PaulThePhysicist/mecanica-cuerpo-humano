import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { FitCameraResize as FitCamera } from './three/FitCameraResize';
import { DclTag } from './DclReadout';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

interface ForcePlateCanvasProps {
  gaitPhase: 'heel_strike' | 'mid_stance' | 'toe_off';
  bodyMassKg: number;
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

interface GaitPhaseConfig {
  name: string;
  badge: string;
  fzMult: number;
  fyN: number;
  fxN: number;
  copRelX: number; // 0 (medial) to 1 (lateral)
  copRelZ: number; // -1 (heel) to +1 (toes)
  peakPressureKPa: number;
  pitchDeg: number;  // Ankle/foot pitch: >0 dorsiflexion (heel down), <0 plantarflexion (heel up)
  tibiaDeg: number;  // Tibia tilt: <0 backward, >0 forward
  heelElevM: number; // Heel vertical lift in meters
  desc: string;
}

const GAIT_CONFIG: Record<string, GaitPhaseConfig> = {
  heel_strike: {
    name: 'Contacto Inicial (Heel Strike)',
    badge: 'FRENADO (Fy < 0)',
    fzMult: 1.15,
    fyN: -125,
    fxN: 15,
    copRelX: 0.08,
    copRelZ: -0.52,
    peakPressureKPa: 290,
    pitchDeg: 12,
    tibiaDeg: -6,
    heelElevM: 0,
    desc: 'Impacto de talón contra la plataforma. Vector de frenado anteroposterior (Fy < 0) y primer pico vertical en la curva M (Fz = 1,15 W).',
  },
  mid_stance: {
    name: 'Apoyo Medio Plantar (Mid Stance)',
    badge: 'VALLE VERTICAL (0,85 W)',
    fzMult: 0.85,
    fyN: 0,
    fxN: 22,
    copRelX: 0.14,
    copRelZ: -0.05,
    peakPressureKPa: 145,
    pitchDeg: 0,
    tibiaDeg: 0,
    heelElevM: 0,
    desc: 'El centro de masas pasa sobre el pie. Valle transitorio en Fz (0,85 W) por aceleración vertical descendente; Fy cruza por cero.',
  },
  toe_off: {
    name: 'Despegue de Dedos (Toe-Off)',
    badge: 'PROPULSIÓN (+Fy)',
    fzMult: 1.25,
    fyN: 185,
    fxN: -12,
    copRelX: -0.06,
    copRelZ: 0.48,
    peakPressureKPa: 380,
    pitchDeg: -26,
    tibiaDeg: 18,
    heelElevM: 0.18,
    desc: 'Potente empuje propulsivo del tríceps sural a través del 1er metatarsiano y el hallux. Máximo pico vertical (Fz = 1,25 W) y aceleración anterior.',
  },
};

// ── Paleta de Colores de Grado Médico ──
const BONE_IVORY = '#ede5d0';
const BONE_ACCENT = '#c5b593';
const CARTILAGE_ICE = '#68c5b8';
const TEAL_ACCENT = '#0d6e64';
const GREEN_ACCENT = '#059669';
const RED_ACCENT = '#ef4444';
const BLUE_ACCENT = '#2563eb';
const AMBER_ACCENT = '#f59e0b';

// Puntos de la curva COP continua tipo "Mariposa de Marcha" (Butterfly Trajectory)
const COP_TRAJECTORY_POINTS: [number, number, number][] = [
  [0.08, 0.008, -0.56], // Contacto inicial en borde posterolateral del calcáneo
  [0.09, 0.008, -0.42],
  [0.13, 0.008, -0.22], // Transición por el arco externo / medio pie
  [0.14, 0.008, -0.05], // Apoyo medio
  [0.08, 0.008, 0.18],  // Cruce hacia el antepié
  [-0.04, 0.008, 0.38], // Cabeza del 1er metatarsiano
  [-0.07, 0.008, 0.52], // Despegue por el Hallux
];

// ── 1. Vector 3D de Fuerza con Vástago, Cono y Badge HTML ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [0, 1, 0] as [number, number, number],
  color = '#0d6e64',
  label,
  sub,
  emphasis,
  shaftRadius = 0.012,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  /** Letrero para el riel lateral (símbolo = valor). */
  label: string;
  sub?: string;
  emphasis?: 'strong' | 'muted';
  shaftRadius?: number;
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

  const headLen = Math.min(0.16, Math.max(0.06, len * 0.22));
  const headRadius = headLen * 0.36;
  const shaftLen = Math.max(0.01, len - headLen);

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
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Cono punta del vector */}
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

      {/* Letrero → riel lateral (símbolo = valor), con línea guía a la punta. */}
      <Callout
        position={[tipPos.x + dir.x * 0.06, tipPos.y + dir.y * 0.06, tipPos.z + dir.z * 0.06]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── 2. Mapa de Calor Plantar Isobárico Generado Dinámicamente en Canvas 2D ──
function usePlantarHeatmapTexture(gaitPhase: string) {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // E5-02: sin contexto 2D no hay mapa de calor que generar; la textura en
      // blanco ya es benigna aquí (overlay aditivo transparente sobre la
      // plataforma, no la escena completa), pero el fallo debe quedar en consola.
      console.error('[ForcePlateCanvas] usePlantarHeatmapTexture: no se pudo obtener el contexto 2D.');
      return new THREE.CanvasTexture(canvas);
    }

    ctx.clearRect(0, 0, size, size);

    // Mapeo coordenado del pie (Z horizontal en textura [0..size], X vertical [0..size])
    // Talón en Z = 120, Medio pie en Z = 256, Metatarsianos en Z = 390, Hallux en Z = 450
    const cx = size * 0.5;
    const cy = size * 0.5;

    // Gradientes isobáricos según fase
    const drawHotspot = (x: number, y: number, r: number, maxPressureKPa: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      if (maxPressureKPa > 300) {
        // Pico muy alto (>300 kPa): Blanco -> Rojo carmín -> Naranja -> Amarillo -> Verde -> Transparente
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        grad.addColorStop(0.2, 'rgba(239, 68, 68, 0.92)');
        grad.addColorStop(0.45, 'rgba(249, 115, 22, 0.75)');
        grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.45)');
        grad.addColorStop(0.9, 'rgba(16, 185, 129, 0.2)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      } else if (maxPressureKPa > 200) {
        // Pico medio-alto (200-300 kPa): Rojo -> Naranja -> Verde -> Azul -> Transparente
        grad.addColorStop(0, 'rgba(254, 202, 202, 0.95)');
        grad.addColorStop(0.25, 'rgba(239, 68, 68, 0.85)');
        grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.65)');
        grad.addColorStop(0.8, 'rgba(16, 185, 129, 0.3)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        // Presión media (100-200 kPa): Amarillo -> Verde -> Cian -> Transparente
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.90)');
        grad.addColorStop(0.3, 'rgba(16, 185, 129, 0.75)');
        grad.addColorStop(0.65, 'rgba(6, 182, 212, 0.45)');
        grad.addColorStop(0.9, 'rgba(59, 130, 246, 0.2)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Anillos isobáricos (líneas de contorno de presión constante)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      for (let cr = r * 0.3; cr < r; cr += r * 0.25) {
        ctx.beginPath();
        ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    if (gaitPhase === 'heel_strike') {
      // Hotspot potente en el talón posterolateral
      drawHotspot(cx + 18, cy - 130, 68, 290);
      // Huella suave residual de contacto
      drawHotspot(cx + 26, cy - 40, 35, 80);
    } else if (gaitPhase === 'mid_stance') {
      // Distribución balanceada a lo largo del borde externo y talón
      drawHotspot(cx + 16, cy - 120, 52, 130);
      drawHotspot(cx + 28, cy - 20, 48, 145);
      drawHotspot(cx + 15, cy + 80, 56, 140);
    } else {
      // Toe-off: Concentración extrema en metatarsianos 1-2 y hallux
      drawHotspot(cx - 15, cy + 120, 72, 380); // 1er Metatarsiano
      drawHotspot(cx - 20, cy + 175, 48, 350); // Hallux
      drawHotspot(cx + 25, cy + 105, 42, 180); // Metatarsianos laterales
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [gaitPhase]);
}

// ── 3. Modelo 3D de la Plataforma Dinamométrica de Fuerza con Cuarzo Piezoeléctrico ──
function ForcePlatform3D() {
  const ledGlowRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame((state) => {
    if (ledGlowRef.current) {
      const t = state.clock.getElapsedTime();
      ledGlowRef.current.emissiveIntensity = 0.75 + 0.25 * Math.sin(t * 5);
    }
  });

  const sensorPositions: [number, number, number][] = [
    [-0.95, 0.02, -1.35],
    [0.95, 0.02, -1.35],
    [-0.95, 0.02, 1.35],
    [0.95, 0.02, 1.35],
  ];

  return (
    <group position={[0, -0.08, 0]}>
      {/* Chasis de aluminio anodizado biselado */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.14, 3.0]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.88}
          roughness={0.24}
        />
      </mesh>

      {/* Bisel perimetral decorativo */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[2.24, 0.015, 3.04]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>

      {/* Placa superior de vidrio templado rectificado */}
      <mesh position={[0, 0.076, 0]} receiveShadow>
        <boxGeometry args={[2.16, 0.01, 2.96]} />
        <meshStandardMaterial
          color="#f1f5f9"
          transparent
          opacity={0.82}
          roughness={0.12}
          metalness={0.18}
        />
      </mesh>

      {/* 4 Sensores piezoeléctricos de cuarzo en las 4 esquinas */}
      {sensorPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Carcasa cilíndrica de acero inoxidable del sensor */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Anillo LED indicador de estado activo de cuarzo */}
          <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.04, 0.075, 24]} />
            <meshStandardMaterial
              ref={i === 0 ? ledGlowRef : undefined}
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.9}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>

        </group>
      ))}

      {/* Ejes Coordenados de la Plataforma (+Fx, +Fy) */}
      <group position={[-0.85, 0.082, -1.1]}>
        {/* Eje +Fy (Anterior) */}
        <Line
          points={[
            [0, 0, 0],
            [0, 0, 0.45],
          ]}
          color="#059669"
          lineWidth={2.2}
        />
        <DclTag position={[0, 0, 0.50]} color="#059669" symbol="+Fy" />

        {/* Eje +Fx (Mediolateral) */}
        <Line
          points={[
            [0, 0, 0],
            [0.35, 0, 0],
          ]}
          color="#2563eb"
          lineWidth={2.2}
        />
        <DclTag position={[0.40, 0, 0]} color="#2563eb" symbol="+Fx" />
      </group>
    </group>
  );
}

// ── 4. Anatomía 3D del Pie y Pierna Derecha con Cinemática Dinámica de Marcha ──
function LegAndFootBones3D({
  gaitPhase,
}: {
  gaitPhase: 'heel_strike' | 'mid_stance' | 'toe_off';
}) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const cfg = GAIT_CONFIG[gaitPhase] || GAIT_CONFIG.heel_strike;

  const footGroupRef = useRef<THREE.Group | null>(null);
  const tibiaGroupRef = useRef<THREE.Group | null>(null);

  const curPitchRef = useRef<number>(cfg.pitchDeg);
  const curTibiaRef = useRef<number>(cfg.tibiaDeg);
  const curHeelElevRef = useRef<number>(cfg.heelElevM);

  // Materiales óseos anatómicos
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(BONE_IVORY),
        roughness: 0.56,
        metalness: 0.04,
      }),
    []
  );

  const tarsusMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f5eee0'),
        roughness: 0.52,
        metalness: 0.04,
      }),
    []
  );

  const cartilageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(CARTILAGE_ICE),
        roughness: 0.22,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Animación cinemática suave (LERP entre fases del paso)
  useFrame((_, delta) => {
    const lerpSpeed = Math.min(1, delta * 8);
    curPitchRef.current += (cfg.pitchDeg - curPitchRef.current) * lerpSpeed;
    curTibiaRef.current += (cfg.tibiaDeg - curTibiaRef.current) * lerpSpeed;
    curHeelElevRef.current += (cfg.heelElevM - curHeelElevRef.current) * lerpSpeed;

    if (footGroupRef.current) {
      // Rotación sagital del pie (Pitch)
      const pitchRad = (curPitchRef.current * Math.PI) / 180;
      footGroupRef.current.rotation.x = -pitchRad;
      footGroupRef.current.position.y = curHeelElevRef.current * 0.5;
    }

    if (tibiaGroupRef.current) {
      // Inclinación anterior/posterior de la tibia
      const tibRad = (curTibiaRef.current * Math.PI) / 180;
      tibiaGroupRef.current.rotation.x = -tibRad;
    }
  });

  // Escala anatómica del pie/pierna sobre la plataforma
  const SCALE = 10.5;
  // Offset para centrar el pie derecho en el origen de la plataforma
  const P_FOOT_R = new THREE.Vector3(-0.048, -0.496, 0.0);

  return (
    <group position={[0, 0.005, 0]}>
      {/* Segmento móvil del pie y tarso */}
      <group ref={footGroupRef} position={[0, 0, 0]}>
        <group scale={SCALE} position={[-P_FOOT_R.x * SCALE, -P_FOOT_R.y * SCALE, -P_FOOT_R.z * SCALE]}>
          {/* Tarso posterior: Talus y Calcaneus */}
          {nodes?.talus_R && <mesh geometry={nodes.talus_R.geometry} material={tarsusMat} castShadow />}
          {nodes?.calcaneus_L && <mesh geometry={nodes.calcaneus_L.geometry} material={tarsusMat} castShadow />}

          {/* Tarso medio y anterior: Navicular, Cuñas I-III, Cuboide */}
          {nodes?.navicular_R && <mesh geometry={nodes.navicular_R.geometry} material={tarsusMat} />}
          {nodes?.cuneiform_med_R && <mesh geometry={nodes.cuneiform_med_R.geometry} material={tarsusMat} />}
          {nodes?.cuneiform_int_R && <mesh geometry={nodes.cuneiform_int_R.geometry} material={tarsusMat} />}
          {nodes?.cuneiform_lat_R && <mesh geometry={nodes.cuneiform_lat_R.geometry} material={tarsusMat} />}
          {nodes?.cuboid_R && <mesh geometry={nodes.cuboid_R.geometry} material={tarsusMat} />}

          {/* Metatarsianos I al V */}
          {nodes?.metatarsal1_R && <mesh geometry={nodes.metatarsal1_R.geometry} material={boneMat} castShadow />}
          {nodes?.metatarsal2_R && <mesh geometry={nodes.metatarsal2_R.geometry} material={boneMat} castShadow />}
          {nodes?.metatarsal3_R && <mesh geometry={nodes.metatarsal3_R.geometry} material={boneMat} castShadow />}
          {nodes?.metatarsal4_R && <mesh geometry={nodes.metatarsal4_R.geometry} material={boneMat} castShadow />}
          {nodes?.metatarsal5_R && <mesh geometry={nodes.metatarsal5_R.geometry} material={boneMat} castShadow />}

          {/* Cartílago articular en la cúpula astragalina */}
          <mesh position={[-0.041, -0.463, -0.021]} rotation={[0, 0, Math.PI / 2]} material={cartilageMat}>
            <cylinderGeometry args={[0.009, 0.009, 0.016, 20]} />
          </mesh>
        </group>
      </group>

      {/* Segmento Tibia y Peroné articulando sobre el astrágalo */}
      <group ref={tibiaGroupRef} position={[0, 0.35, -0.22]}>
        <group scale={SCALE} position={[-P_FOOT_R.x * SCALE, -P_FOOT_R.y * SCALE - 0.35, -P_FOOT_R.z * SCALE + 0.22]}>
          {nodes?.tibia_R && <mesh geometry={nodes.tibia_R.geometry} material={boneMat} castShadow />}
          {nodes?.fibula_R && <mesh geometry={nodes.fibula_R.geometry} material={boneMat} castShadow />}
        </group>
      </group>
    </group>
  );
}

// ── 5. Trayectoria del COP y Vectores Triaxiales de la GRF ──
function CopAndGrfVectors3D({
  gaitPhase,
  bodyMassKg,
}: {
  gaitPhase: 'heel_strike' | 'mid_stance' | 'toe_off';
  bodyMassKg: number;
}) {
  const cfg = GAIT_CONFIG[gaitPhase] || GAIT_CONFIG.heel_strike;

  const curCopRef = useRef<{ x: number; z: number }>({ x: cfg.copRelX, z: cfg.copRelZ });
  const pulseRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const g = 9.81;
  const weightN = bodyMassKg * g;
  const fzN = weightN * cfg.fzMult;
  const fyN = cfg.fyN;
  const fxN = cfg.fxN;
  const grfResultantN = Math.hypot(fzN, fyN, fxN);

  // Escala calibrada para representar Newtons en unidades 3D
  const forceScale = 0.00115;

  const fzVec: [number, number, number] = [0, fzN * forceScale, 0];
  const fyVec: [number, number, number] = [0, 0, fyN * forceScale * 1.8]; // Z es anteroposterior
  const fxVec: [number, number, number] = [fxN * forceScale * 1.8, 0, 0];  // X es mediolateral

  const grfVec: [number, number, number] = [
    fxVec[0],
    fzVec[1],
    fyVec[2],
  ];

  // Letreros del riel lateral (la fase de marcha llena estas cifras).
  const lGRF = `GRF = ${grfResultantN.toFixed(0)} N`;
  const lFz = `Fz = ${fzN.toFixed(0)} N`;
  const lFy = `Fy = ${fyN.toFixed(0)} N`;
  const lFx = `Fx = ${fxN.toFixed(0)} N`;

  useFrame((state, delta) => {
    const lerpSpeed = Math.min(1, delta * 8);
    curCopRef.current.x += (cfg.copRelX - curCopRef.current.x) * lerpSpeed;
    curCopRef.current.z += (cfg.copRelZ - curCopRef.current.z) * lerpSpeed;

    if (pulseRef.current) {
      const t = state.clock.getElapsedTime();
      pulseRef.current.opacity = 0.4 + 0.4 * Math.sin(t * 7);
    }
  });

  const copPos: [number, number, number] = [curCopRef.current.x, 0.015, curCopRef.current.z];

  return (
    <group>
      {/* Curva continua de la mariposa del COP (Gait Butterfly Trajectory) */}
      <Line
        points={COP_TRAJECTORY_POINTS}
        color={RED_ACCENT}
        lineWidth={3.0}
        dashed
        dashScale={22}
        dashSize={0.08}
        gapSize={0.04}
      />

      {/* Marcador 3D del Centro de Presiones (COP) Instantáneo */}
      <group position={copPos}>
        {/* Esfera central del COP */}
        <mesh position={[0, 0.01, 0]}>
          <sphereGeometry args={[0.032, 24, 24]} />
          <meshStandardMaterial color={RED_ACCENT} emissive={RED_ACCENT} emissiveIntensity={0.8} />
        </mesh>

        {/* Halo de pulsación isobárica */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.045, 0.09, 32]} />
          <meshBasicMaterial
            ref={pulseRef}
            color={RED_ACCENT}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* COP: referencia anclada, se queda sobre la plataforma. */}
        <DclTag position={[0, -0.06, 0.08]} color="#ef4444" symbol="COP" />
      </group>

      {/* ── Vector Resultante de la Reacción del Suelo (GRF) ── */}
      <ForceVector3D origin={copPos} vector={grfVec} color={TEAL_ACCENT} label={lGRF} sub={`${(grfResultantN / weightN).toFixed(2)}·W`} emphasis="strong" shaftRadius={0.016} />

      {/* ── Componente Vertical Fz (Verde Esmeralda) ── */}
      <ForceVector3D origin={copPos} vector={fzVec} color={GREEN_ACCENT} label={lFz} sub={`vertical · ${cfg.fzMult.toFixed(2)} W`} emphasis="muted" shaftRadius={0.012} />

      {/* ── Componente Anteroposterior Fy (Frenado / Propulsión) ── */}
      {Math.abs(fyN) > 5 && (
        <ForceVector3D
          origin={copPos}
          vector={fyVec}
          color={fyN > 0 ? '#10b981' : RED_ACCENT}
          label={lFy}
          sub={fyN > 0 ? 'propulsión anterior' : 'frenado'}
          emphasis="muted"
          shaftRadius={0.010}
        />
      )}

      {/* ── Componente Mediolateral Fx (Estabilidad Lateral) ── */}
      {Math.abs(fxN) > 5 && (
        <ForceVector3D
          origin={copPos}
          vector={fxVec}
          color={BLUE_ACCENT}
          label={lFx}
          sub="mediolateral"
          emphasis="muted"
          shaftRadius={0.008}
        />
      )}

      {/* Caja de proyecciones ortogonales punteadas 3D */}
      <Line
        points={[
          [copPos[0], copPos[1] + fzVec[1], copPos[2]],
          [copPos[0] + grfVec[0], copPos[1] + grfVec[1], copPos[2] + grfVec[2]],
          [copPos[0] + fyVec[0] + fxVec[0], copPos[1], copPos[2] + fyVec[2] + fxVec[2]],
        ]}
        color="#64748b"
        lineWidth={1.2}
        dashed
        dashScale={18}
        dashSize={0.06}
        gapSize={0.03}
      />

      {/* Proyecta cada <Callout> de la escena a píxeles para el riel lateral. */}
      <CalloutSource />
    </group>
  );
}

// ── 6. Plano del Mapa de Calor Isobárico Superpuesto a la Plataforma ──
function PlantarHeatmapPlane({ gaitPhase }: { gaitPhase: string }) {
  const heatmapTexture = usePlantarHeatmapTexture(gaitPhase);

  return (
    <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.6, 2.4]} />
      <meshBasicMaterial
        map={heatmapTexture}
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ── 7. Mini Osciloscopio HUD 3D de la Curva M Vertical Fz(t) ──
function VerticalMCurveOscilloscope({
  gaitPhase,
  bodyMassKg,
}: {
  gaitPhase: 'heel_strike' | 'mid_stance' | 'toe_off';
  bodyMassKg: number;
}) {
  const g = 9.81;
  const weightN = bodyMassKg * g;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid #cbd5e1',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 18px rgba(35, 44, 54, 0.12)',
        width: '185px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.62rem', fontWeight: 800, color: TEAL_ACCENT, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>
        Curva M Vertical Fz(t)
      </div>

      <svg width="160" height="75" viewBox="0 0 160 75" style={{ display: 'block', margin: '0 auto' }}>
        {/* Línea base de 1.0 W (Peso corporal de referencia) */}
        <line x1="8" y1="45" x2="152" y2="45" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
        <text x="126" y="42" fontSize="6.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">1.0 W</text>

        {/* Curva en M clásica */}
        <path
          d="M 12 65 C 24 65, 30 18, 48 18 C 66 18, 74 52, 88 52 C 102 52, 114 12, 130 12 C 142 12, 148 65, 152 65"
          fill="none"
          stroke={TEAL_ACCENT}
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Puntos clave */}
        <circle cx="48" cy="18" r="3.5" fill={gaitPhase === 'heel_strike' ? RED_ACCENT : TEAL_ACCENT} />
        <circle cx="88" cy="52" r="3.5" fill={gaitPhase === 'mid_stance' ? RED_ACCENT : TEAL_ACCENT} />
        <circle cx="130" cy="12" r="3.5" fill={gaitPhase === 'toe_off' ? RED_ACCENT : TEAL_ACCENT} />

        {/* Cursor indicador animado */}
        {gaitPhase === 'heel_strike' && (
          <circle cx="48" cy="18" r="6" fill="none" stroke={RED_ACCENT} strokeWidth="1.5" />
        )}
        {gaitPhase === 'mid_stance' && (
          <circle cx="88" cy="52" r="6" fill="none" stroke={RED_ACCENT} strokeWidth="1.5" />
        )}
        {gaitPhase === 'toe_off' && (
          <circle cx="130" cy="12" r="6" fill="none" stroke={RED_ACCENT} strokeWidth="1.5" />
        )}

        <text x="48" y="10" fontSize="6" fill={gaitPhase === 'heel_strike' ? RED_ACCENT : '#64748b'} textAnchor="middle" fontWeight="bold">1.15 W</text>
        <text x="88" y="66" fontSize="6" fill={gaitPhase === 'mid_stance' ? RED_ACCENT : '#64748b'} textAnchor="middle" fontWeight="bold">0.85 W</text>
        <text x="130" y="6" fontSize="6" fill={gaitPhase === 'toe_off' ? RED_ACCENT : '#64748b'} textAnchor="middle" fontWeight="bold">1.25 W</text>
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.54rem', fontFamily: 'JetBrains Mono, monospace', marginTop: '3px', color: '#475569' }}>
        <span>W = {weightN.toFixed(0)} N</span>
        <b style={{ color: TEAL_ACCENT }}>
          Fz = {(weightN * GAIT_CONFIG[gaitPhase].fzMult).toFixed(0)} N
        </b>
      </div>
    </div>
  );
}

// ── 8. Dial Manométrico Analógico de Presión Plantar Pico ──
function PeakPressureGauge({
  gaitPhase,
}: {
  gaitPhase: 'heel_strike' | 'mid_stance' | 'toe_off';
}) {
  const cfg = GAIT_CONFIG[gaitPhase] || GAIT_CONFIG.heel_strike;
  const maxP = 450;
  const normVal = Math.min(1, Math.max(0, cfg.peakPressureKPa / maxP));
  const needleAngle = -135 + normVal * 270;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid #cbd5e1',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 18px rgba(35, 44, 54, 0.12)',
        width: '165px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        Presión Pico Baropodométrica
      </div>

      <svg width="110" height="66" viewBox="0 0 110 66" style={{ margin: '3px auto 0', display: 'block' }}>
        <path d="M 15 58 A 40 40 0 0 1 95 58" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
        {/* Sector Verde (0 - 200 kPa) */}
        <path d="M 15 58 A 40 40 0 0 1 55 18" fill="none" stroke="#10b981" strokeWidth="7" strokeDasharray="3 2" opacity={0.4} />
        {/* Sector Ámbar (200 - 320 kPa) */}
        <path d="M 55 18 A 40 40 0 0 1 85 34" fill="none" stroke="#f59e0b" strokeWidth="7" strokeDasharray="3 2" opacity={0.4} />
        {/* Sector Rojo (> 320 kPa) */}
        <path d="M 85 34 A 40 40 0 0 1 95 58" fill="none" stroke="#ef4444" strokeWidth="7" strokeDasharray="3 2" opacity={0.4} />

        {/* Arco de valor */}
        <path
          d="M 15 58 A 40 40 0 0 1 95 58"
          fill="none"
          stroke={cfg.peakPressureKPa > 320 ? RED_ACCENT : (cfg.peakPressureKPa > 200 ? AMBER_ACCENT : GREEN_ACCENT)}
          strokeWidth="7"
          strokeDasharray="125.66"
          strokeDashoffset={125.66 * (1 - normVal)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease, stroke 0.35s ease' }}
        />

        {/* Aguja indicadora */}
        <g transform={`rotate(${needleAngle} 55 58)`} style={{ transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="55" y1="58" x2="55" y2="22" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="55" cy="58" r="4" fill="#1e293b" />
          <circle cx="55" cy="58" r="1.8" fill="#ffffff" />
        </g>
      </svg>

      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: RED_ACCENT, fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
        {cfg.peakPressureKPa} kPa
      </div>
      <div style={{ fontSize: '0.52rem', color: '#64748b' }}>
        {gaitPhase === 'toe_off' ? 'Propulsión 1er Metatarso' : (gaitPhase === 'heel_strike' ? 'Choque de Talón' : 'Apoyo Medio Plano')}
      </div>
    </div>
  );
}

// ── 9. Controlador de Cámara Dinámico con Presets de Visualización ──
function CameraRig({ viewPreset, controlsRef }: { viewPreset: 'iso' | 'sagittal' | 'frontal' | 'top'; controlsRef: React.MutableRefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewPreset === 'iso') {
      camera.position.set(1.85, 1.5, 2.18);
      camera.lookAt(0, 0.35, 0);
    } else if (viewPreset === 'sagittal') {
      camera.position.set(3.4, 0.4, 0.0);
      camera.lookAt(0, 0.35, 0);
    } else if (viewPreset === 'frontal') {
      camera.position.set(0.0, 0.5, 3.4);
      camera.lookAt(0, 0.35, 0);
    } else if (viewPreset === 'top') {
      camera.position.set(0.0, 3.8, 0.05);
      camera.lookAt(0, 0, 0);
    }
  }, [viewPreset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 + 0.05}
      minDistance={1.0}
      maxDistance={6.5}
      target={[0, 0.35, 0]}
    />
  );
}

// ── COMPONENTE PRINCIPAL: ForcePlateCanvas ──
export default function ForcePlateCanvas({
  showLabels = false,
  gaitPhase = 'heel_strike',
  bodyMassKg = 70,
}: ForcePlateCanvasProps) {
  const [viewPreset, setViewPreset] = useState<'iso' | 'sagittal' | 'frontal' | 'top'>('iso');
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const callouts = useCalloutStore();

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="cap2-webgl-canvas" style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}>
      <Canvas
        shadows
        camera={{ position: [1.85, 1.5, 2.18], fov: 40 }}
        dpr={[1, 2]}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'radial-gradient(circle at 50% 38%, #ece3ce 0%, #ddd1b6 52%, #c6b697 100%)',
        }}
      >
        <CameraRig viewPreset={viewPreset} controlsRef={controlsRef} />

        {/* ── Iluminación de Estudio Anatómico ── */}
        <ambientLight intensity={0.55} />
        {/* Luz de contra que perfila la silueta contra el fondo */}
        <directionalLight position={[-2, 3.5, -6]} intensity={0.9} color="#ffffff" />
        <directionalLight
          position={[4, 8, 5]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={15}
          shadow-camera-left={-2}
          shadow-camera-right={2}
          shadow-camera-top={2}
          shadow-camera-bottom={-2}
        />
        {/* Luz cálida de contorno perióstico */}
        <directionalLight position={[-4, 3, -3]} intensity={0.45} color="#fef3c7" />
        {/* Luz fría de relleno de piso */}
        <directionalLight position={[0, -2, 2]} intensity={0.2} color="#e0f2fe" />

        <Suspense fallback={null}>
          <group name="fit-root" position={[0, 0, 0]}>
            {/* 1. Plataforma Dinamométrica de Fuerza con Sensores Piezoeléctricos */}
            <ForcePlatform3D />

            {/* 2. Mapa de Calor Plantar Isobárico */}
            <PlantarHeatmapPlane gaitPhase={gaitPhase} />

            {/* 3. Anatomía Ósea 3D del Pie y Pierna Real de human_body.glb */}
            <LegAndFootBones3D gaitPhase={gaitPhase} />

            {/* 4. Trayectoria Continua del COP y Vectores Triaxiales de la GRF */}
            <CopAndGrfVectors3D gaitPhase={gaitPhase} bodyMassKg={bodyMassKg} />
          </group>

          {/* Sombra de contacto suave debajo de la plataforma */}
          <ContactShadows
            position={[0, -0.155, 0]}
            opacity={0.52}
            scale={4.8}
            blur={1.8}
            far={2.2}
            color="#241d12"
          />
        </Suspense>

        <FitCamera padding={1.35} lookTarget={[0, 0.35, 0]} refit={`${gaitPhase}:${viewPreset}`} />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Lecturas de la GRF → riel lateral con línea guía a cada flecha */}
      <CalloutRail store={callouts} side="right" reserveBottom={120} />

      {/* ── Widgets HUD anclados a las esquinas (fuera del 3D → no se recortan) ── */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 9, transform: 'scale(0.82)', transformOrigin: 'top left', pointerEvents: 'none' }}>
        <VerticalMCurveOscilloscope gaitPhase={gaitPhase} bodyMassKg={bodyMassKg} />
      </div>
      <div style={{ position: 'absolute', right: '10px', bottom: '10px', zIndex: 9, transform: 'scale(0.8)', transformOrigin: 'bottom right', pointerEvents: 'none' }}>
        <PeakPressureGauge gaitPhase={gaitPhase} />
      </div>

      {/* ── Selector de Vistas de Cámara Flotante ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--line)',
          borderRadius: '6px',
          padding: '3px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setViewPreset('iso')}
          style={{
            background: viewPreset === 'iso' ? 'var(--teal)' : 'transparent',
            color: viewPreset === 'iso' ? '#fff' : 'var(--ink)',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 7px',
            fontSize: '0.56rem',
            fontWeight: viewPreset === 'iso' ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          Perspectiva 3D
        </button>
        <button
          type="button"
          onClick={() => setViewPreset('sagittal')}
          style={{
            background: viewPreset === 'sagittal' ? 'var(--teal)' : 'transparent',
            color: viewPreset === 'sagittal' ? '#fff' : 'var(--ink)',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 7px',
            fontSize: '0.56rem',
            fontWeight: viewPreset === 'sagittal' ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          Vista Sagital (Lateral)
        </button>
        <button
          type="button"
          onClick={() => setViewPreset('frontal')}
          style={{
            background: viewPreset === 'frontal' ? 'var(--teal)' : 'transparent',
            color: viewPreset === 'frontal' ? '#fff' : 'var(--ink)',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 7px',
            fontSize: '0.56rem',
            fontWeight: viewPreset === 'frontal' ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          Vista Frontal
        </button>
        <button
          type="button"
          onClick={() => setViewPreset('top')}
          style={{
            background: viewPreset === 'top' ? 'var(--teal)' : 'transparent',
            color: viewPreset === 'top' ? '#fff' : 'var(--ink)',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 7px',
            fontSize: '0.56rem',
            fontWeight: viewPreset === 'top' ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          Vista Plantar (Superior)
        </button>
      </div>
    </div>
    </CalloutProvider>
  );
}

// Preload GLB
useGLTF.preload('/assets/cap1/human_body.glb');
