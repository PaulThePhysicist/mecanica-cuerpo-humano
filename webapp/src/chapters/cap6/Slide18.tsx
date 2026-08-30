import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="18" data-module="7">
      <div className="module-header">
        <span className="mnum">6.6</span>
        <span className="mtitle">Pérdida por radiación</span>
        <span className="msub">La ley de Stefan–Boltzmann y el pico de Planck</span>
        <span className="mslide-count">18 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌅</span> Radiación de cuerpo negro
            </div>
            <div className="card-body">
              <p>
                {"El flujo total emitido depende de \\(T^4\\) (ley de Stefan):"}
              </p>
              <div className="eq-block">
                {"\\[ R = \\varepsilon\\sigma T^4 \\qquad \\sigma = 5{,}67\\times 10^{-8}\\ \\text{W/m}^2\\text{-K}^4 \\qquad \\text{(eq. 6.39)} \\]"}
              </div>
              <p>
                {"La emisión de la piel a 34 °C (307 K) es de "}<span className="tag">505 W/m²</span>{" (ε = 1). El pico del espectro cae en la "}
                <strong>ley de Wien</strong>:
              </p>
              <div className="eq-block">
                {"\\[ \\lambda_{\\text{pico}} (\\mu\\text{m}) = \\frac{2898}{T (\\text{K})} \\qquad \\text{(eq. 6.38)} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> El balance radiativo (eqs. 6.41–6.44)
            </div>
            <div className="card-body">
              <p>
                La piel emite <span className="tag">932 W</span> (1,85 m² × 505) y recibe de la habitación a 24 °C (297 K){' '}
                <span className="tag">816 W</span>:
              </p>
              <div className="eq-block">
                {"\\[ -\\Big(\\frac{dQ}{dt}\\Big)_r = 932 - 816 = 116\\ \\text{W} \\]"}
              </div>
              <p>
                {"Linealizada (eq. 6.53): \\(-\\dot{Q}_r \\approx h_r A\\,(T_{\\text{skin}} - T_{\\text{room}})\\) con "}
                <span className="tag">{"\\(h_r = 5{,}6\\text{ kcal/m²-h-°C}\\)"}</span>. El cuerpo humano y las paredes irradian
                en el <strong>infrarrojo medio (≈ 10 μm)</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🪞</span> Emisividad · Tabla 6.38
            </div>
            <div className="card-body">
              <p>
                La <strong>piel humana</strong> tiene ε ≈ <span className="tag">0,95–0,99</span> en infrarrojo; el papel de aluminio ≈{' '}
                <span className="tag">0,08</span> (por eso la manta térmica refleja). Al aire libre se suman el sol, el cielo y el
                suelo (Tablas 6.39–6.41).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              El pico de Planck a 300 K está en 10 μm: la termografía «ve» esa banda. La red a T⁴ explica por qué una pared a 0 °C
              enfría más que el aire a 24 °C: la potencia es muy sensible a la temperatura absoluta.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-rad" className="sim" />
            <div className="prof-controls">
              <span className="badge">radiación</span>
              <label>
                T ambiente{' '}
                <input
                  type="range"
                  id="ra_t"
                  min="0"
                  max="40"
                  step="1"
                  defaultValue={params.ra_t}
                  onChange={(e) => {
                    engine.setParam('ra_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ra_tv">{params.ra_t} °C</span>
              </label>
              <span className="readout" id="ra_out">
                pérdida neta ≈ 116 W
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
