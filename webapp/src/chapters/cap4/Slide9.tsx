import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <div className="module-header">
        <span className="mnum">4.3</span>
        <span className="mtitle">La punta del pie: materiales no Hookeanos</span>
        <span className="msub">{"\\(\\sigma = \\mu(e^{\\alpha\\varepsilon} - 1)\\)"}: el módulo tangente crece al estirar</span>
        <span className="mslide-count">9 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦶</span> La "punta del pie" del tendón
            </div>
            <div className="card-body">
              <p>
                Al inicio del estiramiento, el tendón se deforma <strong>fácil</strong>: las fibras de colágeno onduladas se
                van desenrollando. Luego todo se tensa y la curva se empina. El modelo exponencial (4.22 → 4.26):
              </p>
              <div className="eq-block">
                {"\\[ \\frac{d\\sigma}{d\\varepsilon}=\\alpha(\\sigma+\\beta)\\qquad\\rightarrow\\qquad \\sigma=\\mu\\left(e^{\\alpha\\varepsilon}-1\\right) \\]"}
              </div>
              <p>
                El <strong>módulo tangente</strong> {"\\(d\\sigma/d\\varepsilon\\)"} crece con la tensión: es un resorte
                progresivo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📊</span> Los números del tendón
            </div>
            <div className="card-body">
              <p>
                El tendón es <strong>lineal hasta ~2 %</strong> de estiramiento con σ ≈ <span className="tag">16 MPa</span>,
                y en la zona útil su módulo tangente alcanza ≈ <span className="tag">1,2 GPa</span>. En la carrera (
                {"\\(\\varepsilon=6\\ \\%\\)"}, σ=53 MPa) el tendón ya está en la parte empinada: rígido cuando más energía
                hay que devolver.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              Mueve el punto y observa la recta tangente empinarse: su pendiente es el módulo tangente, que pasa de ~0,8 GPa
              (cerca de cero) a ~1 GPa en la zona de trabajo. Esa progresividad protege al tendón: se endurece justo antes de
              acercarse al UTS.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-toe" className="sim" />
            <div className="prof-controls">
              <span className="badge">σ = μ(e^{'{αε}'}−1)</span>
              <label>
                ε{' '}
                <input
                  type="range"
                  id="to_e"
                  min="0"
                  max="10"
                  step="0.1"
                  defaultValue={params.to_e}
                  onChange={(e) => {
                    engine.setParam('to_e', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="to_out">
                Eₜ = 1,0 GPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
