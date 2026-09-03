import React, { Suspense, useState } from 'react';
import AnkleCanvas from './AnkleCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

// C4 · Estática del tobillo — de puntillas (Herman §2.3.3, Figs. 2.28–2.29).
const THETA = (45 * Math.PI) / 180;

export default function SlideAnkle({
  isActive,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [betaDeg, setBetaDeg] = useState<number>(60);
  const [bodyMassKg, setBodyMassKg] = useState<number>(90);
  const [showComponents, setShowComponents] = useState<boolean>(false);

  const g = 9.81;
  const Wb = bodyMassKg * g;
  const beta = (betaDeg * Math.PI) / 180;
  const denom = Math.max(0.16, Math.abs(Math.cos(THETA + beta)));
  const M = (Wb * Math.abs(Math.cos(beta))) / denom;
  // R cierra ΣF = 0:  R = −(N + M), con N = Wb vertical y M a θ de la horizontal.
  const rxN = Math.cos(THETA) * M;
  const ryN = Wb + Math.sin(THETA) * M;
  const R = Math.hypot(rxN, ryN);

  const handleReset = () => {
    setBetaDeg(60);
    setBodyMassKg(90);
    setShowComponents(false);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C4</span>
        <h2 className="mtitle">El tobillo: ponerse de puntillas</h2>
        <span className="msub">Palanca de 2ª clase · Tendón de Aquiles, fulcro metatarsiano y reacción en el astrágalo</span>
        <span className="mslide-count">4 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦶</span> Equilibrio del pie de puntillas
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Al elevarse sobre un pie, el pie gira alrededor de las cabezas de los metatarsianos (fulcro). El tríceps sural, vía tendón de Aquiles sobre el calcáneo, equilibra la normal del suelo $N = W_b$:'}
              </p>
              <div className="eq-block">
                {'\\[ M = W_b\\,\\frac{\\cos\\beta}{\\cos(\\theta+\\beta)}, \\qquad R = W_b\\,\\frac{\\cos\\theta}{\\cos(\\theta+\\beta)} \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Con $\\theta \\approx 45^\\circ$ y $\\beta \\approx 60^\\circ$: $M \\approx 1{,}93\\,W_b$ y $R \\approx 2{,}73\\,W_b$ — ambas muy por encima del peso corporal.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔺</span> Sistema concurrente de tres fuerzas
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'La normal del suelo $N$, la fuerza del Aquiles $M$ y la reacción del astrágalo $R$ forman un sistema concurrente: sus líneas de acción se cruzan en un punto y el triángulo de fuerzas cierra ($\\Sigma\\vec{F} = 0$).'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text">
              El tendón de Aquiles se inserta en el calcáneo <b>por detrás</b> del eje del tobillo: es una palanca de 2ª clase que da ventaja mecánica al caminar, pero la carga articular sigue siendo enorme porque el brazo de la carga es corto. Su rotura anula la flexión plantar activa.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          <HudPanel
            title="BIOMECÁNICA TOBILLO"
            badge={`R = ${(R / Wb).toFixed(2)}·Wb`}
            icon="🦶"
            defaultCollapsed={true}
            footer="💡 Sube β para acercarte a la posición vertical del pie"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Aquiles (M):</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{M.toFixed(0)} N ({(M / Wb).toFixed(2)}·Wb)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Reacción astrágalo (R):</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>{R.toFixed(0)} N ({(R / Wb).toFixed(2)}·Wb)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Peso corporal (Wb):</span>
                <b style={{ color: '#43505c', fontFamily: 'JetBrains Mono, monospace' }}>{Wb.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ángulos:</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>θ = 45° · β = {betaDeg}°</b>
              </div>
            </div>
          </HudPanel>

          <Suspense fallback={<div className="loading-overlay">Cargando visualización 3D...</div>}>
            {isActive && (
              <AnkleCanvas
                betaDeg={betaDeg}
                bodyWeightN={Wb}
                showComponents={showComponents}
              />
            )}
          </Suspense>

          <div className="prof-controls">
            <span className="badge">2.3 · Tobillo</span>
            <span>M = <b style={{ color: '#0d6e64' }}>{M.toFixed(0)} N</b> · R = <b style={{ color: '#b02318' }}>{R.toFixed(0)} N</b></span>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>β pie:</span>
                <input type="range" min="55" max="75" value={betaDeg} aria-label="Ángulo del pie con la horizontal" onChange={(e) => setBetaDeg(parseFloat(e.target.value))} style={{ width: '60px' }} />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '30px' }}>{betaDeg}°</b>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Masa:</span>
                <input type="range" min="40" max="120" value={bodyMassKg} aria-label="Masa corporal" onChange={(e) => setBodyMassKg(parseFloat(e.target.value))} style={{ width: '60px' }} />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{bodyMassKg} kg</b>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input type="checkbox" checked={showComponents} onChange={(e) => setShowComponents(e.target.checked)} />
                <span style={{ color: 'var(--ink-2)' }}>Rx, Ry</span>
              </label>
              <button
                type="button"
                onClick={handleReset}
                style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.62rem', cursor: 'pointer', color: 'var(--ink)' }}
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
