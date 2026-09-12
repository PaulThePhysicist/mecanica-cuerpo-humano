import { useMemo } from 'react';
import * as THREE from 'three';
import { AnatomyStage } from './three/AnatomyStage';
import { useAnatomyNodes } from './three/useAnatomyNodes';
import { materials } from './three/materials';

export type MovementType =
  | 'flexion'
  | 'extension'
  | 'abduction'
  | 'adduction'
  | 'rotation_med'
  | 'rotation_lat'
  | 'pronation'
  | 'supination'
  | 'circumduction';

interface MovementCanvasProps {
  movement: MovementType;
  progress: number; // 0.0 a 1.0
  showMuscles?: boolean;
  showPlanes?: boolean;
  showLabels?: boolean;
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
}

// ── Paleta Anatómica PBR de Grado Médico ──
const CARTILAGE_COLOR = '#68c5b8';

// ── Coordenadas Anatómicas Clave de BodyParts3D (Pose Estándar) ──
const P_SHOULDER = new THREE.Vector3(-0.096, 0.306, -0.018);
const P_ELBOW = new THREE.Vector3(-0.128, 0.142, -0.016);
const P_RAD_PROX = new THREE.Vector3(-0.142, 0.138, -0.005);
const FOREARM_ROTATION_ROM = 80;

