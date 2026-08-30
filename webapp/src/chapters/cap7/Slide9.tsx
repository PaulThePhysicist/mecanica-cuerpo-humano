import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="9" data-module="3">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">El Venturi y la estenosis</span>
        <span className="msub">Medir el flujo por la caída de presión</span>
        <span className="mslide-count">9 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> Ecuaciones del Venturi
            </div>
            <div className="card-body">
              <p>En la garganta de área {"\\(A_2\\)"} la velocidad sube (continuidad) y la presión cae (Bernoulli):</p>
              <div className="eq-block">
                {"\\[ u_2 = \\frac{A_1}{A_2}\\, u_1 \\qquad \\text{(eq. 7.15)} \\]"}
              </div>
              <div className="eq-block">
                {
                  "\\[ P_2 - P_1 = \\frac{1}{2}\\rho u_1^2 \\left[ 1 - \\left(\\frac{A_1}{A_2}\\right)^2 \\right] \\qquad \\text{(eq. 7.16–7.18)} \\]"
                }
              </div>
              <p>
                Medir {"\\(P_2 - P_1\\)"} da el caudal <em>sin</em> cortar el vaso: el principio del medidor de Venturi.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩸</span> La estenosis del vaso
            </div>
            <div className="card-body">
              <p>
                En una <strong>estenosis</strong> (placa que estrecha una arteria) el mismo intercambio ocurre: la
                velocidad sube, la presión local <strong>cae</strong>. El efecto Venturi puede hacer que la presión en la
                estenosis baje de la del exterior.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌀</span> Riesgo de colapso
            </div>
            <div className="card-body">
              <p>
                Si la presión interna cae por debajo de la externa, el vaso <strong>se comprime</strong>: el flujo se vuelve
                pulsátil e intermitente. Es la física detrás de los soplos y de por qué las estenosis severas rompen el flujo
                suave.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              El mismo dibujo del Venturi sirve de estenosis: cambia solo la palabra. Sube el estrechamiento en el canvas: la
              presión en la garganta se hunde y, a estenosis extremas, cruza la línea del cero relativo — ese es el colapso del
              vaso.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-stenosis" />
            <div className="prof-controls">
              <span className="badge">estenosis</span>
              <label>
                % estenosis{' '}
                <input
                  type="range"
                  id="st_s"
                  min="0"
                  max="90"
                  step="1"
                  defaultValue={params.st_s}
                  onInput={(e) => {
                    engine.setParam('st_s', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="st_sv">60 %</span>
              </label>
              <span className="readout" id="st_out">
                caída de presión en la placa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
