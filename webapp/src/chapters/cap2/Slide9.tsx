import React, { useState } from 'react';
import SpineCanvas from './SpineCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide9({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [trunkAngleDeg, setTrunkAngleDeg] = useState<number>(60);
  const [handLoadKg, setHandLoadKg] = useState<number>(15);
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);

  const g = 9.81;
  const wTrunkN = 0.65 * bodyMassKg * g;
  const wLoadN = handLoadKg * g;
  const sinAlpha = Math.sin((trunkAngleDeg * Math.PI) / 180);
  const cosAlpha = Math.cos((trunkAngleDeg * Math.PI) / 180);
  const sinThetaM = Math.sin((12 * Math.PI) / 180);
  const cosThetaM = Math.cos((12 * Math.PI) / 180);

  const tauResNm = (wTrunkN * 0.38 + wLoadN * 0.50) * sinAlpha;
  const fErectorN = Math.max(15, tauResNm / (0.05 * sinThetaM));
  const fErectorKgf = fErectorN / g;

  const rCompN = fErectorN * cosThetaM + (wTrunkN + wLoadN) * cosAlpha;
  const rCompKgf = rCompN / g;
  const rShearN = Math.abs((wTrunkN + wLoadN) * sinAlpha - fErectorN * sinThetaM);

  const handleReset = () => {
    setTrunkAngleDeg(60);
    setHandLoadKg(15);
    setBodyMassKg(70);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D1</span>
        <h2 className="mtitle">La columna y el erector de la espina</h2>
        <span className="msub">Inclinación del tronco · La gran desventaja mecánica lumbar</span>
        <span className="mslide-count">1 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏋️</span> El momento de flexión del tronco
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Al inclinar el tronco hacia adelante en un ángulo $\\alpha$, el peso del torso ($W_1 \\approx 0{,}65\\, W$) y cualquier carga en las manos ($W_2$) generan un gran torque flexor alrededor de L5-S1:'}
              </p>
              <div className="eq-block">
                {'\\[ \\tau_{\\text{res}} = (W_1\\, d_1 + W_2\\, d_2)\\, \\sin\\alpha \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'Donde $d_1 \\approx 38\\text{ cm}$ y $d_2 \\approx 50\\text{ cm}$.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> La fuerza del músculo erector espinal
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem' }}>
                {'El músculo erector de la espina actúa con un brazo de palanca minúsculo ($d_m \\approx 5\\text{ cm}$) y un ángulo muy cerrado ($\\theta_m \\approx 12^\\circ$):'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ F_m = \\frac{\\tau_{\\text{res}}}{d_m\\, \\sin 12^\\circ} \\approx \\frac{\\tau_{\\text{res}}}{0{,}05 \\times 0{,}208} \\approx 96\\, \\tau_{\\text{res}} \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Levantar $20\\text{ kg}$ inclinado exige más de $\\mathbf{3500\\text{ N}}$ ($360\\text{ kgf}$) de tensión en los músculos lumbares.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-9">
              La columna vertebral funciona como una grúa invertida: el brazo de palanca muscular de 5 cm frente al brazo de carga de 50 cm impone una relación de <b>10 a 1 en contra</b> de la musculatura de la espalda.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="TENSIÓN LUMBAR"
            badge={`Fm = ${fErectorN.toFixed(0)} N (${fErectorKgf.toFixed(0)} kgf)`}
            icon="🏋️"
            defaultCollapsed={true}
            footer="💡 Usa los ajustes preestablecidos o desliza el ángulo de inclinación"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tensión Erector (Fm):</span>
                <b style={{ color: fErectorN > 2500 ? '#b02318' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {fErectorN.toFixed(0)} N ({fErectorKgf.toFixed(0)} kgf)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Compresión L5-S1:</span>
                <b style={{ color: '#232c36', fontFamily: 'JetBrains Mono, monospace' }}>
                  {rCompN.toFixed(0)} N ({rCompKgf.toFixed(0)} kgf)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Cizallamiento L5-S1:</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{rShearN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Torque Flexor (τ_res):</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{tauResNm.toFixed(0)} N·m</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Desventaja mecánica:</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>~10:1 (5 cm vs 50 cm)</b>
              </div>
            </div>
          </HudPanel>

          <SpineCanvas
            trunkAngleDeg={trunkAngleDeg}
            handLoadKg={handLoadKg}
            bodyMassKg={bodyMassKg}
          />
          <div className="prof-controls">
            <span className="badge">2.4 · Columna</span>
            <span>Fm = <b style={{ color: fErectorN > 2500 ? '#b02318' : '#0d6e64' }}>{fErectorN.toFixed(0)} N</b> ({fErectorKgf.toFixed(0)} kgf)</span>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              {/* Presets rápidos de postura */}
              <div style={{ display: 'inline-flex', gap: '1px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {[
                  { label: '0°', val: 0 },
                  { label: '30°', val: 30 },
                  { label: '60°', val: 60 },
                  { label: '90°', val: 90 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setTrunkAngleDeg(item.val)}
                    style={{
                      background: trunkAngleDeg === item.val ? 'var(--teal)' : 'transparent',
                      color: trunkAngleDeg === item.val ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 5px',
                      fontSize: '0.58rem',
                      fontWeight: trunkAngleDeg === item.val ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Ángulo:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={trunkAngleDeg}
                  onChange={(e) => setTrunkAngleDeg(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '24px' }}>{trunkAngleDeg}°</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Carga:</span>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={handLoadKg}
                  onChange={(e) => setHandLoadKg(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{handLoadKg} kg</b>
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
