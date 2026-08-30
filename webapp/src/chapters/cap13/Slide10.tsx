import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide10({ engine }: SlideProps) {
  const k = engine?.paramsRef.current.cc_k ?? 750;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 4</span>
        <span className="mtitle">Bucle cerrado: la sudoración lo arregla</span>
        <span className="msub">{"\\(\\tau_r = C/(\\lambda+K)\\)"}</span>
        <span className="mslide-count">10 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🥵</span> El término de control
            </div>
            <div className="card-body">
              <p>
                El cuerpo añade sudoración activa: {"\\(-K_\\text{sudor}(T_\\text{cuerpo}-36{,}85\\ ^\\circ\\mathrm{C})\\)"}, con{' '}
                {"\\(K_\\text{sudor}\\sim 750\\ \\text{kcal/(h·°C)}\\)"} para piel a 33–38 °C (13.31–13.32). La constante de tiempo
                efectiva cae dramáticamente:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.33)</span>
                {"\\[ \\tau_r = \\frac{C}{\\lambda+K} \\]"}
              </div>
              <p>
                Con {"\\(K/\\lambda=30\\)"}: {"\\(\\tau_r = 2{,}4\\ \\text{h}/31 \\approx 4{,}7\\ \\text{min}\\)"} — una escala de
                tiempo fisiológica totalmente adaptativa.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💧</span> Vasomotora y pirógenos
            </div>
            <div className="card-body">
              <p>
                El control vasomotor envía sangre a vasos superficiales (enfría) o al núcleo (conserva), mediante el mecanismo a
                contracorriente (Fig. 6.19). El cuerpo puede perder hasta 1 L/h de sudor (540 kcal/h evaporativas).
              </p>
              <p>
                Los <strong>pirógenos</strong> (toxinas bacterianas) suben el punto de consigna hipotalámico (fiebre): sentimos
                frío y tiritamos hasta alcanzarlo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              Compara abierto (τr = 2,4 h) vs cerrado (τr = 4,7 min) en la barra derecha: la sudoración acelera la respuesta ~31×.
              Sin control, el cuerpo no estabiliza nunca.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cc" />
            <div className="prof-controls">
              <span className="badge">τr</span>
              <label>
                K_sudor{' '}
                <input
                  type="range"
                  id="cc_k"
                  min="0"
                  max="1500"
                  value={k}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('cc_k', v);
                    const span = document.getElementById('cc_kv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="cc_kv">{k}</span>
              </label>
              <span className="readout" id="cc_out">
                τr abierto 2,4 h → cerrado {(60 / (25 + k) * 60).toFixed(0)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
