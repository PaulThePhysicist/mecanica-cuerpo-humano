import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide22({
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
    <span className="mnum">12 · 8</span>
    <span className="mtitle">Sentido magnético y ondas electromagnéticas</span>
    <span className="msub">{"\\(c = \\lambda\\nu \\qquad I(z) = I_0\\,e^{-\\alpha z}\\)"}</span>
    <span className="mslide-count">22 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🐦</span> La brújula de magnetita</div>
        <div className="card-body">
          <p>Los humanos no sienten campos magnéticos, pero muchos animales se orientan con partículas de <strong>magnetita</strong> {"\\(\\mathrm{Fe_3O_4}\\)"} (~50 nm, a veces en cadenas). Las palomas detectan 10–20 nT; los delfines, &lt; 2 µT. El torque del campo sobre las partículas movería filamentos intracelulares que activan una neurona sensorial.</p>
          <p><span className="tag">palomas 10–20 nT</span><span className="tag">delfines &lt; 2 µT</span><span className="tag">Fe₃O₄ ~50 nm</span></p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📡</span> Ondas EM y penetración</div>
        <div className="card-body">
          <p>Radio, microondas, infrarrojo, visible, UV, rayos X y gamma: todas viajan a {"\\(c = \\lambda\\nu\\)"} y solo difieren en frecuencia. La atenuación en tejido sigue la ley de Beer:</p>
          <div className="eq-block"><span className="eqno">(12.93)</span>{"\\[ I(z) = I_0\\,e^{-\\alpha_\\mathrm{light} z} \\]"}</div>
          <p>Depende fuertemente de la frecuencia (absorción + dispersión). El cuerpo absorbe las microondas de <strong>2,45 GHz</strong> (hornos) mucho más de lo indicado por la <em>resonancia del agua</em>.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-22">Recorre el espectro: cada régimen tiene su frecuencia y su penetración en tejido. El cuerpo es «transparente» a las ondas de radio, opaco a la luz y al IR, y de nuevo penetrante a los rayos X.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-em" className="sim" />
        <div className="prof-controls">
          <span className="badge">espectro EM</span>
          <label>Radiación <select id="em_sel" onChange={(e) => engine.setParam('em_sel' as any, parseInt(e.target.value, 10))}><option value="0">Radio</option><option value="1">Microondas 2,45 GHz</option><option value="2">Infrarrojo</option><option value="3">Visible</option><option value="4">UV</option><option value="5">Rayos X</option></select></label>
          <span className="readout" id="em_out">Radio · penetra todo el cuerpo</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
