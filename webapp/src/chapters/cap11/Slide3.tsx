import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="3" data-module="1">
      <div className="module-header">
        <span className="mnum">11 · 1</span>
        <span className="mtitle">Fotones, energía y rodopsina</span>
        <span className="msub">{"\\(E = hc/\\lambda\\)"}</span>
        <span className="mslide-count">3 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💡</span> Cada color, un fotón con su energía
            </div>
            <div className="card-body">
              <p>
                La luz visible (400–700 nm) transporta cuantos de energía {'\\(E = h\\nu\\)'}. Un fotón de 600 nm vale ≈
                3×10⁻¹⁹ J. Del total que entra por la pupila, solo <strong>~50 %</strong> llega a la retina (pérdidas por
                reflexión, absorción y dispersión).
              </p>
              <div className="eq-block">
                <span className="eqno">(11.1)</span>
                {"\\[ E = h\\nu = \\frac{hc}{\\lambda} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧬</span> La rodopsina: un fotón dispara una cascada
            </div>
            <div className="card-body">
              <p>
                El pigmento de los bastones es la <strong>rodopsina</strong> (opsina + 11-<em>cis</em>-retinal). Un fotón
                absorbido <strong>isomeriza el 11-<em>cis</em> en todo-<em>trans</em></strong>, y la cascada enzimática
                amplifica la señal hasta cerrar canales iónicos. El umbral llega a ser de <strong>un solo fotón</strong>.
              </p>
              <div className="eq-block">
                {"\\[ \\text{11-}cis \\;\\xrightarrow{\\;h\\nu\\;}\\; \\text{todo-}trans \\;\\rightarrow\\; \\text{hiperpolarización del bastón} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              Desliza la longitud de onda: el ultravioleta (400 nm) lleva fotones ~1,5× más energéticos que el rojo (650
              nm). La rodopsina solo absorbe donde su espectro se solapa: 400–620 nm con pico en 500 nm.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-photon" className="sim" />
            <div className="prof-controls">
              <span className="badge">fotón</span>
              <label>
                λ{' '}
                <input
                  type="range"
                  id="ph_lam"
                  min="400"
                  max="700"
                  defaultValue={params.ph_lam}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ph_lam', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ph_lamv">555 nm</span>
              </label>
              <span className="readout" id="ph_out">
                555 nm · E ≈ 3,6×10⁻¹⁹ J
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
