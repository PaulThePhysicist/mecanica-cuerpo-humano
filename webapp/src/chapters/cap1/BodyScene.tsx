import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FULL_BODY_FLOOR_Y, FULL_BODY_SCALE, FULL_BODY_SHADOW_Y } from './bodySceneGeometry';
import { AccessibleOrbitControls, SceneControlPad } from './AccessibleOrbitControls';
import { Axes } from './AnatomyCanvas';

const BONE_BASE = new THREE.Color('#e8dcc4'); // marfil cálido
const HIGHLIGHT = new THREE.Color('#067a6b'); // teal regional

export interface MobilityRange {
  joint: string;
  label: string;
  primary: number;
  secondary?: number;
  primaryLabel: string;
  secondaryLabel?: string;
  plane: 'sagittal' | 'coronal' | 'axial';
  position: [number, number, number];
}

const MOBILITY_MODEL_SCALE = FULL_BODY_SCALE;
const SHOULDER_PIVOT = new THREE.Vector3(-0.095, 0.311, -0.015);
const ELBOW_PIVOT = new THREE.Vector3(-0.124, 0.145, -0.019);
const FOREARM_PIVOT = new THREE.Vector3(-0.136, 0.135, -0.018);
const WRIST_PIVOT = new THREE.Vector3(-0.155, 0.005, 0.008);
const HIP_PIVOT = new THREE.Vector3(-0.039, 0.002, -0.003);
const KNEE_PIVOT = new THREE.Vector3(-0.040, -0.250, -0.019);
const ANKLE_PIVOT = new THREE.Vector3(-0.039, -0.460, -0.020);

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

function MobilityRangeOverlay({ range }: { range?: MobilityRange | null }) {
  const sweepRef = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (sweepRef.current && (range?.joint === 'hombro-flex' || range?.joint === 'hombro-abd' || range?.joint === 'hombro-rot' || range?.joint === 'antebrazo' || range?.joint === 'muneca' || range?.joint === 'cadera' || range?.joint === 'rodilla' || range?.joint === 'tobillo')) {
      sweepRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.72) * 0.22;
    }
  });
  if (!range) return null;

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
  const radius = range.joint.startsWith('hombro') ? 0.72 : range.joint === 'cadera' ? 0.62 : 0.48;

  return (
    <group position={anchor}>
      <mesh>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color="#0d786d" emissive="#0d786d" emissiveIntensity={0.7} />
      </mesh>
      <group ref={sweepRef} rotation={planeRotation}>
        <mesh rotation={[0, 0, Math.PI - primaryArc / 2]}>
          <torusGeometry args={[radius, 0.025, 12, 64, primaryArc]} />
          <meshBasicMaterial color="#087f72" transparent opacity={0.95} depthTest={false} depthWrite={false} />
        </mesh>
        {secondaryArc > 0 && (
          <mesh rotation={[0, 0, -secondaryArc / 2]}>
            <torusGeometry args={[radius * 0.9, 0.021, 12, 56, secondaryArc]} />
            <meshBasicMaterial color="#c04a3d" transparent opacity={0.9} depthTest={false} depthWrite={false} />
          </mesh>
        )}
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

function AnatomyModel({ mode, selected, jointMotion }: { mode: string; selected: string | null; jointMotion: 'flexion' | 'abduction' | 'rotation' | 'elbow-flexion' | 'forearm-rotation' | 'wrist-flexion' | 'hip-flexion' | 'knee-flexion' | 'ankle-flexion' | null }) {
  const { scene } = useGLTF('/assets/cap1/human_body.glb');
  const clonedScene = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((child) => {
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
    return s;
  }, [scene]);

  const motionGroups = useMemo(() => {
    const shoulder = new THREE.Group();
    shoulder.name = 'shoulder-motion-pivot';
    clonedScene.updateMatrixWorld(true);
    const parts: THREE.Mesh[] = [];
    const lowerParts: THREE.Mesh[] = [];
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (isShoulderMotionPart(child.name)) parts.push(child as THREE.Mesh);
        if (isHipMotionPart(child.name)) lowerParts.push(child as THREE.Mesh);
      }
    });
    clonedScene.add(shoulder);
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
    clonedScene.add(hip);
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
      shoulder,
      elbow,
      forearm,
      wrist,
      hip,
      knee,
      ankle,
      forearmBaseQuaternion: forearm.quaternion.clone(),
      wristBaseQuaternion: wrist.quaternion.clone(),
    };
  }, [clonedScene]);

  useFrame(({ clock }) => {
    const phase = (Math.sin(clock.getElapsedTime() * 0.72 - Math.PI / 2) + 1) / 2;
    motionGroups.shoulder.rotation.set(0, 0, 0);
    motionGroups.elbow.rotation.set(0, 0, 0);
    motionGroups.forearm.quaternion.copy(motionGroups.forearmBaseQuaternion);
    motionGroups.wrist.quaternion.copy(motionGroups.wristBaseQuaternion);
    motionGroups.hip.rotation.set(0, 0, 0);
    motionGroups.knee.rotation.set(0, 0, 0);
    motionGroups.ankle.rotation.set(0, 0, 0);
    if (jointMotion === 'flexion') {
      // Primer ROM validado: flexión/extensión reflejada para coincidir con
      // la orientación cromática corregida.
      motionGroups.shoulder.rotation.x = THREE.MathUtils.degToRad(61 - phase * 249);
    } else if (jointMotion === 'abduction') {
      // Segundo ROM: abducción/aducción en el plano coronal.
      motionGroups.shoulder.rotation.z = THREE.MathUtils.degToRad(48 - phase * 182);
    } else if (jointMotion === 'rotation') {
      // Tercer ROM: rotación medial/lateral sobre el eje longitudinal del brazo.
      motionGroups.shoulder.rotation.y = THREE.MathUtils.degToRad(34 - phase * 131);
    } else if (jointMotion === 'elbow-flexion') {
      // Cuarto ROM: el antebrazo flexiona en el codo sin mover el húmero.
      motionGroups.elbow.rotation.x = THREE.MathUtils.degToRad(-phase * 142);
    } else if (jointMotion === 'forearm-rotation') {
      // Quinto ROM: radio y mano giran sobre el eje longitudinal del antebrazo.
      motionGroups.forearm.rotateY(THREE.MathUtils.degToRad(77 - phase * 190));
    } else if (jointMotion === 'wrist-flexion') {
      // Sexto ROM: carpo y mano flexionan/extienden, dejando el radio estable.
      motionGroups.wrist.rotateX(THREE.MathUtils.degToRad(99 - phase * 189));
    } else if (jointMotion === 'hip-flexion') {
      // Séptimo ROM: toda la extremidad inferior gira desde el acetábulo.
      motionGroups.hip.rotation.x = THREE.MathUtils.degToRad(-phase * 113);
    } else if (jointMotion === 'knee-flexion') {
      // Octavo ROM: tibia, peroné y pie flexionan posteriormente desde la rodilla.
      motionGroups.knee.rotation.x = THREE.MathUtils.degToRad(phase * 125);
    } else if (jointMotion === 'ankle-flexion') {
      // Noveno ROM: tarso y metatarsianos giran desde el eje talocrural.
      motionGroups.ankle.rotation.x = THREE.MathUtils.degToRad(38 - phase * 73);
    }
  });

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

