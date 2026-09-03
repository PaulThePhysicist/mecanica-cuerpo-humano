import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { AnatomyStage } from '../cap1/three/AnatomyStage';
import { useAnatomyNodes, preloadAnatomy } from '../cap1/three/useAnatomyNodes';
import { materials, makeMuscleActive } from '../cap1/three/materials';

/**
 * C4 · Estática del tobillo — de puntillas sobre un pie (Herman §2.3.3,
 * Figs. 2.28–2.29).
 *
 * El pie gira alrededor de las cabezas de los metatarsianos (fulcro). El tríceps
 * sural, vía tendón de Aquiles sobre el calcáneo, equilibra la normal del suelo
 * (= peso corporal Wb) y transmite la carga al astrágalo:
 *
 *   M = Wb · cosβ / cos(θ+β)      (2.39)
 *   R = Wb · cosθ / cos(θ+β)      (2.40)   con θ ≈ 45°
 *
 * Para β = 60°:  M ≈ 1,93 Wb  y  R ≈ 2,73 Wb  — ambas MUY superiores al peso.
 */

export interface AnkleCanvasProps {
  betaDeg: number;     // ángulo pie–horizontal
  bodyWeightN: number; // Wb (normal del suelo bajo el antepié)
  showComponents: boolean;
}

const THETA = (45 * Math.PI) / 180; // ángulo del tendón de Aquiles con la horizontal

const TEAL = '#0d6e64';
const AMBER = '#d97706';
const RED = '#b02318';
const SLATE = '#43505c';
const TENDON_COLOR = '#e7dcc4';

