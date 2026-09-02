import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Line, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Cap2ZoomHandler from './Cap2ZoomHandler';
import { SceneControlPad } from '../cap1/AccessibleOrbitControls';

interface NewtonCanvasProps {
  f1: number;               // Magnitud F1 en N (Deltoides / Músculo)
  theta1: number;           // Ángulo F1 en grados
  f2: number;               // Magnitud F2 en N (Carga / Gravedad)
  theta2: number;           // Ángulo F2 en grados
  autoEquilibrium: boolean; // Si es true, calcula R = -(F1 + F2) para ΣF = 0
  onUpdateF1?: (f: number, theta: number) => void;
  onUpdateF2?: (f: number, theta: number) => void;
}

const BONE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#ede5d0'),
  roughness: 0.65,
  metalness: 0.05,
});

const CARTILAGE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#68c5b8'),
  roughness: 0.25,
  metalness: 0.1,
  transparent: true,
  opacity: 0.85,
});

const LABRUM_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#9bd9cf'),
  roughness: 0.35,
  metalness: 0.02,
  transparent: true,
  opacity: 0.48,
  depthWrite: false,
});

const MUSCLE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#b02318'),
  roughness: 0.55,
  metalness: 0.08,
  emissive: new THREE.Color('#500e08'),
  emissiveIntensity: 0.45,
});

