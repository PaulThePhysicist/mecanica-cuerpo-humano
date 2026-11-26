import React, { Suspense, useState } from 'react';
import { C, ca } from './palette';
import KneeCanvas from './KneeCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import { AnimateButton } from './AnimateButton';
import { useHarmonicClock } from '../cap1/three/useHarmonicClock';
import type { Engine } from './useEngine';
import { KNEE, kneeStatics } from './staticsModels';
import { fx } from './ab';

// C3 · Estática de la rodilla (Herman §2.3.3, Figs. 2.23–2.27).
// Parámetros del libro: a = 12 cm, b = 22 cm, c = 50 cm, W₁ = 150 N, W₀ = 100 N, θ = 15°.
const A_LEVER = KNEE.a / 100;
const A_LEVER_NOPAT = 0.055; // ilustrativo: el libro no da el brazo sin rótula

export default function SlideKnee({
  isActive,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [betaDeg, setBetaDeg] = useState<number>(45);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [ankleLoadN, setAnkleLoadN] = useState<number>(KNEE.W0);
  const [patella, setPatella] = useState<boolean>(true);
  const [showComponents, setShowComponents] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Ciclo de extensión de la rodilla: de casi colgando (β≈82°) a extendida (β≈8°).
  useHarmonicClock({ playing: isAnimating }, (t) => {
    const s = (Math.sin(t * 0.9 - Math.PI / 2) + 1) / 2; // 0→1→0 suave, arranca en β alto
    setBetaDeg(82 - 74 * s);
  });

  // Ecs. 2.34–2.36 con W₀ = pesa del tobillo (control) y W₁ = 150 N (pierna).
  const a = patella ? A_LEVER : A_LEVER_NOPAT;
  const ks = kneeStatics(betaDeg, ankleLoadN, a * 100);
  const M = ks.M;
  const R = ks.R;
  const Mnopat = kneeStatics(betaDeg, ankleLoadN, A_LEVER_NOPAT * 100).M;

  const handleReset = () => {
    setIsAnimating(false);
    setBetaDeg(45);
    setAnkleLoadN(KNEE.W0);
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
                {'La rodilla son dos articulaciones: la tibiofemoral (cóndilos del fémur y tibia, separados por los meniscos) y la patelofemoral (rótula sobre los cóndilos). El cuádriceps llega a la tibia por tendón del cuádriceps → rótula → tendón patelar. Con una pesa $W_0$ en el tobillo, el peso de la pierna $W_1$ y la pierna a $\\beta$ de la horizontal (Figs. 2.23–2.25):'}
              </p>
              <div className="eq-block">
                {'\\[ M = \\frac{(b\\,W_1 + c\\,W_0)\\cos\\beta}{a\\sin\\theta}, \\quad R_x = M\\cos(\\theta+\\beta), \\quad R_y = M\\sin(\\theta+\\beta) - W_0 - W_1 \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Datos del libro: $a = 12$, $b = 22$, $c = 50\\text{ cm}$, $W_1 = 150$, $W_0 = 100\\text{ N}$, $\\theta = 15^\\circ$, $\\beta = 45^\\circ$. El texto imprime $M = 1381\\text{ N}$ y $R = 1171\\text{ N}$; con esos mismos datos la Ec. 2.34 da $M \\approx 1890\\text{ N}$ y $R \\approx 1680\\text{ N}$ (el visor calcula con la ecuación; $R = 1171$ sí es coherente con $M = 1381$). En ambos casos: fuerzas enormes.'}
              </p>
              <div style={{ marginTop: '0.62rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular M, W₀ y R</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Etiqueta la tracción del cuádriceps por el tendón patelar, la pesa del tobillo y la reacción tibiofemoral.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚙️</span> La rótula como polea
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'La rótula funciona como polea: aumenta el brazo de momento $a$ y con él el torque (Fig. 2.26). Su equilibrio entre la reacción de los cóndilos, el tendón patelar y el tendón del cuádriceps (Fig. 2.27) da la compresión sobre la rótula y su ángulo:'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ F_P = \\frac{\\cos\\gamma - \\cos\\alpha}{\\cos\\phi}\\,M, \\qquad \\phi = \\arctan\\left(\\frac{\\sin\\alpha - \\sin\\gamma}{\\cos\\gamma - \\cos\\alpha}\\right) \\]'}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text">
              Las reacciones en la rodilla son de <b>∼ 3–4 W<sub>b</sub></b> durante la marcha y mucho mayores al subir escaleras; la posición en cuclillas (subir, bajar, saltar) se trata en los Problemas 2.22–2.25. El botón «sin rótula» usa un brazo ilustrativo de 5,5 cm para mostrar por qué la polea importa.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          <HudPanel
            title="BIOMECÁNICA RODILLA"
            badge={`R = ${R.toFixed(0)} N`}
            defaultCollapsed={true}
            footer="💡 Quita la rótula para ver cuánto sube M con el mismo torque"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Cuádriceps (M):</span>
                <b style={{ color: C.teal, fontFamily: 'JetBrains Mono, monospace' }}>{M.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Reacción tibiofemoral (R):</span>
                <b style={{ color: C.blood, fontFamily: 'JetBrains Mono, monospace' }}>{R.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo de momento (a):</span>
                <b style={{ color: patella ? 'var(--teal)' : 'var(--blood)', fontFamily: 'var(--mono)' }}>
                  {fx((patella ? A_LEVER : A_LEVER_NOPAT) * 100, 1)} cm {patella ? '(libro)' : '(sin rótula, ilustrativo)'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>M sin rótula (mismo τ):</span>
                <b style={{ color: C.blood, fontFamily: 'JetBrains Mono, monospace' }}>{Mnopat.toFixed(0)} N (+{(((Mnopat - M) / M) * 100).toFixed(0)}%)</b>
              </div>
            </div>
          </HudPanel>

          <Suspense fallback={<div className="loading-overlay">Cargando visualización 3D...</div>}>
            {isActive && (
              <KneeCanvas showLabels={showLabels}
                betaDeg={betaDeg}
                ankleLoadN={ankleLoadN}
                patella={patella}
                showComponents={showComponents}
              />
            )}
          </Suspense>

          <div className="prof-controls">
            <span className="badge">§2.3.3 · Rodilla</span>
            <span>M = <b style={{ color: C.teal }}>{M.toFixed(0)} N</b> · R = <b style={{ color: C.blood }}>{R.toFixed(0)} N</b></span>

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>β pierna:</span>
                <input type="range" min="0" max="90" value={betaDeg} aria-label="Ángulo de la pierna con la horizontal" onChange={(e) => { setIsAnimating(false); setBetaDeg(parseFloat(e.target.value)); }} style={{ width: '58px' }} />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '30px' }}>{betaDeg.toFixed(0)}°</b>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>W₀ tobillo:</span>
                <input type="range" min="0" max="300" step="10" value={ankleLoadN} aria-label="Carga en el tobillo" onChange={(e) => setAnkleLoadN(parseFloat(e.target.value))} style={{ width: '58px' }} />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '38px' }}>{ankleLoadN} N</b>
              </label>
              <button
                type="button"
                onClick={() => setPatella((v) => !v)}
                aria-pressed={patella}
                style={{
                  background: patella ? 'var(--teal)' : C.blood,
                  color: C.card,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {patella ? 'Con rótula' : 'Sin rótula'}
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