function CameraRig({ resetSignal }: { resetSignal?: number }) {
  const { camera } = useThree();
  React.useEffect(() => {
    // Compartir el encuadre base de A1/A2 mantiene la escala percibida del
    // esqueleto coherente al pasar por el módulo A.
    camera.position.set(3.6, 1.8, 12.5);
    camera.lookAt(0, 0.1, 0);
  }, [camera, resetSignal]);
  return null;
}

function ZoomHandler({
  zoomSignal,
  controlsRef,
}: {
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  React.useEffect(() => {
    if (!zoomSignal) return;
    const target = controlsRef.current?.target ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0.1, 0);
    const factor = zoomSignal.type === 'in' ? 0.78 : 1.28;
    const dir = new THREE.Vector3().subVectors(camera.position, target);
    const newDist = THREE.MathUtils.clamp(dir.length() * factor, 3.5, 32.0);
    dir.normalize().multiplyScalar(newDist);
    camera.position.copy(target).add(dir);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [zoomSignal, camera, controlsRef]);
  return null;
}

export default function BodyScene({
  id,
  mode,
  selected,
  resetSignal = 0,
  zoomSignal = null,
  mobility = null,
}: {
  id: string;
  mode: 'planes' | 'regions';
  selected: string | null;
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
  mobility?: MobilityRange | null;
}) {
  const controlsRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetSignal]);

  return (
    <div id={id} className="three-container" style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [3.6, 1.8, 12.5], fov: 45 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #faf6ee 55%, #eee4d2 100%)',
        }}
      >
        <CameraRig resetSignal={resetSignal} />
        <ZoomHandler zoomSignal={zoomSignal} controlsRef={controlsRef} />
        <ambientLight intensity={0.8} color="#fffcf5" />
        <directionalLight position={[10, 15, 8]} intensity={1.3} color="#fff8eb" />
        <directionalLight position={[-10, 8, -6]} intensity={0.6} color="#e8f4f8" />
        <directionalLight position={[0, -5, 5]} intensity={0.2} color="#faf0e6" />
        <gridHelper args={[8, 16, '#c6bca6', '#ded6c5']} position={[0, FULL_BODY_FLOOR_Y, 0]} />
        <Suspense fallback={null}>
          <Center position={[0, 0, 0]}>
            <AnatomyModel
              mode={mode}
              selected={selected}
              jointMotion={mobility?.joint === 'hombro-flex' ? 'flexion' : mobility?.joint === 'hombro-abd' ? 'abduction' : mobility?.joint === 'hombro-rot' ? 'rotation' : mobility?.joint === 'codo' ? 'elbow-flexion' : mobility?.joint === 'antebrazo' ? 'forearm-rotation' : mobility?.joint === 'muneca' ? 'wrist-flexion' : mobility?.joint === 'cadera' ? 'hip-flexion' : mobility?.joint === 'rodilla' ? 'knee-flexion' : mobility?.joint === 'tobillo' ? 'ankle-flexion' : null}
            />
            <MobilityRangeOverlay range={mobility} />
            {mode === 'regions' && <Axes hoveredTerm={null} showLabels showGrid={false} />}
            {mode === 'planes' && <Planes selected={selected} />}
          </Center>
          {/* Sombra de contacto difusa bajo el esqueleto */}
          <ContactShadows
            position={[0, FULL_BODY_SHADOW_Y, 0]}
            opacity={0.45}
            scale={8}
            blur={2.4}
            far={5}
            color="#232c36"
          />
        </Suspense>
        <AccessibleOrbitControls
          controlsRef={controlsRef}
          minDistance={3.5}
          maxDistance={32}
          target={[0, 0.1, 0]}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />
    </div>
  );
}

// Precarga del GLB del esqueleto.
useGLTF.preload('/assets/cap1/human_body.glb');