// ── 1. Vector de Fuerza 3D con Tubo, Cono y Badge HTML ──
function ForceVector3D({
  origin = [0, 0, 0] as [number, number, number],
  vector = [1, 0, 0] as [number, number, number],
  color = '#0d6e64',
  label = 'F',
  sublabel = '',
  showComponents = false,
  isDashed = false,
}: {
  origin?: [number, number, number];
  vector: [number, number, number];
  color: string;
  label: string;
  sublabel?: string;
  showComponents?: boolean;
  isDashed?: boolean;
}) {
  const v = useMemo(() => new THREE.Vector3(...vector), [vector]);
  const len = v.length();

  const dir = useMemo(() => (len > 0.001 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0)), [v, len]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  if (len < 0.05) return null;

  const headLen = Math.min(0.28, Math.max(0.14, len * 0.22));
  const headRadius = headLen * 0.38;
  const shaftLen = Math.max(0.01, len - headLen);
  const shaftRadius = 0.024;

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
          roughness={0.3}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.35}
          transparent={isDashed}
          opacity={isDashed ? 0.75 : 1.0}
        />
      </mesh>

      {/* Cabeza cónica del vector */}
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat}>
        <coneGeometry args={[headRadius, headLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Proyecciones ortogonales Fx, Fy */}
      {showComponents && (
        <group>
          <Line
            points={[
              origin,
              [origin[0] + v.x, origin[1], origin[2]],
              [origin[0] + v.x, origin[1] + v.y, origin[2]],
            ]}
            color={color}
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.06}
            gapSize={0.04}
          />
        </group>
      )}

      {/* Rótulo HTML 3D Flotante Nativo */}
      <Html
        position={[tipPos.x + dir.x * 0.16, tipPos.y + dir.y * 0.16, tipPos.z + dir.z * 0.16]}
        center
        zIndexRange={[100, 0]}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: `1.5px solid ${color}`,
            borderRadius: '5px',
            padding: '3px 7px',
            boxShadow: `0 2px 8px ${color}28`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
          }}
        >
          <span style={{ color: color, fontSize: '0.62rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {label}
          </span>
          {sublabel && (
            <span style={{ color: '#55606d', fontSize: '0.52rem', fontFamily: 'Karla, sans-serif' }}>
              {sublabel}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── 2. Articulación Glenohumeral Real de BodyParts3D con Músculo Deltoides ──
function GlenohumeralJointGLB({
  armAngle,
  f1,
  subluxation,
  showAnatomy,
}: {
  armAngle: number;
  f1: number;
  subluxation: [number, number, number];
  showAnatomy: boolean;
}) {
  const { nodes: boneNodes } = useGLTF('/assets/cap1/human_body.glb') as any;
  const { nodes: muscleNodes } = useGLTF('/assets/cap1/human_muscles_arm.glb') as any;

  // Centro anatómico de la cabeza humeral (pivote glenohumeral)
  const jointPivot = useMemo(() => new THREE.Vector3(-0.096, 0.306, -0.018), []);

  if (!showAnatomy) {
    return (
      <group position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial
            color="#0d6e64"
            emissive="#0d6e64"
            emissiveIntensity={0.35}
            transparent
            opacity={0.78}
          />
        </mesh>
        <Html position={[0.10, 0.09, 0.04]} center zIndexRange={[80, 0]}>
          <span
            style={{
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid #0d6e64',
              borderRadius: '4px',
              padding: '2px 5px',
              color: '#0a5a52',
              fontSize: '0.52rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            Pivote articular
          </span>
        </Html>
      </group>
    );
  }

  const muscleBulge = Math.min(1.4, 0.95 + (f1 / 150) * 0.45);

  return (
    <group>
      {/* ── Base Fija: Escápula y Clavícula ── */}
      <group position={[-jointPivot.x, -jointPivot.y, -jointPivot.z]}>
        {boneNodes?.scapula_R && <mesh geometry={boneNodes.scapula_R.geometry} material={BONE_MATERIAL} />}
        {boneNodes?.clavicle_R && <mesh geometry={boneNodes.clavicle_R.geometry} material={BONE_MATERIAL} />}

        {/* Manguito rotador estabilizador */}
        {muscleNodes?.supraspinatus_R && (
          <mesh geometry={muscleNodes.supraspinatus_R.geometry} material={MUSCLE_MATERIAL} />
        )}
        {muscleNodes?.infraspinatus_R && (
          <mesh geometry={muscleNodes.infraspinatus_R.geometry} material={MUSCLE_MATERIAL} />
        )}
        {muscleNodes?.subscapularis_R && (
          <mesh geometry={muscleNodes.subscapularis_R.geometry} material={MUSCLE_MATERIAL} />
        )}
      </group>

      {/* ── Cartílago / Labrum Glenoideo Articular (Ice-Mint) ── */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.06, 0.008, 16, 24]} />
        <primitive object={LABRUM_MATERIAL} attach="material" />
      </mesh>

      {/* ── Hueso Móvil: Húmero con Abducción y Músculo Deltoides Real de BodyParts3D ── */}
      <group position={subluxation} rotation={[0, 0, armAngle]}>
        <group position={[-jointPivot.x, -jointPivot.y, -jointPivot.z]}>
          {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={BONE_MATERIAL} />}

          {/* Músculo Deltoides Real con Abultamiento Fisiológico */}
          {muscleNodes?.deltoideus_clavicular_R && (
            <mesh
              geometry={muscleNodes.deltoideus_clavicular_R.geometry}
              material={MUSCLE_MATERIAL}
              scale={[muscleBulge, 1.0, muscleBulge]}
            />
          )}
          {muscleNodes?.deltoideus_acromial_R && (
            <mesh
              geometry={muscleNodes.deltoideus_acromial_R.geometry}
              material={MUSCLE_MATERIAL}
              scale={[muscleBulge, 1.0, muscleBulge]}
            />
          )}
          {muscleNodes?.deltoideus_spinal_R && (
            <mesh
              geometry={muscleNodes.deltoideus_spinal_R.geometry}
              material={MUSCLE_MATERIAL}
              scale={[muscleBulge, 1.0, muscleBulge]}
            />
          )}
        </group>
      </group>
    </group>
  );
}

// ── 3. Contenido de la Escena 3D ──
function SceneContent({
  f1,
  theta1,
  f2,
  theta2,
  autoEquilibrium,
  showComponents,
  showPolygon,
  showAnatomy,
  orbitRef,
}: {
  f1: number;
  theta1: number;
  f2: number;
  theta2: number;
  autoEquilibrium: boolean;
  showComponents: boolean;
  showPolygon: boolean;
  showAnatomy: boolean;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = (theta2 * Math.PI) / 180;

  const f1x = f1 * Math.cos(rad1);
  const f1y = f1 * Math.sin(rad1);

  const f2x = f2 * Math.cos(rad2);
  const f2y = f2 * Math.sin(rad2);

  const rx = -(f1x + f2x);
  const ry = -(f1y + f2y);
  const rMag = Math.hypot(rx, ry);
  const rAngle = ((Math.atan2(ry, rx) * 180) / Math.PI + 360) % 360;

  const sumFx = autoEquilibrium ? 0 : f1x + f2x;
  const sumFy = autoEquilibrium ? 0 : f1y + f2y;
  const fNet = Math.hypot(sumFx, sumFy);

  const vScale = 0.015;

  const vec1: [number, number, number] = [f1x * vScale, f1y * vScale, 0.05];
  const vec2: [number, number, number] = [f2x * vScale, f2y * vScale, 0.05];
  const vecR: [number, number, number] = [rx * vScale, ry * vScale, 0.05];
  const vecNet: [number, number, number] = [sumFx * vScale, sumFy * vScale, 0.05];

  // La luxación glenohumeral se representa como un desplazamiento
  // anteroinferior pequeño de la cabeza humeral, no como una traslación
  // libre en la dirección arbitraria de la fuerza neta. El grupo anatómico
  // está escalado 3.8x, por eso el desplazamiento local debe ser corto.
  const subluxScale = !autoEquilibrium ? Math.min(0.045, (fNet / 100) * 0.035) : 0;
  const subluxationPos: [number, number, number] = [
    0.018,
    -subluxScale,
    0.025,
  ];

  const armAngle = -rad1 * 0.45;

  // Orígenes para modo polígono cerrado (punta con cola)
  const origin2: [number, number, number] = showPolygon ? [vec1[0], vec1[1], vec1[2]] : [0, 0, 0];
  const originR: [number, number, number] = showPolygon
    ? [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2]]
    : [0, 0, 0];

  return (
    <>
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={1.2}
        maxDistance={6.0}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.9} color="#fffcf5" />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff8eb" castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.65} color="#e0f2fe" />
      <directionalLight position={[0, -3, 2]} intensity={0.3} color="#faf0e6" />

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.42}
        scale={4.5}
        blur={2.0}
        far={3.5}
        color="#232c36"
      />

      <gridHelper
        args={[3.5, 14, '#8c7e68', '#cfc5b4']}
        position={[0, 0, -0.35]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      <group scale={3.8} position={[0, 0, 0]}>
        <GlenohumeralJointGLB
          armAngle={armAngle}
          f1={f1}
          subluxation={subluxationPos}
          showAnatomy={showAnatomy}
        />
      </group>

      {/* ── Vectores de Fuerza 3D ── */}
      {/* F1: Deltoides (Verde Esmeralda) */}
      <ForceVector3D
        origin={[0, 0, 0]}
        vector={vec1}
        color="#0d9488"
        label={`F₁ = ${f1.toFixed(0)} N`}
        sublabel={`${theta1}° · Deltoides`}
        showComponents={showComponents && !showPolygon}
      />

      {/* F2: Carga / Peso Brazo (Ámbar) */}
      <ForceVector3D
        origin={origin2}
        vector={vec2}
        color="#d97706"
        label={`F₂ = ${f2.toFixed(0)} N`}
        sublabel={`${theta2}° · Peso Brazo`}
        showComponents={showComponents && !showPolygon}
      />

      {/* R: Reacción Glenoidea (Carmesí) */}
      {autoEquilibrium && rMag > 1 && (
        <ForceVector3D
          origin={originR}
          vector={vecR}
          color="#dc2626"
          label={`R = ${rMag.toFixed(0)} N`}
          sublabel={`${rAngle.toFixed(0)}° · Reacción Glena`}
          showComponents={showComponents && !showPolygon}
        />
      )}

      {/* F_net: Fuerza Neta si hay desbalance dinámico (Violeta) */}
      {!autoEquilibrium && fNet > 1 && (
        <ForceVector3D
          origin={showPolygon ? originR : [0, 0, 0]}
          vector={vecNet}
          color="#8b5cf6"
          label={`F_net = ${fNet.toFixed(1)} N`}
          sublabel="Luxación anteroinferior"
          isDashed
        />
      )}
    </>
  );
}

// Pre-carga de modelos GLB
useGLTF.preload('/assets/cap1/human_body.glb');
useGLTF.preload('/assets/cap1/human_muscles_arm.glb');

export default function NewtonCanvas({
  f1,
  theta1,
  f2,
  theta2,
  autoEquilibrium,
}: NewtonCanvasProps) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const [showComponents, setShowComponents] = useState(true);
  const [showPolygon, setShowPolygon] = useState(false);
  const [showAnatomy, setShowAnatomy] = useState(true);

  return (
    <div className="cap2-webgl-canvas" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [1.6, 0.8, 2.6], fov: 42 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #faf6ee 55%, #eee4d2 100%)',
        }}
      >
        <Cap2ZoomHandler
          initialPosition={[1.6, 0.8, 2.6]}
          target={[0, 0, 0]}
          minDistance={1.2}
          maxDistance={6}
        />
        <Suspense fallback={null}>
          <SceneContent
            f1={f1}
            theta1={theta1}
            f2={f2}
            theta2={theta2}
            autoEquilibrium={autoEquilibrium}
            showComponents={showComponents}
            showPolygon={showPolygon}
            showAnatomy={showAnatomy}
            orbitRef={orbitRef}
          />
        </Suspense>
      </Canvas>
      <SceneControlPad controlsRef={orbitRef} />

      {/* Controles flotantes en la esquina superior derecha */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setShowPolygon((p) => !p)}
          style={{
            background: showPolygon ? 'rgba(13, 148, 136, 0.9)' : 'rgba(255, 255, 255, 0.88)',
            color: showPolygon ? '#ffffff' : '#22303c',
            border: '1px solid rgba(13, 148, 136, 0.35)',
            borderRadius: '6px',
            padding: '5px 9px',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {showPolygon ? '✓ Triángulo ΣF=0' : '△ Triángulo ΣF=0'}
        </button>
        <button
          type="button"
          onClick={() => setShowComponents((c) => !c)}
          style={{
            background: showComponents ? 'rgba(13, 110, 100, 0.9)' : 'rgba(255, 255, 255, 0.88)',
            color: showComponents ? '#ffffff' : '#22303c',
            border: '1px solid rgba(13, 110, 100, 0.35)',
            borderRadius: '6px',
            padding: '5px 9px',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {showComponents ? '✓ Fx / Fy' : '+ Fx / Fy'}
        </button>
        <button
          type="button"
          onClick={() => setShowAnatomy((a) => !a)}
          style={{
            background: showAnatomy ? 'rgba(176, 35, 24, 0.9)' : 'rgba(255, 255, 255, 0.88)',
            color: showAnatomy ? '#ffffff' : '#22303c',
            border: '1px solid rgba(176, 35, 24, 0.35)',
            borderRadius: '6px',
            padding: '5px 9px',
            fontSize: '0.66rem',
            fontFamily: 'Karla, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {showAnatomy ? '✓ Músculo & Hueso' : '+ Músculo & Hueso'}
        </button>
      </div>
    </div>
  );
}