// ── Cono 3D de Circunducción ──
function CircumductionConeVisual({
  apex,
  baseCenter,
  baseRadius,
  phase,
}: {
  apex: THREE.Vector3;
  baseCenter: THREE.Vector3;
  baseRadius: number;
  phase: number;
}) {
  const coneHeight = apex.distanceTo(baseCenter);
  const dir = baseCenter.clone().sub(apex).normalize();
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    return q;
  }, [dir]);

  const coneMid = apex.clone().add(baseCenter).multiplyScalar(0.5);

  const orbiterPos = useMemo(() => {
    const angle = phase * Math.PI * 2;
    return new THREE.Vector3(
      baseCenter.x + Math.cos(angle) * baseRadius,
      baseCenter.y,
      baseCenter.z + Math.sin(angle) * baseRadius
    );
  }, [baseCenter, baseRadius, phase]);

  const trajectoryPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 48;
    for (let i = 0; i <= count; i++) {
      const a = (i / count) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          baseCenter.x + Math.cos(a) * baseRadius,
          baseCenter.y,
          baseCenter.z + Math.sin(a) * baseRadius
        )
      );
    }
    return pts;
  }, [baseCenter, baseRadius]);

  const sweepArmGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([apex, orbiterPos]);
  }, [apex, orbiterPos]);

  return (
    <group>
      <mesh position={[coneMid.x, coneMid.y, coneMid.z]} quaternion={quat}>
        <coneGeometry args={[baseRadius, coneHeight, 32, 1, true]} />
        <meshStandardMaterial
          color="#0d6e64"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <primitive
        object={
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(trajectoryPoints),
            new THREE.LineBasicMaterial({ color: '#0d6e64', transparent: true, opacity: 0.75 })
          )
        }
      />

      <primitive
        object={
          new THREE.Line(
            sweepArmGeom,
            new THREE.LineBasicMaterial({ color: '#b02318', linewidth: 2 })
          )
        }
      />

      <mesh position={[orbiterPos.x, orbiterPos.y, orbiterPos.z]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#b02318" emissive="#b02318" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// ── Visualizador de Planos Anatómicos de Movimiento ──
function PlaneVisualizer({
  movement,
  shoulderPos,
  armSpan,
}: {
  movement: MovementType;
  shoulderPos: THREE.Vector3;
  /** Distancia hombro-codo real (tras escalar el grupo): unidad para que el
   *  plano acompañe al brazo en vez de una lámina de tamaño de escena que lo
   *  empequeñece (V2-01: dominaba el fit-root de toda la escena). */
  armSpan: number;
}) {
  const planeGeom = useMemo(
    () => new THREE.PlaneGeometry(armSpan * 1.8, armSpan * 2.5),
    [armSpan],
  );

  if (movement === 'flexion' || movement === 'extension') {
    return (
      <group position={[shoulderPos.x - 0.1, shoulderPos.y - 0.35, shoulderPos.z]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={planeGeom}>
          <meshBasicMaterial color="#0d6e64" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  if (movement === 'abduction' || movement === 'adduction') {
    return (
      <group position={[shoulderPos.x + 0.25, shoulderPos.y - 0.35, shoulderPos.z]}>
        <mesh geometry={planeGeom}>
          <meshBasicMaterial color="#b02318" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  if (movement === 'rotation_med' || movement === 'rotation_lat') {
    return (
      <group position={[shoulderPos.x, shoulderPos.y, shoulderPos.z]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={planeGeom}>
          <meshBasicMaterial color="#5c6bc0" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  return null;
}

// ── Modelo Esquelético y Muscular Completo con Huesos y Músculos Auténticos BodyParts3D ──
function UpperLimbAnatomy({
  movement,
  progress,
  showMuscles = true,
}: {
  movement: MovementType;
  progress: number;
  showMuscles?: boolean;
}) {
  const boneNodes = useAnatomyNodes('body');
  const muscleNodes = useAnatomyNodes('muscles_arm');

  // Materiales PBR compartidos
  const boneMat = materials.bone;
  const activeMuscleMat = materials.muscleActive;
  const inactiveMuscleMat = materials.muscleIdle;
  const neutralMuscleMat = materials.muscleNeutral;

  // ── Cálculo Cinemático de Ángulos Articulares ──
  let humPitch = 0;
  let humAxial = 0;
  let humCoronal = 0;
  let elbowFlex = 0;
  let pronationAngle = 0;
  let circumPhase = 0;

  let bicepsAct = 0.0;
  let tricepsAct = 0.0;
  let deltoidMidAct = 0.0;
  let deltoidAntAct = 0.0;
  let deltoidPostAct = 0.0;
  let subscapularisAct = 0.0;
  let infraspinatusAct = 0.0;
  let pronatorAct = 0.0;
  let supinatorAct = 0.0;

  switch (movement) {
    case 'flexion':
      elbowFlex = progress * 135;
      humPitch = progress * 20;
      bicepsAct = Math.max(0.1, progress);
      tricepsAct = 0.05;
      break;

    case 'extension':
      elbowFlex = (1 - progress) * 110;
      humPitch = -(progress * 25);
      tricepsAct = Math.max(0.1, progress);
      bicepsAct = 0.05;
      break;

    case 'abduction':
      // El brazo derecho parte en x negativo. La abducción lo eleva
      // alejándolo de la línea media en el plano coronal (eje Z).
      humCoronal = -(progress * 95);
      deltoidMidAct = Math.max(0.1, progress);
      break;

    case 'adduction':
      // Sentido opuesto: regreso hacia la línea media / aducción.
      humCoronal = progress * 30;
      deltoidAntAct = 0.2;
      break;

    case 'rotation_med':
      // Hombro derecho: +Y lleva el antebrazo hacia medial (+X) y anterior
      // (+Z), que corresponde a rotación interna con el codo flexionado.
      humAxial = progress * 75;
      subscapularisAct = Math.max(0.1, progress);
      elbowFlex = 70;
      break;

    case 'rotation_lat':
      // La rotación externa invierte el mismo eje longitudinal.
      humAxial = -(progress * 65);
      infraspinatusAct = Math.max(0.1, progress);
      elbowFlex = 70;
      break;

    case 'pronation':
      elbowFlex = 75;
      pronationAngle = progress * FOREARM_ROTATION_ROM;
      pronatorAct = Math.max(0.1, progress);
      supinatorAct = 0.05;
      break;

    case 'supination':
      elbowFlex = 75;
      pronationAngle = (1 - progress) * FOREARM_ROTATION_ROM;
      supinatorAct = Math.max(0.1, progress);
      bicepsAct = progress * 0.7;
      pronatorAct = 0.05;
      break;

    case 'circumduction':
      circumPhase = progress;
      const angle = circumPhase * Math.PI * 2;
      const coneR = 35;
      humPitch = Math.sin(angle) * coneR;
      humCoronal = -(35 + Math.cos(angle) * coneR);
      elbowFlex = 25;

      deltoidAntAct = Math.max(0.05, Math.sin(angle));
      deltoidMidAct = Math.max(0.05, Math.cos(angle));
      deltoidPostAct = Math.max(0.05, -Math.sin(angle));
      break;
  }

  const rPitch = (humPitch * Math.PI) / 180;
  const rAxial = (humAxial * Math.PI) / 180;
  const rCoronal = (humCoronal * Math.PI) / 180;
  // En la postura anatómica del GLB, el antebrazo parte hacia -Y y el
  // anterior del cuerpo está en +Z. Por eso la flexión fisiológica del
  // codo necesita rotación negativa alrededor de X: lleva el antebrazo
  // hacia anterior y reduce el ángulo articular, en lugar de llevarlo
  // hacia posterior.
  const rElbow = (-elbowFlex * Math.PI) / 180;
  const rPron = (pronationAngle * Math.PI) / 180;

  const dElbow = useMemo(() => new THREE.Vector3().subVectors(P_ELBOW, P_SHOULDER), []);
  const MODEL_SCALE = 4.8;

  return (
    <group position={[0, 0.75, 0]} scale={MODEL_SCALE}>
      {/* ── Contexto Esquelético Fijo: Escápula y Clavícula ── */}
      <group position={[-P_SHOULDER.x, -P_SHOULDER.y, -P_SHOULDER.z]}>
        {boneNodes?.clavicle_R && <mesh geometry={boneNodes.clavicle_R.geometry} material={boneMat} />}
        {boneNodes?.scapula_R && <mesh geometry={boneNodes.scapula_R.geometry} material={boneMat} />}

        {/* Músculos escapulares fijos */}
        {showMuscles && muscleNodes && (
          <>
            {muscleNodes.supraspinatus_R && (
              <mesh geometry={muscleNodes.supraspinatus_R.geometry} material={neutralMuscleMat} />
            )}
            {muscleNodes.infraspinatus_R && (
              <mesh
                geometry={muscleNodes.infraspinatus_R.geometry}
                material={infraspinatusAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
              />
            )}
            {muscleNodes.subscapularis_R && (
              <mesh
                geometry={muscleNodes.subscapularis_R.geometry}
                material={subscapularisAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
              />
            )}
            {muscleNodes.teres_minor_R && (
              <mesh geometry={muscleNodes.teres_minor_R.geometry} material={neutralMuscleMat} />
            )}
            {muscleNodes.teres_major_R && (
              <mesh geometry={muscleNodes.teres_major_R.geometry} material={neutralMuscleMat} />
            )}
          </>
        )}
      </group>

      {/* Cartílago Articular de la Cavidad Glenoidea */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshStandardMaterial color={CARTILAGE_COLOR} roughness={0.25} transparent opacity={0.8} />
      </mesh>

      {/* ── Complejo del Húmero Articulado con Músculos Reales ── */}
      {/* X: flexión/extensión · Y: rotación axial · Z: abducción/aducción */}
      <group rotation={[rPitch, rAxial, rCoronal]}>
        <group position={[-P_SHOULDER.x, -P_SHOULDER.y, -P_SHOULDER.z]}>
          {boneNodes?.humerus_R && <mesh geometry={boneNodes.humerus_R.geometry} material={boneMat} />}

          {/* Músculos Anatómicos Reales del Brazo */}
          {showMuscles && muscleNodes && (
            <>
              {/* Deltoides Clavicular, Acromial y Espinal */}
              {muscleNodes.deltoideus_clavicular_R && (
                <mesh
                  geometry={muscleNodes.deltoideus_clavicular_R.geometry}
                  material={deltoidAntAct > 0.2 ? activeMuscleMat : neutralMuscleMat}
                />
              )}
              {muscleNodes.deltoideus_acromial_R && (
                <mesh
                  geometry={muscleNodes.deltoideus_acromial_R.geometry}
                  material={deltoidMidAct > 0.2 ? activeMuscleMat : neutralMuscleMat}
                />
              )}
              {muscleNodes.deltoideus_spinal_R && (
                <mesh
                  geometry={muscleNodes.deltoideus_spinal_R.geometry}
                  material={deltoidPostAct > 0.2 ? activeMuscleMat : neutralMuscleMat}
                />
              )}

              {/* Bíceps Braquial */}
              {muscleNodes.biceps_brachii_long_head_R && (
                <mesh
                  geometry={muscleNodes.biceps_brachii_long_head_R.geometry}
                  material={bicepsAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
                  scale={bicepsAct > 0.2 ? [1.06, 1.0, 1.08] : [0.96, 1.0, 0.96]}
                />
              )}
              {muscleNodes.biceps_brachii_short_head_R && (
                <mesh
                  geometry={muscleNodes.biceps_brachii_short_head_R.geometry}
                  material={bicepsAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
                  scale={bicepsAct > 0.2 ? [1.06, 1.0, 1.08] : [0.96, 1.0, 0.96]}
                />
              )}

              {/* Braquial y Coracobraquial */}
              {muscleNodes.brachialis_R && (
                <mesh
                  geometry={muscleNodes.brachialis_R.geometry}
                  material={bicepsAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
                />
              )}
              {muscleNodes.coracobrachialis_R && (
                <mesh geometry={muscleNodes.coracobrachialis_R.geometry} material={neutralMuscleMat} />
              )}

              {/* Tríceps Braquial */}
              {muscleNodes.triceps_brachii_long_head_R && (
                <mesh
                  geometry={muscleNodes.triceps_brachii_long_head_R.geometry}
                  material={tricepsAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
                  scale={tricepsAct > 0.2 ? [1.06, 1.0, 1.08] : [0.95, 1.0, 0.95]}
                />
              )}
              {muscleNodes.triceps_brachii_lateral_head_R && (
                <mesh
                  geometry={muscleNodes.triceps_brachii_lateral_head_R.geometry}
                  material={tricepsAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
                  scale={tricepsAct > 0.2 ? [1.06, 1.0, 1.08] : [0.95, 1.0, 0.95]}
                />
              )}
              {muscleNodes.triceps_brachii_medial_head_R && (
                <mesh
                  geometry={muscleNodes.triceps_brachii_medial_head_R.geometry}
                  material={tricepsAct > 0.2 ? activeMuscleMat : inactiveMuscleMat}
                />
              )}
            </>
          )}
        </group>

        {/* ── Articulación del Codo y Antebrazo ── */}
        <group position={[dElbow.x, dElbow.y, dElbow.z]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshStandardMaterial color={CARTILAGE_COLOR} roughness={0.28} transparent opacity={0.8} />
          </mesh>

          <group rotation={[rElbow, 0, 0]}>
            {/* Cúbito (Ulna) */}
            <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
              {boneNodes?.ulna_R && <mesh geometry={boneNodes.ulna_R.geometry} material={boneMat} />}
            </group>

            {/* Radio y mano: el giro ocurre alrededor del eje local del antebrazo.
                Al estar dentro de la flexión del codo, ese eje acompaña la
                inclinación del antebrazo; no es una rotación global del hombro. */}
            <group rotation={[0, rPron, 0]}>
              <group position={[-P_ELBOW.x, -P_ELBOW.y, -P_ELBOW.z]}>
                {boneNodes?.radius_R && <mesh geometry={boneNodes.radius_R.geometry} material={boneMat} />}
                {boneNodes?.scaphoid_R && <mesh geometry={boneNodes.scaphoid_R.geometry} material={boneMat} />}
                {boneNodes?.lunate_R && <mesh geometry={boneNodes.lunate_R.geometry} material={boneMat} />}
                {boneNodes?.capitate_R && <mesh geometry={boneNodes.capitate_R.geometry} material={boneMat} />}
                {boneNodes?.metacarpal_2 && <mesh geometry={boneNodes.metacarpal_2.geometry} material={boneMat} />}
                {boneNodes?.metacarpal_4 && <mesh geometry={boneNodes.metacarpal_4.geometry} material={boneMat} />}

                {/* Pronador Redondo */}
                {showMuscles && muscleNodes && (
                  <>
                    {muscleNodes.pronator_teres_humeral_head_R && (
                      <mesh
                        geometry={muscleNodes.pronator_teres_humeral_head_R.geometry}
                        material={pronatorAct > 0.2 ? activeMuscleMat : neutralMuscleMat}
                      />
                    )}
                    {muscleNodes.pronator_teres_ulnar_head_R && (
                      <mesh
                        geometry={muscleNodes.pronator_teres_ulnar_head_R.geometry}
                        material={pronatorAct > 0.2 ? activeMuscleMat : neutralMuscleMat}
                      />
                    )}
                  </>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// ── Contenido de referencia: costillas/esternón «fantasma» + plano/cono ──
// Vive fuera de fit-root (ver AnatomyStage `contextChildren`): son apoyos
// visuales, no el objetivo. Antes de separarlos dominaban la caja de encuadre
// y dejaban el brazo diminuto (V2-01).
function UpperLimbContext({
  movement,
  progress,
  showPlanes,
}: {
  movement: MovementType;
  progress: number;
  showPlanes: boolean;
}) {
  const boneNodes = useAnatomyNodes('body');
  const contextMat = materials.boneGhost;
  const dElbow = useMemo(() => new THREE.Vector3().subVectors(P_ELBOW, P_SHOULDER), []);
  const MODEL_SCALE = 4.8;

  return (
    <group position={[0, 0.75, 0]} scale={MODEL_SCALE}>
      <group position={[-P_SHOULDER.x, -P_SHOULDER.y, -P_SHOULDER.z]}>
        {boneNodes?.sternum && <mesh geometry={boneNodes.sternum.geometry} material={contextMat} />}
        {boneNodes?.rib_1 && <mesh geometry={boneNodes.rib_1.geometry} material={contextMat} />}
        {boneNodes?.rib_2 && <mesh geometry={boneNodes.rib_2.geometry} material={contextMat} />}
        {boneNodes?.rib_3 && <mesh geometry={boneNodes.rib_3.geometry} material={contextMat} />}
      </group>

      {showPlanes && (
        <PlaneVisualizer movement={movement} shoulderPos={new THREE.Vector3(0, 0, 0)} armSpan={dElbow.length()} />
      )}

      {movement === 'circumduction' && (
        <CircumductionConeVisual
          apex={new THREE.Vector3(0, 0, 0)}
          baseCenter={new THREE.Vector3(0.06, -0.55, 0.0)}
          baseRadius={0.32}
          phase={progress}
        />
      )}
    </group>
  );
}

export default function MovementCanvas({
  movement,
  progress,
  showMuscles = true,
  showPlanes = true,
  resetSignal = 0,
  zoomSignal = null,
}: MovementCanvasProps) {
  return (
    <AnatomyStage
      camera={{ position: [2.8, 0.5, 4.9], fov: 42 }}
      target={[0, 0, 0]}
      minDistance={1.5}
      maxDistance={24}
      minPolarAngle={Math.PI * 0.08}
      maxPolarAngle={Math.PI * 0.92}
      gridY={-2.2}
      shadowY={-2.19}
      shadowScale={6.5}
      shadowOpacity={0.42}
      resetSignal={resetSignal}
      zoomSignal={zoomSignal}
      fit
      fitPadding={1.15}
      refit={movement}
      contextChildren={<UpperLimbContext movement={movement} progress={progress} showPlanes={showPlanes} />}
    >
      <UpperLimbAnatomy movement={movement} progress={progress} showMuscles={showMuscles} />
    </AnatomyStage>
  );
}
