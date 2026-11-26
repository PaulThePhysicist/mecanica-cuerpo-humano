import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { C, ca } from './palette';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

export type BiomechNodeId = 'neck' | 'jaw' | 'elbow' | 'spine' | 'hip' | 'ankle' | 'foot';

interface BiomechSummaryCanvasProps {
  selectedNode: BiomechNodeId;
  onSelectNode?: (node: BiomechNodeId) => void;
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo:
   *  el mando cuelga del párrafo que explica estas magnitudes. */
  showLabels?: boolean;
}

interface BiomechNodeInfo {
  id: BiomechNodeId;
  title: string;
  leverType: string;
  classTag: string;
  equation: string;
  keyRatio: string;
  ratioLabel: string;
  vm: string;
  vmType: 'speed' | 'force' | 'equilibrium';
  clinical: string;
  pos3D: [number, number, number];
  camTarget: [number, number, number];
  camPos: [number, number, number];
  activeBoneNames: string[];
  activeMuscleNames: string[];
}

const NODES_DATA: Record<BiomechNodeId, BiomechNodeInfo> = {
  jaw: {
    id: 'jaw',
    title: 'Mandíbula y ATM',
    leverType: 'Palanca de 3ª clase (VM < 1)',
    classTag: '3ª CLASE',
    equation: 'M · VM = F mordida',
    keyRatio: 'Masetero: VM 0,50 (incisivo) · 0,76 (molar)',
    ratioLabel: 'Ventaja mecánica del masetero',
    vm: 'VM < 1 en todos los dientes',
    vmType: 'force',
    clinical: 'El alimento cerca de la ATM (molares) aprovecha mejor la fuerza del masetero que en los incisivos.',
    pos3D: [0.0, 1.62, 0.16],
    camTarget: [0.0, 1.62, 0.14],
    camPos: [0.18, 1.66, 0.88],
    activeBoneNames: ['mandible', 'maxilla_R', 'maxilla_L', 'temporal_R', 'temporal_L'],
    activeMuscleNames: ['masseter_superficial_R', 'masseter_deep_R', 'masseter_superficial_L', 'masseter_deep_L'],
  },
  neck: {
    id: 'neck',
    title: 'Cabeza y Cuello (Atlas C1)',
    leverType: 'Palanca de 1ª clase',
    classTag: '1ª CLASE',
    equation: 'M · dM = W · dW',
    keyRatio: 'Fulcro: W + M (ilustrativo M ≈ 2,4 W)',
    ratioLabel: 'Músculos de la nuca',
    vm: '1ª clase: la menos común',
    vmType: 'speed',
    clinical: 'El peso de la cabeza cae por delante del apoyo y lo equilibran los músculos de la nuca (Fig. 2.6a).',
    pos3D: [0.0, 1.58, -0.06],
    camTarget: [0.0, 1.58, -0.05],
    camPos: [-0.48, 1.62, 0.68],
    activeBoneNames: ['occipital', 'cervical3', 'cervical4', 'cervical5', 'cervical6', 'cervical7'],
    activeMuscleNames: ['trapezius_descending_R', 'trapezius_descending_L', 'rectus_capitis_posterior_major_R', 'rectus_capitis_posterior_major_L'],
  },
  elbow: {
    id: 'elbow',
    title: 'Flexión de Codo (Bíceps)',
    leverType: 'Palanca de 3ª clase',
    classTag: '3ª CLASE',
    equation: 'M · 4 cm = W · 36 cm',
    keyRatio: 'M = 9 W (Caso 1) · 950 N para 100 N',
    ratioLabel: 'Multiplicador muscular',
    vm: 'VM = 0,11',
    vmType: 'speed',
    clinical: 'El desplazamiento de la mano se amplifica por dW/dM = 9: el bíceps se contrae 7–8 cm y la mano recorre mucho más.',
    pos3D: [-0.50, 0.58, -0.04],
    camTarget: [-0.50, 0.58, -0.04],
    camPos: [-0.96, 0.64, 0.72],
    activeBoneNames: ['humerus_R', 'radius_R', 'ulna_R'],
    activeMuscleNames: ['biceps_brachii_long_head_R', 'biceps_brachii_short_head_R', 'brachialis_R', 'triceps_brachii_long_head_R'],
  },
  spine: {
    id: 'spine',
    title: 'Columna Lumbar (L5-S1)',
    leverType: 'Barra rígida a θ (Fig. 2.41)',
    classTag: 'ESPALDA',
    equation: 'M = 2,5 Wb · R = 2,74 Wb (θ = 30°)',
    keyRatio: '+0,2 Wb ⇒ M = 3,74 Wb · R = 4,07 Wb',
    ratioLabel: 'Reacción sobre la quinta lumbar',
    vm: 'Erector a 12° de la columna',
    vmType: 'speed',
    clinical: 'Nunca doblar la espalda para levantar: 180 N más exigen 1100 N más al erector.',
    pos3D: [0.0, 0.30, -0.08],
    camTarget: [0.0, 0.30, -0.06],
    camPos: [-0.78, 0.38, 0.82],
    activeBoneNames: ['lumbar1', 'lumbar2', 'lumbar3', 'lumbar4', 'lumbar5', 'sacrum'],
    activeMuscleNames: ['rectus_abdominis_R', 'rectus_abdominis_L', 'latissimus_dorsi_R', 'latissimus_dorsi_L'],
  },
  hip: {
    id: 'hip',
    title: 'Cadera (Apoyo Monopodal)',
    leverType: 'DCL de la pierna (Fig. 2.17)',
    classTag: 'CADERA',
    equation: 'M = 1,57 Wb · R = 2,37 Wb',
    keyRatio: 'Con bastón (Wb/6): M = 0,61 Wb · R = 1,26 Wb',
    ratioLabel: 'Carga en la cabeza femoral',
    vm: 'Abductores a 70°',
    vmType: 'speed',
    clinical: 'El bastón contralateral desplaza el pie 6,1 cm y baja el brazo de la normal de 10,8 a 4,7 cm.',
    pos3D: [-0.17, 0.00, 0.00],
    camTarget: [-0.17, 0.00, 0.00],
    camPos: [-0.72, 0.08, 1.05],
    activeBoneNames: ['hip_R', 'femur_R', 'sacrum'],
    activeMuscleNames: ['gluteus_medius_R', 'gluteus_minimus_R', 'gluteus_maximus_R', 'psoas_major_R'],
  },
  ankle: {
    id: 'ankle',
    title: 'Tobillo (Puntillas)',
    leverType: 'Sistema concurrente (Fig. 2.28)',
    classTag: 'PUNTILLAS',
    equation: 'M = Wb cos β / cos(θ+β)',
    keyRatio: 'M = 1,93 Wb · R = 2,73 Wb',
    ratioLabel: 'Fuerzas en el tobillo',
    vm: 'θ = 45°, β = 60°',
    vmType: 'force',
    clinical: 'Ambas fuerzas superan con mucho el peso corporal aunque se apoye solo en los dedos.',
    pos3D: [-0.19, -1.86, -0.08],
    camTarget: [-0.19, -1.86, -0.08],
    camPos: [-0.68, -1.76, 0.72],
    activeBoneNames: ['tibia_R', 'fibula_R', 'talus_R', 'calcaneus_L'],
    activeMuscleNames: ['gastrocnemius_medial_head_R', 'gastrocnemius_lateral_head_R', 'soleus_R'],
  },
  foot: {
    id: 'foot',
    title: 'Plataforma de Marcha (GRF)',
    leverType: 'Complementario (no está en §2)',
    classTag: 'GRF',
    equation: 'GRF = √(Fx² + Fy² + Fz²)',
    keyRatio: 'Pico vertical ≈ 1,2 Wb (marcha)',
    ratioLabel: 'Fuerza vertical del suelo',
    vm: 'Rodilla al caminar: 3–4 Wb (libro)',
    vmType: 'equilibrium',
    clinical: 'El centro de presiones migra del talón a los dedos durante el apoyo.',
    pos3D: [-0.19, -1.98, 0.08],
    camTarget: [-0.19, -1.98, 0.08],
    camPos: [-0.58, -1.88, 0.75],
    activeBoneNames: ['metatarsal1_R', 'metatarsal2_R', 'metatarsal3_R', 'metatarsal4_R', 'metatarsal5_R', 'navicular_R', 'cuneiform_med_R'],
    activeMuscleNames: ['tibialis_anterior_R', 'tibialis_posterior_R'],
  },
};

