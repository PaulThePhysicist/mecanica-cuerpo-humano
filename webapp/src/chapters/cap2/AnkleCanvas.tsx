import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { AnatomyStage } from '../cap1/three/AnatomyStage';
import { useAnatomyNodes, preloadAnatomy } from '../cap1/three/useAnatomyNodes';
import { materials, makeMuscleActive } from '../cap1/three/materials';
import { DclTag, DclReadout, type DclRow } from './DclReadout';

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
  symbol,
  dashed = false,
}: {
  origin: [number, number, number];
  vector: [number, number, number];
  color: string;
  symbol: string;
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
      <DclTag position={[tip.x + dir.x * 0.03, tip.y + dir.y * 0.03, tip.z + dir.z * 0.03]} color={color} symbol={symbol} />
    </group>
  );
}

const FOOT_NODES = [
  'talus_R', 'calcaneus_R', 'navicular_R', 'cuboid_R',
  'cuneiform_med_R', 'cuneiform_int_R', 'cuneiform_lat_R',
  'metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R',
];

// Landmarks en el espacio canónico del esqueleto (human_body.glb).
const ANKLE_C = new THREE.Vector3(-0.041, -0.466, -0.021);   // mortaja tibioastragalina
const FULCRUM = new THREE.Vector3(-0.048, -0.486, 0.030);    // cabezas de los metatarsianos
const ACH_HEEL = new THREE.Vector3(-0.015, -0.474, -0.048);  // inserción del Aquiles (calcáneo)
const CALF_TOP = new THREE.Vector3(-0.048, -0.320, -0.030);  // vientre del tríceps sural
const REST_BETA = 12; // ángulo del pie con el suelo en pose canónica
const DEG = Math.PI / 180;

// Rota un punto alrededor del fulcro en el plano sagital (eje X).
function pivot(p: THREE.Vector3, g: number): THREE.Vector3 {
  const d = p.clone().sub(FULCRUM);
  const c = Math.cos(g), s = Math.sin(g);
  return new THREE.Vector3(
    FULCRUM.x + d.x,
    FULCRUM.y + d.y * c - d.z * s,
    FULCRUM.z + d.y * s + d.z * c,
  );
}

/**
 * Estática del tobillo de puntillas (2.39–2.40) + geometría del DCL. Fuente
 * única compartida por `AnkleAnatomy` (flechas) y `AnkleCanvas` (panel de
 * lecturas) para que las cifras coincidan siempre.
 */
function ankleSolve(betaDeg: number, bodyWeightN: number) {
  // Herman define θ y β de modo que cos(θ+β) puede salir negativo para β
  // grandes; lo que importa son las MAGNITUDES. Singularidad en θ+β = 90°
  // (β ≈ 45°); el slide restringe β a 55–75°. Clamp de seguridad.
  const beta = betaDeg * DEG;
  const Wb = bodyWeightN;
  const denom = Math.max(0.16, Math.abs(Math.cos(THETA + beta)));
  const M = (Wb * Math.abs(Math.cos(beta))) / denom;

  const gamma = (betaDeg - REST_BETA) * DEG;
  const ankP = pivot(ANKLE_C, gamma);
  const heelP = pivot(ACH_HEEL, gamma);
  const calfP = pivot(CALF_TOP, gamma);
  const achDir = calfP.clone().sub(heelP).normalize();

  // Reacción en el astrágalo:  R = −(N + M)  (cierra ΣF = 0).
  const rxN = -(achDir.x * M);
  const ryN = -(Wb + achDir.y * M);
  const rzN = -(achDir.z * M);
  const R = Math.hypot(rxN, ryN, rzN);

  return { beta, Wb, M, gamma, ankP, heelP, calfP, achDir, rxN, ryN, rzN, R };
}

