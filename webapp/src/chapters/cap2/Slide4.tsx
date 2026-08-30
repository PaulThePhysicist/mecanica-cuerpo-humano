import React, { useState } from 'react';
import BicepsCanvas from './BicepsCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide4({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [handLoadKg, setHandLoadKg] = useState<number>(5);
  const [insertCm, setInsertCm] = useState<number>(4.0);
  const [elbowAngleDeg, setElbowAngleDeg] = useState<number>(90);

  const g = 9.81;
  const wForearmN = 1.5 * g;
  const wHandN = handLoadKg * g;
  const flexRad = (elbowAngleDeg * Math.PI) / 180;
  const tauResNm = (wForearmN * 0.14 + wHandN * 0.35) * Math.sin(flexRad);
  const fMuscN = tauResNm / ((insertCm / 100) * Math.max(0.2, Math.sin(flexRad)));
  const fMuscKgf = fMuscN / g;
  const rJointN = Math.max(0, fMuscN - (wForearmN + wHandN));

  const setPreset = (type: 'standard' | 'extension' | 'heavy' | 'leverage') => {
    if (type === 'standard') {
      setHandLoadKg(5);
      setInsertCm(4.0);
      setElbowAngleDeg(90);
    } else if (type === 'extension') {
      setHandLoadKg(5);
      setInsertCm(4.0);
      setElbowAngleDeg(135);
    } else if (type === 'heavy') {
      setHandLoadKg(18);
      setInsertCm(4.0);
      setElbowAngleDeg(90);
    } else if (type === 'leverage') {
      setHandLoadKg(5);
      setInsertCm(6.0);
      setElbowAngleDeg(90);
    }
  };

  const handleReset = () => {
    setHandLoadKg(5);
    setInsertCm(4.0);
    setElbowAngleDeg(90);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B2</span>
        <span className="mtitle">Flexión del codo: el bíceps 3D</span>
        <span className="msub">Palanca de 3ª clase · Desventaja mecánica y fuerza de compresión articular</span>
        <span className="mslide-count">2 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💪</span> Equilibrio de momentos en el codo
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                Tomando momentos alrededor del eje articular troclear del codo ($\Delta$):
              </p>
              <div className="eq-block">
                {'\\[ F_m\\, d = W_a\\, D_a + W_h\\, D \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'Donde $d \\approx 4\\text{ cm}$ (inserción en la tuberosidad bicipital del radio), $D_a \\approx 14\\text{ cm}$ (centro de masa del antebrazo) y $D \\approx 35\\text{ cm}$ (carga en la palma de la mano).'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ F_m = W_h \\left(\\frac{D}{d}\\right) + W_a \\left(\\frac{D_a}{d}\\right) \\approx 8{,}75\\, W_h + 3{,}5\\, W_a \\]'}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Carga articular y cartílago troclear
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'La fuerza de reacción articular $R_j$ comprime la tróclea humeral contra la escotadura troclear del cúbito:'}
              </p>
              <div className="eq-block">
                {'\\[ R_j = F_m - (W_a + W_h) \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Sostener solo $5\\text{ kg}$ en la mano somete al cartílago articular del codo a más de $\\sim 400\\text{ N}$ de compresión continua.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-4">
              La evolución diseñó el miembro superior como un sistema de <strong>palancas de 3ª clase</strong>: pagamos un alto costo en fuerza muscular para ganar amplitud angular y movimientos sumamente veloces en la manipulación distal.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="MECÁNICA DEL BÍCEPS"
            badge={`Fm = ${fMuscN.toFixed(0)} N (${fMuscKgf.toFixed(1)} kgf)`}
            icon="💪"
            footer="💡 Rota la escena 3D y ajusta la carga o la distancia de inserción"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.58rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tensión Bíceps (Fm):</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{fMuscN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Equivalente masa:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{fMuscKgf.toFixed(1)} kgf</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga en mano:</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{handLoadKg} kg ({wHandN.toFixed(0)} N)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo inserción (d):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{insertCm.toFixed(1)} cm</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Compresión Articular (Rj):</span>
                <b style={{ color: '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>{rJointN.toFixed(0)} N ({(rJointN / 9.81).toFixed(1)} kgf)</b>
              </div>
            </div>
          </HudPanel>

          <BicepsCanvas
            handLoadKg={handLoadKg}
            insertCm={insertCm}
            elbowAngleDeg={elbowAngleDeg}
          />
          <div className="prof-controls">
            <span className="badge">2.2 · Bíceps</span>

            {/* Presets */}
            {(() => {
              const isStd = handLoadKg === 5 && elbowAngleDeg === 90 && insertCm === 4;
              const isExt = handLoadKg === 5 && elbowAngleDeg === 135 && insertCm === 4;
              const isHeavy = handLoadKg === 18 && elbowAngleDeg === 90 && insertCm === 4;
              const isLev = handLoadKg === 5 && elbowAngleDeg === 90 && insertCm === 6;

              return (
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPreset('standard')}
                    style={{
                      background: isStd ? 'var(--teal)' : 'var(--paper-2)',
                      color: isStd ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isStd ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isStd ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    5 kg @ 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('extension')}
                    style={{
                      background: isExt ? 'var(--teal)' : 'var(--paper-2)',
                      color: isExt ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isExt ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isExt ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    135° Ext
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
                    18 kg Pesada
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('leverage')}
                    style={{
                      background: isLev ? 'var(--teal)' : 'var(--paper-2)',
                      color: isLev ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isLev ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isLev ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    d = 6 cm Ventaja
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.60rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>Carga:</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={handLoadKg}
                  onChange={(e) => setHandLoadKg(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{handLoadKg}kg</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>d ins:</span>
                <input
                  type="range"
                  min="3.0"
                  max="6.0"
                  step="0.2"
                  value={insertCm}
                  onChange={(e) => setInsertCm(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{insertCm.toFixed(1)}cm</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>Ángulo:</span>
                <input
                  type="range"
                  min="45"
                  max="135"
                  value={elbowAngleDeg}
                  onChange={(e) => setElbowAngleDeg(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{elbowAngleDeg}°</b>
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
