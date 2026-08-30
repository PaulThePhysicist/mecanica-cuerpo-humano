import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">10 · 4</span>
        <span className="mtitle">La glotis: fuente de voz</span>
        <span className="msub">{"\\(f_0 \\approx 128\\ \\mathrm{Hz}\\ (M)\\ \\sim\\ 260\\ \\mathrm{Hz}\\ (F)\\)"}</span>
        <span className="mslide-count">7 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌀</span> Vibración de las cuerdas vocales
            </div>
            <div className="card-body">
              <p>
                El aire pulmonar pasa entre las cuerdas vocales. Por el <strong>efecto Bernoulli</strong>, la presión cae
                donde la velocidad sube, y las cuerdas se cierran y abren a la frecuencia fundamental {"\\(f_0\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.40)</span>
                {"\\[ P + \\tfrac{1}{2}\\rho v^{2} = \\text{const} \\]"}
              </div>
              <p>
                El pulso glotal es una onda casi «en diente de sierra»: rica en armónicos, con energía que decae ~12
                dB/octava. En voz modal: <span className="tag">bajo 98 · barítono 123 · tenor 165 Hz</span> y{' '}
                <span className="tag">contralto 175 · mezzo 196 · soprano 247 Hz</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Eficiencia energética del habla
            </div>
            <div className="card-body">
              <p>
                El habla emite solo ~{"\\(10^{-3}\\)"} W acústicos sobre ~{"\\(10^{-2}\\)"} W aerodinámicos: eficiencia de
                alrededor del 1 %.
              </p>
              <div className="eq-block">
                <span className="eqno">(10.52)</span>
                {"\\[ \\eta \\approx 10^{-3} \\times 100 = 0{,}1\\text{–}1\\,\\% \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Pulsa ▶ para ver el ciclo glotal animado: al abrirse, el aire se acelera y la presión cae (Bernoulli), y las
              cuerdas vuelven a cerrarse. Cada cierre es un «golpe» del pulso glotal.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-glottis" className="sim" />
            <div className="prof-controls">
              <span className="badge">glotis</span>
              <button id="gl_play" type="button" onClick={() => engine.toggleGlottis()}>
                {flags.glPlaying ? '⏸' : '▶'}
              </button>
              <label>
                f₀{' '}
                <input
                  type="range"
                  id="gl_f"
                  min="80"
                  max="300"
                  defaultValue={params.gl_f}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('gl_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="gl_fv">128 Hz</span>
              </label>
              <span className="readout" id="gl_out">
                Ciclo glotal · f₀ = 128 Hz (voz masculina)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
