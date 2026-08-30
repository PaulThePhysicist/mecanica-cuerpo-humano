import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide15({
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
    <span className="mnum">9.5.3</span>
    <span className="mtitle">El ciclo inspiración/espiración</span>
    <span className="msub">Volumen, presión pleural, flujo y presión alveolar vs. tiempo</span>
    <span className="mslide-count">15 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📉</span> Las cuatro trazas (Fig. 9.17)</div>
        <div className="card-body">
          <p>En un ciclo: el <strong>volumen</strong> sube y baja; la <strong>presión intrapleural</strong> va de −4 a −6 mmHg; el <strong>flujo</strong> es positivo al inspirar y negativo al espirar; la <strong>presión alveolar</strong> oscila levemente alrededor de 0. Si se omitiera la resistencia de las vías, la presión alveolar sería cero y la intrapleural seguiría la curva discontinua.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔄</span> Dinámica del ciclo</div>
        <div className="card-body">
          <p>El flujo máximo ocurre a mitad de cada fase; el volumen máximo, al final de la inspiración; la presión intrapleural es más negativa durante la inspiración. De la resistencia se deduce {"\\( R = \\Delta P/Q \\)"} (Prob. 9.32).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📐</span> De la traza al lazo (Fig. 9.18)</div>
        <div className="card-body">
          <p>Graficando V contra P en todos los instantes se obtienen <strong>lazos cerrados</strong> (el tiempo queda implícito). Son útiles porque el pulmón es un vaso de compliancia donde V y P están ligados — los vemos en la slide siguiente.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-15">El ciclo completo en un vistazo: la P_intrapleural se vuelve más negativa (−6) durante la inspiración y vuelve a −4; el flujo es el que cambia de signo. Pulsa ▶ y deja correr el ciclo: el volumen llega después que la presión — ese desfase es la resistencia de las vías.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-cycle" />
        <div className="prof-controls">
          <span className="badge">ciclo</span>
          <button id="cy_play" onClick={toggleCycle}>▶</button>
          <label>velocidad <input type="range" id="cy_speed" min="50" max="200" step="10" defaultValue="100" onInput={(e) => { engine.setParam("cy_speed" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="cy_speedv">×1</span></label>
          <span className="readout" id="cy_out">inspiración · V en ascenso</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
