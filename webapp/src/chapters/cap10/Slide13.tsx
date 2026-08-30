import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="5">
      <div className="module-header">
        <span className="mnum">10 · 5</span>
        <span className="mtitle">El oído medio: adaptador de impedancias</span>
        <span className="msub">
          {"\\(17\\times\\ \\text{área} \\cdot 1{,}3\\times\\ \\text{palanca} \\approx 22\\times\\ (27\\ \\mathrm{dB})\\)"}
        </span>
        <span className="mslide-count">13 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔧</span> Amplificación por área y palanca
            </div>
            <div className="card-body">
              <p>
                La membrana timpánica (~55 mm² efectiva) concentra la fuerza sobre el estribo (~3,2 mm²): ganancia por
                área de ~17×. A eso se suma la palanca de los huesecillos (~1,3×). Total ≈ 22× en fuerza, es decir,
              </p>
              <div className="eq-block">
                <span className="eqno">(10.53)</span>
                {"\\[ \\frac{F_\\mathrm{estribo}}{F_\\mathrm{tímpano}} \\approx 17 \\times 1{,}3 \\approx 22 \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(10.54)</span>
                {"\\[ 20 \\log_{10}(22) \\approx 27\\ \\mathrm{dB} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📊</span> Ganancia selectiva
            </div>
            <div className="card-body">
              <p>
                La ganancia del oído medio no es plana: es máxima (~27 dB) en 0,8–3 kHz y cae hacia los extremos. Esta
                selectividad contribuye a la forma de U del campo auditivo.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Mecanismo</th>
                    <th>Factor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Área tímpano/estribo</td>
                    <td>17×</td>
                  </tr>
                  <tr>
                    <td>Palanca de huesecillos</td>
                    <td>1,3×</td>
                  </tr>
                  <tr>
                    <td>Ganancia total</td>
                    <td>22× (27 dB)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Mueve los dos controles: la ganancia por área es la que domina. Con valores reales (17× y 1,3×) llegas a los
              27 dB: eso compensa la reflexión del 99,9 % en la ventana oval.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-middleear" className="sim" />
            <div className="prof-controls">
              <span className="badge">oído medio</span>
              <label>
                Ganancia área{' '}
                <input
                  type="range"
                  id="me_ae"
                  min="1"
                  max="25"
                  defaultValue={params.me_ae}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('me_ae', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="me_aev">17,0×</span>
              </label>
              <label>
                Ganancia palanca{' '}
                <input
                  type="range"
                  id="me_l"
                  min="1"
                  max="3"
                  defaultValue={params.me_l}
                  step="0.05"
                  onChange={(e) => {
                    engine.setParam('me_l', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="me_lv">1,30×</span>
              </label>
              <span className="readout" id="me_out">
                Total 22,1× → 26,9 dB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
