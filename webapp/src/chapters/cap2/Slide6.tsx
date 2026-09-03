import React, { useState } from 'react';
import TricepsCanvas from './TricepsCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide6({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [pushLoadKg, setPushLoadKg] = useState<number>(6);
  const [insertCm, setInsertCm] = useState<number>(2.5);

  const g = 9.81;
  const wPushN = pushLoadKg * g;
  const fTricepsN = wPushN * (0.35 / (insertCm / 100));
  const fTricepsKgf = fTricepsN / g;
  const rJointN = fTricepsN + wPushN;

  const setPreset = (type: 'light' | 'bench' | 'heavy') => {
    if (type === 'light') {
      setPushLoadKg(3);
      setInsertCm(2.5);
    } else if (type === 'bench') {
      setPushLoadKg(10);
      setInsertCm(2.5);
    } else if (type === 'heavy') {
      setPushLoadKg(20);
      setInsertCm(2.5);
    }
  };

  const handleReset = () => {
    setPushLoadKg(6);
    setInsertCm(2.5);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B4</span>
        <h2 className="mtitle">Extensión del codo: el tríceps 3D</h2>
        <span className="msub">Palanca de 1ª clase · Inserción en el olécranon y compresión articular aditiva</span>
        <span className="mslide-count">4 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🥊</span> Palanca de 1ª clase en el olécranon
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                En la extensión activa del codo, el <strong>tríceps braquial</strong> tira hacia arriba del pico del <strong>olécranon</strong>, situado en el lado opuesto del fulcro troclear:
              </p>
              <div className="eq-block">
                {'\\[ F_t\\, d = W\\, D \\qquad\\Rightarrow\\qquad F_t = W \\left(\\frac{D}{d}\\right) \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'Con $d \\approx 2{,}5\\text{ cm}$ y $D \\approx 35\\text{ cm}$, la relación de palanca es de $35 / 2{,}5 = \\mathbf{14\\times}$.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Compresión articular aditiva máxima
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                A diferencia de la flexión (donde el bíceps y la carga tiran en sentidos opuestos restando carga neta), en la extensión <strong>tanto el tríceps como la fuerza de empuje comprimen la articulación</strong> en la misma dirección hacia la tróclea:
              </p>
              <div className="eq-block">
                {'\\[ R_j = F_t + W = W \\left(1 + \\frac{D}{d}\\right) = 15\\, W \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Empujar con solo $10\\text{ kg}$ somete al cartílago troclear a una compresión de $\\sim 150\\text{ kgf}$ ($1470\\text{ N}$).'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-6">
              El olécranon actúa como un fulcro posterior: su prominencia ósea determina directamente la fuerza máxima de empuje en deportes de lanzamiento, calistenia (fondos en paralelas) y boxeo.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="MECÁNICA DEL TRÍCEPS"
            badge={`Ft = ${fTricepsN.toFixed(0)} N (${fTricepsKgf.toFixed(1)} kgf)`}
            icon="🥊"
            footer="💡 Rota la escena 3D y ajusta la fuerza de empuje o el brazo del olécranon"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.58rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tensión Tríceps (Ft):</span>
                <b style={{ color: '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>{fTricepsN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza de empuje:</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{pushLoadKg} kg ({wPushN.toFixed(0)} N)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo olécranon (d):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{insertCm.toFixed(1)} cm</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Relación Ft / W:</span>
                <b style={{ color: '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>{(0.35 / (insertCm / 100)).toFixed(1)}×</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Compresión Articular (Rj):</span>
                <b style={{ color: '#7c3aed', fontFamily: 'JetBrains Mono, monospace' }}>{rJointN.toFixed(0)} N ({(rJointN / 9.81).toFixed(1)} kgf)</b>
              </div>
            </div>
          </HudPanel>

          <TricepsCanvas
            pushLoadKg={pushLoadKg}
            insertCm={insertCm}
          />
          <div className="prof-controls">
            <span className="badge">2.2 · Tríceps</span>

            {/* Presets */}
            {(() => {
              const isLight = pushLoadKg === 3 && insertCm === 2.5;
              const isBench = pushLoadKg === 10 && insertCm === 2.5;
              const isHeavy = pushLoadKg === 20 && insertCm === 2.5;

              return (
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPreset('light')}
                    style={{
                      background: isLight ? 'var(--teal)' : 'var(--paper-2)',
                      color: isLight ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isLight ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isLight ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    3 kg Ligero
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('bench')}
                    style={{
                      background: isBench ? 'var(--teal)' : 'var(--paper-2)',
                      color: isBench ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isBench ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isBench ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    10 kg Banco
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('heavy')}
                    style={{
                      background: isHeavy ? 'var(--teal)' : 'var(--paper-2)',
                      color: isHeavy ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isHeavy ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isHeavy ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    20 kg Máx
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.60rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>Empuje:</span>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={pushLoadKg}
                  onChange={(e) => setPushLoadKg(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{pushLoadKg}kg</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>d olécranon:</span>
                <input
                  type="range"
                  min="2.0"
                  max="4.0"
                  step="0.1"
                  value={insertCm}
                  onChange={(e) => setInsertCm(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{insertCm.toFixed(1)}cm</b>
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
