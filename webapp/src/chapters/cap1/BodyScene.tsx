import React, { useMemo } from 'react';
import { Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FULL_BODY_FLOOR_Y, FULL_BODY_SCALE, FULL_BODY_SHADOW_Y } from './bodySceneGeometry';
import { AnatomyStage } from './three/AnatomyStage';
import { useAnatomyScene } from './three/useAnatomyNodes';
import { Axes } from './AnatomyCanvas';
import { ROM_MOTIONS, romAngleAt } from './romTable';
import type { MobilityRange } from './romTable';

export type { MobilityRange } from './romTable';

function ModelLoader() {
  return (
    <Html center>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #d4c7b0',
          borderRadius: '12px',
          padding: '1.2rem 1.6rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minWidth: '220px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            border: '3px solid #e0d7c7',
            borderTopColor: '#0d6e64',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 0.6rem',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#232c36' }}>
          Cargando Esqueleto 3D...
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6b7885', marginTop: '0.25rem' }}>
          Atlas Anatómico de 131 Huesos
        </div>
      </div>
    </Html>
  );
}

const BONE_BASE = new THREE.Color('#e8dcc4'); // marfil cálido
const HIGHLIGHT = new THREE.Color('#067a6b'); // teal regional

const MOBILITY_MODEL_SCALE = FULL_BODY_SCALE;
const SHOULDER_PIVOT = new THREE.Vector3(-0.095, 0.311, -0.015);
const ELBOW_PIVOT = new THREE.Vector3(-0.124, 0.145, -0.019);
const FOREARM_PIVOT = new THREE.Vector3(-0.136, 0.135, -0.018);
const WRIST_PIVOT = new THREE.Vector3(-0.155, 0.005, 0.008);
const HIP_PIVOT = new THREE.Vector3(-0.039, 0.002, -0.003);
const KNEE_PIVOT = new THREE.Vector3(-0.040, -0.250, -0.019);
const ANKLE_PIVOT = new THREE.Vector3(-0.039, -0.460, -0.020);

/* Membresía de cada cadena cinemática (lado derecho del esqueleto, X < 0 en el
   GLB). Ojo: `calcaneus_L` NO es una errata. En human_body.glb los dos calcáneos
   vienen con la etiqueta cambiada — el nodo `calcaneus_L` está en X = -0.043 (pie
   derecho) y `calcaneus_R` en X = +0.054 (pie izquierdo). Las listas de abajo van
   por posición real, no por sufijo, así que el talón que viaja con la pierna
   derecha es `calcaneus_L`. Los metacarpianos siguen el mismo criterio: los
   pares 1,2,4,6,8 son los de la mano derecha. */
function isShoulderMotionPart(name: string) {
  return [
    'humerus_R', 'radius_R', 'ulna_R', 'scaphoid_R', 'lunate_R',
    'triquetral_R', 'pisiform_R', 'trapezium_R', 'trapezoid_R',
    'capitate_R', 'hamate_R', 'metacarpal_1', 'metacarpal_2',
    'metacarpal_4', 'metacarpal_6', 'metacarpal_8',
  ].includes(name);
}

function isElbowMotionPart(name: string) {
  return [
    'radius_R', 'ulna_R', 'scaphoid_R', 'lunate_R', 'triquetral_R',
    'pisiform_R', 'trapezium_R', 'trapezoid_R', 'capitate_R', 'hamate_R',
    'metacarpal_1', 'metacarpal_2', 'metacarpal_4', 'metacarpal_6', 'metacarpal_8',
  ].includes(name);
}

function isForearmRotationPart(name: string) {
  return [
    'radius_R', 'scaphoid_R', 'lunate_R', 'triquetral_R', 'pisiform_R',
    'trapezium_R', 'trapezoid_R', 'capitate_R', 'hamate_R',
    'metacarpal_1', 'metacarpal_2', 'metacarpal_4', 'metacarpal_6', 'metacarpal_8',
  ].includes(name);
}

function isWristMotionPart(name: string) {
  return [
    'scaphoid_R', 'lunate_R', 'triquetral_R', 'pisiform_R',
    'trapezium_R', 'trapezoid_R', 'capitate_R', 'hamate_R',
    'metacarpal_1', 'metacarpal_2', 'metacarpal_4', 'metacarpal_6', 'metacarpal_8',
  ].includes(name);
}

