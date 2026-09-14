import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AnatomyStage } from './three/AnatomyStage';
import { useAnatomyNodes } from './three/useAnatomyNodes';
import { materials } from './three/materials';
import { BONE } from './colorTokens';

export interface KinematicAngles {
  joint1: number;       // Hombro / Cadera - Flexión/Extensión (Pitch)
  joint1_yaw?: number;   // Hombro / Cadera - Abducción/Aducción (Yaw)
  joint1_roll?: number;  // Hombro / Cadera - Rotación Axial (Roll)
  joint2: number;       // Codo / Rodilla - Flexión/Extensión (Bisagra 1 GL)
  pivot: number;        // Pivote radiocubital - Pronación/Supinación (1 GL, solo brazo)
  joint3: number;       // Muñeca / Tobillo - Flexión/Extensión (Pitch)
  joint3_yaw?: number;   // Muñeca / Tobillo - Desviación / Inversión (2 GL)
}

interface KinematicsProps {
  mode: 6 | 7; // 6 = Pierna, 7 = Brazo
  angles: KinematicAngles;
  isAnimating?: boolean;
  layerMode?: 'atlas' | 'skeleton' | 'muscles';
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
  selectedJoint?: string | null;
  onSelectJoint?: (jointId: string | null) => void;
}

// ── Paleta Biomecánica Profesional ──
const CARTILAGE_ICE = new THREE.Color('#78d0c8');  // Cartílago articular translúcido

const COLOR_PITCH = '#b02318'; // Rojo · Flexión / Extensión
const COLOR_YAW   = '#0d6e64'; // Verde Teal · Abducción / Aducción / Desviación
const COLOR_ROLL  = '#5c6bc0'; // Azul Índigo · Rotación Axial / Pronación / Inversión

// ── Centros Articulares Exactos en Coordenadas GLB BodyParts3D ──
// Brazo Derecho (R)
const P_SHOULDER = new THREE.Vector3(-0.095, 0.311, -0.015);
const P_ELBOW    = new THREE.Vector3(-0.124, 0.145, -0.019);
const P_WRIST    = new THREE.Vector3(-0.155, 0.005, 0.008);
const P_RAD_HEAD = new THREE.Vector3(-0.136, 0.135, -0.018); // Cabeza radial (pivote proximal)

// Pierna Derecha (R)
const P_HIP   = new THREE.Vector3(-0.039, 0.002, -0.003);
const P_KNEE  = new THREE.Vector3(-0.040, -0.250, -0.019);
const P_ANKLE = new THREE.Vector3(-0.039, -0.460, -0.020);

