import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AccessibleOrbitControls, SceneControlPad, type SceneControlsRef } from '../cap1/AccessibleOrbitControls';

interface StabState {
  theta: number;
  H: number;
  stable: boolean;
  hCM: number;
  cx: number;
  cxm: number;
  cym: number;
  yg: number;
  heel: number;
  toe: number;
  hpx: number;
  dB: number;
  dF: number;
}

declare global {
  interface Window {
    __stab3d?: {
      ready: boolean;
      update: (p: Partial<StabState>) => void;
      setRot: (th: number) => void;
      getScreenPos: (wx: number, wy: number, wz: number) => { x: number; y: number };
    };
    drawStab?: () => void;
  }
}

const MODEL_URL = '/assets/cap1/human_body.glb';
const MODEL_HEIGHT = 1.9;

function StabilityModel({
  humanRef,
  height,
  theta,
  onReady,
}: {
  humanRef: React.RefObject<THREE.Group | null>;
  height: number;
  theta: number;
  onReady: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);
  const didNotifyRef = useRef(false);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        standard.roughness = Math.max(0.6, standard.roughness || 0.6);
        standard.metalness = Math.min(0.2, standard.metalness || 0.1);
      });
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    model.scale.setScalar(MODEL_HEIGHT / (size.y || 1));

    const scaledBox = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    model.position.set(-center.x, -scaledBox.min.y, -center.z);
    if (!didNotifyRef.current) {
      didNotifyRef.current = true;
      onReady();
    }
  }, [model, onReady]);

  useEffect(() => {
    const human = humanRef.current;
    if (!human) return;
    human.scale.setScalar(height / MODEL_HEIGHT);
    human.rotation.z = THREE.MathUtils.degToRad(theta);
  }, [height, theta, humanRef]);

  return <primitive object={model} />;
}

function StabilityScene({
  controlsRef,
  onReady,
}: {
  controlsRef: SceneControlsRef;
  onReady: () => void;
}) {
  const humanRef = useRef<THREE.Group | null>(null);
  const stateRef = useRef<StabState>({
    theta: 0,
    H: 1.8,
    stable: true,
    hCM: 1,
    cx: 0,
    cxm: 0,
    cym: 0,
    yg: 1,
    heel: 0,
    toe: 1,
    hpx: 1,
    dB: 0.05,
    dF: 0.15,
  });
  const bridgeRef = useRef<NonNullable<Window['__stab3d']> | null>(null);
  const { camera, gl } = useThree();

  const apply = () => {
    const human = humanRef.current;
    if (!human) return;
    human.scale.setScalar(stateRef.current.H / MODEL_HEIGHT);
    human.rotation.z = THREE.MathUtils.degToRad(stateRef.current.theta);
  };

  useEffect(() => {
    const getScreenPos = (wx: number, wy: number, wz: number) => {
      const point = new THREE.Vector3(wx, wy, wz).project(camera);
      const width = gl.domElement.clientWidth || 800;
      const height = gl.domElement.clientHeight || 600;
      return { x: (point.x * 0.5 + 0.5) * width, y: (-point.y * 0.5 + 0.5) * height };
    };

    const bridge: NonNullable<Window['__stab3d']> = {
      ready: false,
      update: (patch) => {
        Object.assign(stateRef.current, patch);
        apply();
      },
      setRot: (theta) => {
        stateRef.current.theta = theta;
        apply();
      },
      getScreenPos,
    };
    bridgeRef.current = bridge;
    window.__stab3d = bridge;
    window.drawStab = () => undefined;

    return () => {
      bridgeRef.current = null;
      window.__stab3d = { ready: false, update: () => undefined, setRot: () => undefined, getScreenPos: () => ({ x: 0, y: 0 }) };
      delete window.drawStab;
    };
  }, [camera, gl]);

  return (
    <>
      <color attach="background" args={['#f5f0e4']} />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#ffffff', '#444444', 0.5]} position={[0, 5, 0]} />
      <directionalLight
        castShadow
        intensity={1}
        position={[2.5, 4, 3]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight intensity={0.4} color="#ddeeff" position={[-3, 2, -2]} />
      <gridHelper args={[8, 16, '#cfc3a9', '#e2dac9']} position={[0, 0.002, 0]} />
      <group ref={humanRef} position={[0, 0, 0]}>
        <Suspense fallback={null}>
          <StabilityModel
            humanRef={humanRef}
            height={stateRef.current.H}
            theta={stateRef.current.theta}
            onReady={() => {
              if (bridgeRef.current) bridgeRef.current.ready = true;
              apply();
              onReady();
            }}
          />
        </Suspense>
      </group>
      <ContactShadows position={[0, 0.012, 0]} opacity={0.28} scale={5} blur={2.2} far={3.5} />
      <AccessibleOrbitControls
        controlsRef={controlsRef}
        target={[0, 0.82, 0]}
        minDistance={2.4}
        maxDistance={10}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.75}
      />
    </>
  );
}

export default function StabScene3D({ onReady }: { onReady?: () => void }) {
  const controlsRef = useRef<SceneControlsRef['current']>(null);
  const [ready, setReady] = React.useState(false);

  return (
    <div className="cap3-three-stage" id="stage-stab" aria-label="Escena 3D de estabilidad corporal">
      <Canvas
        camera={{ position: [0.65, 0.8, 4.9], fov: 38, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera }) => camera.lookAt(0, 0.6, 0)}
      >
        <StabilityScene
          controlsRef={controlsRef}
          onReady={() => {
            setReady(true);
            onReady?.();
          }}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />
      <div className={`cap3-three-loading${ready ? ' is-ready' : ''}`} aria-live="polite">
        {ready ? 'Modelo anatómico listo' : 'Cargando modelo anatómico…'}
      </div>
      <div className="cap3-three-caption">Arrastra para orbitar · doble clic para enfocar</div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
