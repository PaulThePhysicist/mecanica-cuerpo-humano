import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { AnatomyStage } from '../cap1/three/AnatomyStage';
import { useAnatomyNodes, preloadAnatomy } from '../cap1/three/useAnatomyNodes';
import { materials, makeMuscleActive } from '../cap1/three/materials';

/**
 * C3 · Estática de la rodilla (Herman §2.3.3, Figs. 2.23–2.27).
 *
 * Ejercicio de extensión de rodilla con peso en el tobillo. El cuádriceps,
 * vía tendón rotuliano, equilibra el peso de la pierna (W0) y la carga (W1):
 *
 *   M = (b·W1 + c·W0) · cosβ / (a · sinθ)        (2.34)
 *   Rx = M cos(θ+β) ,  Ry = M sin(θ+β) − W0 − W1  (2.35–2.36)
 *
 * La rótula actúa como polea: aleja la línea de acción del tendón del centro
 * articular y agranda el brazo de momento efectivo `a`. Sin ella, para el mismo
 * torque el cuádriceps debería tirar mucho más fuerte. El precio es la
 * compresión femoropatelar Fp (2.37).
 */

export interface KneeCanvasProps {
  betaDeg: number;      // ángulo pierna–horizontal (0 = horizontal, 90 = colgando)
  ankleLoadN: number;   // W1 · peso añadido en el tobillo
  patella: boolean;     // rótula presente (polea) vs. ausente (tendón en cuerda)
  showComponents: boolean;
}

const A_LEVER = 0.048;      // brazo de momento del tendón con rótula (~4,8 cm)
const A_LEVER_NOPAT = 0.022; // sin rótula el tendón roza el cóndilo (~2,2 cm)
const B_ARM = 0.22;        // rodilla → carga del tobillo (~22 cm)
const C_ARM = 0.20;        // rodilla → centro de masa de la pierna (~20 cm)
const THETA = (18 * Math.PI) / 180; // ángulo tendón rotuliano–tibia
const W0 = 45;             // peso de la pierna (N)

const TEAL = '#0d6e64';
const AMBER = '#d97706';
const RED = '#b02318';
const BLUE = '#0284c7';
const VIOLET = '#7c3aed';
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