// ── Indicador de Grado de Libertad 3D (Arco brillante con punta direccional) ──
function DofArc({
  radius = 0.038,
  axis = 'pitch',
  color = COLOR_PITCH,
  active = false,
  angleVal = 0,
  label = '',
}: {
  radius?: number;
  axis?: 'pitch' | 'yaw' | 'roll';
  color?: string;
  active?: boolean;
  angleVal?: number;
  label?: string;
}) {
  const rot: [number, number, number] =
    axis === 'pitch' ? [0, 0, 0] :
    axis === 'yaw' ? [0, Math.PI / 2, 0] :
    [Math.PI / 2, 0, 0];

  const arcLen = Math.PI * 1.45;

  return (
    <group rotation={rot}>
      {/* Anillo toroide del eje */}
      <mesh>
        <torusGeometry args={[radius, active ? 0.0024 : 0.0014, 16, 48, arcLen]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.8 : 0.35}
          transparent
          opacity={active ? 0.95 : 0.72}
          roughness={0.2}
        />
      </mesh>

      {/* Flecha direccional en el extremo positivo del arco */}
      <mesh
        position={[radius * Math.cos(arcLen), radius * Math.sin(arcLen), 0]}
        rotation={[0, 0, arcLen + Math.PI / 2]}
      >
        <coneGeometry args={[0.0045, 0.011, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.9 : 0.5} />
      </mesh>

      {/* Badge flotante cuando el joint está seleccionado */}
      {active && label && (
        <Html
          position={[radius * 0.95, radius * 0.3, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(255, 253, 248, 0.95)',
              border: `1px solid ${color}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              borderRadius: '4px',
              padding: '2px 5px',
              fontSize: '0.55rem',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#22303c',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span style={{ color }}>{label}:</span> {Math.round(angleVal)}°
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Núcleo Articular Interactivo y Arcos DOF ──
function JointIndicator({
  axes,
  selected = false,
  onClick,
  title,
  anglesMap = {},
}: {
  axes: { axis: 'pitch' | 'yaw' | 'roll'; label: string; color: string; val: number }[];
  selected?: boolean;
  onClick?: () => void;
  title: string;
  anglesMap?: Record<string, number>;
}) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Esfera articular central interactiva */}
      <mesh>
        <sphereGeometry args={[selected ? 0.014 : 0.009, 24, 24]} />
        <meshStandardMaterial
          color={selected ? '#0d6e64' : BONE}
          emissive={selected ? '#0d6e64' : '#000000'}
          emissiveIntensity={selected ? 0.7 : 0}
          roughness={0.35}
          metalness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Cartílago articular translúcido circundante */}
      <mesh>
        <sphereGeometry args={[selected ? 0.018 : 0.012, 20, 20]} />
        <meshStandardMaterial
          color={CARTILAGE_ICE}
          transparent
          opacity={selected ? 0.45 : 0.22}
          roughness={0.1}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Halo de pulsación cuando está activo */}
      {selected && (
        <mesh>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshBasicMaterial color="#0d6e64" transparent opacity={0.20} depthWrite={false} />
        </mesh>
      )}

      {/* Arcos de los grados de libertad */}
      {axes.map((ax, idx) => (
        <DofArc
          key={ax.axis + idx}
          axis={ax.axis}
          radius={0.032 + idx * 0.008}
          color={ax.color}
          active={selected}
          angleVal={ax.val}
          label={ax.label}
        />
      ))}
    </group>
  );
}

// ── Cadena Cinemática del Brazo (7 GL — Redundante) con Huesos Reales ──
function RealArmKinematics({
  angles,
  selectedJoint,
  onSelectJoint,
  nodes,
}: {
  angles: KinematicAngles;
  selectedJoint: string | null;
  onSelectJoint: (id: string | null) => void;
  nodes: Record<string, THREE.Mesh>;
}) {
  const scale = 11.0;

  // Materiales anatómicos estándar
  const boneMat = materials.bone;
  const baseMat = materials.boneContext;
  const highlightMat = materials.boneHighlight;


  // 1. Ángulos articulares en radianes
  // Hombro (3 GL): Flexión (Pitch), Abducción (Yaw), Rotación Axial (Roll)
  const shPitch = (angles.joint1 * Math.PI) / 180;
  const shYaw   = ((angles.joint1_yaw || 0) * Math.PI) / 180;
  const shRoll  = ((angles.joint1_roll || 0) * Math.PI) / 180;

  // Codo (1 GL): Flexión / Extensión (Hinge)
  const elPitch = (angles.joint2 * Math.PI) / 180;

  // Pivote radiocubital (1 GL): Pronación / Supinación (Roll)
  const pivRoll = (angles.pivot * Math.PI) / 180;

  // Muñeca (2 GL): Flexión / Extensión (Pitch), Desviación Radial / Cubital (Yaw)
  const wrPitch = (angles.joint3 * Math.PI) / 180;
  const wrYaw   = ((angles.joint3_yaw || 0) * Math.PI) / 180;

  // Posición del hombro en el espacio mundial (centrado para la cámara)
  const rootPos: [number, number, number] = [0, 1.4, 0];

  // Vectores de desplazamiento relativo entre articulaciones
  const dElbow = useMemo(
    () => new THREE.Vector3().subVectors(P_ELBOW, P_SHOULDER),
    []
  );
  const dWrist = useMemo(
    () => new THREE.Vector3().subVectors(P_WRIST, P_ELBOW),
    []
  );

  // Lista de huesos del carpo y mano derechos. En human_body.glb los metacarpianos
  // van interleados L/R sin sufijo: los índices 1,2,4,6,8 son la mano derecha
  // (x < 0), verificado por bbox.
  const carpalNames = useMemo(
    () => [
      'scaphoid_R', 'lunate_R', 'triquetral_R', 'pisiform_R',
      'trapezium_R', 'trapezoid_R', 'capitate_R', 'hamate_R',
      'metacarpal_1', 'metacarpal_2', 'metacarpal_4', 'metacarpal_6', 'metacarpal_8',
    ],
    []
  );

  return (
    <group position={rootPos} scale={scale}>
      {/* ── Base Fija: Escápula y Clavícula ── */}
      {/* Pivote real en el hombro; la rotación azul ocurre dentro de él. */}
      <group rotation={[0, Math.PI, 0]}>
        <group position={[-P_SHOULDER.x, -P_SHOULDER.y, -P_SHOULDER.z]}>
          {nodes.scapula_R && <mesh geometry={nodes.scapula_R.geometry} material={baseMat} />}
          {nodes.clavicle_R && <mesh geometry={nodes.clavicle_R.geometry} material={baseMat} />}
        </group>
      </group>

      {/* ── 1. ARTICULACIÓN DEL HOMBRO (Esferoidal · 3 GL) ── */}
      <JointIndicator
        title="Hombro"
        selected={selectedJoint === 'shoulder'}
        onClick={() => onSelectJoint(selectedJoint === 'shoulder' ? null : 'shoulder')}
        axes={[
          { axis: 'pitch', label: 'Flex', color: COLOR_PITCH, val: angles.joint1 },
          { axis: 'yaw',   label: 'Abd',  color: COLOR_YAW,   val: angles.joint1_yaw || 0 },
          { axis: 'roll',  label: 'Rot',  color: COLOR_ROLL,  val: angles.joint1_roll || 0 },
        ]}
      />

      {/* Segmento 1: Húmero (Brachium) */}
      <group rotation={[shPitch, shRoll, shYaw]}>
        <group position={[-P_SHOULDER.x, -P_SHOULDER.y, -P_SHOULDER.z]}>
          {nodes.humerus_R && (
            <mesh
              geometry={nodes.humerus_R.geometry}
              material={selectedJoint === 'shoulder' ? highlightMat : boneMat}
            />
          )}
        </group>

        {/* ── 2. ARTICULACIÓN DEL CODO (Bisagra · 1 GL) ── */}
        <group position={[dElbow.x, dElbow.y, dElbow.z]}>
          <JointIndicator
            title="Codo"
            selected={selectedJoint === 'elbow'}
            onClick={() => onSelectJoint(selectedJoint === 'elbow' ? null : 'elbow')}
            axes={[
              { axis: 'pitch', label: 'Flex', color: COLOR_PITCH, val: angles.joint2 },
            ]}
          />

          {/* Segmento 2: Antebrazo (Cúbito fijo en flexión + Radio móvil en pivote) */}
          <group rotation={[elPitch, 0, 0]}>
            {/* Cúbito (Ulna) - Alineado con la tróclea humeral */}
            <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
              {nodes.ulna_R && (
                <mesh
                  geometry={nodes.ulna_R.geometry}
                  material={selectedJoint === 'elbow' ? highlightMat : boneMat}
                />
              )}
            </group>

            {/* ── 3. PIVOTE RADIOCUBITAL (Trocoide · 1 GL Pronación/Supinación) ── */}
            <group position={[dWrist.x * 0.5, dWrist.y * 0.5, dWrist.z * 0.5]}>
              <JointIndicator
                title="Pivote"
                selected={selectedJoint === 'pivot'}
                onClick={() => onSelectJoint(selectedJoint === 'pivot' ? null : 'pivot')}
                axes={[
                  { axis: 'roll', label: 'Pron/Sup', color: '#9c27b0', val: angles.pivot },
                ]}
              />
            </group>

            {/* Radio (Radius) rotando sobre su eje longitudinal anatómico */}
            <group rotation={[0, pivRoll, 0]}>
              <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
                {nodes.radius_R && (
                  <mesh
                    geometry={nodes.radius_R.geometry}
                    material={selectedJoint === 'pivot' ? highlightMat : boneMat}
                  />
                )}
              </group>

              {/* ── 4. ARTICULACIÓN DE LA MUÑECA (Condílea · 2 GL) ── */}
              <group position={[dWrist.x, dWrist.y, dWrist.z]}>
                <JointIndicator
                  title="Muñeca"
                  selected={selectedJoint === 'wrist'}
                  onClick={() => onSelectJoint(selectedJoint === 'wrist' ? null : 'wrist')}
                  axes={[
                    { axis: 'pitch', label: 'Flex', color: COLOR_PITCH, val: angles.joint3 },
                    { axis: 'yaw',   label: 'Desv', color: COLOR_YAW,   val: angles.joint3_yaw || 0 },
                  ]}
                />

                {/* Segmento 3: Mano (Huesos del carpo y metacarpo) */}
                <group rotation={[wrPitch, 0, wrYaw]}>
                  <group position={[-P_WRIST.x, -P_WRIST.y, -P_WRIST.z]}>
                    {carpalNames.map((name) => {
                      const meshNode = nodes[name];
                      if (!meshNode) return null;
                      return (
                        <mesh
                          key={name}
                          geometry={meshNode.geometry}
                          material={selectedJoint === 'wrist' ? highlightMat : boneMat}
                        />
                      );
                    })}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// ── Cadena Cinemática de la Pierna (6 GL) con Huesos Reales ──
function RealLegKinematics({
  angles,
  selectedJoint,
  onSelectJoint,
  nodes,
}: {
  angles: KinematicAngles;
  selectedJoint: string | null;
  onSelectJoint: (id: string | null) => void;
  nodes: Record<string, THREE.Mesh>;
}) {
  const scale = 9.2;

  // Materiales anatómicos
  const boneMat = materials.bone;
  const baseMat = materials.boneContext;
  const highlightMat = materials.boneHighlight;

  // 1. Ángulos articulares
  // Cadera (3 GL): Flexión (Pitch), Abducción (Yaw), Rotación Axial (Roll)
  const hipPitch = (angles.joint1 * Math.PI) / 180;
  const hipYaw   = ((angles.joint1_yaw || 0) * Math.PI) / 180;
  const hipRoll  = ((angles.joint1_roll || 0) * Math.PI) / 180;

  // Rodilla (1 GL): Flexión posterior (Bisagra)
  const kneePitch = (-angles.joint2 * Math.PI) / 180;

  // Tobillo (2 GL): Flexión/Extensión (Pitch), Inversión/Eversión (Roll)
  const ankPitch = (angles.joint3 * Math.PI) / 180;
  const ankRoll  = ((angles.joint3_yaw || 0) * Math.PI) / 180;

  // Posición de la cadera en el espacio mundial
  const rootPos: [number, number, number] = [0, 1.8, 0];

  // Vectores de desplazamiento relativo
  const dKnee = useMemo(
    () => new THREE.Vector3().subVectors(P_KNEE, P_HIP),
    []
  );
  const dAnkle = useMemo(
    () => new THREE.Vector3().subVectors(P_ANKLE, P_KNEE),
    []
  );

  // Lista de huesos del tarso y pie
  const footNames = useMemo(
    () => [
      'talus_R', 'calcaneus_L', 'navicular_R', 'cuboid_R',
      'cuneiform_med_R', 'cuneiform_int_R', 'cuneiform_lat_R',
      'metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R',
    ],
    []
  );

  return (
    <group position={rootPos} scale={scale}>
      {/* ── Base Fija: Pelvis completa (contexto anatómico, no un iliaco suelto) ── */}
      <group position={[-P_HIP.x, -P_HIP.y, -P_HIP.z]}>
        {nodes.hip_R && <mesh geometry={nodes.hip_R.geometry} material={baseMat} />}
        {nodes.hip_L && <mesh geometry={nodes.hip_L.geometry} material={materials.boneGhost} />}
        {nodes.sacrum && <mesh geometry={nodes.sacrum.geometry} material={materials.boneGhost} />}
      </group>

      {/* ── 1. ARTICULACIÓN DE LA CADERA (Esferoidal · 3 GL) ── */}
      <JointIndicator
        title="Cadera"
        selected={selectedJoint === 'shoulder'}
        onClick={() => onSelectJoint(selectedJoint === 'shoulder' ? null : 'shoulder')}
        axes={[
          { axis: 'pitch', label: 'Flex', color: COLOR_PITCH, val: angles.joint1 },
          { axis: 'yaw',   label: 'Abd',  color: COLOR_YAW,   val: angles.joint1_yaw || 0 },
          { axis: 'roll',  label: 'Rot',  color: COLOR_ROLL,  val: angles.joint1_roll || 0 },
        ]}
      />

      {/* Segmento 1: Fémur (Muslo) articulando en el acetábulo */}
      <group rotation={[hipPitch, hipRoll, hipYaw]}>
        <group position={[-P_HIP.x, -P_HIP.y, -P_HIP.z]}>
          {nodes.femur_R && (
            <mesh
              geometry={nodes.femur_R.geometry}
              material={selectedJoint === 'shoulder' ? highlightMat : boneMat}
            />
          )}
        </group>

        {/* ── 2. ARTICULACIÓN DE LA RODILLA (Bisagra · 1 GL) ── */}
        <group position={[dKnee.x, dKnee.y, dKnee.z]}>
          <JointIndicator
            title="Rodilla"
            selected={selectedJoint === 'elbow'}
            onClick={() => onSelectJoint(selectedJoint === 'elbow' ? null : 'elbow')}
            axes={[
              { axis: 'pitch', label: 'Flex', color: COLOR_PITCH, val: angles.joint2 },
            ]}
          />

          {/* Rótula (Patella) deslizándose sobre la tróclea femoral anterior */}
          <group position={[-P_KNEE.x, -P_KNEE.y + Math.sin(kneePitch * 0.5) * 0.015, -P_KNEE.z + Math.sin(kneePitch) * 0.008]}>
            {nodes.patella_R && <mesh geometry={nodes.patella_R.geometry} material={boneMat} />}
          </group>

          {/* Segmento 2: Pierna (Tibia y Peroné articulando en flexión posterior) */}
          <group rotation={[kneePitch, 0, 0]}>
            <group position={[-P_KNEE.x, -P_KNEE.y, -P_KNEE.z]}>
              {nodes.tibia_R && (
                <mesh
                  geometry={nodes.tibia_R.geometry}
                  material={selectedJoint === 'elbow' ? highlightMat : boneMat}
                />
              )}
              {nodes.fibula_R && (
                <mesh
                  geometry={nodes.fibula_R.geometry}
                  material={selectedJoint === 'elbow' ? highlightMat : boneMat}
                />
              )}
            </group>

            {/* ── 3. ARTICULACIÓN DEL TOBILLO (Condílea / Tróclea · 2 GL) ── */}
            <group position={[dAnkle.x, dAnkle.y, dAnkle.z]}>
              <JointIndicator
                title="Tobillo"
                selected={selectedJoint === 'wrist'}
                onClick={() => onSelectJoint(selectedJoint === 'wrist' ? null : 'wrist')}
                axes={[
                  { axis: 'pitch', label: 'Flex', color: COLOR_PITCH, val: angles.joint3 },
                  { axis: 'roll',  label: 'Inv',  color: COLOR_ROLL,  val: angles.joint3_yaw || 0 },
                ]}
              />

              {/* Segmento 3: Pie (Tarso, metatarso y dedos) */}
              <group rotation={[ankPitch, 0, ankRoll]}>
                <group position={[-P_ANKLE.x, -P_ANKLE.y, -P_ANKLE.z]}>
                  {footNames.map((name) => {
                    const meshNode = nodes[name];
                    if (!meshNode) return null;
                    return (
                      <mesh
                        key={name}
                        geometry={meshNode.geometry}
                        material={selectedJoint === 'wrist' ? highlightMat : boneMat}
                      />
                    );
                  })}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// ── Componente Principal del Canvas 3D Cinemático ──
export default function KinematicsCanvas({
  mode,
  angles,
  resetSignal = 0,
  zoomSignal = null,
  selectedJoint = null,
  onSelectJoint = () => {},
}: KinematicsProps) {
  const nodes = useAnatomyNodes('body');

  return (
    <AnatomyStage
      camera={{ position: [5.57, 0.66, 8.85], fov: 40 }}
      target={[0, 0, 0]}
      minDistance={2.0}
      maxDistance={16}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 1.75}
      gridY={-3.2}
      shadowY={-3.19}
      shadowOpacity={0.48}
      resetSignal={resetSignal}
      zoomSignal={zoomSignal}
      fit
      fitPadding={2.0}
      refit={mode}
      onPointerMissed={() => onSelectJoint(null)}
    >
      {mode === 6 ? (
        <RealLegKinematics angles={angles} selectedJoint={selectedJoint} onSelectJoint={onSelectJoint} nodes={nodes} />
      ) : (
        <RealArmKinematics angles={angles} selectedJoint={selectedJoint} onSelectJoint={onSelectJoint} nodes={nodes} />
      )}
    </AnatomyStage>
  );
}
