import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide9({
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
    <span className="mnum">9.4</span>
    <span className="mtitle">El espirómetro y los volúmenes pulmonares</span>
    <span className="msub">V_T ≈ 1 L · CRF 2,2 L · CPT 6 L · CV 5 L · VR 1 L</span>
    <span className="mslide-count">9 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📏</span> Los volúmenes (Fig. 9.13)</div>
        <div className="card-body">
          <p>En respiración normal el pulmón oscila entre <span className="tag">3,2 L</span> (tras inspirar) y <span className="tag">2,2 L</span> (tras espirar). La diferencia es el <strong>volumen corriente</strong> {"\\( V_T \\approx 1\\ \\text{L} \\)"}. El volumen tras espirar normal es la <strong>CRF</strong>. Tras inspirar profundo: <strong>CPT</strong> ≈ 6 L (la supera el VRI). Tras espirar profundo: <strong>VR</strong> ≈ 1 L. La <strong>CV</strong> ≈ 5 L = CPT − VR; el <strong>VRE</strong> = CRF − VR.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🤰</span> Embarazo</div>
        <div className="card-body">
          <p>La tasa de inhalación aumenta ~<span className="tag">30–50 %</span> (más {"\\( V_T \\)"} y más frecuencia); el consumo de O₂ sube ~20–40 % para el feto, la placenta y los órganos de la madre.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🩺</span> Por qué importa</div>
        <div className="card-body">
          <p>La CV mide qué tan bien funcionan los pulmones (y cuánto puedes inflar globos). La CRF es el aire viciado que se mezcla con el nuevo. Existe espacio muerto: <span className="tag">0,15 L anatómico</span> (tráquea y bronquios) más el alveolar fisiológico. Con la edad la CPT no cambia, pero la CV cae.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-9">Este es el mapa de volúmenes que usaremos todo el capítulo. El «piso» de la respiración normal es la CRF (2,2 L); la CV (5 L) es tu margen de maniobra. Pulsa ▶ y mira el espirómetro dibujar los compartimentos; cambia a respiración profunda y ve crecer la amplitud.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-spiro" />
        <div className="prof-controls">
          <span className="badge">espirómetro</span>
          <button id="sp_play" onClick={toggleSpiro}>▶</button>
          <label>tipo <select id="sp_mode" onChange={(e) => { engine.setParam("sp_mode" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="normal" selected>Respiración normal</option>
            <option value="profunda">Respiración profunda</option>
          </select></label>
          <span className="readout" id="sp_out">V = 2,2 L (CRF)</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