function isHipMotionPart(name: string) {
  return [
    'femur_R', 'patella_R', 'tibia_R', 'fibula_R',
    'talus_R', 'calcaneus_L', 'navicular_R', 'cuboid_R',
    'cuneiform_med_R', 'cuneiform_int_R', 'cuneiform_lat_R',
    'metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R',
  ].includes(name);
}

function isKneeMotionPart(name: string) {
  return [
    'tibia_R', 'fibula_R', 'talus_R', 'calcaneus_L', 'navicular_R', 'cuboid_R',
    'cuneiform_med_R', 'cuneiform_int_R', 'cuneiform_lat_R',
    'metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R',
  ].includes(name);
}

function isAnkleMotionPart(name: string) {
  return [
    'talus_R', 'calcaneus_L', 'navicular_R', 'cuboid_R',
    'cuneiform_med_R', 'cuneiform_int_R', 'cuneiform_lat_R',
    'metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R',
  ].includes(name);
}

/**
 * Abanico ROM: dibuja el recorrido de Tabla 1.10 como sector en el plano
 * anatómico del movimiento, más una aguja que marca el ángulo actual.
 *
 * El rayo neutro (posición anatómica) apunta a -Y local; el sector primario
 * barre en sentido horario y el secundario en antihorario, así que el conjunto
 * se lee como un goniómetro: los dos topes de la tabla y dónde está el hueso
 * ahora mismo. La aguja y el esqueleto salen del mismo `progress`, de modo que
 * no pueden desincronizarse.
 */
const NEUTRAL_RAY = -Math.PI / 2;

