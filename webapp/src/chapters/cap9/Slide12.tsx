import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide12({
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
    <span className="mnum">9.5.1</span>
    <span className="mtitle">Compliancia y resistencia de las vías aéreas</span>
    <span className="msub">C ≈ 0,2 L/cmH₂O · R_vías ≈ 2 cmH₂O/(L/s) · 80 % / 20 %</span>
    <span className="mslide-count">12 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫧</span> Compliancia</div>
        <div className="card-body">
          <p>La compliancia del pulmón es <span className="tag">≈ 0,2 L/cmH₂O</span> y baja a presiones de expansión altas (pendiente decreciente). La <strong>compliancia específica</strong> se normaliza por un volumen característico. La elasticidad del tórax suma con la del pulmón.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🚰</span> Resistencia de las vías</div>
        <div className="card-body">
          <p>{"\\( R_{\\text{vías}} \\approx 2\\ \\text{cmH}_2\\text{O}/(\\text{L/s}) \\)"} en respiración normal, y baja al crecer el pulmón. Es ~<span className="tag">80 %</span> de la resistencia pulmonar total; el otro 20 % es la <strong>resistencia tisular</strong> (fuerzas viscosas del tórax y la pared). Por Poiseuille, {"\\( R \\propto L/r^4 \\)"}: domina en los bronquios intermedios (Prob. 9.21).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">💪</span> Presiones máximas</div>
        <div className="card-body">
          <p>Hombres jóvenes: espiración <span className="tag">100–150 cmH₂O</span>, inspiración <span className="tag">−95 a −105</span>. Mujeres: espiración 60–95, inspiración −65 a −75. Muy útiles para inflar globos o succionar por pajillas largas (Prob. 9.27).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-12">La resistencia NO está en la tráquea: está en los bronquios de tamaño intermedio (generaciones ~5–9), donde el radio pequeño aún no lo compensa el número de tubos. El canvas reproduce el Problema 9.21 con Poiseuille: busca la generación con la barra más alta y suma todas las resistencias.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-airres" />
        <div className="prof-controls">
          <span className="badge">resistencia</span>
          <label>ver <select id="ar_sel" onChange={(e) => { engine.setParam("ar_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="r" selected>R por generación</option>
            <option value="g">Conductancia 1/R</option>
          </select></label>
          <span className="readout" id="ar_out">R máxima en z ≈ 6</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
