import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">7.1</span>
        <span className="mtitle">Presión hidrostática y el manómetro</span>
        <span className="msub">La presión crece con la profundidad del fluido</span>
        <span className="mslide-count">1 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🕳️</span> La ecuación del manómetro
            </div>
            <div className="card-body">
              <p>
                La presión a una profundidad {"\\(h\\)"} en un fluido de densidad {"\\(\\rho\\)"} es la presión de referencia
                más el peso de la columna:
              </p>
              <div className="eq-block">
                {"\\[ P = P_{\\text{ref}} + \\rho g h \\qquad \\text{(eq. 7.1)} \\]"}
              </div>
              <p>
                Un <strong>manómetro de tubo en U</strong> (Fig. 7.1) mide esa columna:{" "}
                {"\\(P_{\\text{gas}} - P_{\\text{atm}} = \\rho g h\\)"}. El <strong>esfigmomanómetro</strong> usa la misma
                idea, con una columna de mercurio (Fig. 7.2).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫀</span> Unidades fisiológicas
            </div>
            <div className="card-body">
              <p>
                Las presiones del cuerpo se reportan en <span className="tag">mmHg</span> (torr):{' '}
                <span className="tag">1 atm = 760 mmHg ≈ 101 kPa</span>, <span className="tag">1 mmHg ≈ 133 Pa</span>. En el
                riñón, la vejiga y el pulmón se usa el <span className="tag">cmH₂O</span>:{' '}
                <span className="tag">1 cmH₂O = 0,738 mmHg</span>.
              </p>
              <p>
                Presión arterial típica: <span className="tag">120/80 mmHg</span>. El corazón debe empujar contra la columna
                hidrostática de la sangre.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦵</span> La columna que soportamos
            </div>
            <div className="card-body">
              <p>
                De pie, la sangre en las piernas siente la presión hidrostática de la columna que la separa del corazón:{' '}
                <span className="tag">≈ 7600 mmHg ≈ 10 atm</span> en el esqueleto de las piernas (Tabla 7.1).
              </p>
              <p>
                El gradiente hidrostático explica por qué conviene elevar las piernas para drenar las varices, y por qué el
                cerebro, más alto, recibe presiones menores.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              Todo el capítulo arranca de esta columna de fluido. En el canvas sube la profundidad y cambia el fluido: cada
              líquido con su densidad pesa distinto a la misma altura. Regla para el aula: cada 10 m de agua ≈ 1 atm ≈ 760 mmHg.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-manometer" />
            <div className="prof-controls">
              <span className="badge">manómetro</span>
              <label>
                fluido{' '}
                <select
                  id="mn_rho"
                  defaultValue={params.mn_rho}
                  onChange={(e) => {
                    engine.setParam('mn_rho', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                >
                  <option value="1000">Agua · 1000</option>
                  <option value="1060">Sangre · 1060</option>
                  <option value="13600">Mercurio · 13600</option>
                </select>
              </label>
              <label>
                h{' '}
                <input
                  type="range"
                  id="mn_h"
                  min="0"
                  max="120"
                  step="1"
                  defaultValue={params.mn_h}
                  onInput={(e) => {
                    engine.setParam('mn_h', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="mn_hv">40 cm</span>
              </label>
              <span className="readout" id="mn_out">
                ρgh = 53 300 Pa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