function MobilityRangeOverlay({ range, progress }: { range?: MobilityRange | null; progress: number }) {
  if (!range) return null;

  const motion = ROM_MOTIONS[range.joint];
  const planeRotation: [number, number, number] =
    range.plane === 'sagittal' ? [0, Math.PI / 2, 0] :
    // Convención anatómica de esta app: Y = mundo X, Z = mundo Y.
    // Por eso el plano anatómico YZ corresponde al XY nativo de Three.js.
    range.plane === 'coronal' ? [0, 0, 0] :
    // El plano anatómico XY corresponde al XZ nativo de Three.js.
    [Math.PI / 2, 0, 0];
  const primaryArc = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(range.primary), 0.18, Math.PI * 1.85);
  const secondaryArc = range.secondary
    ? THREE.MathUtils.clamp(THREE.MathUtils.degToRad(range.secondary), 0.18, Math.PI * 1.25)
    : 0;
  const anchor: [number, number, number] = [
    range.position[0] * MOBILITY_MODEL_SCALE,
    range.position[1] * MOBILITY_MODEL_SCALE,
    range.position[2] * MOBILITY_MODEL_SCALE,
  ];
  const radius = motion?.radius ?? 0.6;

  // Excursión > 0 = hacia el movimiento primario, que se dibuja en horario.
  const excursion = THREE.MathUtils.degToRad((romAngleAt(range.joint, progress) ?? 0) * (motion?.primarySign ?? 1));
  const needleAngle = NEUTRAL_RAY - excursion;

  return (
    <group position={anchor}>
      <mesh>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial color="#0d786d" emissive="#0d786d" emissiveIntensity={0.7} />
      </mesh>
      <group rotation={planeRotation}>
        {/* Sector primario: del neutro hacia el tope del movimiento principal. */}
        <mesh rotation={[0, 0, NEUTRAL_RAY - primaryArc]}>
          <torusGeometry args={[radius, 0.022, 10, 96, primaryArc]} />
          <meshBasicMaterial color="#087f72" transparent opacity={0.85} depthTest={false} depthWrite={false} />
        </mesh>
        {/* Sector secundario: del neutro hacia el tope contrario. */}
        {secondaryArc > 0 && (
          <mesh rotation={[0, 0, NEUTRAL_RAY]}>
            <torusGeometry args={[radius, 0.022, 10, 80, secondaryArc]} />
            <meshBasicMaterial color="#c04a3d" transparent opacity={0.8} depthTest={false} depthWrite={false} />
          </mesh>
        )}
        {/* Rayo neutro: la referencia contra la que se miden ambos topes. */}
        <mesh position={[0, -radius / 2, 0]}>
          <boxGeometry args={[0.012, radius, 0.012]} />
          <meshBasicMaterial color="#8d8271" transparent opacity={0.55} depthTest={false} depthWrite={false} />
        </mesh>
        {/* Aguja: ángulo actual, mismo `progress` que mueve el hueso. */}
        <group rotation={[0, 0, needleAngle + Math.PI / 2]}>
          <mesh position={[0, -radius / 2, 0]}>
            <boxGeometry args={[0.03, radius, 0.03]} />
            <meshBasicMaterial color="#b8860b" depthTest={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, -radius, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#b8860b" depthTest={false} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* Mapa región A3 -> nombres de nodo del esqueleto (GLB human_body.glb).
   Cada hueso del GLB tiene un node name (p.ej. 'humerus_L'); al seleccionar
   una región se tiñen de teal TODOS los huesos que la componen. Esto es
   robusto y no depende de proximidad: el hueso se pinta entero. */
const REGION_BONES: Record<string, string[]> = {
  'region-thorax': ['thoracic1','thoracic2','thoracic3','thoracic4','thoracic5','thoracic6','thoracic7','thoracic8','thoracic9','thoracic10','thoracic11','thoracic12','sternum','rib_1','rib_2','rib_3','rib_4','rib_5','rib_6','rib_7','rib_8','rib_9','rib_10','rib_11','rib_12','rib_13','rib_14','rib_15','rib_16','rib_17','rib_18','rib_19','rib_20','rib_21','rib_22','rib_23'],
  'region-digital': ['metacarpal_1','metacarpal_2','metacarpal_3','metacarpal_4','metacarpal_5','metacarpal_6','metacarpal_7','metacarpal_8','metacarpal_9','metatarsal1_L','metatarsal1_R','metatarsal2_L','metatarsal2_R','metatarsal3_L','metatarsal3_R','metatarsal4_L','metatarsal4_R','metatarsal5_L','metatarsal5_R'],
  'region-gluteal': ['hip_L','hip_R'],
  'region-plantar': ['metatarsal1_L','metatarsal1_R','metatarsal2_L','metatarsal2_R','metatarsal3_L','metatarsal3_R','metatarsal4_L','metatarsal4_R','metatarsal5_L','metatarsal5_R'],
  'region-vertebral': ['cervical3','cervical4','cervical5','cervical6','cervical7','thoracic1','thoracic2','thoracic3','thoracic4','thoracic5','thoracic6','thoracic7','thoracic8','thoracic9','thoracic10','thoracic11','thoracic12','lumbar1','lumbar2','lumbar3','lumbar4','lumbar5','sacrum'],
  'region-caput': ['frontal','parietal_L','parietal_R','temporal_L','temporal_R','occipital','sphenoid','ethmoid','zygomatic_L','zygomatic_R','maxilla_L','maxilla_R','nasal_L','nasal_R','mandible'],
  'region-cervical': ['cervical3','cervical4','cervical5','cervical6','cervical7'],
  'region-acromion': ['clavicle_L','clavicle_R','scapula_L','scapula_R'],
  'region-coxal': ['hip_L','hip_R'],
  'region-brachium': ['humerus_L','humerus_R'],
  'region-antebrachium': ['radius_L','radius_R','ulna_L','ulna_R'],
  'region-carpus': ['scaphoid_L','scaphoid_R','lunate_L','lunate_R','triquetral_L','triquetral_R','pisiform_L','pisiform_R','trapezium_L','trapezium_R','trapezoid_L','trapezoid_R','capitate_L','capitate_R','hamate_L','hamate_R'],
  'region-femur': ['femur_L','femur_R'],
  'region-popliteus': ['patella_L','patella_R'],
  'region-crus': ['tibia_L','tibia_R','fibula_L','fibula_R'],
  'region-tarsus': ['talus_L','talus_R','calcaneus_L','calcaneus_R','navicular_L','navicular_R','cuneiform_med_L','cuneiform_med_R','cuneiform_int_L','cuneiform_int_R','cuneiform_lat_L','cuneiform_lat_R','cuboid_L','cuboid_R','metatarsal1_L','metatarsal1_R','metatarsal2_L','metatarsal2_R','metatarsal3_L','metatarsal3_R','metatarsal4_L','metatarsal4_R','metatarsal5_L','metatarsal5_R'],
};

function AnatomyModel({ mode, selected, joint, progress }: { mode: string; selected: string | null; joint: string | null; progress: number }) {
  const scene = useAnatomyScene('body');

  // Clon + rig en UN SOLO useMemo, y por tanto sobre el mismo clon.
  //
  // Antes iban en dos memos: el segundo mutaba `clonedScene` (crea los pivotes y
  // les reparenta los huesos con .attach). Eso es un efecto secundario dentro de
  // un useMemo, y en StrictMode React lo invoca dos veces: la segunda pasada
  // robaba los 131 huesos hacia un SEGUNDO juego de pivotes, mientras el valor
  // que React conservaba apuntaba al primero — que quedaba vacío. Resultado: la
  // escena tenía 14 pivotes, el esqueleto colgaba de los que nadie animaba y
  // ningún ROM se movía. Clonando y armando en el mismo memo, cada invocación
  // produce un clon íntegro e independiente y da igual cuál conserve React.
  const { clonedScene, motionGroups } = useMemo(() => {
    const rig = scene.clone(true);
    rig.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // material uniforme para poder teñir por región sin lidiar con vertex colors
        const mat = new THREE.MeshStandardMaterial({
          color: BONE_BASE.clone(),
          roughness: 0.85,
          metalness: 0.0,
        });
        mesh.material = mat;
        mesh.userData.baseColor = BONE_BASE.clone();
        mesh.userData.boneName = mesh.name;
      }
    });

    const shoulder = new THREE.Group();
    shoulder.name = 'shoulder-motion-pivot';
    rig.updateMatrixWorld(true);
    const parts: THREE.Mesh[] = [];
    const lowerParts: THREE.Mesh[] = [];
    rig.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (isShoulderMotionPart(child.name)) parts.push(child as THREE.Mesh);
        if (isHipMotionPart(child.name)) lowerParts.push(child as THREE.Mesh);
      }
    });
    rig.add(shoulder);
    shoulder.position.copy(SHOULDER_PIVOT);
    parts.forEach((mesh) => shoulder.attach(mesh));

    const elbow = new THREE.Group();
    elbow.name = 'elbow-flexion-pivot';
    shoulder.add(elbow);
    elbow.position.copy(ELBOW_PIVOT).sub(SHOULDER_PIVOT);
    parts.filter((mesh) => isElbowMotionPart(mesh.name)).forEach((mesh) => elbow.attach(mesh));

    const forearm = new THREE.Group();
    forearm.name = 'forearm-pronation-pivot';
    elbow.add(forearm);
    forearm.position.copy(FOREARM_PIVOT).sub(ELBOW_PIVOT);
    forearm.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(WRIST_PIVOT, FOREARM_PIVOT).normalize(),
    );
    parts.filter((mesh) => isForearmRotationPart(mesh.name)).forEach((mesh) => forearm.attach(mesh));

    const wrist = new THREE.Group();
    wrist.name = 'wrist-flexion-pivot';
    forearm.add(wrist);
    // La flexión/extensión de muñeca gira alrededor del eje mediolateral
    // anatómico (Y de la app = X mundial). Neutralizar la orientación heredada
    // del antebrazo hace que el eje local X de este pivote coincida con él.
    wrist.quaternion.copy(forearm.quaternion).invert();
    wrist.position.copy(
      WRIST_PIVOT.clone()
        .sub(FOREARM_PIVOT)
        .applyQuaternion(forearm.quaternion.clone().invert()),
    );
    parts.filter((mesh) => isWristMotionPart(mesh.name)).forEach((mesh) => wrist.attach(mesh));

    const hip = new THREE.Group();
    hip.name = 'hip-flexion-pivot';
    rig.add(hip);
    hip.position.copy(HIP_PIVOT);
    lowerParts.forEach((mesh) => hip.attach(mesh));

    const knee = new THREE.Group();
    knee.name = 'knee-flexion-pivot';
    hip.add(knee);
    knee.position.copy(KNEE_PIVOT).sub(HIP_PIVOT);
    lowerParts.filter((mesh) => isKneeMotionPart(mesh.name)).forEach((mesh) => knee.attach(mesh));

    const ankle = new THREE.Group();
    ankle.name = 'ankle-flexion-pivot';
    knee.add(ankle);
    ankle.position.copy(ANKLE_PIVOT).sub(KNEE_PIVOT);
    lowerParts.filter((mesh) => isAnkleMotionPart(mesh.name)).forEach((mesh) => ankle.attach(mesh));

    return {
      clonedScene: rig,
      motionGroups: {
        shoulder,
        elbow,
        forearm,
        wrist,
        hip,
        knee,
        ankle,
        forearmBaseQuaternion: forearm.quaternion.clone(),
        wristBaseQuaternion: wrist.quaternion.clone(),
      },
    };
  }, [scene]);

  // Pose = función pura de (articulación, progress). La fase la lleva el slide
  // con useHarmonicClock, igual que B3, así que el ROM se puede pausar y barrer
  // con el deslizador en vez de oscilar solo.
  React.useEffect(() => {
    const g = motionGroups;
    g.shoulder.rotation.set(0, 0, 0);
    g.elbow.rotation.set(0, 0, 0);
    g.forearm.quaternion.copy(g.forearmBaseQuaternion);
    g.wrist.quaternion.copy(g.wristBaseQuaternion);
    g.hip.rotation.set(0, 0, 0);
    g.knee.rotation.set(0, 0, 0);
    g.ankle.rotation.set(0, 0, 0);

    const motion = joint ? ROM_MOTIONS[joint] : undefined;
    if (!motion) return;
    const rad = THREE.MathUtils.degToRad(motion.from + (motion.to - motion.from) * progress);
    const pivot = g[motion.pivot];
    if (motion.relative) {
      // Pivotes con orientación heredada: giro sobre su cuaternión base.
      if (motion.axis === 'x') pivot.rotateX(rad);
      else if (motion.axis === 'y') pivot.rotateY(rad);
      else pivot.rotateZ(rad);
    } else {
      pivot.rotation[motion.axis] = rad;
    }
  }, [motionGroups, joint, progress]);

  React.useEffect(() => {
    const active = (mode === 'regions' && selected && REGION_BONES[selected]) ? new Set(REGION_BONES[selected]) : null;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (active && active.has(mesh.userData.boneName)) {
          mat.color.copy(HIGHLIGHT);
          mat.emissive = new THREE.Color('#0a3d38');
          mat.emissiveIntensity = 0.35;
        } else {
          mat.color.copy(mesh.userData.baseColor);
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0;
        }
      }
    });
  }, [selected, mode, clonedScene]);

  // El GLB ya está orientado en posición anatómica anterior hacia la cámara.
  // La rotación de 180° mostraba por defecto la vista posterior.
  return <primitive object={clonedScene} scale={FULL_BODY_SCALE} />;
}