// ── Paleta de Colores ──
const BONE_BASE = '#ede5d0';
const BONE_HIGHLIGHT = C.teal;
const MUSCLE_ACTIVE = C.blood;
const MUSCLE_PASSIVE = C.ink3;
const TEAL_DEEP = C.teal;
const GREEN_ACCENT = C.coronal;
const AMBER_ACCENT = C.amber;
const BLUE_ACCENT = C.series3;
const RED_ACCENT = C.blood;

// ── 1. Vector de Fuerza 3D con Cono y Rótulo ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [0, 1, 0] as [number, number, number],
  color = C.teal,
  label,
  sub,
  emphasis,
  shaftRadius = 0.010,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  /** Letrero para el riel lateral (símbolo · rol). */
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

  const headLen = Math.min(0.12, Math.max(0.045, len * 0.22));
  const headRadius = headLen * 0.35;
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

      {/* Letrero → riel lateral, con línea guía a la punta. */}
      <Callout
        position={[tipPos.x + dir.x * 0.05, tipPos.y + dir.y * 0.05, tipPos.z + dir.z * 0.05]}
        label={label}
        sub={sub}
        color={color}
        emphasis={emphasis}
      />
    </group>
  );
}

// ── 2. Modelo Anatómico del Esqueleto Completo y Músculos Clave ──
function FullBodySkeletonAndMuscles({
  selectedNode,
}: {
  selectedNode: BiomechNodeId;
}) {
  const { scene: boneScene } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { scene: muscleScene } = useGLTF('/assets/cap1/human_muscles_full.glb') as any;

  const nodeInfo = NODES_DATA[selectedNode] || NODES_DATA.elbow;
  const activeBonesSet = useMemo(() => new Set(nodeInfo.activeBoneNames), [nodeInfo]);
  const activeMusclesSet = useMemo(() => new Set(nodeInfo.activeMuscleNames), [nodeInfo]);

  // Clonar y configurar materiales para huesos
  const clonedBones = useMemo(() => {
    const s = boneScene.clone(true);
    s.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(BONE_BASE),
          roughness: 0.58,
          metalness: 0.05,
        });
        mesh.userData.boneName = mesh.name;
      }
    });
    return s;
  }, [boneScene]);

  // Clonar y configurar materiales para músculos
  const clonedMuscles = useMemo(() => {
    const s = muscleScene.clone(true);
    s.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(MUSCLE_PASSIVE),
          roughness: 0.65,
          metalness: 0.05,
          transparent: true,
          opacity: 0.35,
        });
        mesh.userData.muscleName = mesh.name;
      }
    });
    return s;
  }, [muscleScene]);

  // Actualizar resaltado de huesos y músculos cuando cambia el nodo seleccionado
  useEffect(() => {
    clonedBones.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const isSelected = activeBonesSet.has(mesh.userData.boneName);
        if (isSelected) {
          mat.color.set(BONE_HIGHLIGHT);
          mat.emissive.set('#064e43');
          mat.emissiveIntensity = 0.45;
        } else {
          mat.color.set(BONE_BASE);
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
        }
      }
    });

    clonedMuscles.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const isSelected = activeMusclesSet.has(mesh.userData.muscleName);
        if (isSelected) {
          mat.color.set(MUSCLE_ACTIVE);
          mat.emissive.set('#500e08');
          mat.emissiveIntensity = 0.65;
          mat.opacity = 0.92;
        } else {
          mat.color.set(MUSCLE_PASSIVE);
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
          mat.opacity = 0.22;
        }
      }
    });
  }, [activeBonesSet, activeMusclesSet, clonedBones, clonedMuscles]);

  const MODEL_SCALE = 4.2;

  return (
    <group position={[0, 0, 0]} scale={MODEL_SCALE}>
      <primitive object={clonedBones} />
      <primitive object={clonedMuscles} />
    </group>
  );
}

