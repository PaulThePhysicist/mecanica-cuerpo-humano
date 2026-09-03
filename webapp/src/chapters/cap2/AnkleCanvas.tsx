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

function AnkleAnatomy({ betaDeg, bodyWeightN, showComponents }: AnkleCanvasProps) {
  const bone = useAnatomyNodes('body');
  const muscle = useAnatomyNodes('muscles_hip_leg');

  // ── Biomecánica de puntillas (2.39–2.40) ──
  // Herman define θ y β de modo que cos(θ+β) puede salir negativo para β
  // grandes; lo que importa son las MAGNITUDES.
  const beta = betaDeg * DEG;
  const Wb = bodyWeightN;
  // El modelo de Herman tiene una singularidad en θ+β = 90° (β ≈ 45°); el
  // slide restringe β a 55–75°, bien lejos de ella. Clamp de seguridad.
  const denom = Math.max(0.16, Math.abs(Math.cos(THETA + beta)));
  const M = (Wb * Math.abs(Math.cos(beta))) / denom;

  const emg = Math.min(1.4, 0.25 + M / (Wb * 3));
  const surMat = useMemo(() => makeMuscleActive(emg), [emg]);

  const S = 0.00006; // N → unidades de mundo

  // Al ponerse de puntillas, el pie (y con él la pierna) gira sobre el fulcro
  // metatarsiano y el talón se eleva.
  const gamma = (betaDeg - REST_BETA) * DEG;
  const ankP = pivot(ANKLE_C, gamma);
  const heelP = pivot(ACH_HEEL, gamma);
  const calfP = pivot(CALF_TOP, gamma);

  // Aquiles: del calcáneo hacia el vientre del tríceps sural.
  const achDir = calfP.clone().sub(heelP).normalize();
  const mVec: [number, number, number] = [achDir.x * M * S, achDir.y * M * S, achDir.z * M * S];
  // Normal del suelo bajo el fulcro, vertical hacia arriba = Wb (fija).
  const nVec: [number, number, number] = [0, Wb * S, 0];
  // Reacción en el astrágalo:  R = −(N + M)  (cierra ΣF = 0).
  const rxN = -(achDir.x * M);
  const ryN = -(Wb + achDir.y * M);
  const rzN = -(achDir.z * M);
  const R = Math.hypot(rxN, ryN, rzN);
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
      <Html position={[FULCRUM.x, FULCRUM.y - 0.028, FULCRUM.z]} center zIndexRange={[80, 0]}>
        <span style={{ background: 'rgba(255,255,255,0.85)', color: SLATE, fontSize: '0.5rem', fontWeight: 700, fontFamily: 'Karla, sans-serif', padding: '1px 4px', borderRadius: 3, whiteSpace: 'nowrap' }}>
          fulcro · metatarsianos
        </span>
      </Html>

      {/* Suelo */}
      <mesh position={[FULCRUM.x, FULCRUM.y - 0.004, FULCRUM.z + 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.34, 0.26]} />
        <meshStandardMaterial color="#e6ddc8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Vectores ── */}
      <ForceArrow origin={heelP.toArray()} vector={mVec} color={TEAL} label={`M = ${M.toFixed(0)} N`} sublabel={`Aquiles · ${(M / Wb).toFixed(2)}·Wb`} />
      <ForceArrow origin={FULCRUM.toArray()} vector={nVec} color={SLATE} label={`N = Wb = ${Wb.toFixed(0)} N`} sublabel="normal del suelo" />
      <ForceArrow origin={ankP.toArray()} vector={rVec} color={RED} label={`R = ${R.toFixed(0)} N`} sublabel={`astrágalo · ${(R / Wb).toFixed(2)}·Wb`} />

      {showComponents && (
        <>
          <ForceArrow origin={ankP.toArray()} vector={[0, 0, rzN * S]} color="#0284c7" label={`R∥ = ${Math.abs(rzN).toFixed(0)} N`} dashed />
          <ForceArrow origin={[ankP.x, ankP.y, ankP.z + rzN * S]} vector={[0, ryN * S, 0]} color={TEAL} label={`R⊥ = ${Math.abs(ryN).toFixed(0)} N`} dashed />
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
  return (
    <AnatomyStage
      className="cap2-webgl-canvas"
      camera={{ position: [-3.0, 0.35, 1.2], fov: 36 }}
      target={[0.02, 0.0, 0.04]}
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
