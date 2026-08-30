import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="4">
      <div className="module-header">
        <span className="mnum">10 · 4</span>
        <span className="mtitle">Síntesis de Fourier y timbre</span>
        <span className="msub">{"\\(x(t) = \\sum_n a_n \\cos(2\\pi n f_0 t + \\varphi_n)\\)"}</span>
        <span className="mslide-count">10 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> Toda onda periódica es una suma de senos
            </div>
            <div className="card-body">
              <p>
                La voz no es un seno puro: es una onda periódica con forma de diente de sierra, es decir, una suma de
                armónicos {"\\(n f_0\\)"}. El <strong>timbre</strong> es el reparto de amplitudes {"\\(a_n\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.50)</span>
                {"\\[ x(t) = \\sum_{n} a_n \\cos\\!\\big(2\\pi n f_0\\, t + \\varphi_n\\big) \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👂</span> Del espectro al oído
            </div>
            <div className="card-body">
              <p>
                La cóclea hace «análisis de Fourier» en tiempo real: separa la onda compleja en sus frecuencias.
                Cuantos más armónicos se añaden, más «brillante» es el timbre. Para el diente de sierra:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.51)</span>
                {"\\[ a_n \\propto \\frac{1}{n}\\ \\text{(diente de sierra)} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              Añade armónicos uno a uno y observa cómo la suma se aproxima a la forma de diente de sierra de la glotis.
              Cada «diente» es energía en un múltiplo de f₀.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-timbre" className="sim" />
            <div className="prof-controls">
              <span className="badge">Fourier</span>
              <label>
                Forma{' '}
                <select
                  id="tm_sel"
                  defaultValue={params.tm_sel}
                  onChange={(e) => {
                    engine.setParam('tm_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Diente de sierra (voz)</option>
                  <option value="1">Cuadrada (clarinete)</option>
                  <option value="2">Triangular (flauta)</option>
                </select>
              </label>
              <label>
                Armónicos{' '}
                <input
                  type="range"
                  id="tm_n"
                  min="1"
                  max="12"
                  defaultValue={params.tm_n}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('tm_n', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="tm_nv">6</span>
              </label>
              <span className="readout" id="tm_out">
                6 armónicos · f₀ = 128 Hz
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
