import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="3" data-module="1">
      <div className="module-header">
        <span className="mnum">10 · 2</span>
        <span className="mtitle">Impedancia acústica y reflexión en interfaces</span>
        <span className="msub">{"\\(Z = \\rho v,\\quad R = \\big((Z_2 - Z_1)/(Z_1 + Z_2)\\big)^{2}\\)"}</span>
        <span className="mslide-count">3 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧭</span> La impedancia gobierna la entrega de energía
            </div>
            <div className="card-body">
              <p>
                La impedancia acústica {"\\(Z = \\rho v\\)"} (rayl = kg·m⁻²·s⁻¹) mide la «resistencia» al paso de la
                onda. El aire tiene <span className="tag">Z ≈ 413 rayl</span>; los tejidos,{' '}
                <span className="tag">{'Z ≈ 1,5×10⁶ rayl'}</span>. En una interfaz, la fracción de intensidad reflejada
                es
              </p>
              <div className="eq-block">
                <span className="eqno">(10.31)</span>
                {"\\[ R = \\left(\\frac{Z_2 - Z_1}{Z_1 + Z_2}\\right)^{2} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👂</span> El oído «derrota» la gran reflexión
            </div>
            <div className="card-body">
              <p>
                Sin el oído medio, el 99,9 % de la energía se reflejaría en la interfaz aire–líquido de la cóclea. Los
                huesecillos y la membrana timpánica son un <strong>adaptador de impedancias</strong> entre el aire y el
                líquido del oído interno.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Tabla 10.5 · interfaz</th>
                    <th>R (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Aire → músculo</td>
                    <td>98,01</td>
                  </tr>
                  <tr>
                    <td>Hueso → músculo</td>
                    <td>41,23</td>
                  </tr>
                  <tr>
                    <td>Tejido blando → pulmón</td>
                    <td>63,64</td>
                  </tr>
                  <tr>
                    <td>Grasa → músculo</td>
                    <td>1,08</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              La reflexión entre músculo y hueso es grande (41 %); la del aire a músculo es enorme (98 %). Por eso el
              ultrasonido diagnóstico necesita gel y por eso la cóclea necesita el adaptador del oído medio.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-impedance" className="sim" />
            <div className="prof-controls">
              <span className="badge">Z</span>
              <label>
                Interfaz{' '}
                <select
                  id="im_sel"
                  defaultValue={params.im_sel}
                  onChange={(e) => {
                    engine.setParam('im_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Agua → tejido blando</option>
                  <option value="1">Grasa → músculo</option>
                  <option value="2">Hueso → músculo</option>
                  <option value="3">Tejido blando → hueso</option>
                  <option value="4">Tejido blando → pulmón</option>
                  <option value="5">Aire → músculo</option>
                  <option value="6">Aire → agua</option>
                </select>
              </label>
              <span className="readout" id="im_out">
                Agua→tejido blando: R = 0,23 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
