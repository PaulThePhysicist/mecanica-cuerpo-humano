import React, { useState } from 'react';
import { C, ca } from './palette';
import SpineCanvas from './SpineCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import { AnimateButton } from './AnimateButton';
import { useHarmonicClock } from '../cap1/three/useHarmonicClock';
import type { Engine } from './useEngine';
import { G, backStatics, TABLE_2_3 } from './staticsModels';
import { fx } from './ab';

export default function Slide9({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [trunkAngleDeg, setTrunkAngleDeg] = useState<number>(60);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [handLoadKg, setHandLoadKg] = useState<number>(0);
  const [bodyMassKg, setBodyMassKg] = useState<number>(90);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Ciclo de levantamiento: el tronco se inclina (α≈78°) y se endereza (α≈8°).
  // Lento (speed 0.6) para leer cómo se dispara la tensión del erector.
  useHarmonicClock({ playing: isAnimating }, (t) => {
    const s = (Math.sin(t * 0.6 - Math.PI / 2) + 1) / 2;
    setTrunkAngleDeg(8 + 70 * s);
  });

  // Modelo del libro (Ecs. 2.41–2.46): θ desde la horizontal = 90° − inclinación.
  const thetaDeg = 90 - trunkAngleDeg;
  const WbN = bodyMassKg * G;
  const back = backStatics(thetaDeg, WbN, handLoadKg * G);
  const fErectorN = back.M;
  const fErectorKgf = fErectorN / G;
  const rCompN = back.R;
  const rCompKgf = rCompN / G;
  const rShearN = back.shear;

  const handleReset = () => {
    setIsAnimating(false);
    setTrunkAngleDeg(60);
    setHandLoadKg(0);
    setBodyMassKg(90);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D1</span>
        <h2 className="mtitle">La columna y el erector de la espina</h2>
        <span className="msub">Flexión y levantamiento · fuerzas sobre la quinta vértebra lumbar (Ecs. 2.41–2.46)</span>
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
                {'La columna tiene 33 vértebras (26 huesos): 7 cervicales, 12 torácicas, 5 lumbares, 5 fusionadas en el sacro y 4 en el coxis. Las curvas torácica y sacra son primarias (posición fetal); la cervical (a los tres meses) y la lumbar (al aprender a caminar) son secundarias. Desviaciones del ángulo lumbosacro de $\\sim 30^\\circ$ pueden doler.'}
              </p>
              <p style={{ fontSize: '.66rem' }}>
                {'Modelo (Fig. 2.41): la columna es una barra rígida a $\\theta$ de la horizontal, articulada en el disco lumbosacro. $W_1 = 0{,}4\\,W_b$ (tronco) actúa a $L/2$; $W_2 = 0{,}2\\,W_b$ (brazos y cabeza, más lo levantado) en $L$; el erector de la columna, a $2L/3$ y $12^\\circ$ de ella:'}
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ \\tau_z = \\frac{2L}{3}\\sin 12^\\circ\\,M - \\frac{L}{2}\\cos\\theta\\,(0{,}4\\,W_b) - L\\cos\\theta\\,(0{,}2\\,W_b) = 0 \\]'}
              </div>
              <div style={{ marginTop: '0.62rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular M, W₁ y W₂</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Etiqueta la fuerza del erector de la columna frente a los dos pesos que debe equilibrar: tronco y brazos, cabeza y carga.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Tabla 2.3 · Fuerzas en unidades de W<sub>b</sub>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem' }}>
                {'Para $\\theta = 30^\\circ$ (flexión profunda): $M = 2{,}5\\,W_b$, $R_x = 2{,}38$, $R_y = 1{,}37$, $\\phi = 30^\\circ$ y $R = 2{,}74\\,W_b$; con $90\\text{ kg}$ ($880\\text{ N}$): $M \\approx 2200\\text{ N}$ y $R \\approx 2400\\text{ N}$. Levantando $0{,}2\\,W_b$ más ($180\\text{ N}$): $M = 3{,}74\\,W_b \\approx 3300\\text{ N}$ y $R = 4{,}07\\,W_b \\approx 3600\\text{ N}$.'}
              </p>
              <table className="data-mini">
                <thead><tr><th>{'$\\theta$'}</th><th>M sin carga</th><th>{'M (+0,2 W'}<sub>b</sub>)</th><th>R sin carga</th><th>{'R (+0,2 W'}<sub>b</sub>)</th></tr></thead>
                <tbody>
                  {TABLE_2_3.map((r) => (
                    <tr key={r.theta} aria-current={Math.round(thetaDeg) === r.theta ? 'true' : undefined} style={Math.round(thetaDeg) === r.theta ? { background: 'var(--teal-tint)' } : undefined}>
                      <td>{r.theta}°</td><td>{fx(r.M0, 2)}</td><td>{fx(r.M1, 2)}</td><td>{fx(r.R0, 2)}</td><td>{fx(r.R1, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '0.62rem' }}>
                Multiplica por 880 N (90 kg). Los brazos de momento de los pesos y del músculo son parecidos, pero el músculo tira casi paralelo a la columna: a cualquier ángulo de flexión su torque es pequeño.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-9">
              Los músculos deben ejercer <b>1100 N más</b> para equilibrar solo <b>180 N más</b>, y la reacción sobre la quinta lumbar crece 1200 N. Por eso nunca se debe doblar la espalda para levantar peso: se levanta con los músculos de las piernas.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="TENSIÓN LUMBAR"
            badge={`M = ${fx(fErectorN / WbN, 2)} Wb`}
            defaultCollapsed={true}
            footer="💡 Los botones θ reproducen las filas de la Tabla 2.3; 18 kg de carga son 0,2 Wb para 90 kg"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Erector de la columna (M):</span>
                <b style={{ color: fErectorN > 2500 ? 'var(--blood)' : 'var(--teal)', fontFamily: 'var(--mono)' }}>
                  {fx(fErectorN)} N ({fx(fErectorN / WbN, 2)} W<sub>b</sub>)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Reacción en el sacro (R):</span>
                <b style={{ color: 'var(--ink)', fontFamily: 'var(--mono)' }}>
                  {fx(rCompN)} N ({fx(rCompN / WbN, 2)} W<sub>b</sub>)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ángulo de R con la horizontal (φ):</span>
                <b style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fx(back.phi)}°</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Pesos W₁ / W₂:</span>
                <b style={{ color: 'var(--teal)', fontFamily: 'var(--mono)' }}>{fx(back.W1)} / {fx(back.W2)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ángulo de la columna (θ):</span>
                <b style={{ color: 'var(--blood)', fontFamily: 'var(--mono)' }}>{fx(thetaDeg)}° de la horizontal</b>
              </div>
            </div>
          </HudPanel>

          <SpineCanvas showLabels={showLabels}
            trunkAngleDeg={trunkAngleDeg}
            handLoadKg={handLoadKg}
            bodyMassKg={bodyMassKg}
          />
          <div className="prof-controls">
            <span className="badge">§2.3.4 · Espalda</span>
            <span>M = <b style={{ color: fErectorN > 2500 ? 'var(--blood)' : 'var(--teal)' }}>{fx(fErectorN)} N</b> · R = {fx(rCompN)} N</span>

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              {/* Presets rápidos de postura */}
              <div style={{ display: 'inline-flex', gap: '1px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {[
                  { label: 'θ 90°', val: 0 },
                  { label: 'θ 80°', val: 10 },
                  { label: 'θ 60°', val: 30 },
                  { label: 'θ 30°', val: 60 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setTrunkAngleDeg(item.val)}
                    style={{
                      background: trunkAngleDeg === item.val ? 'var(--teal)' : 'transparent',
                      color: trunkAngleDeg === item.val ? C.card : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 5px',
                      fontSize: '0.62rem',
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
                <span>θ:</span>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={thetaDeg}
                  aria-label="Ángulo de la columna con la horizontal"
                  onChange={(e) => { setIsAnimating(false); setTrunkAngleDeg(90 - parseFloat(e.target.value)); }}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'var(--mono)', minWidth: '24px' }}>{fx(thetaDeg)}°</b>
              </label>

              <AnimateButton playing={isAnimating} onToggle={() => setIsAnimating((a) => !a)} label="Levantar" />

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
