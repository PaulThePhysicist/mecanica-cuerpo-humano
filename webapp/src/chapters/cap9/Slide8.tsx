import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide8({
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
    <span className="mnum">9.3</span>
    <span className="mtitle">Inspiración y espiración</span>
    <span className="msub">El diafragma baja, las costillas suben, el aire entra</span>
    <span className="mslide-count">8 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📐</span> Dos mecanismos (Fig. 9.9)</div>
        <div className="card-body">
          <p>(1) El <strong>diafragma</strong> baja y alarga la cavidad torácica (el único usado en la respiración tranquila). La espiración tranquila es el retroceso elástico con el diafragma relajado; en la pesada, los músculos abdominales empujan el diafragma hacia arriba. (2) Las <strong>costillas</strong> se elevan (músculos del cuello) y aumentan el diámetro anteroposterior ~20 %.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⬇️</span> Pasos de la inspiración (Fig. 9.11)</div>
        <div className="card-body">
          <p>Los músculos inspiratorios agrandan la caja → la pleura visceral y parietal se separan → {"\\( P_{\\text{lung}} - P_{\\text{pleura}} \\)"} pasa de ~−4 a <span className="tag">~−6 mmHg</span> (de 756 a 754 absolutos) → el pulmón se expande → la presión alveolar baja de ~0 a <span className="tag">~−1 mmHg</span> (de 760 a 759 absolutos) → el aire fluye de la boca hacia los pulmones.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔄</span> Espiración normal = gratis</div>
        <div className="card-body">
          <p>No requiere contracción muscular: es el retroceso elástico del pulmón y la pared torácica. La contracción activa solo aparece en el ejercicio intenso, para espirar el aire viciado más rápido.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-8">Los números del ciclo: al inspirar la presión alveolar cae de 0 a −1 mmHg (760 → 759 absolutos) y con eso entran ~0,5 L en ~2 s. El diafragma es el músculo principal: al bajar, arrastra la pleura visceral hacia abajo y el pulmón se estira. La espiración normal no cuesta energía.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-breath" />
        <div className="prof-controls">
          <span className="badge">ciclo</span>
          <button id="br_play" onClick={toggleBreath}>▶</button>
          <label>ritmo <input type="range" id="br_rate" min="6" max="30" step="1" defaultValue="12" onInput={(e) => { engine.setParam("br_rate" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="br_ratev">12 /min</span></label>
          <span className="readout" id="br_out">P_alveolar 0 · P_pleura −5 · V = 2,2 L</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M4 · VOLÚMENES PULMONARES ═══════════ */}
    </>
  );
}
