import React, { useState } from 'react';
import TorqueCanvas from './TorqueCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide2({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [theta, setTheta] = useState<number>(60);
  const [rCm, setRCm] = useState<number>(70);
  const [fN, setFN] = useState<number>(60);

  const rM = rCm / 100;
  const rad = (theta * Math.PI) / 180;
  const tau = rM * fN * Math.sin(rad);
  const fPerp = fN * Math.sin(rad);
  const fParallel = fN * Math.cos(rad);
  const rPerp = rM * Math.abs(Math.sin(rad));

  const isCCW = tau > 0.05;
  const isCW = tau < -0.05;
  const tauColor = isCCW ? '#0d6e64' : (isCW ? '#b02318' : '#6b7885');

  const handleUpdate = (newTheta: number, newR: number, newF: number) => {
    setTheta(newTheta);
    setRCm(newR);
    setFN(newF);
  };

  const setPreset = (type: 'optimal' | 'acute' | 'zero' | 'reverse' | 'biceps') => {
    if (type === 'optimal') {
      setTheta(90);
      setRCm(70);
      setFN(60);
    } else if (type === 'acute') {
      setTheta(30);
      setRCm(70);
      setFN(75);
    } else if (type === 'zero') {
      setTheta(0);
      setRCm(70);
      setFN(60);
    } else if (type === 'reverse') {
      setTheta(240);
      setRCm(70);
      setFN(60);
    } else if (type === 'biceps') {
      setTheta(15);
      setRCm(35);
      setFN(100);
    }
  };

  const handleReset = () => {
    setTheta(60);
    setRCm(70);
    setFN(60);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">A2</span>
        <h2 className="mtitle">El torque vectorial</h2>
        <span className="msub">{'$\\tau = \\vec{r} \\times \\vec{F}$ · Descomposición ortogonal y brazo de momento'}</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔄</span> Definición de torque o momento
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Una fuerza $\\vec{F}$ aplicada a una distancia $\\vec{r}$ de un eje articular genera un '}<strong>torque</strong>{' (producto cruz vectorial):'}
              </p>
              <div className="eq-block">
                {'\\[ \\vec{\\tau} = \\vec{r} \\times \\vec{F} \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                Su magnitud alrededor del eje perpendicular al plano es:
              </p>
              <div className="eq-block">
                {'\\[ \\tau = r\\,F\\,\\sin\\theta = r_{\\perp}\\,F = r\\,F_{\\perp} \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                Fuerza hacia $+y$ a distancia $+r$ produce giro <strong>antihorario ($\tau &gt; 0$)</strong>. Fuerza hacia $-y$ produce giro <strong>horario ($\tau &lt; 0$)</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">✂️</span> Desglose de componentes ortogonales
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.64rem' }}>
                <span className="pill">
                  <b>{'F⊥ = F sinθ:'}</b> Componente tangencial útil (genera el 100% del torque angular).
                </span>
                <span className="pill">
                  <b>{'F∥ = F cosθ:'}</b> Componente radial que comprime o distrae la articulación (0 torque).
                </span>
                <span className="pill">
                  <b>{'r⊥ = r sinθ:'}</b> Brazo de palanca perpendicular a la línea de acción de la fuerza.
                </span>
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                {'Cuando $\\theta = 90^\\circ$, $\\sin(90^\\circ) = 1$ y el torque es máximo ($\\tau = r F$). Cuando $\\theta = 0^\\circ$ o $180^\\circ$, el torque es nulo y la fuerza es puramente compresiva o distractiva.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-2">
              {'En la anatomía humana, los tendones suelen insertarse con ángulos $\\theta$ pequeños (ej. bíceps a ~15° en extensión casi completa), lo que reduce la componente útil $F_\\perp$ a solo un ~26% de la fuerza total, disipando el resto en compresión articular protectora.'}
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="TORQUE VECTORIAL"
            badge={`${tau >= 0 ? '+' : ''}${tau.toFixed(1)} N·m`}
            icon="🔄"
            footer="💡 Arrastra la punta de la flecha o ajusta los controles inferiores"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.58rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Torque Neto (τ):</span>
                <b style={{ color: tauColor, fontFamily: 'JetBrains Mono, monospace' }}>
                  {tau >= 0 ? '+' : ''}{tau.toFixed(2).replace('.', ',')} N·m
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Sentido de Giro:</span>
                <b style={{ color: tauColor }}>
                  {isCCW ? 'Antihorario (+)' : (isCW ? 'Horario (−)' : 'Nulo (0)')}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo Perpendicular (r⊥):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace', color: '#d97706' }}>{rPerp.toFixed(3)} m ({(rPerp * 100).toFixed(1)} cm)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Tangencial (F⊥):</span>
                <b style={{ color: tauColor, fontFamily: 'JetBrains Mono, monospace' }}>{Math.abs(fPerp).toFixed(1)} N ({((Math.abs(fPerp) / Math.max(1, fN)) * 100).toFixed(0)}%)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Radial (F∥):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fParallel.toFixed(1)} N ({fParallel >= 0 ? 'Tracción' : 'Compresión'})</b>
              </div>
            </div>
          </HudPanel>

          <TorqueCanvas
            theta={theta}
            rCm={rCm}
            fN={fN}
            onUpdate={handleUpdate}
          />
          <div className="prof-controls">
            <span className="badge">2.1 · Torque</span>

            {/* Botones de Presets */}
            {(() => {
              const isOptimal = theta === 90 && rCm === 70 && fN === 60;
              const isAcute = theta === 30 && rCm === 70 && fN === 75;
              const isBiceps = theta === 15 && rCm === 35 && fN === 100;
              const isZero = theta === 0 && rCm === 70 && fN === 60;
              const isReverse = theta === 240 && rCm === 70 && fN === 60;

              return (
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPreset('optimal')}
                    style={{
                      background: isOptimal ? 'var(--teal)' : 'var(--paper-2)',
                      color: isOptimal ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isOptimal ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isOptimal ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    90° Máx
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('acute')}
                    style={{
                      background: isAcute ? 'var(--teal)' : 'var(--paper-2)',
                      color: isAcute ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isAcute ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isAcute ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    30° Agudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('biceps')}
                    style={{
                      background: isBiceps ? 'var(--teal)' : 'var(--paper-2)',
                      color: isBiceps ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isBiceps ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isBiceps ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    15° Bíceps
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('zero')}
                    style={{
                      background: isZero ? 'var(--teal)' : 'var(--paper-2)',
                      color: isZero ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isZero ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isZero ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    0° Compresión
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('reverse')}
                    style={{
                      background: isReverse ? 'var(--teal)' : 'var(--paper-2)',
                      color: isReverse ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isReverse ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isReverse ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    240° Inverso
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.60rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>θ:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={theta}
                  onChange={(e) => setTheta(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{theta}°</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>r:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={rCm}
                  onChange={(e) => setRCm(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{rCm}cm</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>F:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fN}
                  onChange={(e) => setFN(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{fN}N</b>
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
