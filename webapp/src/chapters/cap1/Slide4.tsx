import React, { useState, useEffect, useRef } from 'react';
import KinematicsCanvas from './KinematicsCanvas';
import type { KinematicAngles } from './KinematicsCanvas';
import KinematicsAtlas2D from './KinematicsAtlas2D';
import HudPanel from './HudPanel';

interface Slide4Props {
  setGLMode?: (m: number) => void;
  toggleGLAnimation?: () => void;
  slideCount?: string;
}

const JOINT_DESCRIPTIONS: Record<string, string> = {
  shoulder: '<b>Articulación proximal (Esferoidal · 3 GL):</b> Hombro (glenohumeral) o cadera (coxofemoral). Permite flexión/extensión (pitch), abducción/aducción (yaw) y rotación axial interna/externa (roll).',
  elbow: '<b>Articulación intermedia (Bisagra · 1 GL):</b> Codo (húmerocubital) o rodilla (femorotibial). Permite 1 coordenada de flexión/extensión pura.',
  pivot: '<b>Pivote radiocubital (Trocoide · 1 GL):</b> Exclusivo del antebrazo. Permite pronación y supinación axial (el radio gira sobre la cabeza del cúbito).',
  wrist: '<b>Articulación distal (Condílea · 2 GL):</b> Muñeca (radiocarpiana) o tobillo (talocrural). Permite flexión/extensión y desviación lateral / inversión.',
};

