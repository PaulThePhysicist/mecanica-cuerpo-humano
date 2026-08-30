import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide13({ engine }: SlideProps) {
  const p = engine?.paramsRef.current.br_p ?? 100;
  const pt = engine?.paramsRef.current.br_pt ?? 80;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 5</span>
        <span className="mtitle">Presión arterial: el barorreceptor</span>
        <span className="msub">{"\\(F + K_1\\dot F = K_2(p_b-p_t)+K_3\\dot p_b\\)"}</span>
        <span className="mslide-count">13 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">❤️</span> El sensor del seno carotídeo
            </div>
            <div className="card-body">
              <p>
                Los barorreceptores del seno carotídeo detectan la presión arterial {"\\(p_b\\)"} y emiten una señal por el nervio
                del seno carotídeo al cerebro. La frecuencia de disparo {"\\(F\\)"} es proporcional al exceso sobre un umbral{" "}
                {"\\(p_t\\)"} (modelo viscoelástico tipo Kelvin):
              </p>
              <div className="eq-block">
                <span className="eqno">(13.34)</span>
                {"\\[ F + K_1\\frac{dF}{dt} = K_2(p_b-p_t) + K_3\\frac{dp_b}{dt} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> Dos términos derivados
            </div>
            <div className="card-body">
              <p>
                El término {"\\(dp_b/dt\\)"} describe el <strong>sobreimpulso</strong> (overshoot) dinámico de la frecuencia; el
                término {"\\(dF/dt\\)"} explica la acomodación y que las tasas de disparo siguen cambiando aunque la presión ya se
                haya estabilizado.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Mueve la presión pb: la frecuencia F sube por encima del umbral pt con un sobreimpulso cuando pb cambia rápido. Es
              el mismo tipo de ecuación diferencial de primer orden que el modelo de Kelvin en biomecánica tisular.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-br" />
            <div className="prof-controls">
              <span className="badge">baro</span>
              <label>
                p_b{' '}
                <input
                  type="range"
                  id="br_p"
                  min="40"
                  max="200"
                  value={p}
                  step="1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('br_p', v);
                    const span = document.getElementById('br_pv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="br_pv">{p}</span>
              </label>
              <label>
                p_t{' '}
                <input
                  type="range"
                  id="br_pt"
                  min="40"
                  max="120"
                  value={pt}
                  step="1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('br_pt', v);
                    const span = document.getElementById('br_ptv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="br_ptv">{pt}</span>
              </label>
              <span className="readout" id="br_out">
                F ∝ {Math.max(0, p - pt)} mmHg
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
