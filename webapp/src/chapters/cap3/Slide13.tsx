import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="5">
      <div className="module-header">
        <span className="mnum">3.8</span>
        <span className="mtitle">Potencia del lanzamiento</span>
        <span className="msub">P = τΩ: cuánta potencia genera el brazo</span>
        <span className="mslide-count">13 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Potencia rotacional
            </div>
            <div className="card-body">
              <p>La potencia de un movimiento rotatorio es el producto del torque por la velocidad angular:</p>
              <div className="eq-block">
                {"\\[ P = \\tau\\,\\Omega \\]"}
              </div>
              <p>
                {"Para el caso <strong>c</strong> del lanzamiento: \\(\\tau = 36{,}45\\ \\text{N·m}\\), \\(\\Omega_{\\text{prom}} = 15{,}7\\ \\text{rad/s}\\):"}
              </p>
              <div className="eq-block">
                {"\\[ P_{\\text{prom}} = 36{,}45 \\times 15{,}7 \\approx 570\\ \\text{W} = 0{,}76\\ \\text{hp} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚀</span> El pico de potencia
            </div>
            <div className="card-body">
              <p>{"Con la velocidad angular máxima \\(\\Omega_{\\max} = 31{,}4\\ \\text{rad/s}\\):"}</p>
              <div className="eq-block">
                {"\\[ P_{\\max} = 36{,}45 \\times 31{,}4 \\approx 1140\\ \\text{W} = 1{,}5\\ \\text{hp} \\]"}
              </div>
              <p>En general el lanzamiento suma las potencias de cada segmento:</p>
              <div className="eq-block">
                {"\\[ P = \\sum_k \\tau_k \\Omega_k \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Un caballo de fuerza por un brazo humano: la potencia instantánea de un lanzamiento rivaliza con la de una
              aspiradora. Comparación del libro: pitcher (pelota de 0,146 kg, 90–100 mph) vs quarterback (pelota de 0,42 kg,
              50–60 mph).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-power" className="sim" />
            <div className="prof-controls">
              <span className="badge">P = τΩ</span>
              <label>
                Ω{' '}
                <input
                  type="range"
                  id="pw_om"
                  min="5"
                  max="35"
                  step="0.1"
                  defaultValue={params.pw_om}
                  onChange={(e) => {
                    engine.setParam('pw_om', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="pw_out">
                P = 570 W
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