function KneeAnatomy({ betaDeg, ankleLoadN, patella, showComponents }: KneeCanvasProps) {
  const bone = useAnatomyNodes('body');
  const muscle = useAnatomyNodes('muscles_hip_leg');

  // Centro articular ≈ centro del bounding box de la rótula derecha.
  const { kneeC, tuberosity } = useMemo(() => {
    const g = bone.patella_R?.geometry as THREE.BufferGeometry | undefined;
    let c = new THREE.Vector3(-0.05, -0.47, 0.02);
    if (g) {
      g.computeBoundingBox();
      c = g.boundingBox!.getCenter(new THREE.Vector3());
    }
    // Tuberosidad tibial: por debajo y ligeramente anterior a la rótula.
    const tub = c.clone().add(new THREE.Vector3(0.004, -0.055, 0.006));
    return { kneeC: c, tuberosity: tub };
  }, [bone]);

  // ── Biomecánica (2.34–2.37) ──
  const beta = (betaDeg * Math.PI) / 180;
  const W1 = ankleLoadN;
  const a = patella ? A_LEVER : A_LEVER_NOPAT;
  const torqueExt = (B_ARM * W1 + C_ARM * W0) * Math.cos(beta); // torque a vencer
  const M = torqueExt / (a * Math.sin(THETA));
  const rx = M * Math.cos(THETA + beta);
  const ry = M * Math.sin(THETA + beta) - W0 - W1;
  const R = Math.hypot(rx, ry);
  // Compresión femoropatelar: sólo con rótula, crece al flexionar.
  const fp = patella ? 2 * M * Math.sin((Math.PI / 2 - THETA) - beta * 0.5) : 0;

  const emg = Math.min(1.4, 0.3 + M / 1600);
  const quadMat = useMemo(() => makeMuscleActive(emg), [emg]);

  const S = 0.00006; // N → unidades de mundo (metros del modelo)

  // Dirección del tendón rotuliano (rótula → tuberosidad), en el plano sagital.
  const tendonDir = useMemo(() => {
    const d = tuberosity.clone().sub(kneeC).normalize();
    return d;
  }, [kneeC, tuberosity]);

  // Vector M: a lo largo del tendón, hacia proximal (tira de la tibia hacia el fémur).
  const mVec: [number, number, number] = [-tendonDir.x * M * S, -tendonDir.y * M * S, 0];
  // Pesos: verticales hacia abajo, aplicados en sus brazos sobre la tibia.
  const legComW: [number, number, number] = [kneeC.x - C_ARM * Math.cos(beta), kneeC.y - C_ARM * Math.sin(beta), kneeC.z];
  const ankleW: [number, number, number] = [kneeC.x - B_ARM * Math.cos(beta), kneeC.y - B_ARM * Math.sin(beta), kneeC.z];
  const w0Vec: [number, number, number] = [0, -W0 * S, 0];
  const w1Vec: [number, number, number] = [0, -W1 * S, 0];
  const rVec: [number, number, number] = [-rx * S, -ry * S, 0];

  // Líneas de acción / brazos de momento del tendón.
  const patApex = kneeC.clone().add(new THREE.Vector3(0, 0.012, patella ? 0.03 : 0.006));
  const tendonWithPat: [number, number, number][] = [
    [tuberosity.x, tuberosity.y, tuberosity.z],
    [patApex.x, patApex.y, patApex.z],
    [kneeC.x - 0.01, kneeC.y + 0.11, kneeC.z + (patella ? 0.018 : 0)],
  ];

  return (
    <group scale={5.2} position={[-0.35, 0.1, 0]}>
    <group position={[-kneeC.x, -kneeC.y, -kneeC.z]}>
      {/* ── Huesos ── */}
      {bone.femur_R && <mesh geometry={bone.femur_R.geometry} material={materials.bone} />}
      {bone.tibia_R && <mesh geometry={bone.tibia_R.geometry} material={materials.bone} />}
      {bone.fibula_R && <mesh geometry={bone.fibula_R.geometry} material={materials.bone} />}
      {patella && bone.patella_R && (
        <mesh geometry={bone.patella_R.geometry} material={materials.boneHighlight} />
      )}

      {/* ── Cuádriceps (recto femoral) ── */}
      {muscle.rectus_femoris_R && (
        <mesh geometry={muscle.rectus_femoris_R.geometry} material={quadMat} />
      )}
      {/* Isquiotibial antagonista, tono basal */}
      {muscle.biceps_femoris_long_head_R && (
        <mesh geometry={muscle.biceps_femoris_long_head_R.geometry} material={materials.muscleIdle} />
      )}

      {/* Cartílago del centro articular */}
      <mesh position={kneeC.toArray()}>
        <sphereGeometry args={[0.014, 20, 20]} />
        <primitive object={materials.cartilage} attach="material" />
      </mesh>

      {/* ── Tendón rotuliano / línea de acción ── */}
      <Line points={tendonWithPat} color={TENDON_COLOR} lineWidth={4} />
      {!patella && (
        <Html position={[kneeC.x - 0.14, kneeC.y + 0.12, kneeC.z]} center zIndexRange={[80, 0]}>
          <span style={{ background: 'rgba(255,255,255,0.85)', color: RED, fontSize: '0.52rem', fontWeight: 700, fontFamily: 'Karla, sans-serif', padding: '1px 4px', borderRadius: 3, whiteSpace: 'nowrap' }}>
            sin rótula · brazo {(A_LEVER_NOPAT * 100).toFixed(1)} cm
          </span>
        </Html>
      )}

      {/* Brazo de momento perpendicular (rodilla → línea del tendón) */}
      <Line
        points={[[kneeC.x, kneeC.y, kneeC.z], [kneeC.x, kneeC.y, kneeC.z + (patella ? 0.045 : 0.02)]]}
        color={patella ? TEAL : RED}
        lineWidth={2}
        dashed
        dashScale={40}
        dashSize={0.01}
        gapSize={0.008}
      />

      {/* ── Vectores de fuerza ── */}
      <ForceArrow origin={[tuberosity.x, tuberosity.y, tuberosity.z]} vector={mVec} color={TEAL} label={`M = ${M.toFixed(0)} N`} sublabel={patella ? 'cuádriceps · con rótula' : '⚠ cuádriceps · sin rótula'} />
      <ForceArrow origin={legComW} vector={w0Vec} color={AMBER} label={`W₀ = ${W0} N`} sublabel="peso de la pierna" />
      <ForceArrow origin={ankleW} vector={w1Vec} color={AMBER} label={`W₁ = ${W1} N`} sublabel="carga en el tobillo" />
      <ForceArrow origin={kneeC.toArray()} vector={rVec} color={RED} label={`R = ${R.toFixed(0)} N`} sublabel="reacción tibiofemoral" />

      {showComponents && (
        <>
          <ForceArrow origin={kneeC.toArray()} vector={[-rx * S, 0, 0]} color={BLUE} label={`Rx = ${rx.toFixed(0)} N`} dashed />
          <ForceArrow origin={[kneeC.x - rx * S, kneeC.y, kneeC.z]} vector={[0, -ry * S, 0]} color={TEAL} label={`Ry = ${ry.toFixed(0)} N`} dashed />
        </>
      )}

      {patella && fp > 0 && (
        <ForceArrow
          origin={[patApex.x, patApex.y, patApex.z]}
          vector={[0, -0.02, fp * S]}
          color={VIOLET}
          label={`Fp = ${fp.toFixed(0)} N`}
          sublabel="compresión femoropatelar"
          dashed
        />
      )}

      {/* Guías de brazo de palanca a los pesos */}
      <Line points={[[kneeC.x, kneeC.y, kneeC.z], legComW]} color={AMBER} lineWidth={1} dashed dashScale={30} dashSize={0.012} gapSize={0.01} transparent opacity={0.5} />
      <Line points={[[kneeC.x, kneeC.y, kneeC.z], ankleW]} color={AMBER} lineWidth={1} dashed dashScale={30} dashSize={0.012} gapSize={0.01} transparent opacity={0.4} />
    </group>
    </group>
  );
}

export default function KneeCanvas({
  betaDeg = 45,
  ankleLoadN = 150,
  patella = true,
  showComponents = false,
}: KneeCanvasProps) {
  return (
    <AnatomyStage
      className="cap2-webgl-canvas"
      camera={{ position: [0.35, 0.25, 3.6], fov: 40 }}
      target={[0, 0, 0]}
      minDistance={1.6}
      maxDistance={7}
      grid={false}
      shadow={false}
    >
      <KneeAnatomy betaDeg={betaDeg} ankleLoadN={ankleLoadN} patella={patella} showComponents={showComponents} />
    </AnatomyStage>
  );
}

preloadAnatomy('body', 'muscles_hip_leg');
