import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Cap2ZoomHandler from './Cap2ZoomHandler';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';
import { STUDIO_BG_DEEP } from '../cap1/three/materials';
import { StudioLights } from '../cap1/three/StudioLights';
import { FitCameraResize as FitCamera } from './three/FitCameraResize';
import {
  Callout,
  CalloutProvider,
  CalloutRail,
  CalloutSource,
  useCalloutStore,
} from '../cap1/three/Callouts';

type LeverClass = 1 | 2 | 3;

// Qué representan Fm y W en cada región (el diagrama es esquemático, sin cifras).
const LEVER_LEGEND: Record<LeverClass, { fm: string; w: string; klass: string }> = {
  1: { fm: 'extensores cervicales', w: 'peso de la cabeza', klass: '1ª clase · interapoyo (fulcro entre Fm y W)' },
  2: { fm: 'tríceps sural (Aquiles)', w: 'peso corporal', klass: '2ª clase · interresistencia (W entre fulcro y Fm)' },
  3: { fm: 'bíceps braquial', w: 'carga en la mano', klass: '3ª clase · interpotencia (Fm entre fulcro y W)' },
};

const BONE = new THREE.MeshStandardMaterial({ color: '#e9e1cf', roughness: 0.62, metalness: 0.04 });
const BONE_DEEP = new THREE.MeshStandardMaterial({ color: '#d5c9b3', roughness: 0.68, metalness: 0.03 });
const JOINT = new THREE.MeshStandardMaterial({ color: '#4fb9ad', roughness: 0.28, metalness: 0.12, emissive: '#0d6e64', emissiveIntensity: 0.18 });
const MUSCLE = new THREE.MeshStandardMaterial({ color: '#a92a1e', roughness: 0.58, metalness: 0.03, emissive: '#4a0e08', emissiveIntensity: 0.18 });

const TITLES: Record<LeverClass, string> = {
  1: 'Cuello · atlanto-occipital',
  2: 'Tobillo · apoyo plantar',
  3: 'Codo · flexión con bíceps',
};

function LeverLoading() {
  return (
    <Html center>
      <div style={{ background: 'rgba(255,253,248,.94)', border: '1px solid #c8bea9', borderRadius: 6, padding: '6px 10px', color: '#43505c', font: '600 .68rem Karla, sans-serif', whiteSpace: 'nowrap' }}>
        Cargando región anatómica…
      </div>
    </Html>
  );
}

