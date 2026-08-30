import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide13({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">8.3</span>
    <span className="mtitle">Aneurismas y la bifurcación</span>
    <span className="msub">La pared lateral paga la desviación del flujo</span>
    <span className="mslide-count">13 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🎯</span> Fuerza lateral en la bifurcación</div>
        <div className="card-body">
          <p>Al bifurcarse, la sangre cambia de dirección y la pared recibe una fuerza neta (continuidad: {"\\( Q = u_1 A_1 = 2 u_2 A_2 \\)"}, eq. 8.36):</p>
          <div className="eq-block">{"\\[  F_{\\text{pared}} = \\rho\\, Q\\,(u_2\\cos\\theta - u_1) = \\rho A_1 u_1^2\\left(\\frac{A_1}{2A_2}\\cos\\theta - 1\\right)  \\]"}</div>
          <p>Presión sobre la pared (eq. 8.41): <span className="tag">P_pared = ρu₁² ≈ 2 mmHg</span> para u₁ = 50 cm/s.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧠</span> El polígono de Willis</div>
        <div className="card-body">
          <p>Los <span className="tag">aneurismas saculares</span> nacen en las bifurcaciones cerebrales, donde esta fuerza lateral golpea la pared. Su rotura es el <span className="tag">ACV hemorrágico</span> (~20 % de todos los ictus, sobre todo en jóvenes).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📈</span> El círculo vicioso de Laplace</div>
        <div className="card-body">
          <p>Una vez formado el saco, Laplace {"\\( \\Delta P = T/R \\)"} exige <strong>más tensión cuanto mayor el radio</strong> → la pared se estira → crece más. La ruptura llega cuando la tensión supera el UTS del tejido.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-13">La bifurcación convierte el impulso lineal en un golpe a la pared: cuanta más velocidad y más agudo el ángulo, más fuerza lateral. En el canvas abre el ángulo θ y sube la velocidad: la flecha sobre la pared crece. Esa es la física del aneurisma del polígono de Willis.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-aneurysm" />
        <div className="prof-controls">
          <span className="badge">bifurcación</span>
          <label>θ <input type="range" id="an_t" min="0" max="80" step="5" defaultValue={45} onChange={(e) => { engine.setParam('an_t', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="an_tv">45°</span></label>
          <label>A₂/A₁ <input type="range" id="an_a" min="0.3" max="1" step="0.05" defaultValue={0.5} onChange={(e) => { engine.setParam('an_a', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="an_av">0,50</span></label>
          <label>u₁ <input type="range" id="an_u" min="20" max="100" step="5" defaultValue={50} onChange={(e) => { engine.setParam('an_u', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="an_uv">50 cm/s</span></label>
          <span className="readout" id="an_out">F_pared ≈ 38 mN · P_pared ≈ 1,3 mmHg</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
