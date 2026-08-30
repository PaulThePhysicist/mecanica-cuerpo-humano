import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AccessibleOrbitControls, SceneControlPad } from './AccessibleOrbitControls';

export type JointType = 'hinge' | 'pivot' | 'condylar' | 'saddle' | 'plane' | 'ball';

interface SynovialJointCanvasProps {
  type: JointType;
  angles: {
    a1: number; // Eje principal 1 (grados o mm)
    a2: number; // Eje 2 (grados o mm)
    a3: number; // Eje 3 (grados)
  };
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
}

// ── Paleta y Materiales Anatómicos de Alta Fidelidad ──
const BONE_IVORY = '#ede5d0';
const BONE_DEEP = '#ded3be';
const CARTILAGE_ICE = '#68c5b8';
const LIGAMENT_FIBROUS = '#dfd8c7';
const ACCENT_RED = '#b02318';
const ACCENT_TEAL = '#0d6e64';
const ACCENT_BLUE = '#5c6bc0';
const ACCENT_AMBER = '#d97706';

// ── Componente de Arco de Grado de Libertad 3D Proporcional (Sin letreros obstructivos) ──
function DOFArc3D({
  radius = 0.05,
  startAngle = -Math.PI / 4,
  endAngle = Math.PI / 4,
  color = '#b02318',
  rotation = [0, 0, 0] as [number, number, number],
  position = [0, 0, 0] as [number, number, number],
}: {
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  color?: string;
  rotation?: [number, number, number];
  position?: [number, number, number];
  badgeLabel?: string;
  badgeValue?: string;
}) {
  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 32;
    for (let i = 0; i <= count; i++) {
      const theta = startAngle + ((endAngle - startAngle) * i) / count;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius, startAngle, endAngle]);

  const arrowAngle = endAngle;
  const arrowX = Math.cos(arrowAngle) * radius;
  const arrowZ = Math.sin(arrowAngle) * radius;

  const coneRadius = Math.max(0.0012, radius * 0.08);
  const coneLength = Math.max(0.003, radius * 0.22);

  return (
    <group position={position} rotation={rotation}>
      {/* Línea del arco nítida y luminosa */}
      <primitive object={new THREE.Line(curve, new THREE.LineBasicMaterial({ color, linewidth: 2 }))} />

      {/* Flecha indicadora cónica proporcional */}
      <mesh position={[arrowX, 0, arrowZ]} rotation={[0, -arrowAngle - Math.PI / 2, 0]}>
        <coneGeometry args={[coneRadius, coneLength, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// ── Componente de Flecha de Traslación Proporcional para Articulación Plana ──
function TranslationArrow3D({
  length = 0.035,
  dir = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  position = [0, 0, 0] as [number, number, number],
}: {
  length?: number;
  dir?: [number, number, number];
  color?: string;
  position?: [number, number, number];
  label?: string;
  value?: string;
}) {
  const direction = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction), [direction]);

  const shaftRadius = Math.max(0.0006, length * 0.035);
  const coneRadius = Math.max(0.0018, length * 0.09);
  const coneLength = Math.max(0.004, length * 0.22);

  return (
    <group position={position}>
      <group quaternion={q}>
        <mesh position={[0, length / 2, 0]}>
          <cylinderGeometry args={[shaftRadius, shaftRadius, length, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[0, length, 0]}>
          <coneGeometry args={[coneRadius, coneLength, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

// ── 1. Bisagra (Hinge · 1 GL): Codo / Húmerocubital (Humerus + Ulna + Radius) ──
function HingeAnatomy({ angle }: { angle: number }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const rad = (angle * Math.PI) / 180;
  // Centro anatómico de rotación troclear del codo derecho
  const P0 = useMemo(() => new THREE.Vector3(-0.126, 0.140, -0.015), []);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const cartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARTILAGE_ICE,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group scale={16}>
      {/* Segmento Fijo: Húmero distal */}
      <group position={[-P0.x, -P0.y, -P0.z]}>
        {nodes.humerus_R && <mesh geometry={nodes.humerus_R.geometry} material={fixedMat} />}
      </group>

      {/* Cartílago articular de la tróclea humeral */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={cartMat}>
        <cylinderGeometry args={[0.007, 0.007, 0.016, 24]} />
      </mesh>

      {/* Segmento Móvil: Cúbito y Radio articulando en flexión/extensión alrededor del eje X */}
      <group rotation={[rad, 0, 0]}>
        <group position={[-P0.x, -P0.y, -P0.z]}>
          {nodes.ulna_R && <mesh geometry={nodes.ulna_R.geometry} material={boneMat} />}
          {nodes.radius_R && <mesh geometry={nodes.radius_R.geometry} material={boneMat} />}
        </group>

        {/* Cartílago articular en la escotadura troclear cubital */}
        <mesh position={[0, -0.001, 0.002]} rotation={[0, 0, Math.PI / 2]} material={cartMat}>
          <cylinderGeometry args={[0.0075, 0.0075, 0.012, 24, 1, true, -Math.PI * 0.4, Math.PI * 0.8]} />
        </mesh>

        {/* Indicador DOF 1 GL (Flexión) ceñido a la tróclea */}
        <DOFArc3D
          radius={0.032}
          startAngle={-Math.PI * 0.1}
          endAngle={Math.max(-Math.PI * 0.1 + 0.1, rad)}
          color={ACCENT_RED}
          rotation={[0, 0, Math.PI / 2]}
          position={[0.016, 0, 0]}
          badgeLabel="Flex"
          badgeValue={`${Math.round(angle)}°`}
        />
      </group>
    </group>
  );
}

// ── 2. Pivote (Pivot · 1 GL): Radiocubital Proximal (Ulna + Radius con ligamento anular) ──
function PivotAnatomy({ angle }: { angle: number }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const rad = (angle * Math.PI) / 180;

  // Centro de la articulación radiocubital proximal (cabeza del radio / escotadura radial)
  const P_head = useMemo(() => new THREE.Vector3(-0.145, 0.136, -0.005), []);
  const P_mid = useMemo(() => new THREE.Vector3(-0.138, 0.075, -0.008), []);

  // La pronosupinación no gira sobre el eje Y de la escena por definición:
  // sigue el eje longitudinal real del antebrazo, desde la cabeza radial
  // hacia la diáfisis. Se comparte entre la pieza móvil y sus indicadores.
  const pivotAxis = useMemo(
    () => new THREE.Vector3().subVectors(P_mid, P_head).normalize(),
    [P_head, P_mid]
  );
  const pivotAxisFrame = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pivotAxis),
    [pivotAxis]
  );
  const pivotRingFrame = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pivotAxis),
    [pivotAxis]
  );
  const pivotRotation = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(pivotAxis, rad),
    [pivotAxis, rad]
  );
  const headPosition: [number, number, number] = [
    P_head.x - P_mid.x,
    P_head.y - P_mid.y,
    P_head.z - P_mid.z,
  ];

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const cartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARTILAGE_ICE,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      }),
    []
  );
  const ligMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: LIGAMENT_FIBROUS,
        roughness: 0.45,
        metalness: 0.08,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group scale={16}>
      {/* Segmento Fijo: Cúbito */}
      <group position={[-P_mid.x, -P_mid.y, -P_mid.z]}>
        {nodes.ulna_R && <mesh geometry={nodes.ulna_R.geometry} material={fixedMat} />}
      </group>

      {/* Ligamento anular del radio (anillo fibroso contenedor ceñido) */}
      <mesh
        position={headPosition}
        quaternion={pivotRingFrame}
        material={ligMat}
      >
        <torusGeometry args={[0.009, 0.0018, 16, 32, Math.PI * 1.6]} />
      </mesh>

      {/* Cartílago hialino de la escotadura radial cubital */}
      <mesh
        position={[P_head.x - P_mid.x + 0.004, P_head.y - P_mid.y, P_head.z - P_mid.z]}
        quaternion={pivotAxisFrame}
        material={cartMat}
      >
        <cylinderGeometry args={[0.0075, 0.0075, 0.006, 16, 1, true, -Math.PI * 0.4, Math.PI * 0.8]} />
      </mesh>

      {/* Segmento Móvil: Radio rotando axialmente sobre su eje longitudinal */}
      <group
        position={headPosition}
        quaternion={pivotRotation}
      >
        <group position={[-P_head.x, -P_head.y, -P_head.z]}>
          {nodes.radius_R && <mesh geometry={nodes.radius_R.geometry} material={boneMat} />}
        </group>

        {/* Cartílago anular de la circunferencia articular de la cabeza del radio */}
        <mesh position={[0, 0, 0]} quaternion={pivotAxisFrame} material={cartMat}>
          <cylinderGeometry args={[0.008, 0.008, 0.005, 24]} />
        </mesh>
      </group>

      {/* Indicador DOF 1 GL fijo al eje: muestra pronación y supinación
          desde la posición neutra sin girar junto con el radio. */}
      <group position={headPosition} quaternion={pivotAxisFrame}>
        <DOFArc3D
          radius={0.018}
          startAngle={0}
          endAngle={Math.abs(rad) < 0.001 ? 0.001 : rad}
          color={ACCENT_TEAL}
          position={[0, 0.010, 0]}
          badgeLabel="Pron/Sup"
          badgeValue={`${Math.round(angle)}°`}
        />
      </group>
    </group>
  );
}

