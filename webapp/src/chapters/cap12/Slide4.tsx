import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({
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
    <span className="mnum">12 · 2</span>
    <span className="mtitle">La conductividad de las soluciones</span>
    <span className="msub">{"\\(\\sigma = \\sum_i n_i\\,\\Lambda_{0,i}\\)"}</span>
    <span className="mslide-count">4 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧪</span> Cada ion aporta su corriente</div>
        <div className="card-body">
          <p>Al aplicar voltaje a una solución, iones positivos y negativos se mueven con el campo. La conductividad es la suma de las contribuciones de cada ion, proporcional a su concentración (a dilución baja):</p>
          <div className="eq-block"><span className="eqno">(12.15)</span>{"\\[ \\sigma = \\sum_i n_i\\,\\Lambda_{0,i} \\]"}</div>
          <p>Con {"\\(\\Lambda_{0,i}\\)"} la <em>conductancia molar a dilución infinita</em> (Tabla 12.2):</p>
          <table className="data-mini">
            <tr><th>Ion</th><th>Λ₀ (1/Ω·m·M)</th></tr>
            <tr><td>H⁺</td><td>34,9</td></tr>
            <tr><td>OH⁻</td><td>19,8</td></tr>
            <tr><td>Na⁺</td><td>5,0</td></tr>
            <tr><td>Cl⁻</td><td>7,6</td></tr>
            <tr className="table-caption"><td colSpan={2}>El H⁺ es ~7× más móvil que el Na⁺.</td></tr>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫀</span> Sangre y citoplasma (Tabla 12.3)</div>
        <div className="card-body">
          <p>Los iones libres en sangre y en el interior de la célula no son iguales:</p>
          <table className="data-mini">
            <tr><th>Ion</th><th>Sangre</th><th>Citoplasma</th><th>Relación</th></tr>
            <tr><td>Na⁺</td><td>145 mM</td><td>12 mM</td><td>12:1</td></tr>
            <tr><td>K⁺</td><td>4 mM</td><td>140 mM</td><td>1:35</td></tr>
            <tr><td>Ca²⁺</td><td>1,8 mM</td><td>100 nM</td><td>18:1</td></tr>
            <tr><td>Cl⁻</td><td>115 mM</td><td>4 mM</td><td>29:1</td></tr>
            <tr><td>HCO₃⁻</td><td>25 mM</td><td>10 mM</td><td>2,5:1</td></tr>
            <tr className="table-caption"><td colSpan={4}>Estos gradientes son la «batería» de la célula.</td></tr>
          </table>
          <p>Con {"\\(\\rho = 1/\\sigma\\)"} y {"\\(R = \\rho L/A\\)"} se estima la resistencia de cualquier trayecto.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-4">Sube las concentraciones: cada barra suma su conductancia. El H⁺ con su Λ₀ grande (34,9) pesa mucho aunque esté a baja concentración; el pH cambia la conductividad de la sangre.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-cs" className="sim" />
        <div className="prof-controls">
          <span className="badge">σ = ΣnΛ</span>
          <label>[Na⁺] <input type="range" id="cs_na" min="0" max="150" defaultValue="145" step="1" onChange={(e) => engine.setParam('cs_na' as any, parseFloat(e.target.value))} /> <span id="cs_nav">145 mM</span></label>
          <label>[K⁺] <input type="range" id="cs_k" min="0" max="150" defaultValue="5" step="1" onChange={(e) => engine.setParam('cs_k' as any, parseFloat(e.target.value))} /> <span id="cs_kv">5 mM</span></label>
          <label>[H⁺] <input type="range" id="cs_h" min="0" max="150" defaultValue="40" step="1" onChange={(e) => engine.setParam('cs_h' as any, parseFloat(e.target.value))} /> <span id="cs_hv">40 nM</span></label>
          <span className="readout" id="cs_out">σ ≈ 1,63 S/m</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
