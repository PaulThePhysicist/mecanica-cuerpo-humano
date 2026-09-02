import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FULL_BODY_FLOOR_Y, FULL_BODY_SCALE, FULL_BODY_SHADOW_Y } from './bodySceneGeometry';
import { AnatomyStage } from './three/AnatomyStage';
import { useAnatomyScene } from './three/useAnatomyNodes';
import { Axes } from './AnatomyCanvas';

const BONE_BASE = new THREE.Color('#e8dcc4');

function AnatomyModel({ planeSel }: { planeSel?: string | null }) {
  const scene = useAnatomyScene('body');

  const clonedScene = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = new THREE.MeshStandardMaterial({
          color: BONE_BASE.clone(),
          roughness: 0.82,
          metalness: 0.05,
          transparent: true,
          opacity: 0.85,
        });
        mesh.material = mat;
      }
    });
    return s;
  }, [scene]);

  useEffect(() => {
    // Si hay un plano seleccionado, el cuerpo se vuelve translúcido para apreciar la sección interna
    // Mantener el mismo contraste de la referencia A1 incluso al aislar un
    // plano; la lámina translúcida sigue mostrando la sección sin lavar el
    // modelo anatómico.
    const targetOpacity = 0.85;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = targetOpacity;
      }
    });
  }, [planeSel, clonedScene]);

  return <primitive object={clonedScene} scale={FULL_BODY_SCALE} />;
}

interface PlaneDefinition {
  id: string;
  name: string;
  sub: string;
  eq: string;
  color: string;
  width: number;
  height: number;
  pos: [number, number, number];
  rot: [number, number, number];
  labelPos: [number, number, number];
  travelAxis: 'x' | 'y' | 'z';
}

const PLANES: PlaneDefinition[] = [
  {
    id: 'plane-sagittal',
    name: 'Plano sagital',
    sub: 'Derecha / Izquierda · Flexión/Extensión',
    eq: 'y = 0 (midsagital)',
    color: '#6d5fbf', // Púrpura sagital
    width: 0.48,
    height: 0.95,
    pos: [0.005, 0.05, -0.006],
    rot: [0, Math.PI / 2, 0],
    labelPos: [0.005, 0.54, -0.25],
    travelAxis: 'x',
  },
  {
    id: 'plane-coronal',
    name: 'Plano coronal',
    sub: 'Anterior / Posterior · Abducción/Aducción',
    eq: 'x = 0 (frontal)',
    color: '#0d6e64', // Verde teal coronal
    width: 0.54,
    height: 0.95,
    pos: [0.005, 0.05, -0.006],
    rot: [0, 0, 0],
    labelPos: [-0.29, 0.54, -0.006],
    travelAxis: 'z',
  },
  {
    id: 'plane-transverse',
    name: 'Plano transverso',
    sub: 'Superior / Inferior · Rotaciones',
    eq: 'z = 0 (horizontal)',
    color: '#c0681e', // Ámbar transverso
    width: 0.54,
    height: 0.48,
    pos: [0.005, 0.05, -0.006],
    rot: [-Math.PI / 2, 0, 0],
    labelPos: [0.29, 0.05, 0.25],
    travelAxis: 'y',
  },
];

