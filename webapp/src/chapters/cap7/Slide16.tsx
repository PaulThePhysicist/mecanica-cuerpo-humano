import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="16" data-module="6">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Sustentación y Strouhal</span>
        <span className="msub">La fuerza que también usan la mano y el ala</span>
        <span className="mslide-count">16 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🪽</span> Sustentación
            </div>
            <div className="card-body">
              <p>Una superficie inclinada en un flujo genera fuerza perpendicular a la corriente (eq. 7.63):</p>
              <div className="eq-block">
                {"\\[ F_{\\text{sust}} = \\frac{1}{2} C_{\\text{sust}} S \\rho u^2 \\]"}
              </div>
              <p>
                {"\\(C_{\\text{sust}}\\)"} va de <span className="tag">−0,4 a 1,2</span> para ángulos de ataque{' '}
                {"\\(\\beta\\)"} de −4° a 12°. Más allá de ≈ 12° el flujo se desprende y la sustentación{' '}
                <strong>colapsa</strong> (entrada en pérdida, «stall»).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌪️</span> Número de Strouhal
            </div>
            <div className="card-body">
              <p>La frecuencia con que se sueltan los vórtices alternos en la estela (eq. 7.60):</p>
              <div className="eq-block">
                {
                  "\\[ f_{\\text{St}} = \\text{St}\\,\\frac{u}{D} \\qquad \\text{St} \\approx 0{,}12\\text{–}0{,}23 \\]"
                }
              </div>
              <p>
                Gobierna el «caleidoscopio» de vórtices tras nadadores y voladores, y la vibración de cables y mástiles.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">✋</span> La mano como hélice
            </div>
            <div className="card-body">
              <p>
                En el nado, la mano que barre inclinada genera <strong>sustentación</strong> además de propulsión: los
                buenos nadadores usan las manos como hélices y no como paletas planas (módulo 8).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              La sustentación no es solo aviación: es la mano del nadador y el ala del Gossamer. El gráfico del canvas es el
              del libro: C_sust crece con el ángulo hasta ~12°, y ahí se desploma. Ese pico y esa caída son la física
              completa del vuelo y de la brazada.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-lift" />
            <div className="prof-controls">
              <span className="badge">sustentación</span>
              <label>
                β{' '}
                <input
                  type="range"
                  id="li_b"
                  min="-6"
                  max="20"
                  step="1"
                  defaultValue={params.li_b}
                  onInput={(e) => {
                    engine.setParam('li_b', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="li_bv">8°</span>
              </label>
              <span className="readout" id="li_out">
                C_sust = 0,82
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
