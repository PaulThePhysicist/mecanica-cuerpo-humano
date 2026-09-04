import React, { Suspense, useState } from 'react';
import KneeCanvas from './KneeCanvas';
import HudPanel from './HudPanel';
import { AnimateButton } from './AnimateButton';
import { useHarmonicClock } from '../cap1/three/useHarmonicClock';
import type { Engine } from './useEngine';

// C3 · Estática de la rodilla (Herman §2.3.3, Figs. 2.23–2.27).
const A_LEVER = 0.048;
const A_LEVER_NOPAT = 0.022;
const B_ARM = 0.22;
const C_ARM = 0.20;
const THETA = (18 * Math.PI) / 180;
const W0 = 45;

export default function SlideKnee({
  isActive,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [betaDeg, setBetaDeg] = useState<number>(45);
  const [ankleLoadN, setAnkleLoadN] = useState<number>(150);
  const [patella, setPatella] = useState<boolean>(true);
  const [showComponents, setShowComponents] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Ciclo de extensión de la rodilla: de casi colgando (β≈82°) a extendida (β≈8°).
  useHarmonicClock({ playing: isAnimating }, (t) => {
    const s = (Math.sin(t * 0.9 - Math.PI / 2) + 1) / 2; // 0→1→0 suave, arranca en β alto
    setBetaDeg(82 - 74 * s);
  });

  const beta = (betaDeg * Math.PI) / 180;
  const a = patella ? A_LEVER : A_LEVER_NOPAT;
  const torqueExt = (B_ARM * ankleLoadN + C_ARM * W0) * Math.cos(beta);
  const M = torqueExt / (a * Math.sin(THETA));
  const rx = M * Math.cos(THETA + beta);
  const ry = M * Math.sin(THETA + beta) - W0 - ankleLoadN;
  const R = Math.hypot(rx, ry);
  const Mnopat = torqueExt / (A_LEVER_NOPAT * Math.sin(THETA));

  const handleReset = () => {
    setIsAnimating(false);
    setBetaDeg(45);
    setAnkleLoadN(150);
    setPatella(true);
    setShowComponents(false);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C3</span>
        <h2 className="mtitle">La rodilla: cuádriceps y rótula</h2>
        <span className="msub">Extensión con carga en el tobillo · La rótula como polea que agranda el brazo de momento</span>
        <span className="mslide-count">3 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦵</span> Equilibrio de la pierna inferior
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'El cuádriceps, a través del tendón rotuliano, sostiene el peso de la pierna ($W_0$) y una carga en el tobillo ($W_1$) durante el ejercicio de extensión:'}
              </p>
              <div className="eq-block">
                {'\\[ M = \\frac{(b\\,W_1 + c\\,W_0)\\,\\cos\\beta}{a\\,\\sin\\theta} \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Con $a \\approx 4{,}8\\text{ cm}$, $b \\approx 22\\text{ cm}$, $c \\approx 20\\text{ cm}$, $\\theta \\approx 18^\\circ$. Las fuerzas resultan enormes: $M$ y $R$ superan varias veces la carga real.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚙️</span> La rótula como polea
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'La rótula separa el tendón del centro articular y aumenta el brazo de momento $a$. Sin rótula, para el mismo torque el cuádriceps debería tirar mucho más fuerte; el coste es la compresión femoropatelar $F_P$:'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ F_P = \\frac{\\cos\\gamma - \\cos\\alpha}{\\cos\\phi}\\,M \\]'}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text">
              Las reacciones tibiofemorales llegan a <b>3–4 veces el peso corporal</b> al caminar y son mucho mayores al subir escaleras o ponerse en cuclillas. La <b>patelectomía</b> obliga al cuádriceps a un sobreesfuerzo permanente por la pérdida del brazo de palanca.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          <HudPanel
            title="BIOMECÁNICA RODILLA"
            badge={`R = ${R.toFixed(0)} N`}
            icon="🦵"
            defaultCollapsed={true}
            footer="💡 Quita la rótula para ver cuánto sube M con el mismo torque"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Cuádriceps (M):</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{M.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Reacción tibiofemoral (R):</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>{R.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo de momento (a):</span>
                <b style={{ color: patella ? '#0d6e64' : '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>
                  {((patella ? A_LEVER : A_LEVER_NOPAT) * 100).toFixed(1)} cm {patella ? '(con rótula)' : '(sin rótula)'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>M sin rótula (mismo τ):</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>{Mnopat.toFixed(0)} N (+{(((Mnopat - M) / M) * 100).toFixed(0)}%)</b>
              </div>
            </div>
          </HudPanel>

          <Suspense fallback={<div className="loading-overlay">Cargando visualización 3D...</div>}>
            {isActive && (
              <KneeCanvas
                betaDeg={betaDeg}
                ankleLoadN={ankleLoadN}
                patella={patella}
                showComponents={showComponents}
              />
            )}
          </Suspense>

          <div className="prof-controls">
            <span className="badge">2.3 · Rodilla</span>
            <span>M = <b style={{ color: '#0d6e64' }}>{M.toFixed(0)} N</b> · R = <b style={{ color: '#b02318' }}>{R.toFixed(0)} N</b></span>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>β pierna:</span>
                <input type="range" min="0" max="90" value={betaDeg} aria-label="Ángulo de la pierna con la horizontal" onChange={(e) => { setIsAnimating(false); setBetaDeg(parseFloat(e.target.value)); }} style={{ width: '58px' }} />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '30px' }}>{betaDeg.toFixed(0)}°</b>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>W₁ tobillo:</span>
                <input type="range" min="0" max="300" step="10" value={ankleLoadN} aria-label="Carga en el tobillo" onChange={(e) => setAnkleLoadN(parseFloat(e.target.value))} style={{ width: '58px' }} />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '38px' }}>{ankleLoadN} N</b>
              </label>
              <button
                type="button"
                onClick={() => setPatella((v) => !v)}
                aria-pressed={patella}
                style={{
                  background: patella ? 'var(--teal)' : '#b02318',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {patella ? '✓ Con rótula' : '✕ Sin rótula'}
              </button>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input type="checkbox" checked={showComponents} onChange={(e) => setShowComponents(e.target.checked)} />
                <span style={{ color: 'var(--ink-2)' }}>Rx, Ry</span>
              </label>
              <AnimateButton playing={isAnimating} onToggle={() => setIsAnimating((a) => !a)} label="Extender" />
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
