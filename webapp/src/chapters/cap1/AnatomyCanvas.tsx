import React, { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, Center, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FULL_BODY_FLOOR_Y, FULL_BODY_SCALE, FULL_BODY_SHADOW_Y } from './bodySceneGeometry';
import { AccessibleOrbitControls, SceneControlPad } from './AccessibleOrbitControls';

const highlightUniforms = {
  highlightCenters: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
  highlightRadii: { value: [0.0, 0.0, 0.0, 0.0] },
  highlightColor: { value: new THREE.Color(0x0f6f67) }
};

function AnatomyModel({ hoveredTerm }: { hoveredTerm?: string | null }) {
  const { scene } = useGLTF('/assets/cap1/human_body.glb');
  
  const clonedScene = React.useMemo(() => {
    const s = scene.clone(true);
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const originalMaterial = mesh.material as THREE.Material;
        const material = originalMaterial.clone();
        
        // Hacerlo transparente por si necesitamos opacidad
        material.transparent = true;
        
        material.onBeforeCompile = (shader) => {
          shader.uniforms.highlightCenters = highlightUniforms.highlightCenters;
          shader.uniforms.highlightRadii = highlightUniforms.highlightRadii;
          shader.uniforms.highlightColor = highlightUniforms.highlightColor;

          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
             varying vec3 vLocalPosition;`
          );
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vLocalPosition = position;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
             uniform vec3 highlightCenters[4];
             uniform float highlightRadii[4];
             uniform vec3 highlightColor;
             varying vec3 vLocalPosition;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             float maxFactor = 0.0;
             for (int i = 0; i < 4; i++) {
               if (highlightRadii[i] > 0.0) {
                 float dist = distance(vLocalPosition, highlightCenters[i]);
                 if (dist < highlightRadii[i]) {
                   float factor = smoothstep(highlightRadii[i], highlightRadii[i] * 0.4, dist);
                   maxFactor = max(maxFactor, factor);
                 }
               }
             }
             if (maxFactor > 0.0) {
               gl_FragColor.rgb = mix(gl_FragColor.rgb, highlightColor, maxFactor);
             }`
          );
        };
        mesh.material = material;
      }
    });
    return s;
  }, [scene]);

  React.useEffect(() => {
    highlightUniforms.highlightRadii.value = [0, 0, 0, 0];
    
    let targetOpacity = 0.85; // Por defecto casi opaco para que luzca bien
    if (hoveredTerm) {
      if (['axis-z', 'axis-x', 'axis-y'].includes(hoveredTerm)) {
        targetOpacity = 0.4;
      } else if (['coord-rho-superficial', 'coord-rho-deep', 'coord-rho-surface'].includes(hoveredTerm)) {
        targetOpacity = 0.45; // Translúcido para ver con claridad el interior de la cavidad torácica
      } else {
        targetOpacity = 0.85;
      }
    }
    
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = targetOpacity;
      }
    });

    const setHighlight = (color: string, centers: [number,number,number][], radii: number[]) => {
      highlightUniforms.highlightColor.value.set(color);
      for (let i = 0; i < 4; i++) {
        if (i < centers.length) {
          highlightUniforms.highlightCenters.value[i].set(...centers[i]);
          highlightUniforms.highlightRadii.value[i] = radii[i];
        } else {
          highlightUniforms.highlightRadii.value[i] = 0;
        }
      }
    };

    switch (hoveredTerm) {
      case 'coord-right':
        setHighlight("#b02318", [[-0.109, 0.240, -0.02], [-0.06, -0.18, 0.0]], [0.10, 0.10]); break;
      case 'coord-left':
        setHighlight("#b02318", [[0.109, 0.240, -0.02], [0.06, -0.18, 0.0]], [0.10, 0.10]); break;
      case 'coord-r-trunk':
        setHighlight("#0f6f67", [[-0.005, 0.258, 0.055]], [0.12]); break;
      case 'coord-r-proximal':
        setHighlight("#0f6f67", [[-0.109, 0.240, -0.02], [-0.156, -0.032, 0.018]], [0.09, 0.09]); break;
      case 'coord-r-distal':
        setHighlight("#0f6f67", [[-0.156, -0.032, 0.018]], [0.09]); break;
      case 'coord-rho-surface':
        setHighlight("#0f6f67", [[0.06, 0.16, 0.075]], [0.09]); break;
      case 'coord-rho-superficial':
        setHighlight("#0f6f67", [[0.06, 0.16, 0.075], [0.06, 0.16, -0.015]], [0.08, 0.08]); break;
      case 'coord-rho-deep':
        setHighlight("#b02318", [[0.06, 0.16, -0.015]], [0.09]); break;
      default:
        highlightUniforms.highlightRadii.value = [0, 0, 0, 0];
    }
  }, [hoveredTerm, clonedScene]);

  return <primitive object={clonedScene} scale={FULL_BODY_SCALE} />;
}

