import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">10 · 1</span>
        <span className="mtitle">Ondas sonoras: origen y velocidad</span>
        <span className="msub">{"\\(v = \\sqrt{C/\\rho} \\;|\\; v = \\lambda f\\)"}</span>
        <span className="mslide-count">1 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌊</span> El sonido es una onda de presión
            </div>
            <div className="card-body">
              <p>
                Una vibración mecánica comprime y rarefacta el medio: la onda sonora transporta energía sin transportar
                materia. En el aire a 20 °C la velocidad depende del módulo de compresibilidad {"\\(C\\)"} y la densidad{' '}
                {"\\(\\rho\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.1)</span>
                {"\\[ v = \\sqrt{\\dfrac{C}{\\rho}} \\]"}
              </div>
              <p>
                En un gas ideal, {"\\(v = \\sqrt{\\gamma P/\\rho}\\)"}: a 20 °C y 1 atm,{' '}
                {"\\(v_\\mathrm{aire} \\approx 343\\ \\mathrm{m/s}\\)"}. En los tejidos el sonido viaja mucho más rápido:{' '}
                <span className="tag">≈ 1 540 m/s en tejido blando</span> y <span className="tag">≈ 3 500 m/s en hueso</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📏</span> Frecuencia, longitud de onda y tono
            </div>
            <div className="card-body">
              <p>
                La relación entre velocidad {"\\(v\\)"}, frecuencia {"\\(f\\)"} y longitud de onda {"\\(\\lambda\\)"} es
              </p>
              <div className="eq-block">
                <span className="eqno">(10.3)</span>
                {"\\[ v = \\lambda\\, f \\]"}
              </div>
              <p>
                Un tono de 3 430 Hz en el aire tiene {"\\(\\lambda \\approx 10\\)"} cm; en hueso, {"\\(\\lambda \\approx 1\\)"} m.
                El oído humano percibe tonos entre 20 Hz y 20 kHz.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Medio</th>
                    <th>v (m/s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Aire (20 °C)</td>
                    <td>≈ 343</td>
                  </tr>
                  <tr>
                    <td>Tejido blando</td>
                    <td>≈ 1 540</td>
                  </tr>
                  <tr>
                    <td>Hueso</td>
                    <td>≈ 3 500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              Mueve la frecuencia y cambia el medio con el selector: la misma onda se estira o comprime según la velocidad
              de propagación. En hueso una nota audible de 1 kHz mide 3,5 m de longitud de onda.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-wave" className="sim" />
            <div className="prof-controls">
              <span className="badge">onda</span>
              <label>
                Frecuencia{' '}
                <input
                  type="range"
                  id="wv_f"
                  min="200"
                  max="1600"
                  defaultValue={params.wv_f}
                  step="10"
                  onChange={(e) => {
                    engine.setParam('wv_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="wv_fv">600 Hz</span>
              </label>
              <label>
                Medio{' '}
                <select
                  id="wv_med"
                  defaultValue={params.wv_med}
                  onChange={(e) => {
                    engine.setParam('wv_med', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Aire (343 m/s)</option>
                  <option value="1">Tejido blando (1 540 m/s)</option>
                  <option value="2">Hueso (3 500 m/s)</option>
                </select>
              </label>
              <span className="readout" id="wv_out">
                λ (aire, 600 Hz) = 57 cm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