// ── 3. Condílea (Condylar · 2 GL): Muñeca Radiocarpiana (Radius + Scaphoid + Lunate) ──
function CondylarAnatomy({ a1, a2 }: { a1: number; a2: number }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const r1 = (a1 * Math.PI) / 180; // Flexión/Extensión (eje X)
  const r2 = (a2 * Math.PI) / 180; // Desviación Radial/Cubital (eje Z)

  // Centro articular de la fosa glenoidea del radio distal
  const P0 = useMemo(() => new THREE.Vector3(-0.149, 0.000, 0.008), []);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const cartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARTILAGE_ICE,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group scale={22}>
      {/* Segmento Fijo: Radio distal + Cúbito distal */}
      <group position={[-P0.x, -P0.y, -P0.z]}>
        {nodes.radius_R && <mesh geometry={nodes.radius_R.geometry} material={fixedMat} />}
        {nodes.ulna_R && <mesh geometry={nodes.ulna_R.geometry} material={fixedMat} />}
      </group>

      {/* Cartílago articular de la fosa escafoidea y semilunar del radio */}
      <mesh position={[0, 0.001, 0]} scale={[1.2, 0.4, 0.8]} rotation={[Math.PI, 0, 0]} material={cartMat}>
        <sphereGeometry args={[0.009, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
      </mesh>

      {/* Segmento Móvil: Cóndilo carpiano proximal (Escafoides + Semilunar + Piramidal) con 2 GL */}
      <group rotation={[r1, 0, r2]}>
        <group position={[-P0.x, -P0.y, -P0.z]}>
          {nodes.scaphoid_R && <mesh geometry={nodes.scaphoid_R.geometry} material={boneMat} />}
          {nodes.lunate_R && <mesh geometry={nodes.lunate_R.geometry} material={boneMat} />}
          {nodes.triquetral_R && <mesh geometry={nodes.triquetral_R.geometry} material={boneMat} />}
          {nodes.capitate_R && <mesh geometry={nodes.capitate_R.geometry} material={boneMat} />}
        </group>

        {/* Revestimiento cartilaginoso del cóndilo carpiano */}
        <mesh position={[0, -0.001, 0]} scale={[1.1, 0.45, 0.75]} material={cartMat}>
          <sphereGeometry args={[0.0085, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        </mesh>

        {/* Eje 1 (Flexión / Extensión) */}
        <DOFArc3D
          radius={0.022}
          startAngle={-Math.PI * 0.25}
          endAngle={Math.max(-Math.PI * 0.25 + 0.1, r1)}
          color={ACCENT_RED}
          rotation={[0, 0, Math.PI / 2]}
          position={[0.012, 0, 0]}
          badgeLabel="Flex"
          badgeValue={`${Math.round(a1)}°`}
        />

        {/* Eje 2 (Desviación Radial / Cubital) */}
        <DOFArc3D
          radius={0.020}
          startAngle={-Math.PI * 0.2}
          endAngle={Math.max(-Math.PI * 0.2 + 0.1, r2)}
          color={ACCENT_BLUE}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.012]}
          badgeLabel="Desv"
          badgeValue={`${Math.round(a2)}°`}
        />
      </group>
    </group>
  );
}

// ── 4. Silla de montar (Saddle · 2 GL): Trapeciometacarpiana CMC-1 del Pulgar ──
function SaddleAnatomy({ a1, a2 }: { a1: number; a2: number }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const r1 = (a1 * Math.PI) / 180; // Flexión/Extensión
  const r2 = (a2 * Math.PI) / 180; // Abducción/Oposición

  // Centro de la articulación trapeciometacarpiana
  const P0 = useMemo(() => new THREE.Vector3(-0.163, -0.010, 0.016), []);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const cartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARTILAGE_ICE,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group scale={30}>
      {/* Segmento Fijo: Hueso Trapecio (Trapezium) */}
      <group position={[-P0.x, -P0.y, -P0.z]}>
        {nodes.trapezium_R && <mesh geometry={nodes.trapezium_R.geometry} material={fixedMat} />}
        {nodes.scaphoid_R && <mesh geometry={nodes.scaphoid_R.geometry} material={fixedMat} />}
      </group>

      {/* Cartílago articular de silla de montar (encaje recíproco) */}
      <mesh position={[0, -0.0005, 0]} rotation={[0, 0, 0]} material={cartMat}>
        <torusGeometry args={[0.007, 0.002, 16, 24, Math.PI * 0.7]} />
      </mesh>

      {/* Segmento Móvil: Primer Metacarpiano (Metacarpal 1) con 2 GL de oposición */}
      <group rotation={[r1, 0, r2]}>
        <group position={[-P0.x, -P0.y, -P0.z]}>
          {nodes.metacarpal_1 && <mesh geometry={nodes.metacarpal_1.geometry} material={boneMat} />}
        </group>

        {/* Cartílago recíproco en la base del metacarpiano */}
        <mesh position={[0, 0.0015, 0]} rotation={[0, Math.PI / 2, Math.PI]} material={cartMat}>
          <torusGeometry args={[0.0065, 0.0018, 16, 24, Math.PI * 0.7]} />
        </mesh>

        {/* Eje 1 (Flexión / Extensión) */}
        <DOFArc3D
          radius={0.015}
          startAngle={-Math.PI * 0.25}
          endAngle={Math.max(-Math.PI * 0.25 + 0.1, r1)}
          color={ACCENT_RED}
          rotation={[0, 0, Math.PI / 2]}
          position={[0.008, 0, 0]}
          badgeLabel="Flex"
          badgeValue={`${Math.round(a1)}°`}
        />

        {/* Eje 2 (Abducción / Oposición) */}
        <DOFArc3D
          radius={0.014}
          startAngle={-Math.PI * 0.25}
          endAngle={Math.max(-Math.PI * 0.25 + 0.1, r2)}
          color={ACCENT_AMBER}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.008]}
          badgeLabel="Opos"
          badgeValue={`${Math.round(a2)}°`}
        />
      </group>
    </group>
  );
}

