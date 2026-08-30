import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [mode, setMode] = useState<'cm' | 'sq'>(flags.jumpMode);

  const toggleJump = () => {
    const next = mode === 'cm' ? 'sq' : 'cm';
    setMode(next);
    engine.setFlag('jumpMode', next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <div className="module-header">
        <span className="mnum">3.7</span>
        <span className="mtitle">El salto vertical</span>
        <span className="msub">De la fuerza de empuje a la altura</span>
        <span className="mslide-count">9 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦘</span> La energía del salto
            </div>
            <div className="card-body">
              <p>
                {"Al despegar, la rapidez vertical de salida \\(v_{TO}\\) se convierte en altura:"}
              </p>
              <div className="eq-block">
                {"\\[ H = \\frac{v_{TO}^2}{2g} \\]"}
              </div>
              <p>
                {"El ejemplo del libro: peso \\(W_b = 622\\ \\text{N}\\), fuerza media de empuje \\(\\langle N \\rangle = 1334\\ \\text{N}\\), recorrido de empuje \\(s = 0{,}43\\ \\text{m}\\) →"}
              </p>
              <div className="eq-block">
                {"\\[ H = 0{,}49\\ \\text{m},\\qquad v_{TO} = 3{,}1\\ \\text{m/s},\\qquad \\tau = 0{,}28\\ \\text{s} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📉</span> Sentadilla vs contramovimiento
            </div>
            <div className="card-body">
              <p>
                Con <strong>contramovimiento</strong> (flexionar antes de saltar) la fuerza N cae por debajo del peso y
                luego sube con pico; se usa energía elástica acumulada y el salto es mayor. En la <strong>sentadilla</strong>{' '}
                no hay ese pre-carga.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              La curva N(t) del canvas es la firma de un salto: el pico de fuerza sobre el peso es lo que acelera el CM.
              Compara sentadilla vs contramovimiento en la forma del valle.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-jump" className="sim" />
            <div className="prof-controls">
              <span className="badge">H = v²/2g</span>
              <label>
                peso{' '}
                <input
                  type="range"
                  id="jp_mass"
                  min="40"
                  max="110"
                  defaultValue={params.jp_mass}
                  onChange={(e) => {
                    engine.setParam('jp_mass', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                s{' '}
                <input
                  type="range"
                  id="jp_s"
                  min="0.1"
                  max="0.7"
                  step="0.01"
                  defaultValue={params.jp_s}
                  onChange={(e) => {
                    engine.setParam('jp_s', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="jp_mode" onClick={toggleJump}>
                {mode === 'cm' ? 'Contramov.' : 'Sentadilla'}
              </button>
              <span className="readout" id="jp_out">
                H = 0,49 m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
