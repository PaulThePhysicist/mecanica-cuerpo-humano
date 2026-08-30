import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide6({
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
    <span className="mtitle">Flujo laminar y turbulento: el número de Reynolds</span>
    <span className="msub">La aorta roza la turbulencia · los capilares, nunca</span>
    <span className="mslide-count">6 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌊</span> El número de Reynolds</div>
        <div className="card-body">
          <p>Compara la inercia con la viscosidad (eq. 7.11):</p>
          <div className="eq-block">{"\\[  R_{\\text{e}} = \\frac{\\rho\\, u\\, d}{\\eta}  \\]"}</div>
          <p>En la aorta ({"\\( \\rho = 1060 \\)"}, {"\\( u = 30\\ \\text{cm/s} \\)"}, {"\\( d = 2{,}5\\ \\text{cm} \\)"}, {"\\( \\eta = 4\\ \\text{mPa·s} \\)"}): <span className="tag">R_e ≈ 2000</span> — y llega a <span className="tag">~6000</span> en el pico del ciclo. En los capilares: <span className="tag">R_e &lt; 10⁻³</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🩸</span> Umbral</div>
        <div className="card-body">
          <p>El umbral nominal es <span className="tag">R_e ≈ 2000</span>. El flujo aórtico es casi siempre laminar, pero con ejercicio (más u y d) puede volverse <strong>turbulento</strong> en el pico sistólico.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔊</span> Soplos y murmullos</div>
        <div className="card-body">
          <p>La turbulencia hace ruido: un <span className="tag">soplo</span> sobre una estenosis o una válvula insuficiente es flujo turbulento audible con el estetoscopio. La aorta dilatada (aneurisma) también puede generar el soplo por su mayor {"\\( d \\)"}.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-6">Reynolds cruza el capítulo 7 con el 8: la misma fórmula que ordenaba la natación ahora dice por qué la aorta puede murmurar y el capilar nunca. En el canvas sube la velocidad: primero líneas rectas, y al pasar ~2 m/s (R_e ≈ 2000) el trazado se enrosca — eso es turbulencia.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-reynolds" />
        <div className="prof-controls">
          <span className="badge">Reynolds</span>
          <label>u <input type="range" id="re_u" min="0" max="1" step="0.01" defaultValue={0.3} onChange={(e) => { engine.setParam('re_u', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="re_uv">30 cm/s</span></label>
          <span className="readout" id="re_out">R_e ≈ 2000 · límite laminar</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