function AnkleAnatomy({ betaDeg, bodyWeightN, showComponents }: AnkleCanvasProps) {
  const bone = useAnatomyNodes('body');
  const muscle = useAnatomyNodes('muscles_hip_leg');

  // ── Biomecánica de puntillas (2.39–2.40) + geometría del DCL ──
  const { Wb, M, gamma, ankP, heelP, calfP, achDir, rxN, ryN, rzN, R } =
    ankleSolve(betaDeg, bodyWeightN);

  const emg = Math.min(1.4, 0.25 + M / (Wb * 3));
  const surMat = useMemo(() => makeMuscleActive(emg), [emg]);

  const S = 0.00006; // N → unidades de mundo

  const mVec: [number, number, number] = [achDir.x * M * S, achDir.y * M * S, achDir.z * M * S];
  // Normal del suelo bajo el fulcro, vertical hacia arriba = Wb (fija).
  const nVec: [number, number, number] = [0, Wb * S, 0];
  const rVec: [number, number, number] = [rxN * S, ryN * S, rzN * S];

  const achillesLine: [number, number, number][] = [heelP.toArray(), calfP.toArray()];

  return (
    <group scale={4.4} position={[-0.12, -0.06, -0.12]}>
    <group position={[-FULCRUM.x, -FULCRUM.y, -FULCRUM.z]}>
      {/* ── Pie + pierna: giran juntos sobre el fulcro metatarsiano ── */}
      <group rotation={[gamma, 0, 0]} position={FULCRUM.toArray()}>
        <group position={[-FULCRUM.x, -FULCRUM.y, -FULCRUM.z]}>
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
          {muscle.gastrocnemius_medial_head_R && (
            <mesh geometry={muscle.gastrocnemius_medial_head_R.geometry} material={surMat} />
          )}
          {muscle.gastrocnemius_lateral_head_R && (
            <mesh geometry={muscle.gastrocnemius_lateral_head_R.geometry} material={surMat} />
          )}
          {muscle.soleus_R && <mesh geometry={muscle.soleus_R.geometry} material={surMat} />}
          <mesh position={ANKLE_C.toArray()}>
            <sphereGeometry args={[0.012, 20, 20]} />
            <primitive object={materials.cartilage} attach="material" />
          </mesh>
        </group>
      </group>

      {/* Tendón de Aquiles (ya en coordenadas de mundo giradas) */}
      <Line points={achillesLine} color={TENDON_COLOR} lineWidth={6} />

      {/* Fulcro metatarsiano */}
      <mesh position={FULCRUM.toArray()}>
        <sphereGeometry args={[0.007, 16, 16]} />
        <meshStandardMaterial color={SLATE} emissive={SLATE} emissiveIntensity={0.3} />
      </mesh>
      <DclTag position={[FULCRUM.x, FULCRUM.y - 0.026, FULCRUM.z]} color={SLATE} symbol="fulcro" />

      {/* Suelo */}
      <mesh position={[FULCRUM.x, FULCRUM.y - 0.004, FULCRUM.z + 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.34, 0.26]} />
        <meshStandardMaterial color="#e6ddc8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Vectores (símbolo mínimo; magnitudes en el panel de esquina) ── */}
      <ForceArrow origin={heelP.toArray()} vector={mVec} color={TEAL} symbol="M" />
      <ForceArrow origin={FULCRUM.toArray()} vector={nVec} color={SLATE} symbol="N" />
      <ForceArrow origin={ankP.toArray()} vector={rVec} color={RED} symbol="R" />

      {showComponents && (
        <>
          <ForceArrow origin={ankP.toArray()} vector={[0, 0, rzN * S]} color="#0284c7" symbol="R∥" dashed />
          <ForceArrow origin={[ankP.x, ankP.y, ankP.z + rzN * S]} vector={[0, ryN * S, 0]} color={TEAL} symbol="R⊥" dashed />
        </>
      )}

      {/* Brazo de palanca fulcro → tobillo */}
      <Line points={[FULCRUM.toArray(), ankP.toArray()]} color={AMBER} lineWidth={1.2} dashed dashScale={26} dashSize={0.014} gapSize={0.01} transparent opacity={0.55} />
    </group>
    </group>
  );
}

export default function AnkleCanvas({
  betaDeg = 60,
  bodyWeightN = 882,
  showComponents = false,
}: AnkleCanvasProps) {
  const s = ankleSolve(betaDeg, bodyWeightN);
  const rows: DclRow[] = [
    { symbol: 'M', color: TEAL, value: `${s.M.toFixed(0)} N`, hint: `${(s.M / s.Wb).toFixed(2)}·Wb` },
    { symbol: 'N', color: SLATE, value: `${s.Wb.toFixed(0)} N`, hint: '= Wb' },
    { symbol: 'R', color: RED, value: `${s.R.toFixed(0)} N`, hint: `${(s.R / s.Wb).toFixed(2)}·Wb`, strong: true },
  ];
  if (showComponents) {
    rows.push({ symbol: 'R∥', color: '#0284c7', value: `${Math.abs(s.rzN).toFixed(0)} N`, hint: 'cizalla', muted: true });
    rows.push({ symbol: 'R⊥', color: TEAL, value: `${Math.abs(s.ryN).toFixed(0)} N`, hint: 'compresión', muted: true });
  }

  return (
    <AnatomyStage
      className="cap2-webgl-canvas"
      camera={{ position: [-3.0, 0.35, 1.2], fov: 36 }}
      target={[0.02, 0.0, 0.04]}
      minDistance={1.5}
      maxDistance={7}
      grid={false}
      shadow={false}
      overlay={
        <div
          style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            zIndex: 9,
            transform: 'scale(0.82)',
            transformOrigin: 'bottom left',
            pointerEvents: 'none',
          }}
        >
          <DclReadout
            title="De puntillas · DCL del tobillo"
            tone="#0d6e64"
            rows={rows}
            note={`Palanca de 2ª clase: para β = ${betaDeg}°, tanto M como R superan con creces el peso corporal.`}
          />
        </div>
      }
    >
      <AnkleAnatomy betaDeg={betaDeg} bodyWeightN={bodyWeightN} showComponents={showComponents} />
    </AnatomyStage>
  );
}

preloadAnatomy('body', 'muscles_hip_leg');