function ForceArrow({
  origin,
  vector,
  color,
  label,
  sublabel,
  dashed = false,
}: {
  origin: [number, number, number];
  vector: [number, number, number];
  color: string;
  label: string;
  sublabel?: string;
  dashed?: boolean;
}) {
  const v = useMemo(() => new THREE.Vector3(...vector), [vector]);
  const len = v.length();
  const dir = useMemo(
    () => (len > 1e-4 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0)),
    [v, len],
  );
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);
  if (len < 0.012) return null;

  const headLen = Math.min(0.05, Math.max(0.02, len * 0.28));
  const shaftLen = Math.max(0.005, len - headLen);
  const o = new THREE.Vector3(...origin);
  const mid = o.clone().add(dir.clone().multiplyScalar(shaftLen * 0.5));
  const head = o.clone().add(dir.clone().multiplyScalar(shaftLen + headLen * 0.5));
  const tip = o.clone().add(v);

  return (
    <group>
      <mesh position={mid.toArray()} quaternion={quat}>
        <cylinderGeometry args={[0.006, 0.006, shaftLen, 14]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.15}
          transparent={dashed}
          opacity={dashed ? 0.7 : 1}
        />
      </mesh>
      <mesh position={head.toArray()} quaternion={quat}>
        <coneGeometry args={[headLen * 0.42, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.25} metalness={0.2} />
      </mesh>
      <Html position={[tip.x + dir.x * 0.03, tip.y + dir.y * 0.03, tip.z + dir.z * 0.03]} center zIndexRange={[90, 0]}>
        <div
          style={{
            background: 'rgba(255,255,255,0.94)',
            border: `1.5px solid ${color}`,
            borderRadius: 5,
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          <span style={{ color, fontSize: '0.6rem', fontWeight: 700 }}>{label}</span>
          {sublabel && (
            <>
              <br />
              <span style={{ color: '#55606d', fontSize: '0.5rem', fontFamily: 'system-ui, sans-serif' }}>{sublabel}</span>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

const FOOT_NODES = [
  'talus_R', 'calcaneus_R', 'navicular_R', 'cuboid_R',
  'cuneiform_med_R', 'cuneiform_int_R', 'cuneiform_lat_R',
  'metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R',
];

function AnkleAnatomy({ betaDeg, bodyWeightN, showComponents }: AnkleCanvasProps) {
  const bone = useAnatomyNodes('body');
  const muscle = useAnatomyNodes('muscles_hip_leg');

  const { ankleC, heel, forefoot } = useMemo(() => {
    const centerOf = (name: string, fallback: THREE.Vector3) => {
      const g = bone[name]?.geometry as THREE.BufferGeometry | undefined;
      if (!g) return fallback;
      g.computeBoundingBox();
      return g.boundingBox!.getCenter(new THREE.Vector3());
    };
    const talus = centerOf('talus_R', new THREE.Vector3(-0.05, -0.92, 0.01));
    const calc = centerOf('calcaneus_R', new THREE.Vector3(-0.05, -0.95, -0.03));
    const mt1 = centerOf('metatarsal1_R', new THREE.Vector3(-0.05, -0.97, 0.09));
    return { ankleC: talus, heel: calc, forefoot: mt1 };
  }, [bone]);

  // ── Biomecánica de puntillas (2.39–2.40) ──
  // Herman define θ y β de modo que el denominador cos(θ+β) puede salir
  // negativo para β grandes; lo que importa son las MAGNITUDES de M y R.
  const beta = (betaDeg * Math.PI) / 180;
  const Wb = bodyWeightN;
  const denom = Math.max(0.12, Math.abs(Math.cos(THETA + beta)));
  const M = (Wb * Math.abs(Math.cos(beta))) / denom;

  const emg = Math.min(1.4, 0.25 + M / (Wb * 3));
  const surMat = useMemo(() => makeMuscleActive(emg), [emg]);

  const S = 0.00007; // N → unidades de mundo

  // Tendón de Aquiles: tira del calcáneo hacia arriba-atrás a θ de la horizontal.
  const achDir = new THREE.Vector3(-Math.cos(THETA), Math.sin(THETA), 0).normalize();
  // Normal del suelo bajo el antepié (fulcro), hacia arriba = Wb.
  const nVec: [number, number, number] = [0, Wb * S, 0];
  // La reacción en el astrágalo cierra ΣF = 0:  R = −(N + M).
  const rxN = -(0 + achDir.x * M);
  const ryN = -(Wb + achDir.y * M);
  const R = Math.hypot(rxN, ryN);
  const mVec: [number, number, number] = [achDir.x * M * S, achDir.y * M * S, 0];
  const rVec: [number, number, number] = [rxN * S, ryN * S, 0];

  const achilles: [number, number, number][] = [
    [heel.x, heel.y, heel.z],
    [heel.x + achDir.x * 0.12, heel.y + achDir.y * 0.12, heel.z],
  ];

  return (
    <group scale={6.6} position={[-0.35, -0.15, 0]}>
    <group position={[-ankleC.x, -ankleC.y, -ankleC.z]}>
      {/* ── Huesos ── */}
      {bone.tibia_R && <mesh geometry={bone.tibia_R.geometry} material={materials.bone} />}
      {bone.fibula_R && <mesh geometry={bone.fibula_R.geometry} material={materials.bone} />}
      {FOOT_NODES.map((n) =>
        bone[n] ? (
          <mesh
            key={n}
            geometry={bone[n].geometry}
            material={n === 'talus_R' ? materials.boneHighlight : materials.bone}
          />
        ) : null,
      )}

      {/* ── Tríceps sural ── */}
      {muscle.gastrocnemius_medial_head_R && (
        <mesh geometry={muscle.gastrocnemius_medial_head_R.geometry} material={surMat} />
      )}
      {muscle.gastrocnemius_lateral_head_R && (
        <mesh geometry={muscle.gastrocnemius_lateral_head_R.geometry} material={surMat} />
      )}
      {muscle.soleus_R && <mesh geometry={muscle.soleus_R.geometry} material={surMat} />}

      {/* Cartílago de la mortaja tibioastragalina */}
      <mesh position={ankleC.toArray()}>
        <sphereGeometry args={[0.013, 20, 20]} />
        <primitive object={materials.cartilage} attach="material" />
      </mesh>

      {/* Tendón de Aquiles */}
      <Line points={achilles} color={TENDON_COLOR} lineWidth={5} />

      {/* Fulcro en las cabezas de los metatarsianos */}
      <mesh position={forefoot.toArray()}>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color={SLATE} emissive={SLATE} emissiveIntensity={0.3} />
      </mesh>
      <Html position={[forefoot.x, forefoot.y - 0.03, forefoot.z]} center zIndexRange={[80, 0]}>
        <span style={{ background: 'rgba(255,255,255,0.85)', color: SLATE, fontSize: '0.5rem', fontWeight: 700, fontFamily: 'Karla, sans-serif', padding: '1px 4px', borderRadius: 3, whiteSpace: 'nowrap' }}>
          fulcro · metatarsianos
        </span>
      </Html>

      {/* ── Vectores ── */}
      <ForceArrow origin={[heel.x, heel.y, heel.z]} vector={mVec} color={TEAL} label={`M = ${M.toFixed(0)} N`} sublabel={`Aquiles · ${(M / Wb).toFixed(2)}·Wb`} />
      <ForceArrow origin={forefoot.toArray()} vector={nVec} color={SLATE} label={`N = Wb = ${Wb.toFixed(0)} N`} sublabel="normal del suelo" />
      <ForceArrow origin={ankleC.toArray()} vector={rVec} color={RED} label={`R = ${R.toFixed(0)} N`} sublabel={`astrágalo · ${(R / Wb).toFixed(2)}·Wb`} />

      {showComponents && (
        <>
          <ForceArrow origin={ankleC.toArray()} vector={[rxN * S, 0, 0]} color="#0284c7" label={`Rx = ${Math.abs(rxN).toFixed(0)} N`} dashed />
          <ForceArrow origin={[ankleC.x + rxN * S, ankleC.y, ankleC.z]} vector={[0, ryN * S, 0]} color={TEAL} label={`Ry = ${Math.abs(ryN).toFixed(0)} N`} dashed />
        </>
      )}

      {/* Brazo de palanca fulcro → tobillo */}
      <Line points={[forefoot.toArray(), [ankleC.x, ankleC.y, ankleC.z]]} color={AMBER} lineWidth={1} dashed dashScale={30} dashSize={0.012} gapSize={0.01} transparent opacity={0.5} />
    </group>
    </group>
  );
}

export default function AnkleCanvas({
  betaDeg = 60,
  bodyWeightN = 882,
  showComponents = false,
}: AnkleCanvasProps) {
  return (
    <AnatomyStage
      className="cap2-webgl-canvas"
      camera={{ position: [0.4, 0.3, 3.4], fov: 40 }}
      target={[0, 0, 0]}
      minDistance={1.5}
      maxDistance={7}
      grid={false}
      shadow={false}
    >
      <AnkleAnatomy betaDeg={betaDeg} bodyWeightN={bodyWeightN} showComponents={showComponents} />
    </AnatomyStage>
  );
}

preloadAnatomy('body', 'muscles_hip_leg');