// Componente auxiliar para dibujar una flecha de doble punta con etiquetas.
function DoubleArrow({
  length,
  color,
  dir = [0, 1, 0],
  labelPos,
  subPos,
  labelNeg,
  subNeg,
  opacity,
  showLabels = true
}: any) {
  const radius = 0.015;
  const headRadius = 0.08;
  const headLength = 0.25;
  const shaftLength = length - headLength * 2;

  const D = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), D);
  const qFlip = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
  const headOffset = D.clone().multiplyScalar(shaftLength / 2 + headLength / 2);
  const pPos = D.clone().multiplyScalar(length / 2 + 0.3);
  const pNeg = D.clone().multiplyScalar(-(length / 2 + 0.3));

  const mat = <meshStandardMaterial color={color} transparent opacity={opacity} depthTest={false} />;

  return (
    <group>
      {/* Palo central */}
      <mesh quaternion={q}>
        <cylinderGeometry args={[radius, radius, shaftLength, 16]} />
        {mat}
      </mesh>

      {/* Punta Positiva */}
      <mesh position={[headOffset.x, headOffset.y, headOffset.z]} quaternion={q}>
        <coneGeometry args={[headRadius, headLength, 16]} />
        {mat}
      </mesh>

      {/* Punta Negativa */}
      <mesh position={[pNeg.x, pNeg.y, pNeg.z]} quaternion={qFlip}>
        <coneGeometry args={[headRadius, headLength, 16]} />
        {mat}
      </mesh>

      {/* Etiquetas */}
      {showLabels && (
        <>
          <Html position={[pPos.x, pPos.y, pPos.z]} center zIndexRange={[100, 0]}>
            <div style={{ textAlign: 'center', pointerEvents: 'none', opacity: Math.max(opacity, 0.82) }}>
              <div style={{ color: color, fontSize: '0.65rem', whiteSpace: 'nowrap', opacity: 0.85, marginBottom: '2px' }}>{subPos}</div>
              <div style={{ color: color, fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'var(--sans)' }}>{labelPos}</div>
            </div>
          </Html>
          <Html position={[pNeg.x, pNeg.y, pNeg.z]} center zIndexRange={[100, 0]}>
            <div style={{ textAlign: 'center', pointerEvents: 'none', opacity: Math.max(opacity, 0.82) }}>
              <div style={{ color: color, fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'var(--sans)', marginBottom: '2px' }}>{labelNeg}</div>
              <div style={{ color: color, fontSize: '0.65rem', whiteSpace: 'nowrap', opacity: 0.85 }}>{subNeg}</div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Plano sagital medio: lámina translúcida con gradiente vertical + línea media a trazos
function MidlinePlane({ color }: { color: string }) {
  const X = 0.005, Z = -0.006;      // línea media real del tronco
  const Y0 = -0.36, Y1 = 0.45;      // de la pelvis a la coronilla
  const H = Y1 - Y0, YC = (Y0 + Y1) / 2;
  const W = 0.20;                   // profundidad (frente↔espalda) de la lámina

  const mat = React.useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
        float center = 0.75 + 0.25 * sin(vUv.y * 3.14159);
        gl_FragColor = vec4(uColor, 0.16 * edge * center);
      }
    `,
  }), [color]);

  const dashes: number[] = [];
  const N = 9, dash = H / (N * 1.8);
  for (let i = 0; i < N; i++) dashes.push(Y0 + (i + 0.5) * (H / N));

  return (
    <group>
      <mesh position={[X, YC, Z]} material={mat} renderOrder={2}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {dashes.map((y, i) => (
        <mesh key={i} position={[X, y, Z]}>
          <boxGeometry args={[0.012, dash, 0.012]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Doble flecha "calibre" hombro ↔ hombro: mide |y| sobre el cuerpo real.
function SpanArrow({ color, label, showLabels = true }: { color: string; label: string; showLabels?: boolean }) {
  const Y = 0.30, Z = 0.0;         // justo por encima de los acromios
  const XL = 0.15, XR = -0.15;     // acromio izquierdo / derecho (paciente)
  const tick = 0.045;              // largo de los corchetes verticales
  const r = 0.010;                 // radio del vástago (fino)
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} transparent opacity={0.95} />;
  return (
    <group>
      {/* vástago horizontal (a lo largo de X = eje y anatómico) */}
      <mesh position={[0, Y, Z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r, r, XL - XR, 12]} />
        {mat}
      </mesh>
      {/* corchetes en los extremos */}
      {[XL, XR].map((x, i) => (
        <mesh key={i} position={[x, Y, Z]}>
          <cylinderGeometry args={[r, r, tick * 2, 12]} />
          {mat}
        </mesh>
      ))}
      {/* puntas de flecha hacia fuera */}
      <mesh position={[XL - 0.035, Y, Z]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.035, 0.09, 16]} />
        {mat}
      </mesh>
      <mesh position={[XR + 0.035, Y, Z]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.035, 0.09, 16]} />
        {mat}
      </mesh>
      {/* etiqueta única */}
      {showLabels && (
        <Html center position={[-0.40, Y, Z]} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(255,253,248,0.97)', color: '#22303c',
            border: `1px solid ${color}`, padding: '4px 9px', borderRadius: '5px',
            fontSize: '0.65rem', fontFamily: 'var(--sans)', fontWeight: 'bold',
            whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Calibre radial a lo largo del miembro (brazo): mide r desde la articulación proximal hasta el extremo distal.
// Diseñado con idéntico lenguaje visual que el calibre |y| Medial/Lateral:
// - Vástago paralelo al brazo con offset lateral.
// - Corchetes perpendiculares en hombro (proximal) y mano (distal).
// - Punta cónica orientada distalmente (hacia la mano, indicando el crecimiento de r).
// - Etiqueta explicativa nítida en el exterior.
function RadialArmSpan({ color, label, showLabels = true }: { color: string; label: string; showLabels?: boolean }) {
  const SHO = new THREE.Vector3(-0.109, 0.240, -0.02);
  const HAND = new THREE.Vector3(-0.156, -0.032, 0.018);

  const armVec = new THREE.Vector3().subVectors(HAND, SHO);
  const armLen = armVec.length();
  const armDir = armVec.clone().normalize();

  // Offset hacia el exterior lateral del paciente (hacia la derecha anatómica / -X)
  const offsetVec = new THREE.Vector3(-0.065, 0.01, 0.0);
  const pShoOff = SHO.clone().add(offsetVec);
  const pHandOff = HAND.clone().add(offsetVec);
  const midOff = new THREE.Vector3().addVectors(pShoOff, pHandOff).multiplyScalar(0.5);

  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), armDir);
  const r = 0.009; // calibre estilizado
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} transparent opacity={0.95} />;

  // Vector de corchetes
  const tickVec = offsetVec.clone();
  const tickLen = tickVec.length() * 1.3;
  const tickDir = tickVec.clone().normalize();
  const qTick = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tickDir);

  const midTickSho = SHO.clone().add(tickVec.clone().multiplyScalar(0.5));
  const midTickHand = HAND.clone().add(tickVec.clone().multiplyScalar(0.5));

  return (
    <group>
      {/* Vástago principal del calibre paralelo al brazo */}
      <group position={[midOff.x, midOff.y, midOff.z]} quaternion={q}>
        <mesh>
          <cylinderGeometry args={[r, r, armLen, 12]} />
          {mat}
        </mesh>
        {/* Punta de flecha hacia la mano (distal): r crece en ese sentido */}
        <mesh position={[0, armLen / 2, 0]}>
          <coneGeometry args={[0.035, 0.09, 16]} />
          {mat}
        </mesh>
      </group>

      {/* Corchete en el hombro (Proximal) */}
      <group position={[midTickSho.x, midTickSho.y, midTickSho.z]} quaternion={qTick}>
        <mesh>
          <cylinderGeometry args={[r * 0.85, r * 0.85, tickLen, 12]} />
          {mat}
        </mesh>
      </group>

      {/* Corchete en la mano (Distal) */}
      <group position={[midTickHand.x, midTickHand.y, midTickHand.z]} quaternion={qTick}>
        <mesh>
          <cylinderGeometry args={[r * 0.85, r * 0.85, tickLen, 12]} />
          {mat}
        </mesh>
      </group>

      {/* Etiqueta explicativa flotante en el lateral libre */}
      {showLabels && (
        <Html center position={[midOff.x - 0.22, midOff.y, midOff.z]} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(255,253,248,0.97)', color: '#22303c',
            border: `1px solid ${color}`, padding: '4px 9px', borderRadius: '5px',
            fontSize: '0.65rem', fontFamily: 'var(--sans)', fontWeight: 'bold',
            whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Calibre de profundidad (ρ): mide desde la superficie cutánea (piel) hacia el interior del cuerpo (órganos).
// Sigue el mismo patrón estético y funcional que SpanArrow y RadialArmSpan:
// - Vástago en la dirección de penetración anteroposterior (Z en espacio local).
// - Corchetes perpendiculares en la superficie y en el interior profundo.
// - Punta cónica orientada hacia adentro (profundo: dirección en que ρ crece).
// - Etiqueta explicativa nítida en el lateral libre.
function DepthSpanArrow({ color, label, showLabels = true }: { color: string; label: string; showLabels?: boolean }) {
  const SURF = new THREE.Vector3(0.06, 0.16, 0.075);   // en la superficie cutánea
  const DEEP = new THREE.Vector3(0.06, 0.16, -0.015);  // en el interior profundo

  const depthVec = new THREE.Vector3().subVectors(DEEP, SURF);
  const depthLen = depthVec.length();
  const depthDir = depthVec.clone().normalize();

  // Offset lateral hacia la derecha del punto
  // Mantener el calibre separado del cuerpo, pero sin competir con el modelo.
  const offsetVec = new THREE.Vector3(0.055, 0.0, 0.0);
  const pSurfOff = SURF.clone().add(offsetVec);
  const pDeepOff = DEEP.clone().add(offsetVec);
  const midOff = new THREE.Vector3().addVectors(pSurfOff, pDeepOff).multiplyScalar(0.5);

  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), depthDir);
  const r = 0.0065;
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.95} depthTest={false} />;

  // Vector de corchetes
  const tickVec = offsetVec.clone();
  const tickLen = tickVec.length() * 1.3;
  const tickDir = tickVec.clone().normalize();
  const qTick = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tickDir);

  const midTickSurf = SURF.clone().add(tickVec.clone().multiplyScalar(0.5));
  const midTickDeep = DEEP.clone().add(tickVec.clone().multiplyScalar(0.5));

  return (
    <group>
      {/* Vástago del calibre apuntando hacia adentro */}
      <group position={[midOff.x, midOff.y, midOff.z]} quaternion={q}>
        <mesh>
          <cylinderGeometry args={[r, r, depthLen, 12]} />
          {mat}
        </mesh>
        {/* Punta de flecha hacia el interior (profundo): ρ crece hacia adentro */}
        <mesh position={[0, depthLen / 2, 0]}>
          <coneGeometry args={[0.024, 0.065, 16]} />
          {mat}
        </mesh>
      </group>

      {/* Corchete en la superficie (Superficial) */}
      <group position={[midTickSurf.x, midTickSurf.y, midTickSurf.z]} quaternion={qTick}>
        <mesh>
          <cylinderGeometry args={[r * 0.85, r * 0.85, tickLen, 12]} />
          {mat}
        </mesh>
      </group>

      {/* Corchete en los órganos internos (Profundo) */}
      <group position={[midTickDeep.x, midTickDeep.y, midTickDeep.z]} quaternion={qTick}>
        <mesh>
          <cylinderGeometry args={[r * 0.85, r * 0.85, tickLen, 12]} />
          {mat}
        </mesh>
      </group>

      {/* Etiqueta explicativa única del calibre */}
      {showLabels && (
        <Html center position={[midOff.x + 0.28, midOff.y, midOff.z]} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(255,253,248,0.98)', color: '#22303c',
            border: `1px solid ${color}`, padding: '4px 8px', borderRadius: '5px',
            fontSize: '0.62rem', fontFamily: 'var(--sans)', fontWeight: 'bold',
            whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div>{label}</div>
            <div style={{ marginTop: '2px', color: color, fontSize: '0.58rem', fontWeight: 700 }}>
              ρ aumenta → interior
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Guía de sección transversal a nivel torácico:
function DepthSectionGuide({ color }: { color: string }) {
  const Y = 0.16;
  return (
    <group position={[0, Y, 0.03]}>
      {/* Contorno elíptico sutil de la sección transversal de la pared corporal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.18, 0.12, 1]}>
        <ringGeometry args={[0.92, 1.0, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Lámina de corte translúcida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.18, 0.12, 1]}>
        <circleGeometry args={[0.92, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Línea a trazos que conecta el origen corporal (esternón / tronco) con el hombro (inserción de la extremidad)
function TrunkConnector({ color }: { color: string }) {
  const TRUNK = new THREE.Vector3(-0.005, 0.258, 0.055);
  const SHO = new THREE.Vector3(-0.109, 0.240, -0.02);
  const dir = new THREE.Vector3().subVectors(SHO, TRUNK);
  const len = dir.length();
  const N = 6;
  const dashes: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    dashes.push(new THREE.Vector3().lerpVectors(TRUNK, SHO, t));
  }
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

  return (
    <group>
      {dashes.map((pos, i) => (
        <group key={i} position={[pos.x, pos.y, pos.z]} quaternion={q}>
          <mesh>
            <cylinderGeometry args={[0.0035, 0.0035, len / (N * 2), 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Markers({ hoveredTerm, showLabels = true }: { hoveredTerm: string | null; showLabels?: boolean }) {
  if (!hoveredTerm) return null;

  let markers: { pos: [number, number, number], r: number, color: string, label: string, labelOff?: [number, number, number] }[] = [];
  let medial: { planeColor: string, spanColor: string, spanLabel: string } | null = null;
  let radialSpan: { color: string, label: string } | null = null;
  let trunkLine: { color: string } | null = null;
  let depthSpan: { color: string, label: string } | null = null;
  let depthSection: { color: string } | null = null;

  const C_TEAL = "#0f6f67";
  const C_RED = "#b02318";

  // Coordenadas anatómicas precisas en el espacio local del GLB
  const SHO: [number, number, number] = [-0.109, 0.240, -0.02];   // hombro (inserción proximal)
  const HAND: [number, number, number] = [-0.156, -0.032, 0.018]; // mano (extremo distal)
  const TRUNK: [number, number, number] = [-0.005, 0.258, 0.055]; // esternón (origen de r)
  const SURF: [number, number, number] = [0.06, 0.16, 0.075];     // superficie cutánea anterior
  const DEEP: [number, number, number] = [0.06, 0.16, -0.015];    // interior visceral profundo

  switch (hoveredTerm) {
    case 'coord-right':
      markers.push({ pos: [-0.109, 0.240, -0.02], r: 0.018, color: C_RED, label: 'Derecha del paciente (y < 0)', labelOff: [-0.18, 0.05, 0] });
      markers.push({ pos: [-0.06, -0.18, 0.0], r: 0.018, color: C_RED, label: '' });
      break;
    case 'coord-left':
      markers.push({ pos: [0.109, 0.240, -0.02], r: 0.018, color: C_RED, label: 'Izquierda del paciente (y > 0)', labelOff: [0.18, 0.05, 0] });
      markers.push({ pos: [0.06, -0.18, 0.0], r: 0.018, color: C_RED, label: '' });
      break;
    case 'coord-r-trunk':
      trunkLine = { color: C_TEAL };
      markers.push({ pos: TRUNK, r: 0.020, color: C_TEAL, label: 'Origen de r: el tronco (r = 0)', labelOff: [0.18, 0.05, 0] });
      break;
    case 'coord-r-proximal':
      radialSpan = { color: C_TEAL, label: 'r = dist. al tronco (a lo largo del miembro)' };
      trunkLine = { color: C_TEAL };
      markers.push({ pos: SHO, r: 0.018, color: C_TEAL, label: 'Proximal (hombro) · r → 0', labelOff: [0.16, 0.08, 0] });
      markers.push({ pos: HAND, r: 0.018, color: C_TEAL, label: 'Distal (mano) · r máximo', labelOff: [0.16, -0.08, 0] });
      break;
    case 'coord-r-distal':
      radialSpan = { color: C_TEAL, label: 'r↑ (distal) = crece hacia la mano' };
      trunkLine = { color: C_TEAL };
      markers.push({ pos: SHO, r: 0.014, color: C_TEAL, label: '' });
      markers.push({ pos: HAND, r: 0.020, color: C_TEAL, label: 'Distal (mano): r máximo en el brazo', labelOff: [0.16, -0.08, 0] });
      break;
    case 'coord-rho-surface':
      depthSection = { color: C_TEAL };
      markers.push({ pos: SURF, r: 0.020, color: C_TEAL, label: 'Superficie cutánea (origen de ρ = 0)', labelOff: [0.20, 0.08, 0.06] });
      break;
    case 'coord-rho-superficial':
      // Combo completo con separación espacial absoluta de etiquetas:
      // - Calibre en el cuadrante lateral derecho exterior (+0.34)
      // - Superficial en el cuadrante superior derecho (+0.18, +0.10)
      // - Profundo en el cuadrante inferior izquierdo (-0.20, -0.08)
      depthSpan = { color: C_TEAL, label: 'ρ = dist. a la superficie (profundidad)' };
      depthSection = { color: C_TEAL };
      markers.push({ pos: SURF, r: 0.018, color: C_TEAL, label: 'Superficial (piel) · ρ → 0', labelOff: [0.18, 0.10, 0.06] });
      markers.push({ pos: DEEP, r: 0.018, color: C_RED, label: 'Profundo (órganos) · ρ máximo', labelOff: [-0.20, -0.08, -0.06] });
      break;
    case 'coord-rho-deep':
      depthSpan = { color: C_RED, label: 'ρ↑ (profundo) = crece hacia el interior' };
      depthSection = { color: C_RED };
      markers.push({ pos: SURF, r: 0.012, color: C_TEAL, label: '' });
      markers.push({ pos: DEEP, r: 0.020, color: C_RED, label: 'Profundo (órganos): ρ máximo', labelOff: [-0.20, -0.08, -0.06] });
      break;
    case 'axis-medial':
      medial = { planeColor: C_RED, spanColor: C_RED, spanLabel: '|y| = dist. a la línea media' };
      markers.push({ pos: [0.005, 0.12, -0.006], r: 0.018, color: C_RED, label: 'Medial · |y| → 0', labelOff: [0, -0.14, 0] });
      markers.push({ pos: [0.16, 0.12, -0.006], r: 0.018, color: C_RED, label: 'Lateral · |y| grande', labelOff: [0.16, 0.06, 0] });
      break;
  }

  if (markers.length === 0 && !radialSpan && !medial && !trunkLine && !depthSpan && !depthSection) return null;

  return (
    <group>
      <group scale={6.5}>
        {medial && <MidlinePlane color={medial.planeColor} />}
        {medial && <SpanArrow color={medial.spanColor} label={medial.spanLabel} showLabels={showLabels} />}
        {radialSpan && <RadialArmSpan color={radialSpan.color} label={radialSpan.label} showLabels={showLabels} />}
        {trunkLine && <TrunkConnector color={trunkLine.color} />}
        {depthSection && <DepthSectionGuide color={depthSection.color} />}
        {depthSpan && <DepthSpanArrow color={depthSpan.color} label={depthSpan.label} showLabels={showLabels} />}
        {markers.map((m, i) => (
          <group key={i} position={m.pos}>
            {/* halo suave con radio controlado */}
            <mesh>
              <sphereGeometry args={[m.r * 1.9, 24, 24]} />
              <meshStandardMaterial color={m.color} transparent opacity={0.22} depthTest={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[m.r, 24, 24]} />
              <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.35} transparent opacity={0.95} depthTest={false} />
            </mesh>
            {showLabels && m.label && (
              <Html center position={m.labelOff ? [m.labelOff[0], m.labelOff[1], m.labelOff[2]] : [0, m.r + 0.05, 0]} zIndexRange={[100, 0]}>
                <div style={{
                  background: 'rgba(255,253,248,0.97)',
                  color: '#22303c',
                  border: `1px solid ${m.color}`,
                  padding: '4px 9px',
                  borderRadius: '5px',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--sans)',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {m.label}
                </div>
              </Html>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

export function Axes({ hoveredTerm, showLabels = true, showGrid = true, scale = 1 }: { hoveredTerm: string | null; showLabels?: boolean; showGrid?: boolean; scale?: number }) {
  const colorZ = "#0d6e64"; // Superior/Inferior
  const colorX = "#9a5b00"; // Anterior/Posterior
  const colorY = "#a92a1e"; // Medial/Lateral

  const lengthZ = 8.0;
  const lengthX = 4.0;
  const lengthY = 4.0;

  const isHovered = (terms: string[]) => terms.includes(hoveredTerm || '');
  
  const opZ = isHovered(['axis-z']) ? 1 : hoveredTerm ? 0.1 : 0.3;
  const opX = isHovered(['axis-x']) ? 1 : hoveredTerm ? 0.1 : 0.3;
  const opY = isHovered(['axis-y', 'coord-right', 'coord-left', 'axis-medial']) ? 1 : hoveredTerm ? 0.1 : 0.3;

  const yLabel = (hoveredTerm === 'axis-medial')
    ? { pos: '+y', subPos: '→ Medial', neg: '-y', subNeg: '← Lateral' }
    : { pos: '+y', subPos: '→ Izquierda', neg: '-y', subNeg: '← Derecha' };

  return (
    <group scale={scale}>
      {/* PISO / GRID */}
      {showGrid && <gridHelper args={[8, 16, "#c6bca6", "#ded6c5"]} position={[0, FULL_BODY_FLOOR_Y, 0]} />}

      {/* Esfera central en el origen */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshStandardMaterial color={colorZ} transparent opacity={hoveredTerm ? 0.2 : 0.6} depthTest={false} />
      </mesh>

      {/* EJE Z — Superior/Inferior */}
      <DoubleArrow
        length={lengthZ}
        color={colorZ}
        dir={[0, 1, 0]}
        labelPos="+z" subPos="↑ Superior / Craneal"
        labelNeg="-z" subNeg="↓ Inferior / Caudal"
        opacity={opZ}
        showLabels={showLabels}
      />

      {/* EJE Y — Derecha/Izquierda · Medial/Lateral */}
      <DoubleArrow
        length={lengthY}
        color={colorY}
        dir={[1, 0, 0]}
        labelPos={yLabel.pos} subPos={yLabel.subPos}
        labelNeg={yLabel.neg} subNeg={yLabel.subNeg}
        opacity={opY}
        showLabels={showLabels}
      />

      {/* EJE X — Anterior/Posterior */}
      <DoubleArrow
        length={lengthX}
        color={colorX}
        dir={[0, 0, 1]}
        labelPos="+x" subPos="Anterior / Ventral"
        labelNeg="-x" subNeg="Posterior / Dorsal"
        opacity={opX}
        showLabels={showLabels}
      />
    </group>
  );
}

// El esternón del GLB está hacia +Z; la vista inicial debe mirar desde +Z
// para mostrar la cara anterior y no la espalda.
const DEFAULT_CAM_POS: [number, number, number] = [3.6, 1.8, 12.5];

function CameraRig({ resetSignal }: { resetSignal?: number }) {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.position.set(...DEFAULT_CAM_POS);
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

export default function AnatomyCanvas({
  hoveredTerm,
  showLabels = false,
  autoRotate = false,
  resetSignal = 0,
  zoomSignal = null,
}: {
  hoveredTerm?: string | null;
  showLabels?: boolean;
  autoRotate?: boolean;
  resetSignal?: number;
  zoomSignal?: { type: 'in' | 'out'; time: number } | null;
}) {
  const controlsRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetSignal]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: DEFAULT_CAM_POS, fov: 45 }}
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
      <Suspense fallback={null}>
        <Center position={[0, 0, 0]}>
          <AnatomyModel hoveredTerm={hoveredTerm || null} />
          <Axes hoveredTerm={hoveredTerm || null} showLabels={showLabels} />
          <Markers hoveredTerm={hoveredTerm || null} showLabels={showLabels} />
        </Center>
        {/* Sombra de contacto difusa bajo el cuerpo para asentar la figura en el piso */}
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
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          target={[0, 0, 0]}
        />
      </Canvas>
      <SceneControlPad controlsRef={controlsRef} />
    </div>
  );
}
