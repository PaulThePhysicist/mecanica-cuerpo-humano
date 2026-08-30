import React, { useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type SceneControlsRef = React.MutableRefObject<OrbitControlsImpl | null>;

interface AccessibleOrbitControlsProps {
  controlsRef: SceneControlsRef;
  target: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

/**
 * Controles comunes para todas las escenas 3D de anatomía.
 * Incluye zoom hacia el cursor, paneo, teclado y doble clic para enfocar.
 */
export function AccessibleOrbitControls({
  controlsRef,
  target,
  minDistance = 2.5,
  maxDistance = 32,
  minPolarAngle = Math.PI / 6,
  maxPolarAngle = Math.PI / 1.8,
  autoRotate = false,
  autoRotateSpeed = 1.2,
}: AccessibleOrbitControlsProps) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    const dom = gl.domElement;
    dom.tabIndex = 0;
    dom.setAttribute('aria-label', 'Visualización 3D. Usa arrastre, teclado o los controles visibles para explorar.');

    const controls = controlsRef.current;
    if (controls) controls.listenToKeyEvents(dom);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const focusOnDoubleClick = (event: MouseEvent) => {
      if (!controlsRef.current) return;
      const rect = dom.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster
        .intersectObjects(scene.children, true)
        .find((item) => item.object.visible && (item.object as THREE.Mesh).isMesh);
      if (hit) {
        controlsRef.current.target.copy(hit.point);
        controlsRef.current.update();
      }
    };

    const keyboardZoom = (event: KeyboardEvent) => {
      const active = document.activeElement === dom;
      if (!active || !controlsRef.current) return;
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        controlsRef.current.dollyIn(0.85);
        controlsRef.current.update();
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        controlsRef.current.dollyOut(0.85);
        controlsRef.current.update();
      } else if (event.key === 'Home' || event.key === 'Escape') {
        event.preventDefault();
        controlsRef.current.reset();
      }
    };

    dom.addEventListener('dblclick', focusOnDoubleClick);
    dom.addEventListener('keydown', keyboardZoom);
    return () => {
      controls?.stopListenToKeyEvents();
      dom.removeEventListener('dblclick', focusOnDoubleClick);
      dom.removeEventListener('keydown', keyboardZoom);
    };
  }, [camera, controlsRef, gl, scene]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      enableDamping
      dampingFactor={0.08}
      screenSpacePanning
      zoomToCursor
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      target={target}
    />
  );
}

interface SceneControlPadProps {
  controlsRef: SceneControlsRef;
}

export function SceneControlPad({ controlsRef }: SceneControlPadProps) {
  const [expanded, setExpanded] = useState(false);
  const run = (action: (controls: OrbitControlsImpl) => void) => {
    const controls = controlsRef.current;
    if (!controls) return;
    action(controls);
    controls.update();
  };

  const zoom = (direction: 'in' | 'out') => run((controls) => {
    direction === 'in' ? controls.dollyIn(0.82) : controls.dollyOut(0.82);
  });

  const rotate = (azimuth: number, polar = 0) => run((controls) => {
    controls.setAzimuthalAngle(controls.getAzimuthalAngle() + azimuth);
    controls.setPolarAngle(THREE.MathUtils.clamp(
      controls.getPolarAngle() + polar,
      controls.minPolarAngle,
      controls.maxPolarAngle,
    ));
  });

  const pan = (horizontal: number, vertical: number) => run((controls) => {
    const distance = controls.getDistance();
    const amount = Math.max(0.035, distance * 0.07);
    const right = new THREE.Vector3().setFromMatrixColumn(controls.object.matrixWorld, 0).multiplyScalar(horizontal * amount);
    const up = new THREE.Vector3().setFromMatrixColumn(controls.object.matrixWorld, 1).multiplyScalar(vertical * amount);
    const offset = right.add(up);
    controls.object.position.add(offset);
    controls.target.add(offset);
  });

  const button = (label: string, title: string, onClick: () => void) => (
    <button type="button" aria-label={title} title={title} onClick={onClick}>{label}</button>
  );

  return (
    <div className={`scene-control-pad${expanded ? ' is-expanded' : ''}`} aria-label="Controles alternativos de la visualización 3D">
      <button
        type="button"
        className="scene-control-toggle"
        aria-expanded={expanded}
        aria-controls="scene-control-actions"
        title="Mostrar u ocultar controles accesibles de la visualización 3D"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? '× Ocultar controles' : '⚙ Controles 3D'}
      </button>
      {expanded && (
        <div id="scene-control-actions">
          <div className="scene-control-title">Explorar 3D</div>
          <div className="scene-control-grid">
            <span />
            {button('↥', 'Inclinar hacia arriba', () => rotate(0, -0.16))}
            <span />
            {button('↶', 'Girar a la izquierda', () => rotate(0.16))}
            {button('＋', 'Acercar', () => zoom('in'))}
            {button('↷', 'Girar a la derecha', () => rotate(-0.16))}
          </div>
          <div className="scene-control-row">
            {button('←', 'Desplazar a la izquierda', () => pan(-1, 0))}
            {button('↑', 'Desplazar hacia arriba', () => pan(0, 1))}
            {button('↓', 'Desplazar hacia abajo', () => pan(0, -1))}
            {button('→', 'Desplazar a la derecha', () => pan(1, 0))}
          </div>
          <div className="scene-control-row scene-control-actions">
            {button('−', 'Alejar', () => zoom('out'))}
            {button('↺', 'Restablecer cámara', () => run((controls) => controls.reset()))}
          </div>
          <div className="scene-control-help">Arrastra · clic derecho para mover · doble clic para enfocar · teclado: flechas, +/−, Inicio</div>
        </div>
      )}
    </div>
  );
}
