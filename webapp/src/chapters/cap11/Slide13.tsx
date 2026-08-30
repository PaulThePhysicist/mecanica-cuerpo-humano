import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="5">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">Aberraciones y profundidad de campo</span>
        <span className="msub">{"\\(D(\\lambda) = p - q/(\\lambda - c)\\)"}</span>
        <span className="mslide-count">13 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌈</span> La aberración cromática
            </div>
            <div className="card-body">
              <p>
                {"El índice del ojo varía con \\(\\lambda\\) (dispersión): el foco del rojo cae más atrás que el del azul. Herman ajusta la potencia con la fórmula de Cauchy:"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.69)</span>
                {"\\[ D(\\lambda) = p - \\frac{q}{\\lambda - c},\\qquad p=1{,}7312,\\ q=0{,}63346,\\ c=0{,}21410 \\]"}
              </div>
              <p>
                La <strong>cromática</strong> total del ojo ronda los <strong>2 D</strong> sobre el visible; se minimiza
                con pupila pequeña (filtro de banda). Otras: <strong>esférica</strong> ({'\\(L\\cdot AE \\propto y^2\\)'}
                , {'\\(T\\cdot AE \\propto y^3\\)'}), coma, curvatura de campo y distorsión.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📸</span> Profundidad de campo
            </div>
            <div className="card-body">
              <p>
                Con pupila pequeña el ojo actúa como una cámara con diafragma cerrado: los rayos marginales se recortan y{' '}
                <strong>aumenta la profundidad de campo</strong> (el «agujero de alfiler» enfoca todo). De día, pupila 2
                mm: el rango nítido se extiende; de noche, pupila abierta: el foco se vuelve crítico.
              </p>
              <div className="eq-block">
                {"\\[ \\mathrm{DoF} \\propto \\frac{1}{d^2} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Desliza la longitud de onda: el foco cromático corre ~2 D entre el rojo y el azul. La pupila de 2 mm (día)
              recorta los rayos periféricos: menos aberraciones y más profundidad de campo, a costa de más difracción.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-aberr" className="sim" />
            <div className="prof-controls">
              <span className="badge">cromática</span>
              <label>
                λ{' '}
                <input
                  type="range"
                  id="ab_lam"
                  min="400"
                  max="700"
                  defaultValue={params.ab_lam}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ab_lam', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ab_lamv">555 nm</span>
              </label>
              <span className="readout" id="ab_out">
                555 nm · ΔD ≈ −0,12 D vs 578 nm · cromática total ≈ 2 D
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
