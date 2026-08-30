import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide5({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">8.2</span>
    <span className="mtitle">Velocidad de la sangre: de la aorta a los capilares</span>
    <span className="msub">Continuidad: Q = u·A</span>
    <span className="mslide-count">5 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🚀</span> Continuidad</div>
        <div className="card-body">
          <p>Todo el gasto atraviesa cada nivel ({"\\( Q_{\\text{t}} = A\\,u \\)"}), de modo que la velocidad es inversa al área total:</p>
          <div className="eq-block">{"\\[  u = \\frac{Q_{\\text{t}}}{A} \\qquad \\text{·} \\qquad 30\\ \\text{cm/s (aorta)}  \\]"}</div>
          <p>Con {"\\( Q = 90\\ \\text{cm}^3\\text{/s} \\)"}: aorta <span className="tag">30 cm/s</span> ({"\\( A=3\\ \\text{cm}^2 \\)"}) → capilares <span className="tag">0,022 cm/s</span> ({"\\( A\\approx 4000\\ \\text{cm}^2 \\)"}) → vena cava <span className="tag">5 cm/s</span> ({"\\( A=18\\ \\text{cm}^2 \\)"}).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫧</span> Por qué se enlentece</div>
        <div className="card-body">
          <p>Hay <span className="tag">≈ 10¹⁰ capilares</span> de {"\\( r \\sim 3{,}5\\ \\mu\\text{m} \\)"}. Sus áreas se suman (<span className="tag">~4000 cm²</span>, 1300× la aorta) aunque cada uno sea minúsculo. El flujo lento deja tiempo para el <strong>intercambio</strong> de O₂ y CO₂.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⏱️</span> Tiempo de tránsito</div>
        <div className="card-body">
          <p>El glóbulo rojo tarda <span className="tag">~1 s</span> en cruzar un capilar y la sangre completa da la vuelta al circuito en <span className="tag">~1 min</span>. Esos segundos lentos son la vida: la difusión de oxígeno necesita tiempo (Cap. 7, módulo de difusión).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-5">Continuidad contraintuitiva: el vaso más lento es el más pequeño de todos, el capilar — porque son muchísimos. El área total, no el diámetro individual, fija la velocidad. En el canvas cambia el gasto y observa las tres velocidades escalar juntas, siempre con u_capilar ≈ 1/1000 de la aórtica.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-velocity" />
        <div className="prof-controls">
          <span className="badge">continuidad</span>
          <label>Q <input type="range" id="vl_q" min="30" max="150" step="5" defaultValue={90} onChange={(e) => { engine.setParam('vl_q', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="vl_qv">90 cm³/s</span></label>
          <span className="readout" id="vl_out">aorta 30 · capilares 0,022 · vena cava 5 cm/s</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
