import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({
  engine,
  go,
  goModule,
  next,
  prev,
  toggleAction,
  toggleEinhoven,
  toggleECG,
  toggleMyo,
  toggleEEG,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">12 · 1</span>
    <span className="mtitle">Corriente, Ohm, Kirchhoff y capacitancia</span>
    <span className="msub">{"\\(\\sum_n I_n = 0 \\qquad V = IR \\qquad V = q/C\\)"}</span>
    <span className="mslide-count">3 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔌</span> La corriente se conserva: 1.ª ley</div>
        <div className="card-body">
          <p>La corriente {"\\(I = dq/dt\\)"} y su densidad {"\\(J = I/A\\)"}. La carga no se crea ni se pierde: en un nodo, en estado estacionario la suma vectorial de corrientes es cero:</p>
          <div className="eq-block"><span className="eqno">(12.8)</span>{"\\[ \\sum_n I_n = 0 \\]"}</div>
          <p>La ley de Ohm y la resistencia por geometría (Fig. 12.3):</p>
          <div className="eq-block"><span className="eqno">(12.9–12.11)</span>{"\\[ V = IR,\\qquad R = \\frac{\\rho L}{A},\\qquad r = \\frac{R}{L} = \\frac{\\rho}{A} \\]"}</div>
          <p><span className="tag">G = 1/R (S)</span><span className="tag">σ = 1/ρ</span><span className="tag">g = G/A</span></p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧱</span> Capacitancia y 2.ª ley</div>
        <div className="card-body">
          <p>Dos estructuras con cargas {"\\(+q\\)"} y {"\\(-q\\)"} guardan un voltaje {"\\(V = q/C\\)"}. La membrana del axón es como dos cilindros concéntricos (Fig. 12.4); el condensador de placas paralelas:</p>
          <div className="eq-block"><span className="eqno">(12.12–12.13)</span>{"\\[ V = \\frac{q}{C},\\qquad C = \\frac{\\kappa\\epsilon_0 A}{b} \\]"}</div>
          <p>En un lazo cerrado la suma de caídas de voltaje se anula:</p>
          <div className="eq-block"><span className="eqno">(12.14)</span>{"\\[ \\sum_n V_n = 0 \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-3">Mueve las corrientes I₁ e I₂: la tercera se ajusta sola para que {"\\(\\Sigma I = 0\\)"} (1.ª ley de Kirchhoff). La membrana celular, con su capacitancia, guarda carga igual que un condensador.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-oc" className="sim" />
        <div className="prof-controls">
          <span className="badge">Kirchhoff</span>
          <label>I₁ (entra) <input type="range" id="oc_i1" min="0" max="100" defaultValue="40" step="1" onChange={(e) => engine.setParam('oc_i1' as any, parseFloat(e.target.value))} /> <span id="oc_i1v">40 mA</span></label>
          <label>I₂ (entra) <input type="range" id="oc_i2" min="0" max="100" defaultValue="30" step="1" onChange={(e) => engine.setParam('oc_i2' as any, parseFloat(e.target.value))} /> <span id="oc_i2v">30 mA</span></label>
          <span className="readout" id="oc_out">I₃ = I₁ + I₂ = 70 mA · ΣI = 0</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
