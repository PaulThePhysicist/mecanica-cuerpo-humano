import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [isPlaying, setIsPlaying] = useState(flags.ttPlaying);

  const togglePlay = () => {
    flags.ttPlaying = !flags.ttPlaying;
    if (flags.ttPlaying) flags.ttT = 0;
    setIsPlaying(flags.ttPlaying);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">5.3</span>
        <span className="mtitle">Sacudidas repetidas y el estado tetanizado</span>
        <span className="msub">Dos pulsos, N pulsos, el límite</span>
        <span className="mslide-count">7 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📉</span> Decaimiento y segundo pulso
            </div>
            <div className="card-body">
              <p>
                Al apagar el generador en {"\\(t_1\\)"} ({"\\(T_{\\text{G}}=0\\)"}), la tensión decae con{' '}
                {"\\(\\exp(-\\Delta t/\\tau)\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ T(t)=T_0\\bigl(1-e^{-t_1/\\tau}\\bigr)\\,e^{-(t-t_1)/\\tau} \\qquad\\text{(5.10)} \\]"}
              </div>
              <p>
                Con dos pulsos (on <span className="tag">t₁</span>, off <span className="tag">t₂</span>), la segunda
                sacudida arranca desde la tensión residual y evoluciona según la ec. 5.7:
              </p>
              <div className="eq-block">
                {"\\[ T(t)=T_0\\Bigl\\{1-e^{-t/\\tau}+e^{-(t-t_1)/\\tau}-e^{-(t-(t_1+t_2))/\\tau}\\Bigr\\} \\qquad\\text{(5.13)} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">♾️</span> El límite tetanizado
            </div>
            <div className="card-body">
              <p>
                Después de {"\\(N\\)"} pulsos la tensión al final de cada pulso se multiplica por la suma geométrica{' '}
                {"\\(1+x+x^2+\\cdots+x^{N}\\)"} con {"\\(x=e^{-(t_1+t_2)/\\tau}\\)"}; para {"\\(N\\)"} grande:
              </p>
              <div className="eq-block">
                {"\\[ T_{\\text{tetanizado}}=T_0\\,\\frac{1-e^{-t_1/\\tau}}{1-e^{-(t_1+t_2)/\\tau}} \\qquad\\text{(5.16)} \\]"}
              </div>
              <p>
                Con pulsos consecutivos (<span className="tag">t₂ = 0</span>):{' '}
                <span className="highlight">T = T₀</span>. La tensión de tétanos nunca supera la del generador.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Este es el «motor» de la ec. 5.16 en acción. Juega con t₁, t₂ y τ: con t₂ corto la meseta sube y se ondula
              menos; con t₂ → 0 la meseta vale exactamente T₀. Pregunta de examen: ¿por qué un twitch nunca iguala la
              tensión isométrica máxima, pero el tétanos sí?
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-tetanus2" />
            <div className="prof-controls">
              <span className="badge">modelo</span>
              <label>
                t₁{' '}
                <input
                  type="range"
                  id="tt_t1"
                  min="5"
                  max="200"
                  step="5"
                  defaultValue={params.tt_t1}
                  onChange={(e) => {
                    engine.setParam('tt_t1', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                ms
              </label>
              <label>
                t₂{' '}
                <input
                  type="range"
                  id="tt_t2"
                  min="0"
                  max="200"
                  step="5"
                  defaultValue={params.tt_t2}
                  onChange={(e) => {
                    engine.setParam('tt_t2', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                ms
              </label>
              <label>
                τ{' '}
                <input
                  type="range"
                  id="tt_tau"
                  min="10"
                  max="120"
                  step="5"
                  defaultValue={params.tt_tau}
                  onChange={(e) => {
                    engine.setParam('tt_tau', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                ms
              </label>
              <button id="tt_play" type="button" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="tt_out">
                T tétanos / T₀ = 0,88
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
