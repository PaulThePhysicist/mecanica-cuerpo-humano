import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({
  engine,
  go,
  goModule,
  next,
  prev,
  toggleAction,
  toggleEinhoven,
  toggleECG,
  toggleMyo,
  toggleEEG,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">12 · 5</span>
    <span className="mtitle">Equilibrio, gusto y olfato</span>
    <span className="msub">{"\\(\\sim 12\\times10^6\\ \\text{células olfatorias}\\qquad \\sim 1{-}2\\ \\mathrm{cm^2}\\)"}</span>
    <span className="mslide-count">14 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌀</span> Los canales semicirculares</div>
        <div className="card-body">
          <p>Cada oído tiene <strong>3 canales semicirculares ~ortogonales</strong>. Al girar la cabeza, el fluido se retrasa (1.ª ley de Newton) y mueve los haces. Girar a la derecha: las células del <strong>oído derecho se despolarizan</strong> y las del izquierdo <strong>se hiperpolarizan</strong> (Fig. 12.27). Con la edad, esta vía se deteriora y dependemos más de la vista.</p>
          <div className="eq-block">{"\\[ \\text{giro} \\to \\text{inercia del fluido} \\to \\text{deflexión del haz} \\to \\Delta V \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">😋</span> Gusto y olfato</div>
        <div className="card-body">
          <p>Los <strong>botones gustativos</strong> detectan dulce, agrio, amargo, salado y umami; todos controlan canales iónicos. El <strong>salado</strong> es el más simple: un canal de {"\\(\\mathrm{Na}^+\\)"} despolariza la célula. La región olfatoria cubre ~1–2 cm² con ~12×10⁶ receptores (un pastor alemán: ~4×10⁹). El olfato abre canales que dejan entrar {"\\(\\mathrm{Na}^+\\)"} y disparan más potenciales de acción.</p>
          <p><span className="tag">salado = canal de Na⁺</span><span className="tag">gusto: 2 000 nervios</span><span className="tag">olfato: 2 000 nervios</span></p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-14">Gira la cabeza: el fluido se queda atrás. El oído derecho (hacia donde giras) se despolariza y el izquierdo se hiperpolariza: así el cerebro sabe el sentido del giro.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-eq" className="sim" />
        <div className="prof-controls">
          <span className="badge">equilibrio</span>
          <label>Giro de la cabeza <input type="range" id="eq_g" min="-100" max="100" defaultValue="0" step="1" onChange={(e) => engine.setParam('eq_g' as any, parseFloat(e.target.value))} /> <span id="eq_gv">0°</span></label>
          <span className="readout" id="eq_out">sin giro · ambos oídos en reposo</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
