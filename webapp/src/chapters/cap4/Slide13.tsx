import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="6">
      <div className="module-header">
        <span className="mnum">4.5</span>
        <span className="mtitle">Modelos viscoelásticos: Maxwell y Voigt</span>
        <span className="msub">Dos formas de conectar el resorte con el amortiguador</span>
        <span className="mslide-count">13 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⛓️</span> Maxwell: en serie
            </div>
            <div className="card-body">
              <p>
                Resorte y amortiguador <strong>en serie</strong>. El creep crece sin límite y la relajación decae
                exponencialmente:
              </p>
              <div className="eq-block">
                {"\\[ x(t)=\\frac{F_0}{k}+\\frac{F_0}{c}\\,t\\qquad F(t)=kx_0\\,e^{-kt/c},\\qquad \\tau=\\frac{c}{k} \\]"}
              </div>
              <p>
                {"\\(\\tau=c/k\\)"} es el <strong>tiempo de relajación</strong>: el material "fluye" si la carga dura{" "}
                {"\\(t\\gg\\tau\\)"}.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧱</span> Voigt: en paralelo
            </div>
            <div className="card-body">
              <p>
                Resorte y amortiguador <strong>en paralelo</strong>. El creep satura exponencialmente (retardo), pero el
                modelo no relaja: el resorte interno retiene la deformación.
              </p>
              <div className="eq-block">
                {"\\[ x(t)=\\frac{F_0}{k}\\left(1-e^{-kt/c}\\right) \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Pulsa ▶ y cambia τ: Maxwell fluye sin fin (un líquido elástico), Voigt satura (un sólido retardado). Los
              tejidos reales combinan ambos — ese es el modelo de Kelvin de la siguiente diapositiva.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-models" className="sim" />
            <div className="prof-controls">
              <span className="badge">creep</span>
              <label>
                modelo{' '}
                <select
                  id="md_mode"
                  defaultValue={flags.md_mode}
                  onChange={(e) => {
                    engine.setFlag('md_mode', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="maxwell">Maxwell</option>
                  <option value="voigt">Voigt</option>
                </select>
              </label>
              <label>
                τ{' '}
                <input
                  type="range"
                  id="md_tau"
                  min="0.1"
                  max="2"
                  step="0.05"
                  defaultValue={params.md_tau}
                  onChange={(e) => {
                    engine.setParam('md_tau', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                id="md_play"
                onClick={() => {
                  const next = !flags.mdPlaying;
                  engine.setFlag('mdPlaying', next);
                  if (next) engine.setFlag('mdT', 0);
                  const b = document.getElementById('md_play');
                  if (b) b.textContent = next ? '⏸' : '▶';
                }}
              >
                {flags.mdPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="md_out">
                x(t) max
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
