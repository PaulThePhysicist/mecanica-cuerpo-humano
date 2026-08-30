import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="4">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">Bajo el agua y el ojo reducido</span>
        <span className="msub">{"\\(P_\\mathrm{reducido} = 60{,}00\\ \\mathrm{D},\\quad R = 5{,}55\\ \\mathrm{mm}\\)"}</span>
        <span className="mslide-count">10 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🤿</span> Perdemos la interfaz aire–córnea
            </div>
            <div className="card-body">
              <p>
                Bajo el agua (n = 1,333) la primera superficie pasa de 48,35 D a <span className="tag">5,91 D</span>: se
                pierden <strong>42,44 D</strong> y el ojo queda con ~21,90 D. Los rayos ya no convergen en la retina →{' '}
                <strong>imagen borrosa</strong>. Las gafas de bucear re-crean la interfaz de aire.
              </p>
              <div className="eq-block">
                {"\\[ P_{12}^\\mathrm{agua} = \\frac{1{,}3771-1{,}333}{0{,}0078} \\approx 5{,}9\\ \\mathrm{D} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚪</span> El ojo reducido
            </div>
            <div className="card-body">
              <p>
                {"Para muchos cálculos basta una sola superficie esférica: índice \\(n = 4/3\\), radio "}<span className="tag">5,55 mm</span>, potencia <span className="tag">60,00 D</span>, retina a{' '}
                <span className="tag">22,22 mm</span>. Alternativa: una lente efectiva de <strong>f = 17 mm</strong> en
                aire con la retina a 17 mm.
              </p>
              <div className="eq-block">
                <span className="eqno">(11.63)</span>
                {"\\[ P = \\frac{n-1}{R} = \\frac{1{,}333-1}{0{,}00555} = 60\\ \\mathrm{D} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              Cambia el medio: en el aire el foco cae sobre la retina; bajo el agua cae detrás (hipermetropía «acuática»).
              El ojo reducido es el modelo con que estimaremos tamaños de imagen en la retina.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-reduced" className="sim" />
            <div className="prof-controls">
              <span className="badge">ojo reducido</span>
              <label>
                Medio{' '}
                <select
                  id="ag_sel"
                  defaultValue={params.ag_sel}
                  onChange={(e) => {
                    engine.setParam('ag_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Aire (n₁ = 1,000)</option>
                  <option value="1">Agua (n₁ = 1,333)</option>
                </select>
              </label>
              <span className="readout" id="ag_out">
                Aire · P_ojo = 60 D · foco en la retina
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
