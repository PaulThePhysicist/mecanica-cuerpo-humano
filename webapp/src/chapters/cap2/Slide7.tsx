import React, { useState } from 'react';
import HipCanvas from './HipCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';
import { G, hipStatics } from './staticsModels';
import { fx } from './ab';

export default function Slide7({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [bodyMassKg, setBodyMassKg] = useState<number>(90);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [trendelenburg, setTrendelenburg] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Modelo del libro (Ecs. 2.25–2.28): fuerzas sobre la pierna derecha libre.
  const totalWeightN = bodyMassKg * G; // W_b
  const hip = hipStatics(totalWeightN, { abductorFraction: trendelenburg ? 0.25 : 1 });
  const fAbductorN = hip.M;
  const rJointN = hip.R;
  const rJointKgf = rJointN / G;
  const fAbductorKgf = fAbductorN / G;

  const handleReset = () => {
    setBodyMassKg(90);
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
                {'De pie sobre la pierna derecha (buen modelo de la marcha lenta), se aísla la pierna como cuerpo rígido. Actúan cuatro fuerzas: la normal $N = W_b$ del suelo, el peso de la pierna $W_{\\text{leg}} = 0{,}16\\,W_b$, la reacción $\\vec{R}$ del acetábulo sobre la cabeza femoral y la fuerza $\\vec{M}$ de los abductores (tensor de la fascia lata, glúteo menor y glúteo medio, masas 1:2:4), a $70^\\circ$ de la horizontal sobre el trocánter mayor.'}
              </p>
              <div className="eq-block">
                {'\\[ \\begin{aligned} F_x &= M\\cos 70^\\circ - R_x = 0 \\\\ F_y &= M\\sin 70^\\circ - R_y - 0{,}16\\,W_b + W_b = 0 \\end{aligned} \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                {'Eje en el centro de la cabeza femoral ($R$ no da torque): $N$ a $10{,}8\\text{ cm}$, la pierna a $3{,}2\\text{ cm}$ y los abductores a $7{,}0\\text{ cm}$ (Ec. 2.27):'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ M = \\frac{10{,}8 - 0{,}5}{7{,}0\\,\\sin 70^\\circ}\\,W_b = 1{,}57\\,W_b \\]'}
              </div>
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>{'Rotular $W_b$, $M$ y $R$'}</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Pone cifras sobre las fuerzas del apoyo monopodal: peso corporal, tracción de los abductores y reacción en la cabeza femoral.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Carga sobre el cartílago acetabular
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-2)' }}>
                {'Con $M$ en los balances de fuerza: $R_x = M\\cos 70^\\circ = 0{,}54\\,W_b$ y $R_y = M\\sin 70^\\circ + 0{,}84\\,W_b = 2{,}31\\,W_b$:'}
              </p>
              <div className="eq-block">
                {'\\[ R = \\left(R_x^2 + R_y^2\\right)^{1/2} = 2{,}37\\,W_b, \\qquad \\tan\\phi = \\frac{R_x}{R_y} = 0{,}23 \\;\\Rightarrow\\; \\phi = 13^\\circ \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'Para $m_b = 90\\text{ kg}$ ($W_b = 880\\text{ N}$): $M \\simeq 1{,}6\\,W_b \\approx 1400\\text{ N}$ y $R \\simeq 2{,}4\\,W_b \\approx 2100\\text{ N}$. La fuerza en la cadera supera con mucho el peso corporal por los grandes brazos de momento: ahí está el origen de los problemas de cadera.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Tabla 2.2 · Fuerza máxima en la cadera
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead><tr><th>Actividad</th><th>{'$R_{\\max}/W_b$'}</th></tr></thead>
                <tbody>
                  <tr><td>Caminar</td><td>4,8–5,5</td></tr>
                  <tr><td>Caminar lentamente con / sin bastón</td><td>2,2 / 3,4</td></tr>
                  <tr><td>Subir escaleras</td><td>7,2–7,4</td></tr>
                  <tr><td>Bajar escaleras</td><td>7,1</td></tr>
                  <tr><td>Levantarse de una silla</td><td>3,3</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                Fuerzas excesivas y prolongadas desgastan el cartílago; el reemplazo total de cadera sustituye la bola del fémur (aleación de cobalto-cromo o titanio, a menudo fijada con PMMA, «cemento óseo») y el acetábulo (polietileno de peso molecular ultra alto).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-7">
              {'El torque de la normal del suelo ($10{,}8\\text{ cm}\\cdot W_b$) pesa mucho más que el de la pierna ($0{,}5\\text{ cm}\\cdot W_b$). Si los abductores no pueden dar $M = 1{,}57\\,W_b$ (p. ej., glúteo medio débil, '}<b>signo de Trendelenburg</b>{'), no hay equilibrio estático y la pelvis bascula hacia el lado sin apoyo.'}
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="BIOMECÁNICA CADERA"
            badge={trendelenburg ? 'SIN EQUILIBRIO' : `R = ${fx(rJointN / totalWeightN, 2)} W_b`}
            icon="🦴"
            defaultCollapsed={true}
            footer="💡 «Trendelenburg» deja a los abductores con el 25 % de M: sin equilibrio, la pelvis cae"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Reacción Articular (R):</span>
                <b style={{ color: trendelenburg ? '#b02318' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {fx(rJointN)} N ({fx(rJointN / totalWeightN, 2)} W<sub>b</sub>)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Abductores (M):</span>
                <b style={{ color: 'var(--blood)', fontFamily: 'var(--mono)' }}>{fx(fAbductorN)} N ({fx(fAbductorN / totalWeightN, 2)} W<sub>b</sub>)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Peso corporal (N = W<sub>b</sub>):</span>
                <b style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fx(totalWeightN)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ángulo de R con la vertical (φ):</span>
                <b style={{ color: trendelenburg ? '#b02318' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {fx(hip.phi)}°
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazos de palanca:</span>
                <b style={{ fontFamily: 'var(--mono)' }}>10,8 · 3,2 · 7,0 cm</b>
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
            <span>R = <b style={{ color: trendelenburg ? 'var(--blood)' : 'var(--teal)' }}>{fx(rJointN)} N</b> ({fx(rJointN / totalWeightN, 2)} W<sub>b</sub>)</span>

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
