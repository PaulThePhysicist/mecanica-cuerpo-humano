import React, { useState } from 'react';
import HipCanvas from './HipCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide7({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [trendelenburg, setTrendelenburg] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const g = 9.81;
  const totalWeightN = bodyMassKg * g;
  const wbN = (5 / 6) * totalWeightN;
  const sin70 = Math.sin((70 * Math.PI) / 180);
  const cos70 = Math.cos((70 * Math.PI) / 180);

  const fAbductorN = trendelenburg ? (wbN * 0.18 * 0.25) / (0.07 * sin70) : (wbN * 0.18) / (0.07 * sin70);
  const fAbductorKgf = fAbductorN / g;
  const rxN = fAbductorN * cos70;
  const ryN = fAbductorN * sin70 + wbN;
  const rJointN = Math.hypot(rxN, ryN);
  const rJointKgf = rJointN / g;

  const handleReset = () => {
    setBodyMassKg(70);
    setTrendelenburg(false);
    setShowBreakdown(false);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C1</span>
        <h2 className="mtitle">La cadera: apoyo monopodal</h2>
        <span className="msub">Músculos abductores (glúteo medio) y carga articular en la cabeza femoral</span>
        <span className="mslide-count">1 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> Apoyo sobre una sola pierna
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Al pararse en un pie, el peso suprayacente más la pierna suspendida ($W_b = \\frac{5}{6} W$) tiende a hacer bascular la pelvis hacia el lado sin apoyo.'}
              </p>
              <div className="eq-block">
                {'\\[ F_a\\, b_m\\, \\sin\\theta_m = W_b\\, b_w \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'Con $b_m \\approx 7\\text{ cm}$, $\\theta_m \\approx 70^\\circ$ y $b_w \\approx 18\\text{ cm}$:'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ F_a = W_b \\left(\\frac{0{,}18}{0{,}07\\, \\sin 70^\\circ}\\right) \\approx 2{,}74\\, W_b \\approx 2{,}28\\, W \\]'}
              </div>
            
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>🏷️ Rotular W_b, F_a y R</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Pone cifras sobre las tres fuerzas del apoyo monopodal: peso suprayacente, tracción del glúteo medio y reacción en la cabeza femoral.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Carga sobre el cartílago acetabular
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'La fuerza de reacción articular total $\\vec{R}$ en la cabeza femoral es la suma vectorial de $\\vec{F}_a$ y $\\vec{W}_b$:'}
              </p>
              <div className="eq-block">
                {'\\[ R = \\sqrt{R_x^2 + R_y^2} \\approx 2{,}7\\, W \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Para $70\\text{ kg}$, la cadera soporta $\\sim 185\\text{ kgf}$ ($1815\\text{ N}$) en cada paso al caminar.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-7">
              El <b>Signo de Trendelenburg</b> ocurre por debilidad o denervación del glúteo medio (nervio glúteo superior): la pelvis bascula hacia el lado contralateral sin apoyo durante la marcha.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="BIOMECÁNICA CADERA"
            badge={trendelenburg ? '⚠️ TRENDELENBURG' : `R = ${rJointN.toFixed(0)} N`}
            icon="🦴"
            defaultCollapsed={true}
            footer="💡 Activa la insuficiencia del glúteo medio para ver la caída pélvica"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Reacción Articular (R):</span>
                <b style={{ color: trendelenburg ? '#b02318' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {rJointN.toFixed(0)} N ({rJointKgf.toFixed(1)} kgf)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Abductores (Fa):</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>{fAbductorN.toFixed(0)} N ({fAbductorKgf.toFixed(1)} kgf)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Peso Carga (Wb = 5/6 W):</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{wbN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ratio R / W_total:</span>
                <b style={{ color: trendelenburg ? '#b02318' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {(rJointN / totalWeightN).toFixed(2)}×
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazos de palanca:</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>bm = 7 cm · bw = 18 cm</b>
              </div>
            </div>
          </HudPanel>

          <HipCanvas showLabels={showLabels}
            bodyMassKg={bodyMassKg}
            trendelenburg={trendelenburg}
            showBreakdown={showBreakdown}
          />
          <div className="prof-controls">
            <span className="badge">2.3 · Cadera</span>
            <span>R = <b style={{ color: trendelenburg ? '#b02318' : '#0d6e64' }}>{rJointN.toFixed(0)} N</b> ({rJointKgf.toFixed(1)} kgf)</span>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Masa:</span>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={bodyMassKg}
                  onChange={(e) => setBodyMassKg(parseFloat(e.target.value))}
                  style={{ width: '60px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{bodyMassKg} kg</b>
              </label>

              {/* Segmented Control para Estado de Marcha */}
              <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                <button
                  type="button"
                  onClick={() => setTrendelenburg(false)}
                  style={{
                    background: !trendelenburg ? 'var(--teal)' : 'transparent',
                    color: !trendelenburg ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: !trendelenburg ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setTrendelenburg(true)}
                  style={{
                    background: trendelenburg ? '#b02318' : 'transparent',
                    color: trendelenburg ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: trendelenburg ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Trendelenburg
                </button>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showBreakdown}
                  onChange={(e) => setShowBreakdown(e.target.checked)}
                />
                <span style={{ color: 'var(--ink-2)' }}>Vectores Rx, Ry</span>
              </label>

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
