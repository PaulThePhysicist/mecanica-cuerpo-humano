import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide18({
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
    <span className="mnum">9.5.4</span>
    <span className="mtitle">CVF y VEF₁</span>
    <span className="msub">Normal 5,0 L / 80 % · Obstructivo 3,1 L / 42 % · Restrictivo 3,1 L / 90 %</span>
    <span className="mslide-count">18 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📐</span> Espiración forzada (Fig. 9.21)</div>
        <div className="card-body">
          <p>Tras una inspiración muy profunda se expulsa el aire lo más rápido posible. El volumen total exhalado es la <strong>capacidad vital forzada (CVF)</strong> y el volumen del primer segundo es el <strong>VEF₁</strong> (volumen espiratorio forzado en 1 s). Su relación VEF₁/CVF separa los patrones.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📊</span> Tres patrones</div>
        <div className="card-body">
          <p><span className="tag">Normal</span>: CVF = 5,0 L, VEF₁/CVF = 80 %. <span className="tag">Obstructivo</span>: CVF = 3,1 L, relación 42 % (flujos anormalmente bajos). <span className="tag">Restrictivo</span>: CVF = 3,1 L, relación 90 %. Las tasas de flujo espiratorio forzado (FEF) son 3,5 / 1,4 / 3,7 L/s (Prob. 9.31).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧪</span> Cómo se mide</div>
        <div className="card-body">
          <p>Con un espirómetro de baja resistencia. La CVF puede ser un poco menor que la CV medida con espiración lenta. La relación VEF₁/CVF baja en la obstrucción porque el primer segundo no alcanza a vaciar el aire.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-18">El cociente VEF₁/CVF separa las dos familias: obstrucción → cociente bajo (42 %), porque el primer segundo no puede vaciar; restricción → cociente alto (90 %), porque se vacía rápido pero hay poco volumen. Mueve el slider del tiempo y fíjate en el punto del 1 s.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-fvc" />
        <div className="prof-controls">
          <span className="badge">espirometría</span>
          <label>patrón <select id="fc_sel" onChange={(e) => { engine.setParam("fc_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="normal" selected>Normal</option>
            <option value="obstr">Obstructivo</option>
            <option value="restr">Restrictivo</option>
          </select></label>
          <label>t <input type="range" id="fc_t" min="0" max="60" step="1" defaultValue="10" onInput={(e) => { engine.setParam("fc_t" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="fc_tv">1,0 s</span></label>
          <span className="readout" id="fc_out">VEF₁ = 4,0 L · VEF₁/CVF = 80 %</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M8 · ALTITUD ═══════════ */}
    </>
  );
}