function PlaneMesh({
  plane,
  isSelected,
  isDimmed,
  showLabels,
  travelOffset,
}: {
  plane: PlaneDefinition;
  isSelected: boolean;
  isDimmed: boolean;
  showLabels: boolean;
  travelOffset: number;
}) {
  const { width, height, color, pos, rot, labelPos, name, eq, travelAxis } = plane;

  const opacity = isSelected ? 0.48 : isDimmed ? 0.05 : 0.20;
  const wireOpacity = isSelected ? 0.90 : isDimmed ? 0.12 : 0.40;

  // Bordes del plano
  const planeGeo = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(planeGeo), [planeGeo]);

  // Rejilla interna para dar textura de corte 2D
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[] = [];
    const divisionsX = 4;
    const divisionsY = 6;
    const halfW = width / 2;
    const halfH = height / 2;

    for (let i = 1; i < divisionsX; i++) {
      const x = -halfW + (width / divisionsX) * i;
      lines.push(new THREE.Vector3(x, -halfH, 0.001), new THREE.Vector3(x, halfH, 0.001));
    }
    for (let j = 1; j < divisionsY; j++) {
      const y = -halfH + (height / divisionsY) * j;
      lines.push(new THREE.Vector3(-halfW, y, 0.001), new THREE.Vector3(halfW, y, 0.001));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(lines);
    return geom;
  }, [width, height]);

  return (
    <group>
      <group
        position={[
          pos[0] + (travelAxis === 'x' ? travelOffset : 0),
          pos[1] + (travelAxis === 'y' ? travelOffset : 0),
          pos[2] + (travelAxis === 'z' ? travelOffset : 0),
        ]}
        rotation={rot}
      >
        {/* Lámina translúcida */}
        <mesh geometry={planeGeo}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.35 : 0.05}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Contorno exterior */}
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial color={color} transparent opacity={wireOpacity} linewidth={isSelected ? 2 : 1} />
        </lineSegments>

        {/* Rejilla interna sutil */}
        <lineSegments geometry={gridLines}>
          <lineBasicMaterial color={color} transparent opacity={wireOpacity * 0.35} />
        </lineSegments>
      </group>

      {/* Etiqueta flotante 3D del plano */}
      {showLabels && (
        <Html
          center
          position={[
            labelPos[0] + (travelAxis === 'x' ? travelOffset : 0),
            labelPos[1] + (travelAxis === 'y' ? travelOffset : 0),
            labelPos[2] + (travelAxis === 'z' ? travelOffset : 0),
          ]}
          zIndexRange={[100, 0]}
        >
          <div
            style={{
              background: isSelected ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 253, 248, 0.92)',
              color: '#22303c',
              border: `1.5px solid ${color}`,
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '0.66rem',
              fontFamily: 'var(--sans)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: isSelected ? `0 4px 14px ${color}33` : '0 3px 8px rgba(0,0,0,0.08)',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <span style={{ fontWeight: 'bold', color: color, marginRight: '4px' }}>
              {isSelected ? '◉ ' : '▦ '}
              {name}
            </span>
            <span style={{ opacity: 0.8, fontSize: '0.60rem' }}>({eq})</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Líneas de corte de los ejes de intersección entre los 3 planos
function IntersectionAxes() {
  const len = 0.55;
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: '#2b3b47', transparent: true, opacity: 0.35 }), []);

  const geoX = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-len, 0.05, -0.006), new THREE.Vector3(len, 0.05, -0.006)]), []);
  const geoY = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.005, -len * 0.8, -0.006), new THREE.Vector3(0.005, len * 0.8, -0.006)]), []);
  const geoZ = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.005, 0.05, -len), new THREE.Vector3(0.005, 0.05, len)]), []);

  return (
    <group>
      <lineSegments geometry={geoX} material={mat} />
      <lineSegments geometry={geoY} material={mat} />
      <lineSegments geometry={geoZ} material={mat} />
    </group>
  );
}

// Flechas y rótulos direccionales con el mismo lenguaje visual de A1.
function AxisDirectionArrows({ showLabels }: { showLabels: boolean }) {
  if (!showLabels) return null;

  const arrows = [
    { key: 'z', length: 2.6, color: '#0d6e64', dir: [0, 1, 0], labelPos: '+z', subPos: '↑ Superior / Craneal', labelNeg: '−z', subNeg: '↓ Inferior / Caudal' },
    { key: 'y', length: 1.9, color: '#a92a1e', dir: [1, 0, 0], labelPos: '+y', subPos: '→ Izquierda', labelNeg: '−y', subNeg: '← Derecha' },
    { key: 'x', length: 1.9, color: '#9a5b00', dir: [0, 0, 1], labelPos: '+x', subPos: 'Anterior / Ventral', labelNeg: '−x', subNeg: 'Posterior / Dorsal' },
  ];

  return (
    <group>
      {arrows.map(({ key, ...arrow }) => (
        <AxisDoubleArrow key={key} {...arrow} showLabels />
      ))}
    </group>
  );
}

