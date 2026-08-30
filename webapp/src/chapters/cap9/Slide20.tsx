import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide20({
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
    <span className="mnum">9.5.5</span>
    <span className="mtitle">La presión atmosférica con la altura</span>
    <span className="msub">P(h) = P₀·exp(−mgh/RT) · hipoxia a 8,25 km</span>
    <span className="mslide-count">20 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📉</span> La atmósfera (ec. 9.13–9.16)</div>
        <div className="card-body">
          <p>El cambio de presión con la altura, para una columna de aire de densidad {"\\( \\rho \\)"}:</p>
          <div className="eq-block"><span className="eqno">(9.13)</span>{"\\[ dP = -\\rho g\\,dz \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.14)</span>{"\\[ P = \\frac{RT}{m}\\,\\rho \\]"}</div>
          <p>dividiendo (gas ideal, {"\\( m \\)"} masa molecular):</p>
          <div className="eq-block"><span className="eqno">(9.15)</span>{"\\[ \\frac{dP}{P} = -\\frac{mg}{RT}\\,dz \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.16)</span>{"\\[ P(h) = P_{\\text{nivel del mar}}\\exp\\left(-\\frac{mg}{RT}\\,h\\right) \\]"}</div>
          <p>con {"\\( m = 32\\ \\text{g/mol} \\)"} (O₂) y {"\\( T = 300\\ \\text{K} \\)"}.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🏔️</span> La hipoxia en altura</div>
        <div className="card-body">
          <p>Desde {"\\( P_{\\text{O}_2} = 161\\ \\text{mmHg} \\)"}, la hipoxia (57 mmHg) llega a <span className="tag">8,25 km</span> = 27.100 ft = 5,1 millas. El Everest (29.029 ft ≈ 8,85 km) queda en la frontera. Con la temperatura variable (ec. 9.21, Prob. 9.48) la hipoxia baja a 7,21 km:</p>
          <div className="eq-block"><span className="eqno">(9.21)</span>{"\\[ P(h) = P_0\\left(\\frac{T_0}{T_0 + \\alpha h}\\right)^{\\frac{gm}{R\\alpha}} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">✈️</span> Aviación</div>
        <div className="card-body">
          <p>Los aviones comerciales vuelan a ~10,7 km (35.000 ft): la presión cae tanto que la cabina se presuriza y hay mascarillas de O₂ por si se despresuriza (Prob. 9.45).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-20">La presión cae exponencialmente, no lineal: cada ~8 km se divide por e. Para el O₂ (m = 32 g/mol) la hipoxia aparece a 8,25 km; en la cumbre del Everest la P_O₂ ≈ 53 mmHg — por debajo del umbral, por eso los alpinistas llevan oxígeno. Mueve el slider de altura.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-altitude" />
        <div className="prof-controls">
          <span className="badge">altura</span>
          <label>h <input type="range" id="al_h" min="0" max="12000" step="100" defaultValue="8250" onInput={(e) => { engine.setParam("al_h" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="al_hv">8,25 km</span></label>
          <span className="readout" id="al_out">P_O₂ = 57 mmHg · hipoxia</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
