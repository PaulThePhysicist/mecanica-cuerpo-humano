import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">6.1</span>
        <span className="mtitle">Unidades de potencia y conducción de calor</span>
        <span className="msub">Vatios, calorías y la ley de Fourier</span>
        <span className="mslide-count">2 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔢</span> Potencias del cuerpo · Tabla 6.1
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Equivalencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vatio (W)</td>
                    <td>1 J/s</td>
                  </tr>
                  <tr>
                    <td>100 W</td>
                    <td>1,43 kcal/min</td>
                  </tr>
                  <tr>
                    <td>1 hp</td>
                    <td>746 W = 642 kcal/h</td>
                  </tr>
                  <tr>
                    <td>Caloría (cal)</td>
                    <td>4,184 J</td>
                  </tr>
                </tbody>
              </table>
              <p>
                La <strong>tasa metabólica basal</strong> de una persona de 70 kg es ≈ <span className="tag">81 W</span> — del orden de una
                bombilla incandescente de 100 W.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌡️</span> La conducción: ley de Fourier
            </div>
            <div className="card-body">
              <p>
                {"El flujo de calor por conducción es proporcional a la conductividad térmica \\(K\\) y al gradiente de temperatura:"}
              </p>
              <div className="eq-block">
                {"\\[ -\\frac{1}{A}\\frac{dQ}{dt} = K\\frac{dT}{dx} \\qquad \\text{(eq. 6.6)} \\]"}
              </div>
              <p>
                {"Con un espesor \\(d\\) y un coeficiente \\(h = K/d\\), se escribe "}<span className="tag">{"\\((1/A)dQ/dt = h\\,\\Delta T\\)"}</span>
                {" (eq. 6.7) — la misma forma que usaremos para radiación y convección."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔥</span> Las máquinas son más eficientes
            </div>
            <div className="card-body">
              <p>
                {"Una máquina térmica entre \\(T_c = 293\\text{ K}\\) y \\(T_h = 310\\text{ K}\\) tiene una eficiencia de Carnot máxima:"}
              </p>
              <div className="eq-block">
                {"\\[ \\varepsilon = 1 - \\frac{T_c}{T_h} \\approx 5{,}5\\,\\% \\]"}
              </div>
              <p>
                El cuerpo «logra» ≈ <span className="highlight">25 %</span>: la maquinaria muscular trabaja con un mecanismo distinto
                (el ATP), no con un motor de calor entre dos reservorios.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Dato para el aula: el cuerpo humano «es» una bombilla de ~80–100 W. Juega con el grosor del aislante en el canvas: el
              aire quieto es un pésimo conductor (K pequeñísimo) — por eso la ropa abriga atrapando aire, no por el tejido en sí.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-heat" className="sim" />
            <div className="prof-controls">
              <span className="badge">conducción</span>
              <label>
                material{' '}
                <select
                  id="he_mat"
                  defaultValue={params.he_mat}
                  onChange={(e) => {
                    engine.setParam('he_mat', e.target.value);
                    engine.requestDraw();
                  }}
                >
                  <option value="0.009246">Aire · 0,009</option>
                  <option value="0.0796">Algodón · 0,080</option>
                  <option value="0.19">Grasa · 0,190</option>
                  <option value="0.335">Piel fría · 0,335</option>
                  <option value="0.642">Músculo · 0,642</option>
                </select>
              </label>
              <label>
                grosor{' '}
                <input
                  type="range"
                  id="he_d"
                  min="1"
                  max="20"
                  step="1"
                  defaultValue={params.he_d}
                  onChange={(e) => {
                    engine.setParam('he_d', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="he_dv">{params.he_d} mm</span>
              </label>
              <span className="readout" id="he_out">
                Q/A ≈ 2153 W/m²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
