import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="19" data-module="8">
      <div className="module-header">
        <span className="mnum">5.11</span>
        <span className="mtitle">Medir la fuerza muscular</span>
        <span className="msub">MVC, 1RM e isocinético</span>
        <span className="mslide-count">19 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📏</span> Tres modos de medir
            </div>
            <div className="card-body">
              <p>
                <strong>(1) MVC</strong> — fuerza máxima en contracción voluntaria <strong>isométrica</strong>{' '}
                (longitud fija, las fibras se acortan). Depende sobre todo del <strong>tamaño del músculo</strong>.
              </p>
              <p>
                <strong>(2) Carga 1RM</strong> — la carga máxima que se mueve una sola vez (una carga 10RM es la que se
                mueve a lo sumo 10 veces). Depende del tamaño <em>y</em> de la coordinación.
              </p>
              <p>
                <strong>(3) Isocinético</strong> — torque pico con acortamiento/alargamiento a velocidad angular constante.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📉</span> Más repeticiones, menos carga
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ r\\text{RM}=1\\text{RM}\\,(1{,}0278-0{,}0278\\,r) \\]"}
              </div>
              <p>
                La carga máxima cae casi linealmente con el número de repeticiones {"\\(r\\)"} en la serie (Fig. 5.41). Por
                ejemplo, <span className="tag">10 RM ≈ 75 % de 1RM</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦵</span> La rodilla idealizada
            </div>
            <div className="card-body">
              <p>
                La Fig. 5.40 muestra ángulos, fuerzas y torques idealizados de la extensión de la rodilla (extensión
                completa = 180°) para los tres modos: la segunda mitad del movimiento isocinético involucra los flexores de
                la rodilla.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              MVC mide «cuánto músculo tienes»; 1RM mide «cuánto sabes usarlo» (fuerza + coordinación). El canvas traza la
              carga rRM vs repeticiones: pasa el dedo por la curva y conecta cada RM con su porcentaje de 1RM.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-mvc" />
            <div className="prof-controls">
              <span className="badge">rRM</span>
              <label>
                repeticiones{' '}
                <input
                  type="range"
                  id="mv_r"
                  min="1"
                  max="20"
                  step="1"
                  defaultValue={params.mv_r}
                  onChange={(e) => {
                    engine.setParam('mv_r', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="mv_rv">{params.mv_r}</span>
              </label>
              <span className="readout" id="mv_out">
                10RM = 75 % de 1RM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
