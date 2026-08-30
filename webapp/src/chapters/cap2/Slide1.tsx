import React, { useState, Suspense } from 'react';
import NewtonCanvas from './NewtonCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide1({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [f1, setF1] = useState<number>(60);
  const [theta1, setTheta1] = useState<number>(45);
  const [f2, setF2] = useState<number>(50);
  const [theta2, setTheta2] = useState<number>(135);
  const [autoEquilibrium, setAutoEquilibrium] = useState<boolean>(true);

  // Cálculos reactivos de componentes
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

  const fNetX = autoEquilibrium ? 0 : f1x + f2x;
  const fNetY = autoEquilibrium ? 0 : f1y + f2y;
  const fNetMag = Math.hypot(fNetX, fNetY);

  const handleUpdateF1 = (f: number, theta: number) => {
    setF1(f);
    setTheta1(theta);
  };

  const handleUpdateF2 = (f: number, theta: number) => {
    setF2(f);
    setTheta2(theta);
  };

  const setPreset = (name: 'gleno' | 'ortho' | 'vertical' | 'asym') => {
    if (name === 'gleno') {
      setF1(70);
      setTheta1(35);
      setF2(50);
      setTheta2(270);
      setAutoEquilibrium(true);
    } else if (name === 'ortho') {
      setF1(80);
      setTheta1(45);
      setF2(60);
      setTheta2(270);
      setAutoEquilibrium(true);
    } else if (name === 'vertical') {
      setF1(80);
      setTheta1(90);
      setF2(80);
      setTheta2(270);
      setAutoEquilibrium(true);
    } else if (name === 'asym') {
      setF1(95);
      setTheta1(25);
      setF2(35);
      setTheta2(260);
      setAutoEquilibrium(false);
    }
  };

  const handleReset = () => {
    setF1(60);
    setTheta1(45);
    setF2(50);
    setTheta2(135);
    setAutoEquilibrium(true);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">A1</span>
        <span className="mtitle">Fuerzas, torques y equilibrio</span>
        <span className="msub">Las dos condiciones fundamentales de la estática biomecánica</span>
        <span className="mslide-count">1 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚖️</span> Las dos condiciones del equilibrio
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                En una condición estática, la suma de todas las fuerzas y la suma de todos los torques deben anularse simultáneamente en los tres ejes espaciales:
              </p>
              <div className="eq-block">
                {'\\[ \\sum \\vec{F} = 0 \\quad\\iff\\quad \\sum F_x = 0, \\; \\sum F_y = 0, \\; \\sum F_z = 0 \\]'}
              </div>
              <div className="eq-block">
                {'\\[ \\sum \\vec{\\tau} = 0 \\quad\\iff\\quad \\sum \\tau_x = 0, \\; \\sum \\tau_y = 0, \\; \\sum \\tau_z = 0 \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                El equilibrio rige para todo el cuerpo o para <strong>cualquier articulación aislada (DCL)</strong>, como la articulación glenohumeral del hombro.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦴</span> DCL Articular: El Hombro como Ejemplo
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.66rem', color: 'var(--ink-2)' }}>
                En la abducción del brazo, interactúan tres fuerzas concurrentes fundamentales:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '.62rem', marginTop: '.25rem' }}>
                <span className="pill" style={{ borderLeft: '3px solid #0d6e64' }}>
                  <b>F₁ (Músculo Deltoides):</b> Tensión activa que eleva y sostiene el húmero.
                </span>
                <span className="pill" style={{ borderLeft: '3px solid #d97706' }}>
                  <b>F₂ (Gravedad / Carga):</b> Peso del miembro superior y objetos sostenidos.
                </span>
                <span className="pill" style={{ borderLeft: '3px solid #b02318' }}>
                  <b>R (Reacción Glenoidea):</b> Compresión de la fosa glenoidea que evita la luxación.
                </span>
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '.35rem' }}>
                Si <b>ΣF ≠ 0</b>, la fuerza neta resultante <b>F_net = m·a</b> acelera el segmento o provoca inestabilidad / subluxación articular.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-1">
              En cualquier articulación, <b>los músculos nunca actúan solos</b>: toda contracción muscular genera una fuerza de compresión articular reactiva (<b>R</b>) transmitida a través del cartílago para mantener el contacto óseo estable.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="EQUILIBRIO ESTÁTICO"
            badge={autoEquilibrium ? 'ΣF = 0 (ESTÁTICA)' : `${fNetMag.toFixed(1)} N (DINÁMICA)`}
            icon="⚖️"
            footer="💡 Arrastra las puntas de los vectores o ajusta los controles inferiores"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: '#0d6e64' }}>Músculo (F₁):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{f1} N @ {theta1}°</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: '#d97706' }}>Carga (F₂):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{f2} N @ {theta2}°</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: '#b02318' }}>Reacción (R):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {autoEquilibrium ? `${rMag.toFixed(1)} N @ ${rAngle.toFixed(0)}°` : 'Inactiva (Dinámica)'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Neta:</span>
                <b style={{ color: autoEquilibrium ? '#0d6e64' : '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>
                  {autoEquilibrium ? '0,0 N (Equilibrio)' : `${fNetMag.toFixed(1)} N (Acelera)`}
                </b>
              </div>
            </div>
          </HudPanel>

          <Suspense fallback={<div className="loading-overlay">Cargando visualización 3D...</div>}>
            <NewtonCanvas
              f1={f1}
              theta1={theta1}
              f2={f2}
              theta2={theta2}
              autoEquilibrium={autoEquilibrium}
              onUpdateF1={handleUpdateF1}
              onUpdateF2={handleUpdateF2}
            />
          </Suspense>
          <div className="prof-controls">
            <span className="badge">2.1 · Newton</span>

            {/* Botones de Escenarios Preestablecidos */}
            {(() => {
              const isGleno = f1 === 70 && theta1 === 35 && f2 === 50 && theta2 === 270 && autoEquilibrium;
              const isOrtho = f1 === 80 && theta1 === 45 && f2 === 60 && theta2 === 270 && autoEquilibrium;
              const isVertical = f1 === 80 && theta1 === 90 && f2 === 80 && theta2 === 270 && autoEquilibrium;
              const isAsym = f1 === 95 && theta1 === 25 && f2 === 35 && theta2 === 260 && !autoEquilibrium;

              return (
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPreset('gleno')}
                    title="Escenario Glenohumeral (Abducción 60°)"
                    style={{
                      background: isGleno ? 'var(--teal)' : 'var(--paper-2)',
                      color: isGleno ? '#ffffff' : 'var(--ink)',
                      border: `1px solid ${isGleno ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isGleno ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Abducción 60°
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('ortho')}
                    title="Abducción 90° con Carga"
                    style={{
                      background: isOrtho ? 'var(--teal)' : 'var(--paper-2)',
                      color: isOrtho ? '#ffffff' : 'var(--ink)',
                      border: `1px solid ${isOrtho ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isOrtho ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Abducción 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('vertical')}
                    title="Tracción Vertical Antagonista"
                    style={{
                      background: isVertical ? 'var(--teal)' : 'var(--paper-2)',
                      color: isVertical ? '#ffffff' : 'var(--ink)',
                      border: `1px solid ${isVertical ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isVertical ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Vertical
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('asym')}
                    title="Desbalance Dinámico / Luxación articular"
                    style={{
                      background: isAsym ? '#b02318' : 'var(--paper-2)',
                      color: isAsym ? '#ffffff' : '#b02318',
                      border: `1px solid ${isAsym ? '#b02318' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isAsym ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ⚠️ Luxación
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.60rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#0d6e64' }}>F₁:</span>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={f1}
                  onChange={(e) => setF1(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{f1}N</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#0d6e64' }}>θ₁:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={theta1}
                  onChange={(e) => setTheta1(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{theta1}°</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#d97706' }}>F₂:</span>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={f2}
                  onChange={(e) => setF2(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{f2}N</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#d97706' }}>θ₂:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={theta2}
                  onChange={(e) => setTheta2(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{theta2}°</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer', background: 'var(--paper-2)', padding: '2px 5px', borderRadius: '3px', border: '1px solid var(--line)' }}>
                <input
                  type="checkbox"
                  checked={autoEquilibrium}
                  onChange={(e) => setAutoEquilibrium(e.target.checked)}
                />
                <b style={{ color: autoEquilibrium ? 'var(--teal-deep)' : 'var(--ink)' }}>ΣF = 0</b>
              </label>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '0.60rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
