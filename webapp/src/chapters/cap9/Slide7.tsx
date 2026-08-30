import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide7({
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
    <span className="mtitle">La pleura y la presión transpulmonar</span>
    <span className="msub">Pleura visceral y parietal · intrapleural −4 a −6 mmHg</span>
    <span className="mslide-count">7 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🎈</span> El saco pleural (Fig. 9.8)</div>
        <div className="card-body">
          <p>Cada pulmón está rodeado por un saco dentro de la cavidad torácica, como un globo lleno de líquido intrapleural. La pared interna (<strong>pleura visceral</strong>) se adhiere al pulmón; la externa (<strong>pleura parietal</strong>) a la pared torácica. La elasticidad del pulmón separa ambas membranas y crea una presión ligeramente <span className="tag">−4 a −6 mmHg</span> (subatmosférica).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔗</span> Presión transpulmonar</div>
        <div className="card-body">
          <p>La «fuerza impulsora» del volumen pulmonar es la <strong>presión transpulmonar</strong> = {"\\( P_{\\text{alveolar}} - P_{\\text{intrapleural}} \\)"} (ambas manométricas). Mantiene los pulmones expandidos; si la pleura se perfora (neumotórax, Prob. 9.38), la presión se iguala con la atmósfera y el pulmón colapsa.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚖️</span> Balance de fuerzas (Fig. 9.10)</div>
        <div className="card-body">
          <p>En pre-inspiración: la atracción visceral→parietal más la fuerza hacia afuera de la presión subatmosférica del saco (~−4 mmHg) se equilibran con la tendencia del pulmón a contraerse por elasticidad. Durante la inspiración, ese equilibrio se rompe.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-7">La presión que importa es la transpulmonar: P_alveolar − P_pleura. El pulmón «cuelga» de esa diferencia. Analogía del puño en el globo (Fig. 9.8): el globo se infla no porque entre aire, sino porque la cavidad que lo rodea se hace más grande. Acerca P_pleura a cero con el slider y mira el colapso.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-pleura" />
        <div className="prof-controls">
          <span className="badge">pleura</span>
          <label>P_intrapleural <input type="range" id="pl_pp" min="-10" max="0" step="0.5" defaultValue="-5" onInput={(e) => { engine.setParam("pl_pp" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="pl_ppv">−5 mmHg</span></label>
          <span className="readout" id="pl_out">P_trans = 5 mmHg · pulmón expandido</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