/* Planos de sección (A2). Cada plano se resalta/aisla al seleccionarlo. */
const PLANES = [
  { id: 'plane-transversal', name: 'Plano transversal', normal: [0, 1, 0] as [number, number, number], color: '#0f6f67', pos: [0, 0.1, 0] as [number, number, number] },
  { id: 'plane-frontal', name: 'Plano frontal (coronal)', normal: [0, 0, 1] as [number, number, number], color: '#9a5b00', pos: [0, 0.1, 0] as [number, number, number] },
  { id: 'plane-sagital', name: 'Plano sagital', normal: [1, 0, 0] as [number, number, number], color: '#a92a1e', pos: [0, 0.1, 0] as [number, number, number] },
];

function Planes({ selected }: { selected: string | null }) {
  return (
    <group>
      {PLANES.map((p) => {
        const on = selected === p.id;
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...p.normal));
        return (
          <mesh key={p.id} position={p.pos} quaternion={quat} visible={on}>
            <planeGeometry args={[9, 9]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function BodyScene({
  id,
  mode,
  selected,
  resetSignal = 0,
  zoomSignal = null,
  mobility = null,
  progress = 0,
}: {
  id: string;
  mode: 'planes' | 'regions';
  selected: string | null;
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
  mobility?: MobilityRange | null;
  /** Fase 0..1 del recorrido articular; 0 = tope secundario, 1 = tope primario. */
  progress?: number;
}) {
  return (
    <AnatomyStage
      id={id}
      camera={{ position: [3.6, 1.8, 12.5], fov: 45 }}
      target={[0, 0.1, 0]}
      minDistance={3.5}
      maxDistance={32}
      gridY={FULL_BODY_FLOOR_Y}
      shadowY={FULL_BODY_SHADOW_Y}
      shadowScale={8}
      shadowOpacity={0.45}
      resetSignal={resetSignal}
      zoomSignal={zoomSignal}
      loader={<ModelLoader />}
    >
      <Center position={[0, 0, 0]}>
        <AnatomyModel mode={mode} selected={selected} joint={mobility?.joint ?? null} progress={progress} />
        <MobilityRangeOverlay range={mobility} progress={progress} />
        {mode === 'regions' && <Axes hoveredTerm={null} showLabels showGrid={false} />}
        {mode === 'planes' && <Planes selected={selected} />}
      </Center>
    </AnatomyStage>
  );
}
