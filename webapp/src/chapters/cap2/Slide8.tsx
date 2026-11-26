import React, { useState } from 'react';
import CaneCanvas from './CaneCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';
import { G, hipStatics } from './staticsModels';
import { fx } from './ab';

export default function Slide8({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [caneHand, setCaneHand] = useState<'contra' | 'ipsi' | 'none'>('contra');
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [caneForceKg, setCaneForceKg] = useState<number>(15);
  const [bodyMassKg, setBodyMassKg] = useState<number>(90);

  // Modelo del libro (Ecs. 2.29–2.33): N_c en el bastón a 30,5 cm de la línea media.
  const totalWeightN = bodyMassKg * G;
  const caneFrac = caneForceKg / bodyMassKg; // N_c / W_b (el libro: 1/6)
  const base = hipStatics(totalWeightN);
  const hip = hipStatics(totalWeightN, { caneSide: caneHand, caneFrac });
  const fCaneN = hip.Nc;
  const fAbductorN = hip.M;
  const rJointN = hip.R;
  const rBaseN = base.R;
  const reliefPct = ((rBaseN - rJointN) / rBaseN) * 100;

  const handleReset = () => {
    setCaneHand('contra');
    setCaneForceKg(15);
    setBodyMassKg(90);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C2</span>
        <h2 className="mtitle">Uso terapéutico del bastón</h2>
        <span className="msub">¿Por qué el bastón se lleva en la mano CONTRALATERAL a la cadera lesionada?</span>
        <span className="mslide-count">2 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦯</span> Mecánica del bastón contralateral
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'De pie sobre la pierna derecha, el bastón se apoya en el lado izquierdo a $30{,}5\\text{ cm}$ (1 pie) de la línea media y recibe del suelo $N_c = W_b/6$. Equilibrio del cuerpo completo (Ecs. 2.29–2.30):'}
              </p>
              <div className="eq-block">
                {'\\[ N_f = \\tfrac{5}{6}W_b, \\qquad L = \\frac{N_c}{N_f}\\,30{,}5\\text{ cm} = 6{,}1\\text{ cm} \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'El pie derecho se desplaza $L$ hacia la derecha y el brazo de momento de la normal baja de $10{,}8$ a $4{,}7\\text{ cm}$; el CM de la pierna pasa a $0{,}33\\text{ cm}$ a la izquierda de la vertical (Ec. 2.33):'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ (4{,}7)\\tfrac{5}{6}W_b + (0{,}33)(0{,}16\\,W_b) - (6{,}98)\\,M\\sin 70^\\circ = 0 \\;\\Rightarrow\\; M = 0{,}61\\,W_b \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Entonces $R_x = 0{,}21\\,W_b$, $R_y = 1{,}24\\,W_b$, $R = 1{,}26\\,W_b$ y $\\phi = 9{,}5^\\circ$. Con $W_b = 880\\text{ N}$: $M$ baja de $1400$ a $540\\text{ N}$ y $R$ de $2100$ a $1100\\text{ N}$, con solo unos $145\\text{ N}$ sobre el bastón.'}
              </p>
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular las fuerzas de la cadera</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Muestra sobre el modelo cuánto baja la reacción articular <b>R</b> al descargar peso en el bastón.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚠️</span> El efecto principal: el brazo de momento
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-2)' }}>
                {'Con diferencia, la consecuencia principal del bastón es que el brazo de momento de la normal del suelo cae de $10{,}8$ a $4{,}7\\text{ cm}$ porque el pie se desplaza $6{,}1\\text{ cm}$; la menor carga sobre la pierna ($\\tfrac{5}{6}W_b$) influye mucho menos.'}
              </p>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Fuera del libro: con el bastón en la mano del mismo lado el modelo desplaza el pie hacia el otro lado y alarga ese brazo de momento, de modo que $M$ y $R$ aumentan (el visor extrapola la geometría de la Fig. 2.20).'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-8">
              Un efecto muy grande para tan poco apoyo: ≈ $W_b/6$ en el bastón reduce $R$ casi a la mitad. Por eso el bastón se lleva en la mano <b>opuesta</b> a la cadera que duele. Variante (Problemas 2.8–2.9): cargar un peso en el lado izquierdo aumenta los brazos de momento y con ellos $M$ y $R$.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="DESCARGA CON BASTÓN"
            badge={caneHand === 'none' ? 'SIN BASTÓN' : `R ${reliefPct >= 0 ? '−' : '+'}${fx(Math.abs(reliefPct))} %`}
            defaultCollapsed={true}
            footer="💡 Con 15 kg sobre 90 kg (1/6 del peso) el visor reproduce el caso del libro"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga Articular (R):</span>
                <b style={{ color: 'var(--teal)', fontFamily: 'var(--mono)' }}>
                  {fx(rJointN)} N ({fx(rJointN / totalWeightN, 2)} W<sub>b</sub>)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Cambio de R frente a sin bastón:</span>
                <b style={{ color: reliefPct > 0.5 ? 'var(--teal)' : 'var(--blood)' }}>
                  {caneHand === 'none' ? '0 %' : `${reliefPct >= 0 ? '−' : '+'}${fx(Math.abs(reliefPct))} %`}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Normal en el bastón (N<sub>c</sub>):</span>
                <b style={{ color: 'var(--teal-deep)', fontFamily: 'var(--mono)' }}>{fx(fCaneN)} N ({fx(caneFrac * 100)} % W<sub>b</sub>)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Abductores (M):</span>
                <b style={{ color: 'var(--blood)', fontFamily: 'var(--mono)' }}>{fx(fAbductorN)} N ({fx(fAbductorN / totalWeightN, 2)} W<sub>b</sub>)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Desplazamiento del pie (L):</span>
                <b style={{ color: 'var(--teal-deep)', fontFamily: 'var(--mono)' }}>
                  {fx(hip.L, 1)} cm · brazo de N: {fx(hip.dN, 1)} cm
                </b>
              </div>
            </div>
          </HudPanel>

          <CaneCanvas showLabels={showLabels}
            caneHand={caneHand}
            caneForceKg={caneForceKg}
            bodyMassKg={bodyMassKg}
          />
          <div className="prof-controls">
            <span className="badge">§2.3.2 · Bastón</span>
            <span>R = <b style={{ color: 'var(--teal)' }}>{fx(rJointN / totalWeightN, 2)} W<sub>b</sub></b> ({fx(rJointN)} N)</span>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <div style={{ display: 'inline-flex', gap: '1px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                <button
                  type="button"
                  onClick={() => setCaneHand('contra')}
                  style={{
                    background: caneHand === 'contra' ? 'var(--teal)' : 'transparent',
                    color: caneHand === 'contra' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: caneHand === 'contra' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Contralateral
                </button>
                <button
                  type="button"
                  onClick={() => setCaneHand('ipsi')}
                  style={{
                    background: caneHand === 'ipsi' ? '#d97706' : 'transparent',
                    color: caneHand === 'ipsi' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: caneHand === 'ipsi' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Ipsilateral
                </button>
                <button
                  type="button"
                  onClick={() => setCaneHand('none')}
                  style={{
                    background: caneHand === 'none' ? '#b02318' : 'transparent',
                    color: caneHand === 'none' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: caneHand === 'none' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Sin Bastón
                </button>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Apoyo:</span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={caneForceKg}
                  onChange={(e) => setCaneForceKg(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                  disabled={caneHand === 'none'}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{caneForceKg} kg</b>
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