// ── 3. Superposición de Vectores DCL Específicos por Articulación en 3D ──
function JointDCLVectors3D({ selectedNode }: { selectedNode: BiomechNodeId }) {
  if (selectedNode === 'jaw') {
    return (
      <group>
        {/* Fm Masetero (Hacia arriba) */}
        <ForceVector3D
          origin={[0.04, 1.50, 0.12]}
          vector={[0, 0.24, 0]}
          color={RED_ACCENT}
          label="M masetero"
          sub="masetero"
        />
        {/* Fmordida (Hacia abajo en molares) */}
        <ForceVector3D
          origin={[0.02, 1.62, 0.19]}
          vector={[0, -0.22, 0]}
          color={BLUE_ACCENT}
          label="F mordida"
          sub="en el diente"
        />
        {/* R ATM (Reacción articular) */}
        <ForceVector3D
          origin={[-0.04, 1.64, 0.08]}
          vector={[0, -0.16, -0.04]}
          color={TEAL_DEEP}
          label="R ATM"
          sub="reacción de la ATM"
          emphasis="strong"
        />
      </group>
    );
  }

  if (selectedNode === 'neck') {
    return (
      <group>
        {/* Fm Trapecio / Esplenio (Hacia abajo-atrás) */}
        <ForceVector3D
          origin={[-0.02, 1.58, -0.09]}
          vector={[-0.02, -0.24, -0.10]}
          color={RED_ACCENT}
          label="M"
          sub="trapecio / esplenio"
        />
        {/* W Cabeza (Hacia abajo, anterior a C1) */}
        <ForceVector3D
          origin={[0.02, 1.65, 0.08]}
          vector={[0, -0.20, 0]}
          color={BLUE_ACCENT}
          label="W"
          sub="peso del cráneo"
        />
        {/* R C1 Atlas (Reacción de soporte hacia arriba) */}
        <ForceVector3D
          origin={[0.0, 1.56, -0.03]}
          vector={[0.01, 0.30, 0.02]}
          color={TEAL_DEEP}
          label="R C1"
          sub="reacción del atlas"
          emphasis="strong"
        />
      </group>
    );
  }

  if (selectedNode === 'elbow') {
    return (
      <group>
        {/* Fm Bíceps (Hacia arriba a 4 cm del codo) */}
        <ForceVector3D
          origin={[-0.47, 0.56, 0.02]}
          vector={[0, 0.38, 0.05]}
          color={RED_ACCENT}
          label="M bíceps"
          sub="×9 la carga"
        />
        {/* W mano (hacia abajo, a 36 cm) */}
        <ForceVector3D
          origin={[-0.38, 0.28, 0.06]}
          vector={[0, -0.24, 0]}
          color={BLUE_ACCENT}
          label="W mano"
          sub="carga distal"
        />
        {/* R Articular (Compresión húmerocubital) */}
        <ForceVector3D
          origin={[-0.50, 0.58, -0.04]}
          vector={[0, -0.30, -0.04]}
          color={TEAL_DEEP}
          label="R"
          sub="compresión húmerocubital"
          emphasis="strong"
        />
      </group>
    );
  }

  if (selectedNode === 'spine') {
    return (
      <group>
        {/* Fm Erector Espinal (Tracción hacia arriba-atrás a 12°) */}
        <ForceVector3D
          origin={[-0.02, 0.30, -0.12]}
          vector={[0, 0.44, -0.14]}
          color={RED_ACCENT}
          label="M erector"
          sub="a 12° de la columna"
        />
        {/* W Tronco + Carga (Hacia abajo a 50 cm de momento) */}
        <ForceVector3D
          origin={[0.02, 0.48, 0.20]}
          vector={[0, -0.32, 0]}
          color={BLUE_ACCENT}
          label="W total"
          sub="tronco + carga"
        />
        {/* R L5-S1 (Compresión masiva) */}
        <ForceVector3D
          origin={[0.0, 0.28, -0.05]}
          vector={[0, -0.48, -0.06]}
          color={TEAL_DEEP}
          label="R"
          sub="reacción en la quinta lumbar"
          emphasis="strong"
        />
      </group>
    );
  }

  if (selectedNode === 'hip') {
    return (
      <group>
        {/* Fa Abductores / Glúteo Medio (Hacia arriba a 70°) */}
        <ForceVector3D
          origin={[-0.28, 0.08, 0.0]}
          vector={[-0.12, 0.36, 0]}
          color={RED_ACCENT}
          label="M abductores"
          sub="glúteo medio"
        />
        {/* Wb Peso Corporal Suprayacente (Hacia abajo en CG) */}
        <ForceVector3D
          origin={[0.18, 0.12, 0.0]}
          vector={[0, -0.32, 0]}
          color={AMBER_ACCENT}
          label="Wb"
          sub="peso corporal"
        />
        {/* R Acetábulo (Reacción en cabeza femoral) */}
        <ForceVector3D
          origin={[-0.16, 0.00, 0.0]}
          vector={[0.08, -0.44, 0]}
          color={TEAL_DEEP}
          label="R"
          sub="reacción acetabular (2,37 Wb)"
          emphasis="strong"
        />
      </group>
    );
  }

  if (selectedNode === 'ankle') {
    return (
      <group>
        {/* F Aquiles (Hacia arriba en calcáneo) */}
        <ForceVector3D
          origin={[-0.19, -1.84, -0.14]}
          vector={[0, 0.36, -0.05]}
          color={RED_ACCENT}
          label="M Aquiles"
          sub="tríceps sural"
        />
        {/* W Peso Suelo (Hacia abajo en tibia) */}
        <ForceVector3D
          origin={[-0.19, -1.75, -0.04]}
          vector={[0, -0.34, 0]}
          color={BLUE_ACCENT}
          label="W"
          sub="peso del cuerpo"
        />
        {/* GRF Antepié (Hacia arriba en cabezas metatarsales) */}
        <ForceVector3D
          origin={[-0.19, -1.98, 0.14]}
          vector={[0, 0.34, 0]}
          color={TEAL_DEEP}
          label="GRF"
          sub="normal del antepié"
          emphasis="strong"
        />
      </group>
    );
  }

  if (selectedNode === 'foot') {
    return (
      <group>
        {/* Fz Vertical */}
        <ForceVector3D
          origin={[-0.19, -1.98, 0.08]}
          vector={[0, 0.42, 0]}
          color={GREEN_ACCENT}
          label="Fz"
          sub="vertical (~1,2·W)"
          emphasis="muted"
        />
        {/* Fy Propulsión */}
        <ForceVector3D
          origin={[-0.19, -1.98, 0.08]}
          vector={[0, 0, 0.22]}
          color={AMBER_ACCENT}
          label="Fy"
          sub="propulsión anterior"
          emphasis="muted"
        />
        {/* GRF Resultante */}
        <ForceVector3D
          origin={[-0.19, -1.98, 0.08]}
          vector={[0, 0.44, 0.22]}
          color={TEAL_DEEP}
          label="GRF"
          sub="resultante"
          emphasis="strong"
        />
      </group>
    );
  }

  return null;
}