// ── 5. Esferoidal (Ball & Socket · 3 GL): Hombro Glenohumeral (Scapula + Humerus) ──
function BallSocketAnatomy({ a1, a2, a3 }: { a1: number; a2: number; a3: number }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const r1 = (a1 * Math.PI) / 180; // Flexión/Extensión (eje X)
  const r2 = (a2 * Math.PI) / 180; // Abducción/Aducción (eje Z)
  const r3 = (a3 * Math.PI) / 180; // Rotación Interna/Externa (eje Y)

  // Centro articular de la cavidad glenoidea y cabeza humeral
  const P0 = useMemo(() => new THREE.Vector3(-0.092, 0.295, -0.015), []);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const cartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARTILAGE_ICE,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      }),
    []
  );
  const labrumMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: LIGAMENT_FIBROUS,
        roughness: 0.4,
        metalness: 0.05,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  return (
    <group scale={13}>
      {/* Segmento Fijo: Escápula (con cavidad glenoidea, acromion y coracoides) + Clavícula */}
      <group position={[-P0.x, -P0.y, -P0.z]}>
        {nodes.scapula_R && <mesh geometry={nodes.scapula_R.geometry} material={fixedMat} />}
        {nodes.clavicle_R && <mesh geometry={nodes.clavicle_R.geometry} material={fixedMat} />}
      </group>

      {/* Rodete glenoideo (Labrum) cartilaginoso */}
      <mesh position={[0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={labrumMat}>
        <torusGeometry args={[0.012, 0.0025, 16, 32]} />
      </mesh>

      {/* Cartílago articular de la fosa glenoidea */}
      <mesh position={[0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={cartMat}>
        <circleGeometry args={[0.011, 24]} />
      </mesh>

      {/* Segmento Móvil: Húmero con 3 GL completos (Flexión, Abducción, Rotación Axial) */}
      <group rotation={[r1, r3, r2]}>
        <group position={[-P0.x, -P0.y, -P0.z]}>
          {nodes.humerus_R && <mesh geometry={nodes.humerus_R.geometry} material={boneMat} />}
        </group>

        {/* Cartílago articular esférico de la cabeza humeral */}
        <mesh position={[-0.001, 0, 0]} material={cartMat}>
          <sphereGeometry args={[0.015, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>

        {/* Eje 1: Flexión / Extensión (Rojo) */}
        <DOFArc3D
          radius={0.034}
          startAngle={-Math.PI * 0.3}
          endAngle={Math.max(-Math.PI * 0.3 + 0.1, r1)}
          color={ACCENT_RED}
          rotation={[0, 0, Math.PI / 2]}
          position={[0.018, 0, 0]}
          badgeLabel="Flex"
          badgeValue={`${Math.round(a1)}°`}
        />

        {/* Eje 2: Abducción / Aducción (Azul) */}
        <DOFArc3D
          radius={0.031}
          startAngle={-Math.PI * 0.3}
          endAngle={Math.max(-Math.PI * 0.3 + 0.1, r2)}
          color={ACCENT_BLUE}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.018]}
          badgeLabel="Abd"
          badgeValue={`${Math.round(a2)}°`}
        />

        {/* Eje 3: Rotación Axial Interna / Externa (Verde Teal) */}
        <DOFArc3D
          radius={0.025}
          startAngle={-Math.PI * 0.4}
          endAngle={Math.max(-Math.PI * 0.4 + 0.1, r3)}
          color={ACCENT_TEAL}
          position={[0, -0.03, 0]}
          badgeLabel="Rot"
          badgeValue={`${Math.round(a3)}°`}
        />
      </group>
    </group>
  );
}

// ── 6. Plana / Deslizante (Plane · 2 GL): Acromioclavicular (Scapula Acromion + Clavicle) ──
function PlaneAnatomy({ a1, a2 }: { a1: number; a2: number }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;

  // Deslizamientos planares en mm convertidos a espacio local
  const tx = (a1 / 30) * 0.008; // Deslizamiento anteroposterior
  const tz = (a2 / 30) * 0.006; // Deslizamiento superoinferior / lateral

  // Centro articular acromioclavicular
  const P0 = useMemo(() => new THREE.Vector3(-0.081, 0.323, -0.008), []);

  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_IVORY, roughness: 0.62, metalness: 0.04 }),
    []
  );
  const fixedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BONE_DEEP, roughness: 0.65, metalness: 0.04 }),
    []
  );
  const cartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARTILAGE_ICE,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group scale={22}>
      {/* Segmento Fijo: Acromion de la Escápula */}
      <group position={[-P0.x, -P0.y, -P0.z]}>
        {nodes.scapula_R && <mesh geometry={nodes.scapula_R.geometry} material={fixedMat} />}
      </group>

      {/* Disco articular plano interarticular acromioclavicular */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={cartMat}>
        <cylinderGeometry args={[0.006, 0.006, 0.002, 16]} />
      </mesh>

      {/* Segmento Móvil: Extremo acromial de la clavícula en deslizamiento plano biaxial */}
      <group position={[tx, 0, tz]}>
        <group position={[-P0.x, -P0.y, -P0.z]}>
          {nodes.clavicle_R && <mesh geometry={nodes.clavicle_R.geometry} material={boneMat} />}
        </group>

        {/* Faceta articular de la clavícula */}
        <mesh position={[0.001, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={cartMat}>
          <cylinderGeometry args={[0.0055, 0.0055, 0.0015, 16]} />
        </mesh>

        {/* Flechas indicadoras de deslizamiento traslacional biaxial (2 GL) proporcionadas */}
        <TranslationArrow3D
          length={0.018}
          dir={[1, 0, 0]}
          color={ACCENT_TEAL}
          position={[0, 0.012, 0]}
          label="Δx"
          value={`${a1 > 0 ? '+' : ''}${Math.round(a1 * 0.1)}mm`}
        />
        <TranslationArrow3D
          length={0.018}
          dir={[0, 0, 1]}
          color={ACCENT_AMBER}
          position={[0, 0.012, 0]}
          label="Δz"
          value={`${a2 > 0 ? '+' : ''}${Math.round(a2 * 0.1)}mm`}
        />
      </group>
    </group>
  );
}

// ── Manejador de Zoom reactivo ──
function ZoomHandler({
  zoomSignal,
  controlsRef,
}: {
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!zoomSignal) return;
    const target = controlsRef.current?.target ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);
    const factor = zoomSignal.type === 'in' ? 0.78 : 1.28;
    const dir = new THREE.Vector3().subVectors(camera.position, target);
    const newDist = THREE.MathUtils.clamp(dir.length() * factor, 1.5, 24.0);
    dir.normalize().multiplyScalar(newDist);
    camera.position.copy(target).add(dir);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [zoomSignal, camera, controlsRef]);
  return null;
}

