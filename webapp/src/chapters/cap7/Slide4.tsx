import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">7.2</span>
        <span className="mtitle">Gas ideal, Pascal y Arquímedes</span>
        <span className="msub">Tres leyes que sostienen el cuerpo</span>
        <span className="mslide-count">4 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎈</span> Gas ideal (eq. 7.2)
            </div>
            <div className="card-body">
              <div className="eq-block">{"\\[ P V = n R T \\]"}</div>
              <p>
                El aire inspirado, los gases del tracto digestivo y las burbujas siguen esta ley. La presión de un gas es
                proporcional a su cantidad y temperatura e inversamente proporcional al volumen.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧲</span> Principio de Pascal
            </div>
            <div className="card-body">
              <p>
                Una presión aplicada a un <strong>fluido confinado</strong> se transmite íntegramente a todas las paredes y a
                cada punto:
              </p>
              <div className="eq-block">
                {"\\[ \\Delta P_{\\text{un punto}} = \\Delta P_{\\text{aplicada}} \\]"}
              </div>
              <p>
                En el cuerpo: la presión sistólica llega hasta la última arteriola porque el fluido la transmite; es la base
                del esfigmomanómetro y de la prensa hidráulica.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏊</span> Principio de Arquímedes
            </div>
            <div className="card-body">
              <p>
                Todo cuerpo sumergido recibe un <strong>empuje</strong> igual al peso del fluido desplazado:
              </p>
              <div className="eq-block">
                {"\\[ E = \\rho_{\\text{fluido}} g V_{\\text{sumergido}} \\]"}
              </div>
              <p>
                Si la densidad promedio del cuerpo es menor que la del fluido, <strong>flota</strong>. La grasa (
                {"\\(\\approx 0{,}8\\ \\text{g/cm}^3\\)"}) ayuda a flotar; el hueso ({"\\(\\approx 1{,}5\\text{–}2{,}0\\)"}) se
                hunde. Un aire profundo en los pulmones basta para que la mayoría flote (módulo 8).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              Tres leyes, tres formas de sostener el cuerpo: el gas (respiración, digestión), la transmisión de presión
              (circulación) y el empuje (flotabilidad). En el canvas cambia la densidad del cuerpo: 0,8 flota (grasa), 1,05 se
              hunde (músculo+hueso) — y mira las flechas de Pascal transmitir la presión.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pascal" />
            <div className="prof-controls">
              <span className="badge">leyes</span>
              <label>
                modo{' '}
                <select
                  id="pa_mode"
                  defaultValue={params.pa_mode}
                  onChange={(e) => {
                    engine.setParam('pa_mode', e.target.value as 'pascal' | 'arquimedes');
                    engine.requestDraw();
                  }}
                >
                  <option value="pascal">Pascal</option>
                  <option value="arquimedes">Arquímedes</option>
                </select>
              </label>
              <label>
                densidad{' '}
                <input
                  type="range"
                  id="pa_rho"
                  min="0.6"
                  max="1.3"
                  step="0.01"
                  defaultValue={params.pa_rho}
                  onInput={(e) => {
                    engine.setParam('pa_rho', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="pa_rv">0,90</span>
              </label>
              <span className="readout" id="pa_out">
                E = ρ_agua·g·V
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