function AxisDoubleArrow({ length, color, dir, labelPos, subPos, labelNeg, subNeg, showLabels }: any) {
  // El eje es una referencia ligera; las etiquetas aportan la lectura sin
  // competir visualmente con las láminas de corte.
  const radius = 0.004;
  const headRadius = 0.022;
  const headLength = 0.08;
  const shaftLength = length - headLength * 2;
  const direction = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const reverseQuaternion = quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
  const headOffset = direction.clone().multiplyScalar(shaftLength / 2 + headLength / 2);
  // En A1 los rótulos quedan prácticamente sobre la punta del eje; mantener
  // una holgura mínima evita que el texto parezca separado de su referencia.
  const positive = direction.clone().multiplyScalar(length / 2 - 0.16);
  const negative = direction.clone().multiplyScalar(-(length / 2 - 0.16));
  const material = <meshStandardMaterial color={color} transparent opacity={0.52} depthTest={false} />;

  return (
    <group>
      <mesh quaternion={quaternion}><cylinderGeometry args={[radius, radius, shaftLength, 12]} />{material}</mesh>
      <mesh position={[headOffset.x, headOffset.y, headOffset.z]} quaternion={quaternion}><coneGeometry args={[headRadius, headLength, 12]} />{material}</mesh>
      <mesh position={[negative.x, negative.y, negative.z]} quaternion={reverseQuaternion}><coneGeometry args={[headRadius, headLength, 12]} />{material}</mesh>
      {showLabels && <>
        <Html position={[positive.x, positive.y, positive.z]} center zIndexRange={[100, 0]}>
          <div style={{ textAlign: 'center', pointerEvents: 'none', color, fontFamily: 'var(--sans)', whiteSpace: 'nowrap', opacity: .9 }}>
            <div style={{ fontSize: '.56rem', marginBottom: 1 }}>{subPos}</div><div style={{ fontWeight: 'bold', fontSize: '.9rem' }}>{labelPos}</div>
          </div>
        </Html>
        <Html position={[negative.x, negative.y, negative.z]} center zIndexRange={[100, 0]}>
          <div style={{ textAlign: 'center', pointerEvents: 'none', color, fontFamily: 'var(--sans)', whiteSpace: 'nowrap', opacity: .9 }}>
            <div style={{ fontWeight: 'bold', fontSize: '.9rem', marginBottom: 1 }}>{labelNeg}</div><div style={{ fontSize: '.56rem' }}>{subNeg}</div>
          </div>
        </Html>
      </>}
    </group>
  );
}

function SectionPlanesGroup({
  planeSel,
  showAll,
  showLabels,
  movingPlanes = {},
  motionSpeed = 1,
  planeOffsets = {},
}: {
  planeSel?: string | null;
  showAll: boolean;
  showLabels: boolean;
  movingPlanes: Record<string, boolean>;
  motionSpeed: number;
  planeOffsets: Record<string, number>;
}) {
  const motionTime = useRef(0);
  const [, forceFrame] = React.useState(0);
  useFrame((_, delta) => {
    if (Object.values(movingPlanes).some(Boolean)) {
      motionTime.current += delta * motionSpeed;
      forceFrame((value) => value + 1);
    }
  });

  return (
    <group>
      {/* En A1 los ejes viven en el mismo nivel que el modelo; no deben
          heredar la escala aplicada al cuerpo y a las láminas de corte. */}
      <Axes hoveredTerm={null} showLabels={showLabels} showGrid={false} />
      <group scale={FULL_BODY_SCALE}>
        {PLANES.map((plane) => {
          const isSelected = planeSel === plane.id;
          const isDimmed = Boolean(planeSel && !isSelected);
          const isVisible = showAll || isSelected;

          if (!isVisible) return null;

          return (
            <PlaneMesh
              key={plane.id}
              plane={plane}
              isSelected={isSelected}
              isDimmed={isDimmed}
              showLabels={false}
              travelOffset={(planeOffsets[plane.id] ?? 0) + (movingPlanes[plane.id] ? Math.sin(motionTime.current) * 0.28 : 0)}
            />
          );
        })}
      </group>
    </group>
  );
}

export default function PlanesCanvas({
  planeSel,
  showLabels = false,
  showAll = true,
  autoRotate = false,
  movingPlanes = {},
  motionSpeed = 1,
  planeOffsets = {},
  resetSignal = 0,
  zoomSignal = null,
}: {
  planeSel?: string | null;
  showLabels?: boolean;
  showAll?: boolean;
  autoRotate?: boolean;
  movingPlanes?: Record<string, boolean>;
  motionSpeed?: number;
  planeOffsets?: Record<string, number>;
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
}) {
  return (
    <AnatomyStage
      camera={{ position: [3.6, 1.8, 12.5], fov: 45 }}
      target={[0, 0.2, 0]}
      minDistance={3.5}
      maxDistance={32}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.8}
      autoRotate={autoRotate}
      gridY={FULL_BODY_FLOOR_Y}
      shadowY={FULL_BODY_SHADOW_Y}
      shadowScale={8}
      shadowOpacity={0.45}
      resetSignal={resetSignal}
      zoomSignal={zoomSignal}
    >
      <Center position={[0, 0, 0]}>
        <AnatomyModel planeSel={planeSel} />
        <SectionPlanesGroup
          planeSel={planeSel}
          showAll={showAll}
          showLabels={showLabels}
          movingPlanes={movingPlanes}
          motionSpeed={motionSpeed}
          planeOffsets={planeOffsets}
        />
      </Center>
    </AnatomyStage>
  );
}
