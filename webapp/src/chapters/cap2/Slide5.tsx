import React, { useState } from 'react';
import MultiMuscleCanvas from './MultiMuscleCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide5({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [handLoadKg, setHandLoadKg] = useState<number>(7);
  const [activeMuscleCount, setActiveMuscleCount] = useState<1 | 3>(3);

  const g = 9.81;
  const wLoadN = handLoadKg * g;
  const totalTauNm = wLoadN * 0.35;

  let fBicN = 0;
  let fBrachN = 0;
  let fBradN = 0;

  if (activeMuscleCount === 1) {
    fBicN = totalTauNm / (0.040 * Math.sin((80 * Math.PI) / 180));
  } else {
    fBrachN = (totalTauNm * 0.45) / (0.025 * Math.sin((85 * Math.PI) / 180));
    fBicN = (totalTauNm * 0.40) / (0.040 * Math.sin((80 * Math.PI) / 180));
    fBradN = (totalTauNm * 0.15) / (0.250 * Math.sin((15 * Math.PI) / 180));
  }

  const totalForceN = fBicN + fBrachN + fBradN;

  const setPreset = (type: 'light' | 'moderate' | 'heavy') => {
    if (type === 'light') setHandLoadKg(3);
    else if (type === 'moderate') setHandLoadKg(7);
    else if (type === 'heavy') setHandLoadKg(15);
  };

  const handleReset = () => {
    setHandLoadKg(7);
    setActiveMuscleCount(3);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B3</span>
        <h2 className="mtitle">Sinergia flexora 3D del codo</h2>
        <span className="msub">Bíceps + Braquial anterior + Braquiorradial · Cooperación multi-músculo</span>
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
                {'El codo humano no depende de un solo músculo, sino de un grupo sinérgico con distintos brazos de momento $d$ y orientaciones:'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.62rem', marginTop: '.25rem' }}>
                <span className="pill">
                  <b>1. Braquial anterior:</b> {'$d = 2{,}5\\text{ cm}$, $\\theta = 85^\\circ$. Músculo monoarticular profundo más potente (~45% del torque neto).'}
                </span>
                <span className="pill">
                  <b>2. Bíceps braquial:</b> {'$d = 4{,}0\\text{ cm}$, $\\theta = 80^\\circ$. Biarticular, potente supinador y flexor (~40% del torque neto).'}
                </span>
                <span className="pill">
                  <b>3. Braquiorradial:</b> {'$d = 25{,}0\\text{ cm}$, $\\theta = 15^\\circ$. Brazo de palanca muy largo; estabilizador dinámico y shunt (~15% del torque).'}
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> Ecuación de torque compartido
            </div>
            <div className="card-body">
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ \\tau_{\\text{total}} = F_1 d_1 \\sin\\theta_1 + F_2 d_2 \\sin\\theta_2 + F_3 d_3 \\sin\\theta_3 = W\\, D \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                El sistema neuromuscular modula la activación de cada músculo para optimizar el gasto metabólico, repartir tensiones y prevenir la fatiga aguda.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-5">
              Al cargar con el antebrazo en pronación (palmas abajo), el tendón del bíceps se enrolla en el radio perdiendo ventaja mecánica, momento en que el <b>braquial anterior</b> asume casi todo el trabajo de flexión.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="CODO MULTI-MÚSCULO"
            badge={activeMuscleCount === 3 ? '3 MÚSCULOS (SINERGIA)' : '1 MÚSCULO (AISLADO)'}
            icon="🦾"
            footer="💡 Alterna entre 1 y 3 músculos para ver la redistribución de fuerza y sobrecarga"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.58rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: '#2e8b57' }}>Braquial (d = 2,5 cm):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fBrachN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: '#dc2626' }}>Bíceps (d = 4,0 cm):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fBicN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: '#d97706' }}>Braquiorradial (d = 25 cm):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fBradN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Total:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{totalForceN.toFixed(0)} N ({(totalForceN / 9.81).toFixed(1)} kgf)</b>
              </div>
            </div>
          </HudPanel>

          <MultiMuscleCanvas
            handLoadKg={handLoadKg}
            activeMuscleCount={activeMuscleCount}
          />
          <div className="prof-controls">
            <span className="badge">2.2 · Flexores</span>

            {/* Presets */}
            {(() => {
              const isLight = handLoadKg === 3;
              const isMod = handLoadKg === 7;
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
                    3 kg Ligera
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
                    7 kg Típica
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
                    15 kg Máx
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
                  value={handLoadKg}
                  onChange={(e) => setHandLoadKg(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{handLoadKg}kg</b>
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
                {activeMuscleCount === 3 ? '✓ 3 Músculos (Sinergia)' : '⚠️ 1 Músculo (Aislado)'}
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
