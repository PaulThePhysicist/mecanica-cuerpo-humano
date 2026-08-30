import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide23({
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
    <span className="mtitle">Eficiencia metabólica y espiración forzada</span>
    <span className="msub">dE/dt = dW/dt / ε · ~1–2 % de la BMR</span>
    <span className="mslide-count">23 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔋</span> Eficiencia (ec. 9.20)</div>
        <div className="card-body">
          <p>Con eficiencia muscular {"\\( \\varepsilon = 5 \\)"}–{"\\( 10\\,\\% \\)"}:</p>
          <div className="eq-block"><span className="eqno">(9.20)</span>{"\\[ \\frac{dE}{dt} = \\frac{dW/dt}{\\varepsilon} = \\frac{0{,}86\\ \\text{kcal/día}}{0{,}05} = 17\\ \\text{kcal/día} \\]"}</div>
          <p>≈ 1 % de la BMR (quizás ~2 % real: {"\\( \\varepsilon \\)"} más cerca de 3 % y otros efectos). La nariz aporta ~la mitad del trabajo. En ejercicio intenso, respirar puede consumir <span className="tag">25 %</span> de la energía total.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧱</span> Rápida vs. lenta</div>
        <div className="card-body">
          <p>Respirar rápido y superficial cuesta más por la <strong>resistencia</strong> del flujo; lento y profundo cuesta más por la <strong>elasticidad</strong> (compliancia). Ambas cuestan más que la respiración normal — el patrón Lamaze del parto.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🚨</span> Espiración forzada (Fig. 9.23)</div>
        <div className="card-body">
          <p>La presión intrapleural y alveolar suben lo mismo (<span className="tag">+38 cmH₂O</span>), ambas positivas (+30 y +38). En algún punto de la vía la presión baja de +30 y <strong>comprime la vía</strong> (a +19 cmH₂O), aumentando la resistencia. En la respiración normal, la presión de la vía siempre excede a la intrapleural.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-23">Del trabajo mecánico (0,86 kcal/día) al metabólico hay un factor 1/ε. Con ε = 5 %: 17 kcal/día — el 1 % de tu metabolismo basal. Sube ε con el slider y mira encogerse el costo. El detalle final: en la espiración forzada la propia vía aérea se comprime y se frena sola.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-eff" />
        <div className="prof-controls">
          <span className="badge">eficiencia</span>
          <label>ε <input type="range" id="ef_ep" min="3" max="10" step="1" defaultValue="5" onInput={(e) => { engine.setParam("ef_ep" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="ef_epv">5 %</span></label>
          <span className="readout" id="ef_out">dE/dt = 17 kcal/día · ~1 % BMR</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ NAVEGACIÓN ═══════════ */}
    </>
  );
}
