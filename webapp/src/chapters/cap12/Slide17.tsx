import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({
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
    <span className="mnum">12 · 6</span>
    <span className="mtitle">Despolarización y repolarización del miocardio</span>
    <span className="msub">{"\\(\\text{electrodo a la derecha} \\to \\text{señal positiva}\\)"}</span>
    <span className="mslide-count">17 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔍</span> Una célula, una onda, un dipolo</div>
        <div className="card-body">
          <p>Una célula polarizada es una serie de dipolos (Fig. 12.29). Cuando la <strong>onda de despolarización</strong> recorre la célula de izquierda a derecha, un electrodo a la derecha ve subir el potencial hasta un <strong>máximo cuando la mitad está despolarizada</strong> y volver a cero al terminar. La repolarización da el pulso negativo... en el corazón real es <strong>positivo, más lento y más superficial</strong>, porque repolariza en dirección opuesta.</p>
          <div className="eq-block">{"\\[ \\text{depolarización} \\to \\text{pico positivo} \\qquad \\text{repolarización} \\to \\text{ondas opuestas} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📍</span> La posición lo cambia todo</div>
        <div className="card-body">
          <p>El electrodo a la <strong>izquierda</strong> ve el negativo de la señal del de la derecha: por eso cada derivación aporta información distinta y el vectorcardiograma (Fig. 12.38) reconstruye el lazo del QRS proyectándolo en los planos frontal y horizontal.</p>
          <p><span className="tag">conductor de volumen</span><span className="tag">dipolo local por célula</span><span className="tag">la suma de células = señal</span></p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-17">▶ propaga la onda: la sección polarizada (gris) se enciende a medida que el dipolo avanza. El electrodo derecho registra el pico cuando la frontera llega a la mitad.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-dc" className="sim" />
        <div className="prof-controls">
          <span className="badge">miocardio</span>
          <button id="dc_play" onClick={toggleMyo}>▶</button>
          <span className="readout" id="dc_out">onda de despolarización →</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
