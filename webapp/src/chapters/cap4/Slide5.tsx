import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <div className="module-header">
        <span className="mnum">4.2</span>
        <span className="mtitle">Cortadura y efecto de Poisson</span>
        <span className="msub">{"\\(\\tau = G \\gamma\\)"} y el adelgazamiento al estirar</span>
        <span className="mslide-count">5 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">✂️</span> Esfuerzo cortante
            </div>
            <div className="card-body">
              <p>
                Cuando la fuerza es <strong>paralela</strong> a la superficie (no perpendicular), el material se deforma en
                ángulo {"\\(\\gamma\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ \\tau=\\frac{F}{A},\\qquad \\tau=G\\gamma \\]"}
              </div>
              <p>
                {"\\(G\\)"} es el <strong>módulo de rigidez</strong> (Tabla 4.3: hueso {"\\(G=3{,}51\\)"} GPa). Los discos
                intervertebrales y los ligamentos de la rodilla trabajan en cortadura al inclinarse o torcerse.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🍾</span> Efecto de Poisson
            </div>
            <div className="card-body">
              <p>
                Al <strong>estirar</strong> un material en una dirección, <strong>se adelgaza</strong> en las otras dos:
              </p>
              <div className="eq-block">
                {"\\[ \\upsilon=-\\frac{\\varepsilon_x}{\\varepsilon_z}\\qquad -1<\\upsilon<0{,}5 \\]"}
              </div>
              <p>
                El hueso tiene {"\\(\\upsilon\\approx 0{,}39\\)"} (Tabla 4.3); el corcho {"\\(\\upsilon\\approx 0\\)"} (no se
                adelgaza al estirar).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔗</span> Solo dos constantes independientes
            </div>
            <div className="card-body">
              <p>
                En un material isótropo, {"\\(Y\\)"}, {"\\(G\\)"} y {"\\(\\upsilon\\)"} no son libres:
              </p>
              <div className="eq-block">
                {"\\[ Y=2G(1+\\upsilon) \\]"}
              </div>
              <p>
                Con los datos del hueso: {"\\(9{,}6 \\approx 2(3{,}51)(1+0{,}39)\\)"} ✓ — el módulo transversal (9,6 GPa)
                es consistente con {"\\(G\\)"} y {"\\(\\upsilon\\)"}.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              El esguince de tobillo es un fallo por cortadura del ligamento: la fuerza paralela supera su resistencia.
              Mueve γ en el canvas: la tensión crece lineal (τ = Gγ) hasta que el ligamento "cede".
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-shear" className="sim" />
            <div className="prof-controls">
              <span className="badge">cortadura</span>
              <label>
                γ{' '}
                <input
                  type="range"
                  id="sh_g"
                  min="0"
                  max="10"
                  step="0.1"
                  defaultValue={params.sh_g}
                  onChange={(e) => {
                    engine.setParam('sh_g', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="sh_out">
                τ = 184 MPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
