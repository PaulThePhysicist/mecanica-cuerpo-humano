import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({
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
    <span className="mnum">12 · 4</span>
    <span className="mtitle">El axón como cable eléctrico</span>
    <span className="msub">{"\\(r_i = \\rho_i/\\pi a^2 \\qquad c_m = 2\\pi\\kappa\\epsilon_0 a/b\\)"}</span>
    <span className="mslide-count">10 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔗</span> Cuatro parámetros por unidad de longitud</div>
        <div className="card-body">
          <p>El axón se modela como un cable distribuido (Fig. 12.17) con resistencias {"\\(r_i\\)"} (axoplasma), {"\\(r_o\\)"} (exterior), {"\\(r_m\\)"} (membrana) y capacitancia {"\\(c_m\\)"}, todas por unidad de longitud. Con la Tabla 12.5 (a = 5 µm, {"\\(\\rho_i = 1,1\\ \\Omega\\cdot\\mathrm{m}\\)"}):</p>
          <div className="eq-block"><span className="eqno">(12.47–12.49)</span>{"\\[ r_i = \\frac{\\rho_i}{\\pi a^2} = 6,4\\times10^9\\ \\Omega/\\mathrm{m},\\qquad r_m = \\frac{\\rho_m}{2\\pi ab} = 8\\times10^{19}\\ \\Omega/\\mathrm{m} \\]"}</div>
          <div className="eq-block"><span className="eqno">(12.51–12.56)</span>{"\\[ c_m = \\frac{2\\pi\\kappa\\epsilon_0 a}{b} = 3\\times10^{-7}\\ \\mathrm{F/m},\\qquad c = \\frac{\\kappa\\epsilon_0}{b} = 0,01\\ \\mathrm{F/m^2} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔢</span> Grandes voltajes, pocas cargas</div>
        <div className="card-body">
          <p>A −70 mV, la densidad de carga en la pared es {"\\(\\sigma = (C/A)V = 7\\times10^{-4}\\ \\mathrm{C/m^2}\\)"}, unas <strong>4,4×10³ cargas/µm²</strong>. Un potencial de acción mueve ~2×10⁵ iones Na⁺ por segmento de 1 µm: solo <strong>+0,03 %</strong> del Na⁺ interior. <span className="highlight">Cambios grandes de voltaje con muy pocas cargas</span>.</p>
          <div className="eq-block">{"\\[ \\sigma = \\frac{q}{A} = \\frac{C}{A}\\,V = 7\\times10^{-4}\\ \\mathrm{C/m^2} \\]"}</div>
          <p>El modelo completo de la membrana con canales es el de <strong>Hodgkin–Huxley</strong> (12.67–12.71): {"\\(J_m = g_\\mathrm{Na}(V-V_\\mathrm{Na}) + g_\\mathrm{K}(V-V_\\mathrm{K}) + g_L(V-V_L)\\)"} (Nobel 1963).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-10">Mueve el radio a y el espesor b: r_i cae como 1/a² (axones gruesos conducen mejor), c_m crece con a/b. La mielina (b grande) baja c_m ~400×.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-cb" className="sim" />
        <div className="prof-controls">
          <span className="badge">cable</span>
          <label>a (µm) <input type="range" id="cb_a" min="1" max="10" defaultValue="5" step="0.5" onChange={(e) => engine.setParam('cb_a' as any, parseFloat(e.target.value))} /> <span id="cb_av">5,0 µm</span></label>
          <label>b (nm) <input type="range" id="cb_b" min="6" max="2000" defaultValue="6" step="1" onChange={(e) => engine.setParam('cb_b' as any, parseFloat(e.target.value))} /> <span id="cb_bv">6 nm</span></label>
          <span className="readout" id="cb_out">rᵢ = 6,4×10⁹ Ω/m · cₘ = 3,0×10⁻⁷ F/m</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
