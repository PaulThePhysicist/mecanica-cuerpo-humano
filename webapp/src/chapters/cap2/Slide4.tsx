import React, { useState } from 'react';
import { C } from './palette';
import { fx } from './ab';
import BicepsCanvas from './BicepsCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import { AnimateButton } from './AnimateButton';
import { useHarmonicClock } from '../cap1/three/useHarmonicClock';
import type { Engine } from './useEngine';
import { G, FOREARM } from './staticsModels';

export default function Slide4({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [handLoadKg, setHandLoadKg] = useState<number>(10);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [insertCm, setInsertCm] = useState<number>(4.0);
  const [elbowAngleDeg, setElbowAngleDeg] = useState<number>(90);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Ciclo de flexión / extensión del codo (55° casi extendido ↔ 130° flexionado).
  useHarmonicClock({ playing: isAnimating }, (t) => {
    const s = (Math.sin(t * 1.1 - Math.PI / 2) + 1) / 2;
    setElbowAngleDeg(55 + 75 * s);
  });

  // Casos 2–3 del libro (Ecs. 2.13–2.17): W_F = 15 N a d_F = 13 cm, W_W a d_W = 36 cm.
  // Todos los torques llevan sen θ, así que M no depende del ángulo (Ec. 2.17).
  const g = G;
  const wForearmN = FOREARM.WF;
  const wHandN = handLoadKg * g;
  const flexRad = (elbowAngleDeg * Math.PI) / 180;
  const tauResNm = (wForearmN * FOREARM.dF / 100 + wHandN * FOREARM.dW / 100) * Math.sin(flexRad);
  const fMuscN = tauResNm / ((insertCm / 100) * Math.max(0.2, Math.sin(flexRad)));
  const fMuscKgf = fMuscN / g;
  const rJointN = Math.max(0, fMuscN - (wForearmN + wHandN));

  const setPreset = (type: 'standard' | 'extension' | 'heavy' | 'leverage') => {
    if (type === 'standard') {
      setHandLoadKg(10);
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
    setIsAnimating(false);
    setHandLoadKg(10);
    setInsertCm(4.0);
    setElbowAngleDeg(90);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B2</span>
        <h2 className="mtitle">Flexión del codo: el bíceps 3D</h2>
        <span className="msub">Palanca de 3ª clase · Casos 1–3 del libro (Ecs. 2.13–2.17)</span>
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
                {'Caso 1: el bíceps se inserta en el radio a $d_M \\approx 4\\text{ cm}$ del pivote y el peso $W_W$ de la mano está a $d_W = 0{,}2H = 36\\text{ cm}$ ($H = 180\\text{ cm}$): $M = (36/4)\\,W_W = 9\\,W_W$; 100 N en la mano exigen 900 N al bíceps. Caso 2: se añade el peso del antebrazo $W_F \\approx 0{,}022\\,W_b \\approx 15\\text{ N}$ en su centro, $d_F = 13\\text{ cm}$:'}
              </p>
              <div className="eq-block">
                {'\\[ \\tau_z = M d_M - W_W d_W - W_F d_F = 0 \\;\\Rightarrow\\; M = \\frac{d_W}{d_M} W_W + \\frac{d_F}{d_M} W_F = 9\\,W_W + 3{,}25\\,W_F \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'Para 100 N: $M = 900 + 3{,}25 \\times 15 \\approx 950\\text{ N}$. Caso 3: con el brazo vertical y el antebrazo a un ángulo $\\theta$, los tres torques se multiplican por $\\sin\\theta$ y se obtiene la misma $M$ (Ecs. 2.16–2.17). La sutileza: la fuerza máxima del músculo depende de su longitud, es decir, de $\\theta$, y es mayor cerca de $90^\\circ$.'}
              </p>
              <div style={{ marginTop: '0.62rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>{'Rotular $M$, $W_W$ y $R$'}</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Cuelga de cada flecha su valor en newtons: la tensión del bíceps, la carga en la mano y la reacción sobre la tróclea.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Carga articular y cartílago troclear
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'El libro no calcula la reacción del codo, pero sale de $\\sum F_y = 0$ con el antebrazo a $90^\\circ$: el húmero empuja el antebrazo hacia abajo con'}
              </p>
              <div className="eq-block">
                {'\\[ R = M - W_W - W_F \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Con 100 N en la mano, $R \\approx 950 - 100 - 15 \\approx 835\\text{ N}$: casi ocho veces la carga. Supuestos del modelo: antebrazo y brazo a $90^\\circ$ (Caso 1) y brazo de momento fijo, aunque en realidad cambia con $\\theta$ (Fig. 3.46).'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-4">
              Empieza siempre por un modelo simple y declara sus supuestos (ángulo de 90°, antebrazo sin masa); luego hazlo más realista. Así se pasa del Caso 1 (900 N) al Caso 2 (950 N), al Caso 3 (cualquier ángulo) y al Caso 4 (tres músculos, siguiente diapositiva).
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="MECÁNICA DEL BÍCEPS"
            badge={`M = ${fMuscN.toFixed(0)} N (${fx(fMuscKgf, 1)} kgf)`}
            footer="💡 Rota la escena 3D y ajusta la carga o la distancia de inserción"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tensión del bíceps (M):</span>
                <b style={{ color: C.teal, fontFamily: 'JetBrains Mono, monospace' }}>{fMuscN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Equivalente masa:</span>
                <b style={{ color: C.teal, fontFamily: 'JetBrains Mono, monospace' }}>{fx(fMuscKgf, 1)} kgf</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga en mano:</span>
                <b style={{ color: C.amber, fontFamily: 'JetBrains Mono, monospace' }}>{handLoadKg} kg ({wHandN.toFixed(0)} N)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo del bíceps (d<sub>M</sub>):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fx(insertCm, 1)} cm</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Compresión en el codo (R):</span>
                <b style={{ color: C.blood, fontFamily: 'JetBrains Mono, monospace' }}>{rJointN.toFixed(0)} N ({fx((rJointN / 9.81), 1)} kgf)</b>
              </div>
            </div>
          </HudPanel>

          <BicepsCanvas showLabels={showLabels}
            handLoadKg={handLoadKg}
            insertCm={insertCm}
            elbowAngleDeg={elbowAngleDeg}
          />
          <div className="prof-controls">
            <span className="badge">§2.3.1 · Antebrazo</span>

            {/* Presets */}
            {(() => {
              const isStd = handLoadKg === 10 && elbowAngleDeg === 90 && insertCm === 4;
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
                      color: isStd ? C.card : 'var(--ink)',
                      border: `1px solid ${isStd ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.62rem',
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
                      color: isExt ? C.card : 'var(--ink)',
                      border: `1px solid ${isExt ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.62rem',
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
                      color: isHeavy ? C.card : 'var(--ink)',
                      border: `1px solid ${isHeavy ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.62rem',
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
                      color: isLev ? C.card : 'var(--ink)',
                      border: `1px solid ${isLev ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.62rem',
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

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
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
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{fx(insertCm, 1)}cm</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>Ángulo:</span>
                <input
                  type="range"
                  min="45"
                  max="135"
                  value={elbowAngleDeg}
                  onChange={(e) => { setIsAnimating(false); setElbowAngleDeg(parseFloat(e.target.value)); }}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '26px' }}>{elbowAngleDeg.toFixed(0)}°</b>
              </label>

              <AnimateButton playing={isAnimating} onToggle={() => setIsAnimating((a) => !a)} label="Flexionar" />

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '0.62rem',
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
