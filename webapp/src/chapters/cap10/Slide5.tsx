import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <div className="module-header">
        <span className="mnum">10 · 3</span>
        <span className="mtitle">Resonancia del canal auditivo</span>
        <span className="msub">{"\\(f_1 = v/4L\\ \\text{(tubo cerrado)}\\)"}</span>
        <span className="mslide-count">5 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👂</span> Un amplificador de ~3 kHz en tu oído
            </div>
            <div className="card-body">
              <p>
                El conducto auditivo externo es un tubo de unos 2,5–3,5 cm cerrado por el tímpano. Como resonador de
                cuarto de onda amplifica la presión en la banda de máxima sensibilidad:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.39)</span>
                {"\\[ f_1 = \\frac{v}{4L} = \\frac{343}{4\\times 0{,}025} \\approx 3\\,430\\ \\mathrm{Hz} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎈</span> Resonador de Helmholtz
            </div>
            <div className="card-body">
              <p>
                El canal también actúa como resonador de Helmholtz (masa de aire del cuello + volumen de aire), con área{' '}
                {"\\(A\\)"}, largo {"\\(l\\)"} del cuello y volumen {"\\(V\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ f_0 = \\frac{v}{2\\pi}\\sqrt{\\frac{A}{V\\,l}} \\]"}
              </div>
              <p>
                La combinación de ambos efectos da picos de presión de 5–10 dB cerca de 2,5–4 kHz: justo la banda donde el
                habla concentra su energía.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              El pico de la curva aparece en la banda crítica 2–4 kHz. Alarga el canal en el control y el pico baja: un
              canal «más largo» sintoniza más grave.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-earcanal" className="sim" />
            <div className="prof-controls">
              <span className="badge">canal</span>
              <label>
                Longitud canal{' '}
                <input
                  type="range"
                  id="ea_L"
                  min="18"
                  max="40"
                  defaultValue={params.ea_L}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('ea_L', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ea_Lv">25,0 mm</span>
              </label>
              <span className="readout" id="ea_out">
                f₁ = 3430 Hz · ganancia ≈ +7 dB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