function AnatomicalVector({
  origin,
  vector,
  color,
  symbol,
  sub,
}: {
  origin: [number, number, number];
  vector: [number, number, number];
  color: string;
  symbol: string;
  sub: string;
}) {
  const v = new THREE.Vector3(...vector);
  const len = v.length();
  const dir = v.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const shaft = Math.max(0.012, len - 0.025);
  const base = new THREE.Vector3(...origin);
  const mid = base.clone().add(dir.clone().multiplyScalar(shaft / 2));
  const tip = base.clone().add(v);

  return (
    <group>
      <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
        <cylinderGeometry args={[0.0028, 0.0028, shaft, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[tip.x - dir.x * 0.012, tip.y - dir.y * 0.012, tip.z - dir.z * 0.012]} quaternion={quat}>
        <coneGeometry args={[0.0085, 0.019, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <Callout position={[tip.x, tip.y, tip.z]} label={symbol} sub={sub} color={color} />
    </group>
  );
}

function AnatomyRegion({ leverClass }: { leverClass: LeverClass; showLabels?: boolean }) {
  const { nodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  if (leverClass === 1) {
    return (
      <group position={[0, 0.03, 0]}>
        {/* La malla cervical vive alrededor de Y=.40 en el GLB. Se centra
            aquí para conservar la escala anatómica sin perderla fuera de cámara.
            Escala 6.0 (antes 6.6): a 6.6 el cráneo llenaba el encuadre y dejaba
            el fulcro C1 + los vectores aplastados en la franja inferior. */}
        <group scale={6.0} position={[0, -0.40 * 6.0, 0]}>
          {/* Cráneo completo: la palanca de primera clase actúa sobre la
              cabeza como una unidad, no únicamente sobre el occipital. */}
          {nodes?.frontal && <mesh geometry={nodes.frontal.geometry} material={BONE} />}
          {nodes?.parietal_L && <mesh geometry={nodes.parietal_L.geometry} material={BONE} />}
          {nodes?.parietal_R && <mesh geometry={nodes.parietal_R.geometry} material={BONE} />}
          {nodes?.temporal_L && <mesh geometry={nodes.temporal_L.geometry} material={BONE_DEEP} />}
          {nodes?.temporal_R && <mesh geometry={nodes.temporal_R.geometry} material={BONE_DEEP} />}
          {nodes?.occipital && <mesh geometry={nodes.occipital.geometry} material={BONE_DEEP} />}
          {nodes?.sphenoid && <mesh geometry={nodes.sphenoid.geometry} material={BONE_DEEP} />}
          {nodes?.ethmoid && <mesh geometry={nodes.ethmoid.geometry} material={BONE_DEEP} />}
          {nodes?.zygomatic_L && <mesh geometry={nodes.zygomatic_L.geometry} material={BONE} />}
          {nodes?.zygomatic_R && <mesh geometry={nodes.zygomatic_R.geometry} material={BONE} />}
          {nodes?.maxilla_L && <mesh geometry={nodes.maxilla_L.geometry} material={BONE} />}
          {nodes?.maxilla_R && <mesh geometry={nodes.maxilla_R.geometry} material={BONE} />}
          {nodes?.nasal_L && <mesh geometry={nodes.nasal_L.geometry} material={BONE} />}
          {nodes?.nasal_R && <mesh geometry={nodes.nasal_R.geometry} material={BONE} />}
          {nodes?.mandible && <mesh geometry={nodes.mandible.geometry} material={BONE_DEEP} />}
          {nodes?.cervical3 && <mesh geometry={nodes.cervical3.geometry} material={BONE} />}
          {nodes?.cervical4 && <mesh geometry={nodes.cervical4.geometry} material={BONE} />}
          {nodes?.cervical5 && <mesh geometry={nodes.cervical5.geometry} material={BONE} />}
          {nodes?.cervical6 && <mesh geometry={nodes.cervical6.geometry} material={BONE} />}
          {nodes?.cervical7 && <mesh geometry={nodes.cervical7.geometry} material={BONE} />}
          {/* Cóndilos occipitales / atlas: fulcro entre potencia y carga. */}
          <mesh position={[0.004, 0.402, -0.035]}>
            <sphereGeometry args={[0.016, 20, 20]} />
            <primitive object={JOINT} attach="material" />
          </mesh>
          {/* La palanca de primera clase: el peso actúa por delante del
              fulcro y los extensores cervicales por detrás. Ambas fuerzas
              apuntan hacia abajo y producen torques opuestos. */}
          <mesh position={[0.004, 0.455, 0.015]}>
            <sphereGeometry args={[0.010, 16, 16]} />
            <meshStandardMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.004, 0.425, -0.055]}>
            <sphereGeometry args={[0.010, 16, 16]} />
            <meshStandardMaterial color="#0d6e64" emissive="#0d6e64" emissiveIntensity={0.25} />
          </mesh>
          <AnatomicalVector origin={[0.004, 0.455, 0.015]} vector={[0, -0.085, 0]} color="#d97706" symbol="W" sub={LEVER_LEGEND[1].w} />
          <AnatomicalVector origin={[0.004, 0.425, -0.055]} vector={[0, -0.075, 0]} color="#0d6e64" symbol="Fm" sub={LEVER_LEGEND[1].fm} />
        </group>
      </group>
    );
  }

  if (leverClass === 2) {
    // Escala 5.5 (antes 10.5, la tibia se salía por arriba). El grupo se
    // recoloca para que el astrágalo quede en el origen.
    const S = 5.5;
    return (
      <group position={[0, 0.02, 0]}>
        <group scale={S} position={[0.041 * S, 0.466 * S, 0]}>
          {nodes?.tibia_R && <mesh geometry={nodes.tibia_R.geometry} material={BONE} />}
          {nodes?.fibula_R && <mesh geometry={nodes.fibula_R.geometry} material={BONE_DEEP} />}
          {nodes?.talus_R && <mesh geometry={nodes.talus_R.geometry} material={JOINT} />}
          {/* En el GLB, calcaneus_L es la pieza que continúa con talus_R
              y los metatarsianos_R; calcaneus_R queda en el lado opuesto. */}
          {nodes?.calcaneus_L && <mesh geometry={nodes.calcaneus_L.geometry} material={BONE_DEEP} />}
          {nodes?.navicular_R && <mesh geometry={nodes.navicular_R.geometry} material={BONE} />}
          {nodes?.metatarsal1_R && <mesh geometry={nodes.metatarsal1_R.geometry} material={BONE} />}
          {nodes?.metatarsal2_R && <mesh geometry={nodes.metatarsal2_R.geometry} material={BONE} />}
          {nodes?.metatarsal3_R && <mesh geometry={nodes.metatarsal3_R.geometry} material={BONE} />}
          {nodes?.metatarsal4_R && <mesh geometry={nodes.metatarsal4_R.geometry} material={BONE} />}
          {nodes?.metatarsal5_R && <mesh geometry={nodes.metatarsal5_R.geometry} material={BONE} />}
          <AnatomicalVector origin={[-0.041, -0.463, -0.012]} vector={[0, 0.055, 0]} color="#2e8b57" symbol="Fm" sub={LEVER_LEGEND[2].fm} />
          <AnatomicalVector origin={[-0.041, -0.463, -0.012]} vector={[0, -0.05, 0]} color="#d97706" symbol="W" sub={LEVER_LEGEND[2].w} />
        </group>
      </group>
    );
  }

  return (
    /* El recorte de B1 usa una escala mayor que el cuerpo completo: el
       codo y el antebrazo deben ser legibles, pero conservar sus proporciones. */
    <group position={[-0.05, 0.05, 0]} scale={5.5}>
      <group position={[0.128, -0.142, 0.016]}>
        {nodes?.scapula_R && <mesh geometry={nodes.scapula_R.geometry} material={BONE_DEEP} />}
        {nodes?.humerus_R && <mesh geometry={nodes.humerus_R.geometry} material={BONE} />}
        {nodes?.ulna_R && <mesh geometry={nodes.ulna_R.geometry} material={BONE} />}
        {nodes?.radius_R && <mesh geometry={nodes.radius_R.geometry} material={BONE_DEEP} />}
        {nodes?.carpal_R && <mesh geometry={nodes.carpal_R.geometry} material={BONE} />}
        {muscleNodes?.biceps_brachii_long_head_R && <mesh geometry={muscleNodes.biceps_brachii_long_head_R.geometry} material={MUSCLE} />}
        {muscleNodes?.biceps_brachii_short_head_R && <mesh geometry={muscleNodes.biceps_brachii_short_head_R.geometry} material={MUSCLE} />}
      </group>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.022, 20, 20]} />
        <primitive object={JOINT} attach="material" />
      </mesh>
      {/* Ambos vectores comparten el fulcro del codo y el eje del antebrazo
          calibrado en BicepsCanvas; no son marcadores flotantes. */}
      <AnatomicalVector origin={[0.01, 0.005, 0.01]} vector={[0.01, 0.11, -0.01]} color="#b02318" symbol="Fm" sub={LEVER_LEGEND[3].fm} />
      <AnatomicalVector origin={[0.01, 0.005, 0.01]} vector={[0, -0.08, 0]} color="#d97706" symbol="W" sub={LEVER_LEGEND[3].w} />
    </group>
  );
}

