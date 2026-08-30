import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide13({
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
    <span className="mnum">9.5.1</span>
    <span className="mtitle">Presión media y flujo sinusoidal</span>
    <span className="msub">ΔP_av = (2/π)·ΔP_max · Q_max = (π/2)·Q_av · Re ≈ 1.600</span>
    <span className="mslide-count">13 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌊</span> Medio ciclo senoidal (ec. 9.11–9.12)</div>
        <div className="card-body">
          <p>Modelamos la inhalación como medio ciclo de onda senoidal: {"\\( \\Delta P(t) = \\Delta P_{\\max}\\sin(\\pi t/T_{\\text{half}}) \\)"}, con {"\\( T_{\\text{half}} = 1/(2f) \\)"}. La presión promedio es</p>
          <div className="eq-block"><span className="eqno">(9.11–9.12)</span>{"\\[ \\Delta P_{\\text{av}} = \\frac{1}{T}\\int_0^T \\Delta P_{\\max}\\sin\\left(\\frac{\\pi t}{T}\\right)dt = \\frac{2}{\\pi}\\Delta P_{\\max} \\]"}</div>
          <p>Para {"\\( \\Delta P_{\\max} = 1{,}1\\ \\text{mmHg} \\)"}: {"\\( \\Delta P_{\\text{av}} = 0{,}7\\ \\text{mmHg} \\)"}.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🚰</span> Flujo y resistencia</div>
        <div className="card-body">
          <p>Con {"\\( V_{\\text{in}} = 0{,}5\\ \\text{L} \\)"}: {"\\( Q_{\\text{av}} = 0{,}25\\ \\text{L/s} \\)"} y {"\\( Q_{\\max} = (\\pi/2)Q_{\\text{av}} = 0{,}4\\ \\text{L/s} \\)"}. Si {"\\( Q \\propto \\Delta P \\)"}, ambas tienen la misma dependencia temporal. La resistencia es</p>
          <div className="eq-block">{"\\[ R_{\\text{flow}} = \\frac{\\Delta P}{Q} = \\frac{0{,}7\\ \\text{mmHg}}{0{,}25\\ \\text{L/s}} = 3{,}7\\times10^5\\ \\text{Pa·s/m}^3 \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🌀</span> ¿Laminar o turbulento?</div>
        <div className="card-body">
          <p>Tráquea: {"\\( r = 9\\ \\text{mm} \\)"}, {"\\( u_{\\max} = Q_{\\max}/A = 160\\ \\text{cm/s} \\)"}. Con {"\\( \\rho = 1{,}16\\times10^{-3}\\ \\text{g/cm}^3 \\)"} y {"\\( \\eta = 2\\times10^{-5}\\ \\text{Pa·s} \\)"}, {"\\( Re = \\rho u d/\\eta \\approx 1.600 \\)"} → <span className="tag">laminar</span> (y en fosas y faringe; algo de turbulencia por paredes no lisas). En la nariz el aire gira 90° y el flujo turbulento humedece y limpia el aire.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-13">La integral del medio seno produce el factor 2/π ≈ 0,64: la presión media es el 64 % de la máxima. Del flujo medio al máximo, el inverso π/2. Mueve ΔP_max y V_in y mira encadenarse Q_av, Q_max, R_flow y Re en el readout.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-sine" />
        <div className="prof-controls">
          <span className="badge">onda senoidal</span>
          <label>ΔP_max <input type="range" id="sn_pmax" min="0.5" max="2.5" step="0.1" defaultValue="1.1" onInput={(e) => { engine.setParam("sn_pmax" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="sn_pmaxv">1,1 mmHg</span></label>
          <label>V_in <input type="range" id="sn_vin" min="300" max="800" step="50" defaultValue="500" onInput={(e) => { engine.setParam("sn_vin" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="sn_vinv">0,5 L</span></label>
          <span className="readout" id="sn_out">ΔP_av 0,7 mmHg · Q_av 0,25 L/s</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
