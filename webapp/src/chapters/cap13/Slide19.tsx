import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide19({ engine }: SlideProps) {
  const iVal = engine?.paramsRef.current.po_i ?? 400;
  const tau = engine?.paramsRef.current.po_t ?? 280;
  const isPlaying = engine?.flagsRef.current.poPlaying ?? false;

  const togglePlay = () => {
    if (!engine) return;
    const next = !engine.flagsRef.current.poPlaying;
    engine.setFlag('poPlaying', next);
    if (next) engine.setFlag('poT', 0);
    engine.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 7</span>
        <span className="mtitle">La pupila como oscilador</span>
        <span className="msub">inestable para {"\\(I\\)"} o {"\\(\\tau\\)"} grandes</span>
        <span className="mslide-count">19 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔁</span> Estable e inestable
            </div>
            <div className="card-body">
              <p>La ecuación integral completa de retroalimentación retardada es:</p>
              <div className="eq-block">
                <span className="eqno">(13.39)</span>
                {"\\[ \\tau_x\\dot x + x = \\gamma\\,F\\!\\left[\\ln\\!\\left(\\frac{I(t-\\tau)A(x(t-\\tau))}{\\phi_\\text{umbral}}\\right)\\right] \\]"}
              </div>
              <p>
                Para {"\\(I\\)"} constante, el punto de reposo es <strong>estable en un rango</strong> fisiológico de {"\\(I\\)"} y{' '}
                {"\\(\\tau\\)"}, pero se vuelve <strong>inestable</strong> si el retardo {"\\(\\tau\\)"} o la ganancia por
                iluminancia {"\\(I\\)"} crecen: el área pupilar entra en un ciclo límite de oscilación sostenida ("hippus"
                fotomotor).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💡</span> Cómo provocarlo experimentalmente
            </div>
            <div className="card-body">
              <p>
                Se observa en laboratorio enfocando un haz delgado en el borde pupilar: al contraerse tapa la luz, la falta de
                luz la dilata tras el retardo {"\\(\\tau\\)"}, volviendo a recibir luz, lo que perpetúa la oscilación rítmica
                infinita.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              ▶ anima: con retardo τ bajo la pupila se asienta suavemente; con τ alto entra en oscilación sostenida sin fin. Es la
              demostración óptica directa del criterio {"\\(g\\tau_d \\le \\pi/2\\)"}.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-po" />
            <div className="prof-controls">
              <span className="badge">oscila</span>
              <button id="po_play" onClick={togglePlay} type="button">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <label>
                I{' '}
                <input
                  type="range"
                  id="po_i"
                  min="50"
                  max="1000"
                  value={iVal}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('po_i', v);
                    const span = document.getElementById('po_iv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="po_iv">{iVal}</span>
              </label>
              <label>
                τ (ms){' '}
                <input
                  type="range"
                  id="po_t"
                  min="100"
                  max="600"
                  value={tau}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('po_t', v);
                    const span = document.getElementById('po_tv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="po_tv">{tau}</span>
              </label>
              <span className="readout" id="po_out">
                {iVal > 500 && tau > 350 ? 'oscila (inestable)' : 'se asienta (estable)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