export default function LeverAnatomyCanvas({
  leverClass,
  showLabels = false,
}: {
  leverClass: LeverClass;
  /** Lo enciende la columna de teoría del slide, no un botón sobre el lienzo. */
  showLabels?: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const callouts = useCalloutStore();
  return (
    <CalloutProvider store={callouts} visible={showLabels}>
    <div className="lever-anatomy-canvas cap2-webgl-canvas">
      <Canvas
        camera={{
          position: leverClass === 3 ? [1.15, 0.30, 1.90] : (leverClass === 2 ? [1.15, 0.28, 2.05] : [0.95, 0.28, 1.95]),
          fov: leverClass === 3 ? 42 : 42,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: STUDIO_BG_DEEP }}
      >
        <StudioLights keyIntensity={1.5} />
        <gridHelper args={[2.8, 14, '#bdb199', '#d3c9b4']} position={[0, -0.48, 0]} />
        <Suspense fallback={<LeverLoading />}>
          <group name="fit-root">
            <AnatomyRegion leverClass={leverClass} />
          </group>
        </Suspense>
        <Cap2ZoomHandler
          initialPosition={leverClass === 3 ? [1.15, 0.30, 1.90] : (leverClass === 2 ? [1.15, 0.28, 2.05] : [0.95, 0.28, 1.95])}
          target={[0, 0.12, 0]}
          minDistance={0.55}
          maxDistance={3.2}
        />
        <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={0.55} maxDistance={3.2} target={[0, 0.12, 0]} />
        <FitCamera padding={1.35} lookTarget={[0, 0.12, 0]} refit={leverClass} />
        <CalloutSource />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />

      {/* Leyenda de la palanca → riel lateral con línea guía a cada vector */}
      <CalloutRail
        store={callouts}
        side="left"
        note={`${TITLES[leverClass]} · ${LEVER_LEGEND[leverClass].klass}`}
      />
    </div>
    </CalloutProvider>
  );
}

useGLTF.preload('/assets/cap1/human_body.glb');
