import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide22({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  toggleBubbles,
  toggleBreath,
  toggleSpiro,
  toggleCycle,
  togglePVLoop,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  toggleBubbles?: () => void;
  toggleBreath?: () => void;
  toggleSpiro?: () => void;
  toggleCycle?: () => void;
  togglePVLoop?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">9.6</span>
    <span className="mtitle">El trabajo de la inspiración</span>
    <span className="msub">W = V_t²/(2·C_flow) · 0,86 kcal/día</span>
    <span className="mslide-count">22 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⚡</span> Trabajo elástico (ec. 9.17–9.18)</div>
        <div className="card-body">
          <p>Con {"\\( V = V_d + C_{\\text{flow}}P \\)"}, tenemos {"\\( P = \\Delta V/C_{\\text{flow}} \\)"}. El trabajo por ciclo de volumen corriente {"\\( V_t \\)"} es</p>
          <div className="eq-block"><span className="eqno">(9.17)</span>{"\\[ W = \\int_0^{V_t} P\\,d(\\Delta V) = \\frac{V_t^2}{2C_{\\text{flow}}} \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.18)</span>{"\\[ \\frac{dW}{dt} = f\\,\\frac{V_t^2}{2C_{\\text{flow}}} \\]"}</div>
          <p>Es el área I + II de la Fig. 9.16a (compliancia); el área III es el extra para vencer la resistencia (viscosidad → histéresis).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧮</span> Los números (ec. 9.19)</div>
        <div className="card-body">
          <p>Con {"\\( f = 20/\\text{min} \\)"}, {"\\( V_t = 500\\ \\text{cm}^3 \\)"}, {"\\( C = 0{,}1\\ \\text{L/cmH}_2\\text{O} \\)"}:</p>
          <div className="eq-block"><span className="eqno">(9.19)</span>{"\\[ \\frac{dW}{dt} = \\frac{(20/\\text{min})(500\\ \\text{cm}^3)^2}{2\\,(0{,}1\\ \\text{cm}^3/(\\text{dina/cm}^2))} = 3{,}6\\times10^3\\ \\text{J/día} = 0{,}86\\ \\text{kcal/día} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫁</span> En espiración</div>
        <div className="card-body">
          <p>Normalmente no se realiza trabajo mecánico al espirar (retroceso elástico). En la <strong>respiración forzada</strong> sí se trabaja para contraer los pulmones durante la espiración.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-22">El trabajo de respirar es el área de un triángulo: V_t²/(2C). Sube con el cuadrado del volumen corriente y baja con la compliancia. Mueve V_t, C y f y mira la tasa diaria; la resistencia (área III) no está incluida aquí — la vemos en la slide siguiente.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-work" />
        <div className="prof-controls">
          <span className="badge">trabajo</span>
          <label>V_t <input type="range" id="wr_vt" min="300" max="1000" step="50" defaultValue="500" onInput={(e) => { engine.setParam("wr_vt" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="wr_vtv">500 cm³</span></label>
          <label>C <input type="range" id="wr_c" min="50" max="300" step="10" defaultValue="100" onInput={(e) => { engine.setParam("wr_c" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="wr_cv">0,10 L/cmH₂O</span></label>
          <label>f <input type="range" id="wr_f" min="10" max="40" step="1" defaultValue="20" onInput={(e) => { engine.setParam("wr_f" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="wr_fv">20 /min</span></label>
          <span className="readout" id="wr_out">dW/dt = 0,86 kcal/día</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
