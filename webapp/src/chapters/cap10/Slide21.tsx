import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide21({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="21" data-module="8">
      <div className="module-header">
        <span className="mnum">10 · 7</span>
        <span className="mtitle">Ruidos cardíacos y auscultación</span>
        <span className="msub">{"\\(S_1\\ (\\text{lub}) \\cdot S_2\\ (\\text{dub}) \\cdot S_3 \\cdot S_4\\)"}</span>
        <span className="mslide-count">21 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🫀</span> Los sonidos que «filtra» el corazón
            </div>
            <div className="card-body">
              <p>
                El corazón produce ondas de presión audibles: <strong>S₁</strong> (cierre de las válvulas AV, el
                «lub»), <strong>S₂</strong> (cierre de las semilunares, el «dub»), y los ruidos <strong>S₃</strong> y{' '}
                <strong>S₄</strong> (llenado ventricular, fisiológicos en jóvenes, patológicos en adultos).
              </p>
              <div className="eq-block">
                {"\\[ \\text{S}_1: \\text{válvulas AV} \\quad \\text{S}_2: \\text{semilunares} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩸</span> Soplos y el método de Korotkoff
            </div>
            <div className="card-body">
              <p>
                Los <strong>soplos</strong> son flujos turbulentos a través de válvulas estenóticas o insuficientes. Los{' '}
                <strong>sonidos de Korotkoff</strong> aparecen cuando el flujo se vuelve turbulento bajo el manguito: el
                mismo mecanismo de Bernoulli y turbulencia que genera la voz.
              </p>
              <div className="eq-block">
                {"\\[ \\text{Re} \\approx \\frac{\\rho v D}{\\eta} > 2\\,000\\ \\Rightarrow\\ \\text{turbulencia} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-21">
              ▶ reproduce el fonocardiograma: mira el «lub-dub» en su momento del ciclo. Cambia a un soplo y verás el
              soplido entre S₁ y S₂. La auscultación es espectroscopia de bajo coste.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-heartsounds" className="sim" />
            <div className="prof-controls">
              <span className="badge">fonocardio</span>
              <button id="hs_play" type="button" onClick={() => engine.toggleHeartSounds()}>
                {flags.hsPlaying ? '⏸' : '▶'}
              </button>
              <label>
                Estado{' '}
                <select
                  id="hs_sel"
                  defaultValue={params.hs_sel}
                  onChange={(e) => {
                    engine.setParam('hs_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Normal (S₁–S₂)</option>
                  <option value="1">Con S₃ (joven)</option>
                  <option value="2">Soplo sistólico</option>
                </select>
              </label>
              <span className="readout" id="hs_out">
                Fonocardiograma · S₁ (lub) + S₂ (dub)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
