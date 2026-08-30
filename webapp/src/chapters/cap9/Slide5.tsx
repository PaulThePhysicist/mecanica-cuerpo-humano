import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide5({
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
    <span className="mnum">9.2</span>
    <span className="mtitle">La inestabilidad de las burbujas</span>
    <span className="msub">La burbuja pequeña tiene más presión: al abrir el tapón, colapsa</span>
    <span className="mslide-count">5 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔗</span> Dos burbujas conectadas (Fig. 9.6)</div>
        <div className="card-body">
          <p>En equilibrio, la presión interna de cada burbuja es {"\\( P_{\\text{int}} = 4\\gamma/R \\)"}. Si la #2 es la más pequeña, {"\\( R_2 < R_1 \\)"} implica {"\\( P_2 > P_1 \\)"}. Al abrir el tapón, el aire fluye de la presión alta a la baja: de la <strong>pequeña a la grande</strong>.</p>
          <p>La #2 pierde aire, se hace más pequeña y su presión de equilibrio <strong>aún aumenta</strong>; el flujo continúa hasta que <span className="tag">colapsa</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚠️</span> Si los alvéolos fueran así…</div>
        <div className="card-body">
          <p>El más grande de los cientos de millones de alvéolos crecería a expensas de todos los más pequeños, y el sistema sería <strong>inestable</strong>. El razonamiento es correcto; la suposición falsa: que {"\\( \\gamma \\)"} no depende de {"\\( R \\)"}.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🛟</span> La clave: γ(R)</div>
        <div className="card-body">
          <p>El surfactante de personas sanas (DPPC, dipalmitoil fosfatidilcolina) hace que {"\\( \\gamma(R) \\)"} sea independiente de {"\\( R \\)"} de 0 hasta un tamaño crítico {"\\( R_0 \\)"}. El sistema se estabiliza cuando {"\\( \\gamma(R) \\)"} crece con {"\\( R \\)"} más rápido que el propio {"\\( R \\)"} (slide siguiente).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-5">Siente el problema antes de la solución: conecta dos burbujas y la grande devora a la pequeña. Pulsa ▶ y mira colapsar la #2 mientras la #1 crece. Un pulmón sin surfactante colapsaría igual — es lo que les pasa a los recién nacidos prematuros con membrana hialina.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-bubbles" />
        <div className="prof-controls">
          <span className="badge">inestabilidad</span>
          <button id="bb_play" onClick={toggleBubbles}>▶</button>
          <label>R₂/R₁ <input type="range" id="bb_r2" min="30" max="90" step="5" defaultValue="55" onInput={(e) => { engine.setParam("bb_r2" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="bb_r2v">0,55</span></label>
          <span className="readout" id="bb_out">P₂ &gt; P₁ · al abrir, #2 colapsa</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
