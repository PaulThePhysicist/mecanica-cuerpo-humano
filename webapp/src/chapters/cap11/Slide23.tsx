import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide23({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="23" data-module="9">
      <div className="module-header">
        <span className="mnum">11 · 9</span>
        <span className="mtitle">Mapa del capítulo: del fotón a la visión</span>
        <span className="msub">{"\\(\\lambda \\to E \\to n \\to P \\to V \\to \\mathrm{retina} \\to \\mathrm{color} \\to \\mathrm{clínica}\\)"}</span>
        <span className="mslide-count">23 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🗺️</span> El hilo conductor
            </div>
            <div className="card-body">
              <p>
                <strong>Recibir</strong> (anatomía: córnea → cristalino → retina) · <strong>Refractar</strong> (Snell,
                superficies, lentes) · <strong>Enfocar</strong> (ojo esquemático 64 D, acomodación) ·{' '}
                <strong>Resolver</strong> (difracción, aberraciones, Snellen) · <strong>Corregir</strong> (miopía,
                hipermetropía, astigmatismo) · <strong>Percibir</strong> (brillo, color, adaptación) ·{' '}
                <strong>Cuidar</strong> (deterioro y riesgo).
              </p>
              <div className="eq-block">
                <span className="eqno">(11.1)</span>
                {"\\[ \\text{fotón} \\to \\text{Snell} \\to \\text{potencia} \\to \\text{agudeza} \\to \\text{color} \\to \\text{clínica} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Datos que conviene recordar
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Visible</td>
                    <td>400–700 nm</td>
                  </tr>
                  <tr>
                    <td>Ojo esquemático</td>
                    <td>64,34 D · f = 20,8 mm</td>
                  </tr>
                  <tr>
                    <td>Ojo reducido</td>
                    <td>60 D · R = 5,55 mm · n = 4/3</td>
                  </tr>
                  <tr>
                    <td>Acomodación joven</td>
                    <td>≈ 4–10 D</td>
                  </tr>
                  <tr>
                    <td>Picos bastones / conos</td>
                    <td>500 / 445 · 535 · 570 nm</td>
                  </tr>
                  <tr>
                    <td>Pico fotópico / escotópico</td>
                    <td>555 / 507 nm</td>
                  </tr>
                  <tr>
                    <td>Agudeza 20/20</td>
                    <td>detalle 1′ de arco</td>
                  </tr>
                  <tr>
                    <td>CFF</td>
                    <td>≤ 60 Hz</td>
                  </tr>
                  <tr>
                    <td>PIO normal</td>
                    <td>15 mmHg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-23">
              Recorre las etapas del diagrama con el selector. Es el mismo mapa mental para resolver problemas del
              capítulo: identificar la superficie, sumar potencias, localizar el foco, y decidir la corrección.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-map" className="sim" />
            <div className="prof-controls">
              <span className="badge">mapa</span>
              <label>
                Etapa{' '}
                <select
                  id="mp_sel"
                  defaultValue={params.mp_sel}
                  onChange={(e) => {
                    engine.setParam('mp_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">1 · Recibir (anatomía)</option>
                  <option value="1">2 · Refractar (Snell)</option>
                  <option value="2">3 · Enfocar (potencias)</option>
                  <option value="3">4 · Resolver (agudeza)</option>
                  <option value="4">5 · Corregir (refracción)</option>
                  <option value="5">6 · Percibir (color)</option>
                  <option value="6">7 · Cuidar (clínica)</option>
                </select>
              </label>
              <span className="readout" id="mp_out">
                Etapa 1 · córnea + cristalino forman la imagen
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
