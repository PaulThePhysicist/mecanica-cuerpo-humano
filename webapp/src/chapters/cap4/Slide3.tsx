import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="3" data-module="2">
      <div className="module-header">
        <span className="mnum">4.2</span>
        <span className="mtitle">Tensión y deformación: el resorte Hookeano</span>
        <span className="msub">σ = Y ε: la ley de Hooke aplicada a los tejidos</span>
        <span className="mslide-count">3 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧲</span> De la ley de Hooke al módulo de Young
            </div>
            <div className="card-body">
              <p>
                En un resorte: {"\\(F = -kx\\)"} (4.1) o, aplicada, {"\\(F_{\\text{app}} = k(L-L_0)\\)"} (4.3). Escalando la
                fuerza por el área y el estiramiento por la longitud aparece una relación <strong>independiente del tamaño</strong>:
              </p>
              <div className="eq-block">
                {"\\[ \\sigma=\\frac{F}{A}=Y\\varepsilon,\\qquad Y=\\frac{kL_0}{A},\\qquad \\varepsilon=\\frac{L-L_0}{L_0} \\]"}
              </div>
              <p>
                {"\\(Y\\)"} es el <strong>módulo de Young</strong> (la pendiente de σ–ε). Mide rigidez: cuanto mayor es{" "}
                {"\\(Y\\)"}, menos se deforma el material ante la misma tensión.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📏</span> Unidades
            </div>
            <div className="card-body">
              <p>
                {"\\(1\\ \\text{N/mm}^2 = 1\\ \\text{MPa} = 145\\ \\text{psi}\\)"}. El hueso compacto (
                {"\\(Y=17,9\\)"} GPa) es ≈ <span className="tag">200×</span> más rígido que los tejidos blandos (
                {"\\(Y\\approx 0,1\\)"} GPa).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              En el canvas: sube la fuerza y observa que el punto se desliza por la misma recta — esa pendiente constante ES
              el módulo de Young. Un material Hookeano es una recta que pasa por el origen.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-hooke" className="sim" />
            <div className="prof-controls">
              <span className="badge">F = k(L–L₀)</span>
              <label>
                F{' '}
                <input
                  type="range"
                  id="hk_F"
                  min="0"
                  max="700"
                  step="5"
                  defaultValue={params.hk_F}
                  onChange={(e) => {
                    engine.setParam('hk_F', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="hk_out">
                σ = 0,9 MPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
