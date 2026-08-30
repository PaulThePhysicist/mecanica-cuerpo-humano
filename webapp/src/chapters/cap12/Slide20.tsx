import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({
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
    <span className="mnum">12 · 7</span>
    <span className="mtitle">Efectos de las descargas eléctricas</span>
    <span className="msub">{"\\(I = V/R\\qquad \\text{CA 60 Hz}\\)"}</span>
    <span className="mslide-count">20 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⚡</span> De la cosquilla a la fibrilación</div>
        <div className="card-body">
          <p>La CA de 60 Hz anula el control muscular sobre ~10 mA (apenas se suelta un objeto), provoca <strong>fibrilación ventricular entre 100 mA y 4 A</strong>, y parálisis + quemaduras + muerte por encima de 4 A. La sensación crece como la potencia 3,5 del voltaje (ley de Stevens).</p>
          <table className="data-mini">
            <tr><th>Efecto (~1 s)</th><th>CC</th><th>CA 60 Hz</th></tr>
            <tr><td>Umbral de percepción</td><td>3,5</td><td>0,7</td></tr>
            <tr><td>Doloroso</td><td>41</td><td>6</td></tr>
            <tr><td>Umbral de soltar</td><td>51</td><td>10,5</td></tr>
            <tr><td>Fibrilación ventricular</td><td>500</td><td>100</td></tr>
            <tr className="table-caption"><td colSpan={3}>Tabla 12.7 · valores en mA, aproximados.</td></tr>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🛡️</span> La piel decide</div>
        <div className="card-body">
          <p>La piel seca opone 100 000–600 000 Ω; la húmeda ~1 000 Ω. Superada la piel, el interior es bajo: 400–600 Ω cabeza–pies, 100 Ω oreja–oreja (Fig. 12.40). Con 500 Ω efectivos, <strong>120 V CA → 240 mA</strong> (letal; el disyuntor de 15 A no lo corta); una batería de 9 V → <strong>18 mA</strong> (descarga).</p>
          <div className="eq-block">{"\\[ I = \\frac{V}{R} = \\frac{120\\ \\mathrm{V}}{500\\ \\Omega} = 240\\ \\mathrm{mA} \\gg 100\\ \\mathrm{mA}\\ \\text{(fibrilación)} \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-20">Mueve el voltaje y elige la resistencia (piel seca/húmeda/interna): la corriente salta por la ley de Ohm. Marca las zonas: &lt; 10 mA, 100 mA–4 A y &gt; 4 A.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-sh" className="sim" />
        <div className="prof-controls">
          <span className="badge">descarga</span>
          <label>V (voltios) <input type="range" id="sh_v" min="0" max="240" defaultValue="120" step="1" onChange={(e) => engine.setParam('sh_v' as any, parseFloat(e.target.value))} /> <span id="sh_vv">120 V</span></label>
          <label>Resistencia <select id="sh_sel" onChange={(e) => engine.setParam('sh_sel' as any, parseInt(e.target.value, 10))}><option value="0">Piel seca · 500 kΩ</option><option value="1">Piel húmeda · 1 kΩ</option><option value="2">Interna · 500 Ω</option></select></label>
          <span className="readout" id="sh_out">120 V / 500 kΩ = 240 µA · baja corriente</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
