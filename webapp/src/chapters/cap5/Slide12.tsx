import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="12" data-module="5">
      <div className="module-header">
        <span className="mnum">5.6</span>
        <span className="mtitle">Potencia muscular y el modelo de dos elementos</span>
        <span className="msub">El pico de potencia… y los engranajes de la bici</span>
        <span className="mslide-count">12 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> La potencia generada
            </div>
            <div className="card-body">
              <p>Con {"\\(P=Fv\\)"}:</p>
              <div className="eq-block">
                {"\\[ P(v)=T(v)\\,v=v\\,\\frac{b\\,T_{\\text{max}}-a\\,v}{v+b} \\qquad\\text{(5.23)} \\]"}
              </div>
              <p>
                Presenta un pico en <span className="tag">v ≈ 0,3 v_max</span> (con T ≈ 0,3 T_max), donde{' '}
                <span className="highlight">P ≈ 0,1 T_max·v_max</span>.
              </p>
              <p>
                Las <strong>bicicletas usan cambios</strong> para mantener la velocidad de acortamiento muscular cerca de
                ese pico — igual que los engranajes de un coche mantienen las rpm cerca del torque máximo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔗</span> El modelo de dos elementos
            </div>
            <div className="card-body">
              <p>
                La curva de Hill describe el <strong>elemento contráctil</strong>. En el modelo de dos elementos (Fig. 5.15
                sin amortiguador), el resorte elástico está en serie y {"\\(L = x_{T1}+x_{T2}\\)"},{' '}
                {"\\(v = -dx_{T1}/dt\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ \\frac{dT}{dt}=k\\left[\\frac{dL}{dt}+\\frac{b\\,(T_{\\text{max}}-T)}{T+a}\\right] \\qquad\\text{(5.24)} \\]"}
              </div>
              <p>
                Solo válida si {"\\(T_{\\text{max}}\\)"} no cambia durante el acortamiento (pequeñas contracciones cerca
                del pico de tensión-longitud).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚠️</span> Límites del modelo
            </div>
            <div className="card-body">
              <p>
                Los músculos reales <strong>no mantienen velocidad cero ni longitud constante</strong>: la respuesta
                depende de ambas (Fig. 5.28). Los modelos simples de movimiento asumen solo una — longitud (velocidad lenta)
                o velocidad (longitud ≈ óptima).
              </p>
              <p>
                En el levantamiento de pesas, un <em>envío</em> (clean-and-jerk) aprovecha las mayores fuerzas{' '}
                <em>antes</em> de que los filamentos ganen velocidad.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              ¿Por qué una bicicleta tiene cambios? Porque el músculo solo da su potencia máxima en un punto estrecho de la
              curva (v ≈ 0,3 v_max). El canvas muestra la P(v) y su pico: muévelo con k y verás cómo cambia la velocidad
              óptima de pedaleo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-power" />
            <div className="prof-controls">
              <span className="badge">P(v)</span>
              <label>
                k{' '}
                <input
                  type="range"
                  id="pw_k"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  defaultValue={params.pw_k}
                  onChange={(e) => {
                    engine.setParam('pw_k', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="pw_out">
                pico ≈ 0,1 T_max·v_max
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
