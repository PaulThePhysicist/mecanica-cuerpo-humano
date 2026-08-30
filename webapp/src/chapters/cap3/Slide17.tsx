import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [glove, setGlove] = useState(flags.glove);

  const toggleGlove = () => {
    const next = !glove;
    setGlove(next);
    engine.setFlag('glove', next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">3.11</span>
        <span className="mtitle">Boxeo: guantes vs puño limpio</span>
        <span className="msub">Colisión inelástica, GSI y el factor protector</span>
        <span className="mslide-count">17 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🥊</span> Con guantes: reparte el impacto
            </div>
            <div className="card-body">
              <p>Con guante, la rapidez final de la cabeza es una fracción de la del puño:</p>
              <div className="eq-block">
                {"\\[ v_f = \\frac{v_i}{1 + 2\\,m_{\\text{cabeza}}/m_{\\text{brazo}}} = 0{,}236\\,v_{\\text{puño}} \\]"}
              </div>
              <p>
                {"A 30 mph: \\(v_f \\approx 3{,}2\\ \\text{m/s}\\), ≈ "}<span className="tag">51 g</span>{", GSI ≈ "}<span className="tag">117</span>{" (moderado). A 45 mph: GSI ≈ 593."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩸</span> A puño limpio: elástica y letal
            </div>
            <div className="card-body">
              <p>
                {"Sin guante la colisión es más elástica (\\(v_f = 0{,}382\\,v_{\\text{puño}}\\)) y la distancia de frenado es ~1 mm:"}
              </p>
              <div className="eq-block">
                {"\\[ v_f \\approx 5{,}1\\ \\text{m/s} \\rightarrow 1340\\ g,\\quad \\text{GSI} \\approx 25\\,600 \\]"}
              </div>
              <p>
                Ampliamente fatal — y además fractura la mano del golpeador. El guante no reduce la <em>fuerza</em>,
                reduce la <em>potencia de la desaceleración</em>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              Contraste dramático para la clase: mismo puño, GSI 117 vs 25 600. La diferencia es la distancia de
              deformación del guante. Relaciona con el casco: siempre se trata de Δx.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-boxing" className="sim" />
            <div className="prof-controls">
              <span className="badge">GSI</span>
              <label>
                v{' '}
                <input
                  type="range"
                  id="bx_v"
                  min="20"
                  max="55"
                  step="1"
                  defaultValue={params.bx_v}
                  onChange={(e) => {
                    engine.setParam('bx_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="bx_glove" onClick={toggleGlove}>
                {glove ? 'Guantes' : 'Puño limpio'}
              </button>
              <span className="readout" id="bx_out">
                GSI = 117
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