// ── 4. Nódulos 3D Interactivos Brillantes en el Espacio Corpóreo ──
function Interactive3DNodes({
  selectedNode,
  onSelectNode,
}: {
  selectedNode: BiomechNodeId;
  onSelectNode?: (node: BiomechNodeId) => void;
}) {
  const [hoveredNode, setHoveredNode] = useState<BiomechNodeId | null>(null);
  const pulseRef = useRef<number>(0);

  useFrame((_, delta) => {
    pulseRef.current += delta * 6;
  });

  return (
    <group>
      {(Object.keys(NODES_DATA) as BiomechNodeId[]).map((id) => {
        const item = NODES_DATA[id];
        const isSelected = selectedNode === id;
        const isHovered = hoveredNode === id;

        return (
          <group
            key={id}
            position={item.pos3D}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectNode) onSelectNode(id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredNode(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Esfera central del nódulo */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.042 : (isHovered ? 0.036 : 0.028), 24, 24]} />
              <meshStandardMaterial
                color={isSelected ? C.coronal : (isHovered ? C.teal : TEAL_DEEP)}
                emissive={isSelected ? '#10b981' : (isHovered ? '#0d8577' : TEAL_DEEP)}
                emissiveIntensity={isSelected ? 0.9 : 0.5}
                roughness={0.2}
                metalness={0.4}
              />
            </mesh>

            {/* Anillo de pulso exterior */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.055, 0.075, 32]} />
                <meshBasicMaterial
                  color={C.coronal}
                  transparent
                  opacity={0.6 + 0.3 * Math.sin(pulseRef.current)}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Rótulo sólo para el nódulo seleccionado o en hover: los 7 a la
                vez saturaban el mapa. */}
            {(isSelected || isHovered) && (
              <Html position={[0.08, 0, 0]} center={false} zIndexRange={[100, 0]} occlude="blending">
                <div
                  style={{
                    background: isSelected ? ca(C.teal, 0.96) : ca(C.card, 0.92),
                    color: isSelected ? C.card : C.ink,
                    backdropFilter: 'blur(6px)',
                    border: `1.5px solid ${isSelected ? '${C.tealDeep}' : '${C.line}'}`,
                    borderRadius: '4px',
                    padding: '2px 5px',
                    fontSize: '0.62rem',
                    fontWeight: isSelected ? 700 : 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: `0 2px 8px ${ca(C.ink, 0.12)}`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {item.classTag}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── 5. Controlador de Cámara Dinámico con Tweening Suave ──
function CameraRig({
  selectedNode,
  isOverview,
  controlsRef,
}: {
  selectedNode: BiomechNodeId;
  isOverview: boolean;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  const targetLookRef = useRef<THREE.Vector3>(new THREE.Vector3(-0.02, -0.12, 0));
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0.22, 0.12, 6.5));

  useEffect(() => {
    if (isOverview) {
      // Vista general: cámara centrada en el eje vertical del esqueleto
      // (cabeza y=1.7 · pies y=-2.0 → mira a y≈-0.1) y suficientemente atrás
      // para encuadrar de cráneo a metatarso.
      targetLookRef.current.set(-0.02, -0.12, 0);
      targetPosRef.current.set(0.22, 0.12, 6.5);
    } else {
      const node = NODES_DATA[selectedNode] || NODES_DATA.elbow;
      targetLookRef.current.set(...node.camTarget);
      targetPosRef.current.set(...node.camPos);
    }
  }, [selectedNode, isOverview]);

  useFrame((_, delta) => {
    const lerpFactor = Math.min(1, delta * 4.5);

    camera.position.lerp(targetPosRef.current, lerpFactor);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookRef.current, lerpFactor);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 + 0.1}
      minDistance={0.5}
      maxDistance={13.0}
      target={[0, 0, 0]}
    />
  );
}

// ── 6. Tarjeta DCL / Inspector Biomecánico Glassmorphism Flotante en HUD ──
function BiomechInspectorCard({
  selectedNode,
  onResetOverview,
  isOverview,
}: {
  selectedNode: BiomechNodeId;
  onResetOverview: () => void;
  isOverview: boolean;
}) {
  const node = NODES_DATA[selectedNode] || NODES_DATA.elbow;

  return (
    <div
      style={{
        background: ca(C.card, 0.95),
        backdropFilter: 'blur(10px)',
        border: `1.5px solid var(--line, ${C.line})`,
        borderRadius: '10px',
        padding: isOverview ? '10px 12px' : '12px 14px',
        boxShadow: `0 8px 24px ${ca(C.ink, 0.15)}`,
        width: isOverview ? '234px' : '280px',
        pointerEvents: 'auto',
      }}
    >
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: isOverview ? '0.72rem' : '0.80rem', fontWeight: 800, color: TEAL_DEEP }}>
          {node.title.toUpperCase()}
        </span>
        <span
          style={{
            background: node.vmType === 'force' ? ca(C.coronal, 0.12) : (node.vmType === 'speed' ? ca(C.series3, 0.10) : C.amberTint),
            color: node.vmType === 'force' ? C.coronal : (node.vmType === 'speed' ? C.series3 : C.amber),
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {node.classTag}
        </span>
      </div>

      {/* Bloque de Ecuación de Equilibrio Estático */}
      <div
        style={{
          background: ca(C.teal, 0.08),
          border: `1px solid ${ca(C.teal, 0.25)}`,
          borderRadius: '6px',
          padding: '6px 8px',
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: isOverview ? '0.62rem' : '0.66rem',
          fontWeight: 700,
          color: TEAL_DEEP,
          margin: '6px 0 8px',
        }}
      >
        {node.equation}
      </div>

      {/* Relación Clave y Multiplicador */}
      <div style={{ marginBottom: '2px' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: RED_ACCENT, textTransform: 'uppercase' }}>
          {node.ratioLabel}:
        </div>
        <div style={{ fontSize: isOverview ? '0.80rem' : '0.90rem', fontWeight: 800, color: C.ink, fontFamily: 'JetBrains Mono, monospace' }}>
          {node.keyRatio}
        </div>
        <div style={{ fontSize: '0.62rem', color: C.ink3 }}>
          {node.vm}
        </div>
      </div>

      {/* Bloques verbosos: sólo al enfocar una articulación concreta */}
      {!isOverview && (
        <>
          <div style={{ fontSize: '0.62rem', color: C.ink3, margin: '6px 0 4px' }}>
            {node.leverType}
          </div>
          <hr style={{ border: 'none', borderTop: `1px solid ${ca(C.line, 0.5)}`, margin: '8px 0' }} />
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: TEAL_DEEP, marginBottom: '3px' }}>
            IMPLICACIÓN CLÍNICA / ERGONÓMICA:
          </div>
          <div style={{ fontSize: '0.62rem', color: C.ink, lineHeight: 1.35, marginBottom: '10px' }}>
            {node.clinical}
          </div>
        </>
      )}

      {/* Botón de Enfoque / Vista General */}
      <button
        type="button"
        onClick={onResetOverview}
        style={{
          width: '100%',
          marginTop: isOverview ? '8px' : 0,
          background: isOverview ? `var(--teal, ${C.teal})` : `var(--paper-2, ${C.lineSoft})`,
          color: isOverview ? C.card : `var(--ink, ${C.ink})`,
          border: `1px solid var(--line, ${C.line})`,
          borderRadius: '5px',
          padding: '5px 8px',
          fontSize: '0.62rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {isOverview ? 'Vista general · elige articulación' : 'Volver a la vista general'}
      </button>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL: BiomechSummaryCanvas ──
export default function BiomechSummaryCanvas({
  showLabels = false,
  selectedNode = 'elbow',
  onSelectNode,
}: BiomechSummaryCanvasProps) {
  // Arranca en vista general (cuerpo completo con la articulación resaltada);
  // el usuario acerca a una articulación con su botón.
  const [isOverview, setIsOverview] = useState<boolean>(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handleSelect = (node: BiomechNodeId) => {
    setIsOverview(false);
    if (onSelectNode) onSelectNode(node);
  };

  const handleResetOverview = () => {
    setIsOverview((prev) => !prev);
  };

  const callouts = useCalloutStore();

  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="cap2-webgl-canvas" style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}>
      <Canvas
        shadows
        camera={{ position: [-0.96, 0.64, 0.72], fov: 42 }}
        dpr={[1, 2]}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'radial-gradient(circle at 45% 42%, #ece3ce 0%, #ddd1b6 52%, #c6b697 100%)',
        }}
      >
        <CameraRig selectedNode={selectedNode} isOverview={isOverview} controlsRef={controlsRef} />

        {/* ── Iluminación de Estudio Anatómico ── */}
        <ambientLight intensity={0.55} />
        {/* Luz de contra que perfila la silueta contra el fondo */}
        <directionalLight position={[-2, 4, -7]} intensity={0.9} color={C.card} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 4, -4]} intensity={0.5} color="#fef3c7" />
        <directionalLight position={[0, -3, 3]} intensity={0.25} color="#e0f2fe" />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* 1. Esqueleto Humano Completo (131 Huesos) + Músculos Clave */}
            <FullBodySkeletonAndMuscles selectedNode={selectedNode} />

            {/* 2. Vectores DCL 3D Directamente en la Articulación */}
            <JointDCLVectors3D selectedNode={selectedNode} />

            {/* 3. 7 Nódulos Anatómicos Interactivos Brillantes */}
            <Interactive3DNodes selectedNode={selectedNode} onSelectNode={handleSelect} />

            {/* Proyecta cada <Callout> de la escena a píxeles para el riel lateral. */}
            <CalloutSource />
          </group>

          {/* Sombra de contacto del piso */}
          <ContactShadows
            position={[0, -2.12, 0]}
            opacity={0.58}
            scale={5.5}
            blur={2.0}
            far={3.0}
            color="#241d12"
          />
        </Suspense>

      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Vectores DCL de la articulación → riel lateral derecho con línea guía */}
      <CalloutRail store={callouts} side="right" />

      {/* Inspector biomecánico anclado a la esquina inferior izquierda: los
          vectores DCL del codo caen a la derecha del lienzo, así que esta
          esquina queda libre y la tarjeta ya no tapa el esqueleto. */}
      <div
        style={{
          position: 'absolute',
          left: '8px',
          bottom: '8px',
          zIndex: 9,
          transformOrigin: 'bottom left',
        }}
      >
        <BiomechInspectorCard
          selectedNode={selectedNode}
          onResetOverview={handleResetOverview}
          isOverview={isOverview}
        />
      </div>
    </div>
    </CalloutProvider>
  );
}

// Preload GLB
useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_full.glb');
