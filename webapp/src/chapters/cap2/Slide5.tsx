import React, { useState } from 'react';
import MultiMuscleCanvas from './MultiMuscleCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';
import { G, FOREARM, flexorStatics, FLEXOR_BOOK_LOAD_KG } from './staticsModels';
import { fx } from './ab';

export default function Slide5({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [handLoadKg, setHandLoadKg] = useState<number>(FLEXOR_BOOK_LOAD_KG);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [activeMuscleCount, setActiveMuscleCount] = useState<1 | 3>(3);

  // Caso 4 del libro (Tabla 2.1, Ecs. 2.21–2.24): M_i = k A_i con θ = 90°.
  const tauNcm = handLoadKg * G * FOREARM.dW + FOREARM.WF * FOREARM.dF;
  const fl = flexorStatics(tauNcm, activeMuscleCount === 1);
  const fBicN = fl.biceps;
  const fBrachN = fl.brachialis;
  const fBradN = fl.brachioradialis;
  const totalForceN = fl.total;

  const setPreset = (type: 'light' | 'moderate' | 'heavy') => {
    if (type === 'light') setHandLoadKg(3);
    else if (type === 'moderate') setHandLoadKg(FLEXOR_BOOK_LOAD_KG);
    else if (type === 'heavy') setHandLoadKg(15);
  };

  const handleReset = () => {
    setHandLoadKg(FLEXOR_BOOK_LOAD_KG);
    setActiveMuscleCount(3);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B3</span>
        <h2 className="mtitle">Sinergia flexora 3D del codo</h2>
        <span className="msub">Caso 4 · Bíceps, braquial y braquiorradial (Tabla 2.1, Ecs. 2.18–2.24)</span>
        <span className="mslide-count">3 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦾</span> Los 3 flexores principales del codo
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'El bíceps no es el único flexor del codo (Fig. 2.10). Con $\\theta = 90^\\circ$ (supuesto que puede no ser bueno para cada músculo), la Ec. 2.13 pasa a'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ M_1 d_{M1} + M_2 d_{M2} + M_3 d_{M3} = W_W d_W + W_F d_F \\]'}
              </div>
              <table className="data-mini">
                <thead><tr><th>Tabla 2.1 · Músculo</th><th>{'$d_i$ (cm)'}</th><th>{'PCA (cm²)'}</th></tr></thead>
                <tbody>
                  <tr><td>Bíceps (1)</td><td>4,6</td><td>4,6</td></tr>
                  <tr><td>Braquial (2)</td><td>3,4</td><td>7,0</td></tr>
                  <tr><td>Braquiorradial (3)</td><td>7,5</td><td>1,5</td></tr>
                </tbody>
              </table>
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular los tres flexores</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Pone sobre cada vientre muscular la fuerza que aporta, para ver de un vistazo cómo se reparten el torque.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> Ecuación de torque compartido
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem' }}>
                {'Si la fuerza de cada músculo es proporcional a su área de sección transversal fisiológica (ASTF o PCA), $M_i = k A_i$, con $k$ de hasta $\\sim 40\\text{ N/cm}^2$:'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ k = \\frac{W_W d_W + W_F d_F}{A_1 d_{M1} + A_2 d_{M2} + A_3 d_{M3}}, \\qquad M_i = k\\,A_i \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'El libro obtiene $M_1 = 262\\text{ N}$, $M_2 = 399\\text{ N}$ y $M_3 = 85\\text{ N}$ (total $746\\text{ N}$) frente a $696\\text{ N}$ con el bíceps solo ($d_1 = 4{,}6\\text{ cm}$). El total es mayor porque el braquial tiene un brazo de momento relativamente pequeño. Esas cifras corresponden a un torque de carga de $\\approx 32\\text{ N·m}$, que el visor reproduce con 8,5 kg en la mano.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-5">
              Si las $k_i$ no son iguales, hay más incógnitas que ecuaciones: el problema es <b>indeterminado</b>. El cuerpo lo resuelve minimizando la energía o repartiendo la carga entre músculos para dejar descansar alguno, o para mantener el peso bien equilibrado en la mano.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="CODO MULTI-MÚSCULO"
            badge={activeMuscleCount === 3 ? '3 FLEXORES · MISMA k' : 'BÍCEPS SOLO'}
            icon="🦾"
            footer="💡 Alterna entre bíceps solo y tres flexores: compara 696 N con 262 + 399 + 85 N"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.58rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--coronal)' }}>Braquial M₂ (3,4 cm):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fBrachN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--blood)' }}>Bíceps M₁ (4,6 cm):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fBicN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--amber)' }}>Braquiorradial M₃ (7,5 cm):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fBradN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Total:</span>
                <b style={{ color: 'var(--teal)', fontFamily: 'var(--mono)' }}>{fx(totalForceN)} N · k = {fx(fl.k, 1)} N/cm²</b>
              </div>
            </div>
          </HudPanel>

          <MultiMuscleCanvas showLabels={showLabels}
            handLoadKg={handLoadKg}
            activeMuscleCount={activeMuscleCount}
          />
          <div className="prof-controls">
            <span className="badge">2.2 · Flexores</span>

            {/* Presets */}
            {(() => {
              const isLight = handLoadKg === 3;
              const isMod = handLoadKg === FLEXOR_BOOK_LOAD_KG;
              const isHeavy = handLoadKg === 15;

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
                    3 kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('moderate')}
                    style={{
                      background: isMod ? 'var(--teal)' : 'var(--paper-2)',
                      color: isMod ? '#fff' : 'var(--ink)',
                      border: `1px solid ${isMod ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.58rem',
                      fontWeight: isMod ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    8,5 kg (libro)
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
                    15 kg
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.60rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>Carga:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={handLoadKg}
                  onChange={(e) => setHandLoadKg(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{fx(handLoadKg, 1)} kg</b>
              </label>

              <button
                type="button"
                onClick={() => setActiveMuscleCount(activeMuscleCount === 3 ? 1 : 3)}
                style={{
                  background: activeMuscleCount === 3 ? 'var(--teal)' : '#dc2626',
                  color: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.58rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {activeMuscleCount === 3 ? 'Tres flexores' : 'Bíceps solo'}
              </button>

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
