import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <div className="module-header">
        <span className="mnum">11 · 2</span>
        <span className="mtitle">Ley de Snell y la refracción</span>
        <span className="msub">{"\\(n_1\\sin\\theta_1 = n_2\\sin\\theta_2\\)"}</span>
        <span className="mslide-count">5 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> El cambio de dirección
            </div>
            <div className="card-body">
              <p>Al pasar de un medio a otro, la luz cambia de dirección según los índices:</p>
              <div className="eq-block">
                <span className="eqno">(11.6)</span>
                {"\\[ n_1\\sin\\theta_1 = n_2\\sin\\theta_2 \\]"}
              </div>
              <p>
                {"Para rayos paraxiales (ángulos pequeños, \\(\\sin\\theta\\approx\\theta\\)):"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.7)</span>
                {"\\[ n_1\\,\\theta_1 \\approx n_2\\,\\theta_2 \\]"}
              </div>
              <p>
                La córnea y el cristalino refractan precisamente así:{' '}
                <span className="highlight">cuanto mayor la diferencia de índice, mayor la desviación</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Índices de refracción (Tabla 11.3)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Medio</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Aire</td>
                    <td>1,000</td>
                  </tr>
                  <tr>
                    <td>Agua</td>
                    <td>1,333</td>
                  </tr>
                  <tr>
                    <td>Lágrimas / vítreo</td>
                    <td>≈ 1,336</td>
                  </tr>
                  <tr>
                    <td>Humor acuoso</td>
                    <td>1,3374</td>
                  </tr>
                  <tr>
                    <td>Córnea</td>
                    <td>1,3771</td>
                  </tr>
                  <tr>
                    <td>Cristalino nuclear</td>
                    <td>1,40–1,41</td>
                  </tr>
                  <tr>
                    <td>Plásticos (CR-39 / PC)</td>
                    <td>1,498 / 1,586</td>
                  </tr>
                  <tr>
                    <td>Vidrio crown</td>
                    <td>1,523</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              Cambia el ángulo de incidencia y el índice del segundo medio: el rayo se acerca a la normal al entrar en un
              medio más denso. Al salir del agua al aire (n 1,33 → 1) un rayo casi rasante se dobla bruscamente.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-snell" className="sim" />
            <div className="prof-controls">
              <span className="badge">Snell</span>
              <label>
                θ₁{' '}
                <input
                  type="range"
                  id="sl_th"
                  min="0"
                  max="80"
                  defaultValue={params.sl_th}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('sl_th', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="sl_thv">45°</span>
              </label>
              <label>
                n₂{' '}
                <input
                  type="range"
                  id="sl_n"
                  min="1"
                  max="1.6"
                  defaultValue={params.sl_n}
                  step="0.01"
                  onChange={(e) => {
                    engine.setParam('sl_n', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="sl_nv">1,33</span>
              </label>
              <span className="readout" id="sl_out">
                θ₂ = 32,1° (n₂ = 1,33)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
