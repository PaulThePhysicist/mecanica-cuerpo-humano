import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide6({ engine }: SlideProps) {
  const g = engine?.paramsRef.current.ptr_g ?? 1.5;
  const td = engine?.paramsRef.current.ptr_td ?? 1.0;
  const isPlaying = engine?.flagsRef.current.ptrPlaying ?? false;

  const togglePlay = () => {
    if (!engine) return;
    const next = !engine.flagsRef.current.ptrPlaying;
    engine.setFlag('ptrPlaying', next);
    if (next) engine.setFlag('ptrT', 0);
    engine.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 2</span>
        <span className="mtitle">Convergencia, oscilación y divergencia</span>
        <span className="msub">{"\\(g\\tau_d \\le \\pi/2\\)"}</span>
        <span className="mslide-count">6 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📉</span> El criterio de estabilidad
            </div>
            <div className="card-body">
              <p>
                Para {"\\(g\\tau_d < \\pi/2\\)"}: {"\\(x<0\\)"}, {"\\(P\\)"} oscila amortiguada hacia {"\\(P_0\\)"}. Para{" "}
                {"\\(g\\tau_d=\\pi/2\\)"}: oscilación sostenida. Para {"\\(g\\tau_d>\\pi/2\\)"}: {"\\(x>0\\)"}, {"\\(P\\)"} diverge
                (inestable).
              </p>
              <div className="eq-block">
                <span className="eqno">(13.9)</span>
                {"\\[ g\\tau_d \\le \\frac{\\pi}{2} \\]"}
              </div>
              <p>Esto fija el <strong>límite superior de ganancia</strong> para un {"\\(\\tau_d\\)"} dado.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎚️</span> Juega con g y τd
            </div>
            <div className="card-body">
              <p>
                Cambia la ganancia {"\\(g\\)"} y el retardo {"\\(\\tau_d\\)"}: verás cómo la desviación {"\\(p(t)\\)"} decae, oscila o se
                dispara. La línea central marca el valor de equilibrio {"\\(P_0\\)"}.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              ▶ anima {"\\(p(t)\\)"}: con {"\\(g\\tau_d < \\pi/2\\)"} regresa al consigna; en el límite oscila sin fin; más allá diverge.
              Los sistemas del cuerpo viven muy por debajo del límite.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ptr" />
            <div className="prof-controls">
              <span className="badge">P(t)</span>
              <button id="ptr_play" onClick={togglePlay} type="button">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <label>
                g{' '}
                <input
                  type="range"
                  id="ptr_g"
                  min="0.2"
                  max="6"
                  value={g}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ptr_g', v);
                    const span = document.getElementById('ptr_gv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ptr_gv">{g.toFixed(1).replace('.', ',')}</span>
              </label>
              <label>
                τd{' '}
                <input
                  type="range"
                  id="ptr_td"
                  min="0.1"
                  max="3"
                  value={td}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ptr_td', v);
                    const span = document.getElementById('ptr_tdv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ptr_tdv">{td.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="ptr_out">
                g·τd = {(g * td).toFixed(2).replace('.', ',')} · {g * td < Math.PI / 2 ? 'estable' : 'inestable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