const DEFAULT_JOINT_CAMERA: [number, number, number] = [5.7, 3.1, 7.0];

function JointCameraRig({
  type,
  resetSignal,
  controlsRef,
}: {
  type: JointType;
  resetSignal: number;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Las articulaciones se amplifican desde las unidades locales del GLB
    // para hacer visibles las superficies óseas; esta distancia mantiene
    // un encuadre anatómico comparable entre los seis modelos.
    // El pivote tiene el centro articular desplazado hacia el extremo
    // proximal; encuadrarlo evita que la articulación quede perdida entre
    // las diáfisis largas.
    const target: [number, number, number] = type === 'pivot' ? [0, 0.46, 0] : [0, 0, 0];
    const position: [number, number, number] = type === 'pivot' ? [4.7, 3.0, 5.8] : DEFAULT_JOINT_CAMERA;
    camera.position.set(...position);
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
      controlsRef.current.saveState();
    }
  }, [camera, controlsRef, resetSignal, type]);

  return null;
}

const badgeStyle = (color: string): React.CSSProperties => ({
  background: 'rgba(255, 253, 248, 0.94)',
  backdropFilter: 'blur(6px)',
  border: `1px solid ${color}66`,
  borderRadius: '6px',
  padding: '4px 9px',
  fontSize: '0.68rem',
  fontFamily: 'JetBrains Mono, monospace',
  color: '#22303c',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
});

