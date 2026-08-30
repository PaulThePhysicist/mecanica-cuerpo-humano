import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="20" data-module="8">
      <div className="module-header">
        <span className="mnum">7.4</span>
        <span className="mtitle">La vejiga y la relación presión-volumen</span>
        <span className="msub">El cistometrograma y la ley de Laplace</span>
        <span className="mslide-count">20 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💦</span> El cistometrograma (Fig. 7.23)
            </div>
            <div className="card-body">
              <p>
                La presión sube a <span className="tag">5–10 cmH₂O</span> al llenar <span className="tag">30–50 mL</span>;
                luego se acumulan <span className="tag">200–300 mL</span> más con poco cambio. Sobre{' '}
                <span className="tag">300–400 mL</span> la presión sube rápido: la <strong>necesidad de orinar</strong>{' '}
                aparece a ≈ <span className="tag">30 cmH₂O</span> (3 kPa).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚽</span> Vaciar la vejiga
            </div>
            <div className="card-body">
              <p>
                La micción normal ocurre a <span className="tag">20–40 cmH₂O</span> (2–4 kPa). Los reflejos de micción
                (ondas agudas en la figura) disparan la presión <em>momentáneamente</em> hasta{' '}
                <span className="tag">150 cmH₂O</span> (15 kPa).
              </p>
              <p>
                Conversión: <span className="tag">1 cmH₂O = 0,738 mmHg</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎈</span> Lo que dice Laplace
            </div>
            <div className="card-body">
              <p>
                Modelando la vejiga como esfera de pared constante, la tensión de pared crece como{' '}
                <span className="tag">{"\\(V^{1/3}\\)"}</span>, no como {"\\(V\\)"}. La presión interior queda casi plana.
              </p>
              <p>
                Por eso los <strong>sensores de llenado están en la pared</strong>, midiendo el esfuerzo, y no la presión —
                que apenas cambia.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              El mismo principio que en el estómago: la tensión crece como la raíz cúbica del volumen, la presión queda plana.
              En el canvas recorre el volumen y mira: meseta hasta ~300 mL, luego el ascenso — y dónde aparece «ganas de
              orinar». Es un cistometrograma dibujado en vivo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bladder" />
            <div className="prof-controls">
              <span className="badge">vejiga</span>
              <label>
                V{' '}
                <input
                  type="range"
                  id="bl_v"
                  min="0"
                  max="600"
                  step="5"
                  defaultValue={params.bl_v}
                  onInput={(e) => {
                    engine.setParam('bl_v', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="bl_vv">200 mL</span>
              </label>
              <span className="readout" id="bl_out">
                P ≈ 12 cmH₂O · tensión σ ∝ V^⅓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
