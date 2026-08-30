import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <div className="module-header">
        <span className="mnum">10 · 4</span>
        <span className="mtitle">Modelo de dos tubos: vocales y consonantes</span>
        <span className="msub">{"\\(P_r/P_i = (A_1 - A_2)/(A_1 + A_2)\\)"}</span>
        <span className="mslide-count">9 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧩</span> Un cambio de área refleja presión
            </div>
            <div className="card-body">
              <p>
                Si el tracto se aproxima como dos tubos de áreas {"\\(A_1\\)"} y {"\\(A_2\\)"}, el cociente de presiones
                reflejada e incidente en el cambio de sección es
              </p>
              <div className="eq-block">
                <span className="eqno">(10.47)</span>
                {"\\[ \\frac{P_r}{P_i} = \\frac{A_1 - A_2}{A_1 + A_2} \\]"}
              </div>
              <p>
                La reflexión en el cambio de área define cuánta energía vuelve y cuánta sigue: el mismo mecanismo de
                las interfaces de impedancia, pero «geométrico».
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔤</span> De los tubos a las vocales
            </div>
            <div className="card-body">
              <p>
                Una vocal alta anterior (/i/) tiene dos constricciones; una abierta (/a/) es casi un tubo único. La
                diferencia de áreas entre la faringe y la boca genera los formantes.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Vocal</th>
                    <th>A₁/A₂</th>
                    <th>F₁ (Hz)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>/a/</td>
                    <td>≈ 1</td>
                    <td>800</td>
                  </tr>
                  <tr>
                    <td>/i/</td>
                    <td>≈ 3</td>
                    <td>300</td>
                  </tr>
                  <tr>
                    <td>/u/</td>
                    <td>≈ 2</td>
                    <td>350</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              Cambia el cociente de áreas: cuando el tubo 2 es mucho más estrecho que el tubo 1, la reflexión crece y la
              onda transmitida se achica, igual que en la reflexión por impedancia de la slide 3.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-twotube" className="sim" />
            <div className="prof-controls">
              <span className="badge">2 tubos</span>
              <label>
                A₂/A₁{' '}
                <select
                  id="tt_sel"
                  defaultValue={params.tt_sel}
                  onChange={(e) => {
                    engine.setParam('tt_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">A₂ = A₁ (tubo único)</option>
                  <option value="1">A₂ = 0,50 A₁</option>
                  <option value="2">A₂ = 0,25 A₁</option>
                  <option value="3">A₂ = 0,10 A₁</option>
                  <option value="4">A₂ = 0,03 A₁</option>
                </select>
              </label>
              <span className="readout" id="tt_out">
                P_r/P_i = 0 · sin reflexión
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
