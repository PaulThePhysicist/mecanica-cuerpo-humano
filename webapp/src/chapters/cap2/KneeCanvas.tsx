import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { AnatomyStage } from '../cap1/three/AnatomyStage';
import { useAnatomyNodes, preloadAnatomy } from '../cap1/three/useAnatomyNodes';
import { materials, makeMuscleActive } from '../cap1/three/materials';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

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
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
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
  sub,
  emphasis,
  dashed = false,
}: {
  origin: [number, number, number];
  vector: [number, number, number];
  color: string;
  /** Letrero para el riel lateral (símbolo = valor). */
  label: string;
  sub?: string;
  emphasis?: 'strong' | 'muted';
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
      {/* Letrero → riel lateral (símbolo = valor), con línea guía a la punta. */}
      <Callout
        position={[tip.x + dir.x * 0.03, tip.y + dir.y * 0.03, tip.z + dir.z * 0.03]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// Landmarks en el espacio canónico del esqueleto (human_body.glb).
const KNEE_C = new THREE.Vector3(-0.045, -0.250, -0.010);   // centro tibiofemoral
const LEG_COM = new THREE.Vector3(-0.043, -0.352, -0.017);  // CdM de la pierna (mitad de la tibia)
const ANKLE_C = new THREE.Vector3(-0.041, -0.466, -0.021);  // tobillo (carga W1)
const TUBEROSITY = new THREE.Vector3(-0.045, -0.286, 0.012); // inserción del tendón rotuliano
const DEG = Math.PI / 180;

// Rota un punto alrededor de KNEE_C en el plano sagital (eje X).
function swing(p: THREE.Vector3, alpha: number): THREE.Vector3 {
  const d = p.clone().sub(KNEE_C);
  const c = Math.cos(alpha), s = Math.sin(alpha);
  return new THREE.Vector3(
    KNEE_C.x + d.x,
    KNEE_C.y + d.y * c - d.z * s,
    KNEE_C.z + d.y * s + d.z * c,
  );
}

/**
 * Resuelve la estática de la rodilla (2.34–2.37) + la geometría del DCL. Única
 * fuente de verdad: la usan `KneeAnatomy` (flechas del canvas) y `KneeCanvas`
 * (panel de lecturas de esquina), así que siempre coinciden.
 */
function kneeSolve(betaDeg: number, ankleLoadN: number, patella: boolean) {
  const beta = betaDeg * DEG;
  const W1 = ankleLoadN;
  const a = patella ? A_LEVER : A_LEVER_NOPAT;
  const torqueExt = (B_ARM * W1 + C_ARM * W0) * Math.cos(beta); // torque a vencer
  const M = torqueExt / (a * Math.sin(THETA));
  const Mnopat = torqueExt / (A_LEVER_NOPAT * Math.sin(THETA));
  // Compresión femoropatelar: sólo con rótula, crece al flexionar.
  const fp = patella ? 2 * M * Math.sin(Math.PI / 2 - THETA - beta * 0.5) : 0;

  // La pierna canónica cuelga vertical (β = 90°); al bajar β la extendemos.
  const alpha = -(90 - betaDeg) * DEG;
  const comP = swing(LEG_COM, alpha);
  const ankP = swing(ANKLE_C, alpha);
  const tubP = swing(TUBEROSITY, alpha);
  // La rótula desvía la línea del tendón hacia anterior (+Z) = más brazo de momento.
  const patApex = KNEE_C.clone().add(new THREE.Vector3(0, 0.010, patella ? 0.028 : 0.006));
  const mDir = patApex.clone().sub(tubP).normalize();

  // R cierra ΣF = 0 en el centro articular:  R = −(M + W0 + W1).
  const rxN = -(mDir.x * M);
  const ryN = -(mDir.y * M - W0 - W1);
  const rzN = -(mDir.z * M);
  const R = Math.hypot(rxN, ryN, rzN);

  return { beta, W1, a, M, Mnopat, fp, alpha, comP, ankP, tubP, patApex, mDir, rxN, ryN, rzN, R };
}

function KneeAnatomy({ betaDeg, ankleLoadN, patella, showComponents }: KneeCanvasProps) {
  const bone = useAnatomyNodes('body');
  const muscle = useAnatomyNodes('muscles_hip_leg');

  // ── Biomecánica (2.34–2.37) + geometría del DCL ──
  const { W1, M, fp, alpha, ankP, tubP, patApex, mDir, rxN, ryN, rzN, R } =
    kneeSolve(betaDeg, ankleLoadN, patella);

  const emg = Math.min(1.4, 0.3 + M / 1600);
  const quadMat = useMemo(() => makeMuscleActive(emg), [emg]);

  const S = 0.00005; // N → unidades de mundo (metros del modelo)

  // ── Vectores ──
  const w1Vec: [number, number, number] = [0, -W1 * S, 0];
  const mVec: [number, number, number] = [mDir.x * M * S, mDir.y * M * S, mDir.z * M * S];
  const rVec: [number, number, number] = [rxN * S, ryN * S, rzN * S];

  // Letreros del riel lateral (mismos valores que llenaban el DclReadout de esquina).
  const lM = `M = ${M.toFixed(0)} N`;
  const lW1 = `W₁ = ${W1.toFixed(0)} N`;
  const lR = `R = ${R.toFixed(0)} N`;

  const tendonPath: [number, number, number][] = [
    tubP.toArray(),
    patApex.toArray(),
    [KNEE_C.x, KNEE_C.y + 0.14, KNEE_C.z + (patella ? 0.016 : 0)],
  ];

  return (
    <group scale={3.2} position={[-0.24, -0.02, -0.14]}>
    <group position={[-KNEE_C.x, -KNEE_C.y, -KNEE_C.z]}>
      {/* ── Muslo fijo: fémur + cuádriceps ── */}
      {bone.femur_R && <mesh geometry={bone.femur_R.geometry} material={materials.bone} />}
      {muscle.rectus_femoris_R && (
        <mesh geometry={muscle.rectus_femoris_R.geometry} material={quadMat} />
      )}
      {muscle.biceps_femoris_long_head_R && (
        <mesh geometry={muscle.biceps_femoris_long_head_R.geometry} material={materials.muscleIdle} />
      )}

      {/* ── Pierna móvil: tibia + peroné + rótula giran sobre el centro articular ── */}
      <group rotation={[alpha, 0, 0]} position={KNEE_C.toArray()}>
        <group position={[-KNEE_C.x, -KNEE_C.y, -KNEE_C.z]}>
          {bone.tibia_R && <mesh geometry={bone.tibia_R.geometry} material={materials.bone} />}
          {bone.fibula_R && <mesh geometry={bone.fibula_R.geometry} material={materials.bone} />}
          {patella && bone.patella_R && (
            <mesh geometry={bone.patella_R.geometry} material={materials.boneHighlight} />
          )}
        </group>
      </group>

      {/* Cartílago del centro articular */}
      <mesh position={KNEE_C.toArray()}>
        <sphereGeometry args={[0.013, 20, 20]} />
        <primitive object={materials.cartilage} attach="material" />
      </mesh>

      {/* ── Tendón rotuliano / línea de acción ── */}
      <Line points={tendonPath} color={TENDON_COLOR} lineWidth={patella ? 5 : 3} />
      {!patella && (
        <Line points={[tubP.toArray(), [KNEE_C.x, KNEE_C.y + 0.14, KNEE_C.z]]} color={RED} lineWidth={2} dashed dashScale={40} dashSize={0.012} gapSize={0.01} />
      )}

      {/* ── Vectores de fuerza (letrero → riel lateral con línea guía) ──
          W₀ (peso de la pierna, ~45 N) es diminuto frente a M/R: no dibuja
          flecha ni ocupa el riel; su valor está en la ecuación del slide.
          W₁ solo aparece cuando la carga del tobillo basta para verse. */}
      <ForceArrow origin={tubP.toArray()} vector={mVec} color={TEAL} label={lM} sub={patella ? 'cuádriceps' : 'sin rótula ⚠'} />
      <ForceArrow origin={ankP.toArray()} vector={w1Vec} color={AMBER} label={lW1} sub="carga en el tobillo" emphasis="muted" />
      <ForceArrow origin={KNEE_C.toArray()} vector={rVec} color={RED} label={lR} sub="tibiofemoral" emphasis="strong" />

      {showComponents && (
        <>
          <ForceArrow origin={KNEE_C.toArray()} vector={[0, 0, rzN * S]} color={BLUE} label={`Rt = ${Math.abs(rzN).toFixed(0)} N`} sub="cizalla" emphasis="muted" dashed />
          <ForceArrow origin={[KNEE_C.x, KNEE_C.y, KNEE_C.z + rzN * S]} vector={[0, ryN * S, 0]} color={TEAL} label={`Rn = ${Math.abs(ryN).toFixed(0)} N`} sub="compresión" emphasis="muted" dashed />
        </>
      )}

      {patella && fp > 8 && (
        <ForceArrow
          origin={patApex.toArray()}
          vector={[0, -0.015, -fp * S]}
          color={VIOLET}
          label={`Fp = ${fp.toFixed(0)} N`}
          sub="femoropatelar"
          emphasis="muted"
          dashed
        />
      )}

      {/* Guía del eje de la pierna (rodilla → tobillo) */}
      <Line points={[[KNEE_C.x, KNEE_C.y, KNEE_C.z], ankP.toArray()]} color={AMBER} lineWidth={1} dashed dashScale={30} dashSize={0.012} gapSize={0.01} transparent opacity={0.4} />
    </group>
    </group>
  );
}

export default function KneeCanvas({
  showLabels = false,
  betaDeg = 45,
  ankleLoadN = 150,
  patella = true,
  showComponents = false,
}: KneeCanvasProps) {
  const callouts = useCalloutStore();
  const s = kneeSolve(betaDeg, ankleLoadN, patella);
  const mWithPatella = kneeSolve(betaDeg, ankleLoadN, true).M;
  const railNote = patella
    ? `Rótula = polea: brazo a ≈ 4,8 cm. Sin ella (a ≈ 2,2 cm) el cuádriceps tiraría M ≈ ${s.Mnopat.toFixed(0)} N.`
    : `Sin rótula: brazo a ≈ 2,2 cm → M ≈ ${s.M.toFixed(0)} N. Con rótula bastarían ${mWithPatella.toFixed(0)} N.`;

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
      <AnatomyStage
        className="cap2-webgl-canvas"
        camera={{ position: [-3.1, 0.1, 1.15], fov: 36 }}
        target={[0.02, -0.05, 0.05]}
        minDistance={1.6}
        maxDistance={7}
        grid={false}
        shadow={false}
        overlay={
          <>
            <CalloutRail store={callouts} side="left" note={railNote} />
          </>
        }
      >
        <KneeAnatomy betaDeg={betaDeg} ankleLoadN={ankleLoadN} patella={patella} showComponents={showComponents} />
        <CalloutSource />
      </AnatomyStage>
    </CalloutProvider>
  );
}

preloadAnatomy('body', 'muscles_hip_leg');
