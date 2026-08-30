import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide12({
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
    <span className="mnum">8.2</span>
    <span className="mtitle">Arterias obstruidas: el efecto Bernoulli</span>
    <span className="msub">La sangre se acelera y la presión cae en la zona estrecha</span>
    <span className="mslide-count">12 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🚧</span> Continuidad en la estenosis</div>
        <div className="card-body">
          <p>En la zona estrecha la misma sangre debe pasar más rápido (eq. 8.33):</p>
          <div className="eq-block">{"\\[  u_2 = \\frac{A_1}{A_2}\\, u_1  \\]"}</div>
          <p>Si {"\\( A_2/A_1 = 1/3 \\)"}, entonces <span className="tag">u₂ = 3·u₁</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> La caída de presión (eq. 8.34)</div>
        <div className="card-body">
          <p>Bernoulli: la energía cinética que gana la sangre se paga con presión:</p>
          <div className="eq-block">{"\\[  P_2 - P_1 = \\tfrac{1}{2}\\rho u_1^2\\left(1 - \\left(\\tfrac{A_1}{A_2}\\right)^2\\right)  \\]"}</div>
          <p>Con {"\\( A_2/A_1 = 1/3 \\)"}: <span className="tag">P₂ − P₁ = −4ρu₁²</span>. La presión baja pos-estenosis.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🩺</span> Clínica</div>
        <div className="card-body">
          <p>El <span className="tag">soplo</span> por turbulencia y el <span className="tag">pulso débil</span> distal son signos clásicos. En las coronarias, una obstrucción que baje la presión pos-estenosis reduce la perfusión del miocardio → <span className="tag">angina</span>.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-12">Bernoulli aplicado a la placa: la sangre acelera al pasar el estrechamiento (continuidad) y paga esa energía con presión (Bernoulli). Por eso hay hipoperfusión distal aunque el flujo medio no cambie. En el canvas estrecha el vaso: las partículas se espacian (veloces) y la caída de presión se dispara.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-obstruction" />
        <div className="prof-controls">
          <span className="badge">obstrucción</span>
          <label>A₂/A₁ <input type="range" id="ob_a" min="0.1" max="1" step="0.05" defaultValue={0.33} onChange={(e) => { engine.setParam('ob_a', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="ob_av">0,33</span></label>
          <span className="readout" id="ob_out">u₂/u₁ = 3,0 · P₂−P₁ = −2,9 mmHg</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