export default function Slide4({ setGLMode: parentSetGLMode, slideCount }: Slide4Props) {
  const [mode, setMode] = useState<6 | 7>(6); // 6 = Pierna, 7 = Brazo
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [layer2D, setLayer2D] = useState<'atlas' | 'skeleton' | 'muscles'>('atlas');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedJoint, setSelectedJoint] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  // Ángulos articulares multi-DOF
  const [angles, setAngles] = useState<KinematicAngles>({
    joint1: 15,      // Cadera / Hombro - Flexión/Extensión
    joint1_yaw: 0,   // Cadera / Hombro - Abducción/Aducción
    joint1_roll: 0,  // Cadera / Hombro - Rotación axial
    joint2: 40,      // Rodilla / Codo - Flexión
    pivot: 0,        // Pivote radiocubital (solo brazo)
    joint3: -10,     // Tobillo / Muñeca - Flexión
    joint3_yaw: 0,   // Tobillo / Muñeca - Inversión / Desviación
  });

  const animTimeRef = useRef(0);
  const animRafRef = useRef<number | null>(null);

  const handleSelectMode = (m: 6 | 7) => {
    setMode(m);
    setSelectedJoint(null);
    parentSetGLMode?.(m);
    if (m === 6) {
      setAngles({
        joint1: 15,
        joint1_yaw: 0,
        joint1_roll: 0,
        joint2: 40,
        pivot: 0,
        joint3: -10,
        joint3_yaw: 0,
      });
    } else {
      setAngles({
        joint1: 25,
        joint1_yaw: 15,
        joint1_roll: 10,
        joint2: 55,
        pivot: 25,
        joint3: 12,
        joint3_yaw: -5,
      });
    }
  };

  const handleSelectJoint = (id: string | null) => {
    setSelectedJoint(id);
    const info = document.getElementById('info-text-b1');
    if (info) {
      if (id && JOINT_DESCRIPTIONS[id]) {
        info.innerHTML = JOINT_DESCRIPTIONS[id];
      } else {
        info.innerHTML = 'Pasa el cursor o haz clic sobre cada articulación del modelo para ver sus GL y comportamiento mecánico.';
      }
    }
  };

  // Loop de animación armónica cinemática fisiológica
  useEffect(() => {
    if (!isAnimating) {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      return;
    }

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      if (mode === 6) {
        // Marcha natural de la pierna humana
        setAngles({
          joint1: Math.sin(t * 1.6) * 26,
          joint1_yaw: Math.sin(t * 1.6) * 4,
          joint1_roll: Math.cos(t * 1.6) * 6,
          joint2: 35 + Math.sin(t * 1.6 + 0.8) * 28,
          pivot: 0,
          joint3: Math.sin(t * 1.6 + 1.6) * 16,
          joint3_yaw: Math.sin(t * 1.6) * 5,
        });
      } else {
        // Alcance y orientación funcional del brazo
        setAngles({
          joint1: Math.sin(t * 1.4) * 32,
          joint1_yaw: 15 + Math.sin(t * 1.2) * 18,
          joint1_roll: Math.cos(t * 1.1) * 20,
          joint2: 50 + Math.sin(t * 1.8) * 36,
          pivot: Math.sin(t * 1.3) * 50,
          joint3: Math.sin(t * 2.0) * 22,
          joint3_yaw: Math.cos(t * 1.7) * 12,
        });
      }

      animRafRef.current = requestAnimationFrame(loop);
    };

    animRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, [isAnimating, mode]);

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setIsAnimating(false);
    if (mode === 6) {
      setAngles({ joint1: 0, joint1_yaw: 0, joint1_roll: 0, joint2: 45, pivot: 0, joint3: 0, joint3_yaw: 0 });
    } else {
      setAngles({ joint1: 20, joint1_yaw: 0, joint1_roll: 0, joint2: 50, pivot: 0, joint3: 0, joint3_yaw: 0 });
    }
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B1</span>
        <span className="mtitle">Grados de libertad</span>
        <span className="msub">Las coordenadas del movimiento</span>
        <span className="mslide-count">{slideCount ?? '1 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚙️</span> ¿Qué es un grado de libertad?
            </div>
            <div className="card-body">
              <p>
                Un <strong>grado de libertad (GL)</strong> es una coordenada independiente para describir el movimiento de un cuerpo en el espacio.
              </p>
              <div className="eq-block">
                {'\\['} 6\,\mathrm{'{'}GL{'}'} = \underbrace{'{'}3\ \text{'{'}traslacionales{'}'}{'}'}_{'{'}x,\,y,\,z{'}'}\ +\ \underbrace{'{'}3\ \text{'{'}rotacionales{'}'}{'}'}_{'{\\theta_x,\,\\theta_y,\,\\theta_z}'} {'\\]'}
              </div>
              <p style={{ fontSize: '.68rem' }}>
                El cuerpo humano es un <strong>mecanismo articulado</strong>: cada articulación aporta un número fijo de GL a la cadena cinemática.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦾</span> Brazo 7 GL (Redundante) · Pierna 6 GL
            </div>
            <div className="card-body">
              <div className="row">
                <span
                  className={`pill ${mode === 6 ? 'active' : ''}`}
                  data-selected={mode === 6}
                  onClick={() => handleSelectMode(6)}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Pierna:</b> 3+1+2 = <span className="tag">6 GL</span>
                </span>
                <span
                  className={`pill ${mode === 7 ? 'active' : ''}`}
                  data-selected={mode === 7}
                  onClick={() => handleSelectMode(7)}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Brazo:</b> 3+1+1+2 = <span className="tag">7 GL</span>
                </span>
              </div>
              <p style={{ fontSize: '.64rem', marginTop: '.2rem' }}>
                El <strong>pivote radiocubital</strong> otorga al brazo un 7.º GL axial (pronación/supinación). Con 7 GL en un espacio 3D (6 GL necesarios), el brazo es <strong>cinemáticamente redundante</strong>: la mano alcanza una misma posición con múltiples posturas de codo.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <span className="icon">✋</span> Mano y Pie: Articulaciones Distales
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                La muñeca condílea (2 GL) permite flexión/extensión y desviación radial/cubital. En la pierna, el tobillo (2 GL) combina flexión dorsal/plantar con inversión/eversión subastragalina para adaptarse al terreno.
              </p>
            </div>
          </div>

          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-b1">
              Pasa el cursor o haz clic sobre cada articulación del modelo para ver sus GL: esferoidal 3, bisagra 1, pivote 1, condílea 2.
            </div>
          </div>
        </div>

        <div className="sim-area" data-stage="anatomy" style={{ position: 'relative' }}>
          {/* Selector de Capas 2D en la esquina superior izquierda (solo en 2D) */}
          {viewMode === '2D' && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10,
                display: 'inline-flex',
                background: 'rgba(255, 253, 248, 0.94)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <button
                type="button"
                onClick={() => setLayer2D('atlas')}
                style={{
                  border: 'none',
                  background: layer2D === 'atlas' ? 'var(--teal)' : 'transparent',
                  color: layer2D === 'atlas' ? '#fff' : 'var(--ink-2)',
                  fontWeight: 600,
                  fontSize: '0.60rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Atlas
              </button>
              <button
                type="button"
                onClick={() => setLayer2D('skeleton')}
                style={{
                  border: 'none',
                  background: layer2D === 'skeleton' ? 'var(--teal)' : 'transparent',
                  color: layer2D === 'skeleton' ? '#fff' : 'var(--ink-2)',
                  fontWeight: 600,
                  fontSize: '0.60rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Huesos
              </button>
              <button
                type="button"
                onClick={() => setLayer2D('muscles')}
                style={{
                  border: 'none',
                  background: layer2D === 'muscles' ? 'var(--teal)' : 'transparent',
                  color: layer2D === 'muscles' ? '#fff' : 'var(--ink-2)',
                  fontWeight: 600,
                  fontSize: '0.60rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Músculos
              </button>
            </div>
          )}

          {/* Panel Lateral HUD de Inspección Articular en la esquina superior derecha */}
          <HudPanel
            title={mode === 6 ? 'Cadena Pierna' : 'Cadena Brazo'}
            badge={mode === 6 ? '6 GL (Determinada)' : '7 GL (Redundante)'}
            icon="🦾"
            footer="💡 Haz clic en cada articulación para inspeccionar sus GL"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {mode === 6 ? (
                <>
                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'shoulder' ? null : 'shoulder')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'shoulder' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'shoulder' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b02318' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Cadera (Coxofemoral)</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>3 GL · Esferoidal</span>
                  </div>

                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'elbow' ? null : 'elbow')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'elbow' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'elbow' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d6e64' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Rodilla (Femorotibial)</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>1 GL · Bisagra</span>
                  </div>

                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'wrist' ? null : 'wrist')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'wrist' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'wrist' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5c6bc0' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Tobillo (Talocrural)</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>2 GL · Condílea</span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'shoulder' ? null : 'shoulder')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'shoulder' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'shoulder' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b02318' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Hombro (Glenohumeral)</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>3 GL · Esferoidal</span>
                  </div>

                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'elbow' ? null : 'elbow')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'elbow' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'elbow' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d6e64' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Codo (Húmerocubital)</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>1 GL · Bisagra</span>
                  </div>

                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'pivot' ? null : 'pivot')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'pivot' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'pivot' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9c27b0' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Pivote Radiocubital</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>1 GL · Pron/Sup</span>
                  </div>

                  <div
                    onClick={() => handleSelectJoint(selectedJoint === 'wrist' ? null : 'wrist')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedJoint === 'wrist' ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${selectedJoint === 'wrist' ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5c6bc0' }} />
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Muñeca (Radiocarpiana)</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>2 GL · Condílea</span>
                  </div>
                </>
              )}
            </div>
          </HudPanel>

          {/* Renderizado Condicional: 3D Cinemático vs 2D Atlas Biomecánico */}
          {viewMode === '3D' ? (
            <KinematicsCanvas
              mode={mode}
              angles={angles}
              isAnimating={isAnimating}
              resetSignal={resetSignal}
              zoomSignal={zoomSignal}
              selectedJoint={selectedJoint}
              onSelectJoint={handleSelectJoint}
            />
          ) : (
            <KinematicsAtlas2D
              mode={mode}
              angles={angles}
              layerMode={layer2D}
              selectedJoint={selectedJoint}
              onSelectJoint={handleSelectJoint}
            />
          )}
          <div className="prof-controls">
            {/* Selector de Modo 3D vs 2D */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: '5px',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('3D')}
                style={{
                  border: 'none',
                  background: viewMode === '3D' ? 'var(--teal)' : 'transparent',
                  color: viewMode === '3D' ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                3D Cinemático
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2D')}
                style={{
                  border: 'none',
                  background: viewMode === '2D' ? 'var(--teal)' : 'transparent',
                  color: viewMode === '2D' ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                2D Atlas
              </button>
            </div>

            <span style={{ color: 'var(--ink-2)', fontSize: '0.66rem', fontWeight: 600 }}>
              {mode === 6 ? 'Pierna (6 GL)' : 'Brazo (7 GL)'}
            </span>

            {/* Sliders de control angular interactivo */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.62rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>{mode === 6 ? 'Cadera' : 'Hombro'}</span>:
                <input
                  type="range"
                  min={mode === 6 ? -30 : -50}
                  max={mode === 6 ? 90 : 100}
                  value={Math.round(angles.joint1)}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setAngles((prev) => ({ ...prev, joint1: parseFloat(e.target.value) }));
                  }}
                  style={{ width: '54px' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', width: '24px' }}>
                  {Math.round(angles.joint1)}°
                </span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>{mode === 6 ? 'Rodilla' : 'Codo'}</span>:
                <input
                  type="range"
                  min="0"
                  max={mode === 6 ? 135 : 140}
                  value={Math.round(angles.joint2)}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setAngles((prev) => ({ ...prev, joint2: parseFloat(e.target.value) }));
                  }}
                  style={{ width: '54px' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', width: '24px' }}>
                  {Math.round(angles.joint2)}°
                </span>
              </label>

              {mode === 7 && (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontWeight: 600 }}>Pivote</span>:
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={Math.round(angles.pivot)}
                    onChange={(e) => {
                      setIsAnimating(false);
                      setAngles((prev) => ({ ...prev, pivot: parseFloat(e.target.value) }));
                    }}
                    style={{ width: '50px' }}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', width: '24px' }}>
                    {Math.round(angles.pivot)}°
                  </span>
                </label>
              )}

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>{mode === 6 ? 'Tobillo' : 'Muñeca'}</span>:
                <input
                  type="range"
                  min={mode === 6 ? -40 : -50}
                  max={mode === 6 ? 25 : 60}
                  value={Math.round(angles.joint3)}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setAngles((prev) => ({ ...prev, joint3: parseFloat(e.target.value) }));
                  }}
                  style={{ width: '50px' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', width: '24px' }}>
                  {Math.round(angles.joint3)}°
                </span>
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setIsAnimating((a) => !a)}
                style={{
                  background: isAnimating ? 'var(--teal-tint)' : 'var(--paper-2)',
                  borderColor: isAnimating ? 'var(--teal)' : 'var(--line)',
                  color: isAnimating ? 'var(--teal-deep)' : 'var(--ink)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isAnimating ? '⏸ Pausar' : '▶ Animar'}
              </button>

              {/* Controles de Zoom (solo en 3D) */}
              {viewMode === '3D' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 4px' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--ink-3)' }}>Zoom</span>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Alejar vista (Zoom −)"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 2px' }}
                  >
                    −
                  </button>
                  <span style={{ color: 'var(--line)', fontSize: '0.60rem' }}>|</span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Acercar vista (Zoom +)"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 2px' }}
                  >
                    +
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