const dotStyle = (color: string): React.CSSProperties => ({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: color,
  display: 'inline-block',
  boxShadow: `0 0 5px ${color}88`,
});

// Pre-carga del GLB anatómico de alta definición
useGLTF.preload('/assets/cap1/human_body.glb');

export default function SynovialJointCanvas({
  type,
  angles,
  resetSignal = 0,
  zoomSignal = null,
}: SynovialJointCanvasProps) {
  const controlsRef = useRef<any>(null);
  const controlsTarget: [number, number, number] = type === 'pivot' ? [0, 0.46, 0] : [0, 0, 0];

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetSignal, type]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: DEFAULT_JOINT_CAMERA, fov: 40 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #faf6ee 55%, #eee4d2 100%)',
        }}
      >
        <JointCameraRig type={type} resetSignal={resetSignal} controlsRef={controlsRef} />
        <ZoomHandler zoomSignal={zoomSignal} controlsRef={controlsRef} />
        <ambientLight intensity={0.85} color="#fffcf5" />
        <directionalLight position={[10, 14, 8]} intensity={1.35} color="#fff8eb" />
        <directionalLight position={[-10, 8, -6]} intensity={0.65} color="#e8f4f8" />
        <directionalLight position={[0, -6, 6]} intensity={0.25} color="#faf0e6" />

        {/* Grid de piso suave de referencia */}
        <gridHelper args={[6, 12, '#c6bca6', '#ded6c5']} position={[0, -1.8, 0]} />

        <Suspense fallback={null}>
          {type === 'hinge' && <HingeAnatomy angle={angles.a1} />}
          {type === 'pivot' && <PivotAnatomy angle={angles.a1} />}
          {type === 'condylar' && <CondylarAnatomy a1={angles.a1} a2={angles.a2} />}
          {type === 'saddle' && <SaddleAnatomy a1={angles.a1} a2={angles.a2} />}
          {type === 'ball' && <BallSocketAnatomy a1={angles.a1} a2={angles.a2} a3={angles.a3} />}
          {type === 'plane' && <PlaneAnatomy a1={angles.a1} a2={angles.a2} />}

          {/* Sombra de contacto difusa bajo la articulación */}
          <ContactShadows
            position={[0, -1.79, 0]}
            opacity={0.42}
            scale={5.5}
            blur={2.2}
            far={4}
            color="#232c36"
          />
        </Suspense>

        <AccessibleOrbitControls
          controlsRef={controlsRef}
          minDistance={1.5}
          maxDistance={24}
          minPolarAngle={Math.PI * 0.12}
          maxPolarAngle={Math.PI * 0.88}
          target={controlsTarget}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Telemetría Angular Discreta en la esquina inferior izquierda (Sin obstruir los huesos) */}
      <div
        style={{
          position: 'absolute',
          bottom: '52px',
          left: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          maxWidth: 'calc(100% - 24px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {type === 'hinge' && (
          <div style={badgeStyle(ACCENT_RED)}>
            <span style={dotStyle(ACCENT_RED)} /> Flexión: <b>{Math.round(angles.a1)}°</b>
          </div>
        )}
        {type === 'pivot' && (
          <div style={badgeStyle(ACCENT_TEAL)}>
            <span style={dotStyle(ACCENT_TEAL)} /> Rotación: <b>{Math.round(angles.a1)}°</b>
          </div>
        )}
        {type === 'condylar' && (
          <>
            <div style={badgeStyle(ACCENT_RED)}>
              <span style={dotStyle(ACCENT_RED)} /> Flex/Ext: <b>{Math.round(angles.a1)}°</b>
            </div>
            <div style={badgeStyle(ACCENT_BLUE)}>
              <span style={dotStyle(ACCENT_BLUE)} /> Desviación: <b>{Math.round(angles.a2)}°</b>
            </div>
          </>
        )}
        {type === 'saddle' && (
          <>
            <div style={badgeStyle(ACCENT_RED)}>
              <span style={dotStyle(ACCENT_RED)} /> Flex/Ext: <b>{Math.round(angles.a1)}°</b>
            </div>
            <div style={badgeStyle(ACCENT_AMBER)}>
              <span style={dotStyle(ACCENT_AMBER)} /> Oposición: <b>{Math.round(angles.a2)}°</b>
            </div>
          </>
        )}
        {type === 'ball' && (
          <>
            <div style={badgeStyle(ACCENT_RED)}>
              <span style={dotStyle(ACCENT_RED)} /> Flex/Ext: <b>{Math.round(angles.a1)}°</b>
            </div>
            <div style={badgeStyle(ACCENT_BLUE)}>
              <span style={dotStyle(ACCENT_BLUE)} /> Abducción: <b>{Math.round(angles.a2)}°</b>
            </div>
            <div style={badgeStyle(ACCENT_TEAL)}>
              <span style={dotStyle(ACCENT_TEAL)} /> Rot. Axial: <b>{Math.round(angles.a3)}°</b>
            </div>
          </>
        )}
        {type === 'plane' && (
          <>
            <div style={badgeStyle(ACCENT_TEAL)}>
              <span style={dotStyle(ACCENT_TEAL)} /> Δx: <b>{angles.a1 > 0 ? '+' : ''}{Math.round(angles.a1 * 0.1)} mm</b>
            </div>
            <div style={badgeStyle(ACCENT_AMBER)}>
              <span style={dotStyle(ACCENT_AMBER)} /> Δz: <b>{angles.a2 > 0 ? '+' : ''}{Math.round(angles.a2 * 0.1)} mm</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
