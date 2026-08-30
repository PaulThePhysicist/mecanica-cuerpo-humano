import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="18" data-module="7">
      <div className="module-header">
        <span className="mnum">10 · 6</span>
        <span className="mtitle">Percepción del tono: mels y fundamental ausente</span>
        <span className="msub">{"\\(\\text{mel} = f\\ \\text{percibido en escala musical}\\)"}</span>
        <span className="mslide-count">18 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎼</span> La escala de mels
            </div>
            <div className="card-body">
              <p>
                La percepción del tono no es lineal en hercios: el oído resuelve mejor los cambios en bajas
                frecuencias. La escala de <strong>mels</strong> comprime los hercios en una escala perceptual con 1000
                mels ≈ 1000 Hz.
              </p>
              <div className="eq-block">
                {"\\[ \\text{mel} \\approx 1000 \\cdot \\log_2\\!\\Big(1 + \\frac{f}{1000}\\Big) \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📵</span> La fundamental ausente
            </div>
            <div className="card-body">
              <p>
                Un teléfono o un altavoz pequeño no emiten la fundamental de una voz grave; emiten sus armónicos. Aun
                así percibimos el tono correcto: el cerebro <strong>reconstruye</strong> la fundamental ausente a
                partir del espaciado de los armónicos.
              </p>
              <div className="eq-block">
                {"\\[ f_0 = \\text{mcd de los armónicos presentes} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              Elige cada caso: la voz de bajo sin fundamental y la del clarinete. La melodía que escuchas es la
              frecuencia que falta, no la que suena.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pitch" className="sim" />
            <div className="prof-controls">
              <span className="badge">tono</span>
              <label>
                Caso{' '}
                <select
                  id="pt_sel"
                  defaultValue={params.pt_sel}
                  onChange={(e) => {
                    engine.setParam('pt_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Voz completa (f₀ presente)</option>
                  <option value="1">Sin fundamental (teléfono)</option>
                  <option value="2">Clarinete (solo impares)</option>
                </select>
              </label>
              <span className="readout" id="pt_out">
                Voz completa · percibes f₀ = 128 Hz
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
