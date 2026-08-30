import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({
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
    <span className="mnum">12 · 3</span>
    <span className="mtitle">La membrana celular y el potencial de reposo</span>
    <span className="msub">{"\\(\\mathrm{Na^+}_{i/o} = 15/145\\quad \\mathrm{K^+}_{i/o} = 150/5\\ \\mathrm{mmol/L}\\)"}</span>
    <span className="mslide-count">6 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🛡️</span> El reposo: −70 mV</div>
        <div className="card-body">
          <p>La membrana separa el interior (negativo) del exterior (definido 0 V): reposo de <strong>−70 mV</strong> (estado polarizado, Fig. 12.9–12.10). Subir el potencial (a −60 mV) es <strong>despolarización</strong>; bajarlo (a −80 mV) es <strong>hiperpolarización</strong>. Cada lado es eléctricamente neutro: hay tantas cargas + como −.</p>
          <div className="eq-block">{"\\[ n_i/n_o = \\exp\\!\\big(-Ze(V_i-V_o)/k_BT\\big)\\qquad \\text{equilibrio de Donnan (12.28)} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⛲</span> Tres fuerzas impulsoras + la bomba</div>
        <div className="card-body">
          <p>(1) La <strong>difusión</strong> tiende a igualar concentraciones. (2) El <strong>campo eléctrico</strong> mueve las cargas ({"\\(v_\\mathrm{drift}=\\mu E\\)"}). (3) La <strong>permeabilidad</strong> selectiva (K⁺ y Cl⁻ pasan, las proteínas negativas no) y la <strong>bomba Na⁺/K⁺</strong>, que saca 3 Na⁺ por cada 2 K⁺ que entra. En un nervio típico: <span className="tag">Na 15/145</span><span className="tag">K 150/5</span><span className="tag">Cl 9/125</span> (mmol/L).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-6">Las barras muestran el gradiente dentro/fuera: el Na⁺ está afuera (12:1), el K⁺ dentro (30:1), el Cl⁻ afuera. La bomba Na⁺/K⁺ trabaja contra la difusión para mantenerlo.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-mr" className="sim" />
        <div className="prof-controls">
          <span className="badge">membrana</span>
          <label>Estado <select id="mr_sel" onChange={(e) => engine.setParam('mr_sel' as any, parseInt(e.target.value, 10))}><option value="0">Polarizada (−70)</option><option value="1">Despolarizada (−60)</option><option value="2">Hiperpolarizada (−80)</option></select></label>
          <span className="readout" id="mr_out">reposo −70 mV</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
