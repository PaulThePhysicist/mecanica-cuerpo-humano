import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">7.1</span>
        <span className="mtitle">Las presiones del cuerpo · Tabla 7.1</span>
        <span className="msub">Del oído medio a la vejiga: todo bajo presión</span>
        <span className="mslide-count">2 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📋</span> Presiones típicas (mmHg) · Tabla 7.1
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Compartimento</th>
                    <th>Presión</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Arterial sistólica</td>
                    <td>100–140</td>
                  </tr>
                  <tr>
                    <td>Arterial diastólica</td>
                    <td>60–90</td>
                  </tr>
                  <tr>
                    <td>Capilar arterial / venoso</td>
                    <td>30 / 10</td>
                  </tr>
                  <tr>
                    <td>Venosa típica</td>
                    <td>3–7</td>
                  </tr>
                  <tr>
                    <td>Ojo (ocular)</td>
                    <td>20 (12–23)</td>
                  </tr>
                  <tr>
                    <td>Glaucoma</td>
                    <td>≈ 21–30</td>
                  </tr>
                  <tr>
                    <td>Líquido cefalorraquídeo</td>
                    <td>5–12</td>
                  </tr>
                  <tr>
                    <td>Intratorácica</td>
                    <td>−10</td>
                  </tr>
                  <tr>
                    <td>Vejiga (micción)</td>
                    <td>15–30</td>
                  </tr>
                  <tr>
                    <td>Esqueleto de las piernas, de pie</td>
                    <td>≈ 7600</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩸</span> El gradiente circulatorio
            </div>
            <div className="card-body">
              <p>
                La presión cae ordenadamente a lo largo del árbol vascular: <strong>arterias → capilares → venas</strong>.
                Esa caída es la que empuja la sangre (módulo 4, resistencia).
              </p>
              <p>
                La <span className="tag">intratorácica negativa (−10 mmHg)</span> ayuda al retorno venoso: el tórax
                «aspira» la sangre de regreso al corazón.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚠️</span> Cuando la presión se desvía
            </div>
            <div className="card-body">
              <p>
                <span className="tag">Glaucoma ≈ 21–30 mmHg</span> (vs. ocular normal 20): la presión del humor acuoso
                comprime el nervio óptico. La <span className="tag">ruptura del tímpano</span> ocurre cerca de{' '}
                <span className="tag">120 mmHg</span> de presión en el oído medio.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Esta tabla es un «mapa de presión» del cuerpo que usaremos todo el capítulo. El canvas la grafica en escala
              logarítmica — si no, la pierna (7600) aplasta todo lo demás. La presión no es uniforme: es un gradiente, y la
              vida depende de él.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pressures" />
            <div className="prof-controls">
              <span className="badge">presiones</span>
              <label>
                foco{' '}
                <select
                  id="ps_sel"
                  defaultValue={params.ps_sel}
                  onChange={(e) => {
                    engine.setParam('ps_sel', e.target.value);
                    engine.requestDraw();
                  }}
                >
                  <option value="all">Todas</option>
                  <option value="arterial">Arterial</option>
                  <option value="ocular">Ocular</option>
                  <option value="lcr">Líquido cefalorraquídeo</option>
                  <option value="vejiga">Vejiga</option>
                  <option value="pierna">Piernas de pie</option>
                </select>
              </label>
              <span className="readout" id="ps_out">
                gradiente: 120 → 0 mmHg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
