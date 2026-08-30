import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="14" data-module="6">
      <div className="module-header">
        <span className="mnum">4.6</span>
        <span className="mtitle">El hueso viscoelástico: modelo de Kelvin</span>
        <span className="msub">Carga rápida = hueso más rígido</span>
        <span className="mslide-count">14 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> El sólido lineal estándar
            </div>
            <div className="card-body">
              <p>Kelvin = resorte + (resorte ∥ amortiguador), con dos tiempos:</p>
              <div className="eq-block">
                {"\\[ F+\\tau_\\varepsilon\\frac{dF}{dt}=k_2\\left(x+\\tau_\\sigma\\frac{dx}{dt}\\right),\\qquad \\tau_\\varepsilon=\\frac{c}{k_1},\\ \\ \\tau_\\sigma=c\\left(\\frac{1}{k_1}+\\frac{1}{k_2}\\right) \\]"}
              </div>
              <p>Predice creep finito, relajación incompleta y lazo de histéresis — lo que observamos en el hueso.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚀</span> Carga en rampa
            </div>
            <div className="card-body">
              <p>
                Si la fuerza sube en rampa {"\\(F=F_0\\,t/T\\)"}, la deformación final depende de cuánto dura la rampa
                respecto a {"\\(\\tau_\\sigma\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ T\\ll\\tau_\\sigma:\\;\\;x\\to\\frac{F_0}{k_1+k_2}\\qquad T\\gg\\tau_\\sigma:\\;\\;x\\to\\frac{F_0}{k_2} \\]"}
              </div>
              <p>
                Carga <strong>rápida</strong> → menos deformación → <span className="highlight">más rígido</span>. Carga
                lenta → se deforma más.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              Esto explica las caídas: el impacto dura milisegundos (T ≪ τσ), así que el hueso responde con su módulo
              máximo — se deforma poco y fractura. La misma fuerza aplicada despacio lo deformaría sin romperlo. La
              velocidad de carga decide la lesión.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-kelvin" className="sim" />
            <div className="prof-controls">
              <span className="badge">x(T) rampa</span>
              <label>
                T/τσ{' '}
                <input
                  type="range"
                  id="kl_T"
                  min="-2"
                  max="2"
                  step="0.05"
                  defaultValue={params.kl_T}
                  onChange={(e) => {
                    engine.setParam('kl_T', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                id="kl_play"
                onClick={() => {
                  const next = !flags.klPlaying;
                  engine.setFlag('klPlaying', next);
                  if (next) engine.setFlag('klT', 0);
                  const b = document.getElementById('kl_play');
                  if (b) b.textContent = next ? '⏸' : '▶';
                }}
              >
                {flags.klPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="kl_out">
                x → F₀/2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
