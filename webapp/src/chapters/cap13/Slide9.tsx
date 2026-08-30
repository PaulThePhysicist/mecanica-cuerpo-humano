import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide9({ engine }: SlideProps) {
  const f = engine?.paramsRef.current.oa_f ?? 1;
  const th = engine?.paramsRef.current.oa_th ?? 21;
  const isPlaying = engine?.flagsRef.current.oaPlaying ?? false;

  const togglePlay = () => {
    if (!engine) return;
    const next = !engine.flagsRef.current.oaPlaying;
    engine.setFlag('oaPlaying', next);
    if (next) engine.setFlag('oaT', 0);
    engine.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 3</span>
        <span className="mtitle">Bucle abierto: sin control no hay caso</span>
        <span className="msub">{"\\(T(t)=T_\\text{hab}+2{,}8f+(T_0-T_\\text{hab}-2{,}8f)e^{-t/\\tau_r}\\)"}</span>
        <span className="mslide-count">9 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔓</span> Solo pérdida pasiva
            </div>
            <div className="card-body">
              <p>
                Con radiación y convección: {"\\(-\\lambda(T_\\text{piel}-T_\\text{hab})\\)"}, {"\\(\\lambda\\approx 25\\ \\text{kcal/(h·°C)}\\)"}.
                La solución analítica da (13.16–13.27):
              </p>
              <div className="eq-block">
                <span className="eqno">(13.22)</span>
                {"\\[ \\tau_r = \\frac{C}{\\lambda} = \\frac{60}{25} = 2{,}4\\ \\text{h} \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(13.28)</span>
                {"\\[ T_\\text{estacionario} = T_\\text{hab} + 2{,}8\\,f\\ ^\\circ\\mathrm{C} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🤔</span> Resultados absurdos
            </div>
            <div className="card-body">
              <p>
                Con {"\\(T_\\text{hab}=21\\ ^\\circ\\mathrm{C}\\)"}: reposo {"\\(f\\approx 1\\)"} → {"\\(T_{ss}\\approx 24\\ ^\\circ\\mathrm{C}\\)"}{' '}
                (hipotermia severa); ejercicio moderado {"\\(f=10\\)"} → {"\\(T_{ss}\\approx 49\\ ^\\circ\\mathrm{C}\\)"} (muerte por
                hipertermia).
              </p>
              <p>
                Además, {"\\(\\tau_r=2{,}4\\ \\text{h}\\)"} implicaría tardar más de 5 horas en estabilizar: <strong>fisiológicamente
                inviable</strong>. El término de control activo es imprescindible.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              ▶ anima {"\\(T(t)\\)"} en bucle abierto: con f=1 se estanca en 24 °C (frío) y con f=10 se dispara a 49 °C. El cuerpo
              nunca funciona así; el bucle cerrado con sudoración lo corrige por completo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-oa" />
            <div className="prof-controls">
              <span className="badge">abierto</span>
              <button id="oa_play" onClick={togglePlay} type="button">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <label>
                f{' '}
                <input
                  type="range"
                  id="oa_f"
                  min="1"
                  max="20"
                  value={f}
                  step="1"
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    engine?.setParam('oa_f', v);
                    const span = document.getElementById('oa_fv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="oa_fv">{f}</span>
              </label>
              <label>
                T_hab{' '}
                <input
                  type="range"
                  id="oa_th"
                  min="0"
                  max="35"
                  value={th}
                  step="1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('oa_th', v);
                    const span = document.getElementById('oa_thv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="oa_thv">{th}</span>
              </label>
              <span className="readout" id="oa_out">
                f={f} · T_ss ≈ {(th + 2.8 * f).toFixed(0)} °C
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
