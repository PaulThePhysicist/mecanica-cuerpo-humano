import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <div className="module-header">
        <span className="mnum">3.4</span>
        <span className="mtitle">La pierna como péndulo</span>
        <span className="msub">El modelo balístico de la marcha</span>
        <span className="mslide-count">5 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🪢</span> El péndulo de la pierna
            </div>
            <div className="card-body">
              <p>
                {"La pierna oscila como un péndulo cuyo largo es \\(L = 0,53 H\\). Para una persona de 1,8 m, L ≈ 0,95 m. El "}
                <strong>medio periodo</strong> (duración del balanceo) vale:
              </p>
              <div className="eq-block">
                {"\\[ T_{1/2} = \\pi\\sqrt{\\frac{L}{g}} = \\pi\\sqrt{\\frac{0,95}{9,8}} \\approx 0,98\\ \\text{s} \\]"}
              </div>
              <p>¡Cerca del tiempo real de un paso! El modelo funciona aunque la pierna no sea un péndulo simple.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚙️</span> Refinamientos
            </div>
            <div className="card-body">
              <p>
                {"Si la pierna es una <strong>varilla uniforme</strong> girando en la cadera, \\(\\omega = \\sqrt{3g/2L}\\) y \\(T_{1/2} \\approx 0,80\\ \\text{s}\\). Con un modelo de <strong>dos masas</strong> (muslo y pantorrilla): ≈ 0,76 s. Ajustar la masa y su distribución baja el periodo hacia el valor medido."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌕</span> Péndulo invertido: el límite de la marcha
            </div>
            <div className="card-body">
              <p>En la marcha el cuerpo avanza sobre la pierna como un péndulo invertido; la máxima rapidez estable es:</p>
              <div className="eq-block">
                {"\\[ v_{\\max} = \\sqrt{g\\,R} \\approx 3{,}0\\ \\text{m/s} \\]"}
              </div>
              <p>
                En la <strong>Luna</strong> (g/6) baja a ≈ 1,2 m/s; en <strong>Marte</strong> (g/3) ≈ 1,9 m/s. Por eso
                caminar en gravedad baja es tan raro.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              Este es el corazón del capítulo: un paso ≈ medio periodo de péndulo. Cambia H y planeta en el canvas: en la
              Luna la pierna oscila mucho más lenta (y el video de los astronautas lo confirma).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pendulo" className="sim" />
            <div className="prof-controls">
              <span className="badge">T½ = π√(L/g)</span>
              <label>
                H{' '}
                <input
                  type="range"
                  id="pe_H"
                  min="1.4"
                  max="2.1"
                  step="0.01"
                  defaultValue={params.pe_H}
                  onChange={(e) => {
                    engine.setParam('pe_H', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                planeta{' '}
                <select
                  id="pe_planet"
                  defaultValue={params.pe_planet}
                  onChange={(e) => {
                    engine.setParam('pe_planet', e.target.value as 'earth' | 'moon' | 'mars');
                    engine.requestDraw();
                  }}
                >
                  <option value="earth">Tierra</option>
                  <option value="moon">Luna</option>
                  <option value="mars">Marte</option>
                </select>
              </label>
              <span className="readout" id="pe_out">
                T½ = 0,98 s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
