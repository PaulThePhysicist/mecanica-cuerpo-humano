import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;
  const [wrist, setWrist] = useState(flags.wrist);

  const toggleWrist = () => {
    const next = !wrist;
    setWrist(next);
    engine.setFlag('wrist', next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="14" data-module="6">
      <div className="module-header">
        <span className="mnum">3.9</span>
        <span className="mtitle">El golpe de golf</span>
        <span className="msub">Péndulo doble: brazos + palo, y el rol de la muñeca</span>
        <span className="mslide-count">14 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⛳</span> Un péndulo doble
            </div>
            <div className="card-body">
              <p>
                El swing de golf es un <strong>péndulo doble</strong>: brazos (A–B) y palo (B–C). La energía se transfiere
                del péndulo superior al inferior a través del <strong>quiebre de muñeca</strong> en B.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖐️</span> La muñeca decide cuánta energía llega
            </div>
            <div className="card-body">
              <p>
                Con las <strong>muñecas rígidas</strong>, solo <span className="tag">¼</span> de la energía llega a la
                cabeza del palo. Con <strong>quiebre de muñeca</strong>, llega <span className="tag">⅔</span>:
              </p>
              <div className="eq-block">
                {"\\[ E_{\\text{cabeza}} = \\tfrac{2}{3}E_{\\text{total}} \\]"}
              </div>
              <p>
                La potencia total del swing es ≈ <span className="tag">2,5 kW</span>: ~1,3 kW en la cabeza del palo, ~0,5
                kW en el astil, ~0,7 kW en los brazos. Implica ~10 kg de músculo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              En el canvas alterna la muñeca y mira cuánta energía "sobrevive" hasta la cabeza del palo. Es el mismo
              principio del pitcheo: la cadena cinética termina en el extremo rápido.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-golf" className="sim" />
            <div className="prof-controls">
              <span className="badge">Péndulo doble</span>
              <button id="gf_wrist" onClick={toggleWrist}>
                {wrist ? 'Muñeca: quiebre' : 'Muñeca: rígida'}
              </button>
              <span className="readout" id="gf_out">
                {wrist ? '⅔ a la cabeza' : '¼ a la cabeza'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
