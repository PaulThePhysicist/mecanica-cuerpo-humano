import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide21({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="21" data-module="8">
      <div className="module-header">
        <span className="mnum">5.11</span>
        <span className="mtitle">Fatiga muscular: la curva de Rohmert</span>
        <span className="msub">El tiempo de resistencia cae hiperbólicamente con el esfuerzo</span>
        <span className="mslide-count">21 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📉</span> La curva de Rohmert
            </div>
            <div className="card-body">
              <p>
                Caracteriza la <strong>disminución hiperbólica</strong> del tiempo de resistencia del control voluntario con
                el nivel de esfuerzo (% del nivel de fuerza máxima). También se espera cierta fatiga{' '}
                <strong>por debajo del 15 %</strong> de esfuerzo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧪</span> Causas metabólicas
            </div>
            <div className="card-body">
              <p>
                La fuerza cae por factores que dificultan la formación/desprendimiento de puentes cruzados:{' '}
                <span className="tag">ácido láctico</span>, <span className="tag">aumento de fosfato</span>,{' '}
                <span className="tag">descenso de PCr</span> (el agotamiento de ATP no es dominante).
              </p>
              <p>
                <strong>Isquemia:</strong> la presión intramuscular supera la sistólica → se restringe el flujo de
                oxígeno y la eliminación de desechos. Empieza al <span className="tag">10–20 % MVC</span> en algunos
                músculos; otros no la presentan por encima del <span className="tag">50 %</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧠</span> Fatiga central y periférica
            </div>
            <div className="card-body">
              <p>
                <strong>Central:</strong> la motivación. <strong>Periférica:</strong> el fallo del control neuronal del
                músculo. Las fibras <strong>Tipo I y IIA</strong> resisten la fatiga porque están rodeadas por una rica red
                de capilares.
              </p>
              <p>
                Los músculos posturales (sóleo) cargan mucha fibra Tipo I; los de ráfaga corta (gastrocnemio) no
                necesitan tanta resistencia.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-21">
              La curva de Rohmert explica el diseño ergonómico: sostener el 50 % de tu fuerza máxima te dura ~3–4 min; el
              20 %, mucho más. Es la razón por la que los puestos de trabajo y las posiciones de espera buscan esfuerzos
              &lt; 15 %. Mueve el nivel de esfuerzo en el canvas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-rohmert" />
            <div className="prof-controls">
              <span className="badge">Rohmert</span>
              <label>
                esfuerzo{' '}
                <input
                  type="range"
                  id="rh_s"
                  min="15"
                  max="100"
                  step="1"
                  defaultValue={params.rh_s}
                  onChange={(e) => {
                    engine.setParam('rh_s', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="rh_sv">{params.rh_s} %</span>
              </label>
              <span className="readout" id="rh_out">
                resistencia ≈ 3,5 min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
