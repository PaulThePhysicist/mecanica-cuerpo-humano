import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="14" data-module="5">
      <div className="module-header">
        <span className="mnum">10 · 5</span>
        <span className="mtitle">La cóclea: análisis de frecuencias</span>
        <span className="msub">{"\\(\\text{tonotopía}: f \\propto \\text{posición en la basilar}\\)"}</span>
        <span className="mslide-count">14 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌀</span> La membrana basilar separa frecuencias
            </div>
            <div className="card-body">
              <p>
                La onda de presión del líquido coclear recorre la membrana basilar. Cerca de la ventana oval es rígida
                y resuena agudo; hacia el ápex es laxa y resuena grave. Cada lugar responde a su frecuencia: una{' '}
                <strong>tonotopía</strong>.
              </p>
              <div className="eq-block">
                {"\\[ f(x) \\approx f_0\\ 10^{-a x} \\quad (\\text{mapa logarítmico}) \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔬</span> Células ciliadas: transducción
            </div>
            <div className="card-body">
              <p>
                Las células ciliadas internas (~3,5 mil en humanos) convierten el desplazamiento de la basilar en
                potenciales de acción. Las externas amplifican activamente el movimiento: el «amplificador coclear».
              </p>
              <div className="eq-block">
                <span className="eqno">(10.57)</span>
                {"\\[ V_\\mathrm{cilio} \\propto \\text{deflexión de la basilar} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              ▶ anima el viaje de la onda por la basilar: el máximo se desplaza según la frecuencia del tono. Un grave
              (100 Hz) pica al fondo; un agudo (5 kHz), cerca de la ventana oval.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cochlea" className="sim" />
            <div className="prof-controls">
              <span className="badge">cóclea</span>
              <button id="co_play" type="button" onClick={() => engine.toggleCochlea()}>
                {flags.coPlaying ? '⏸' : '▶'}
              </button>
              <label>
                Tono{' '}
                <input
                  type="range"
                  id="co_f"
                  min="20"
                  max="10000"
                  defaultValue={params.co_f}
                  step="10"
                  onChange={(e) => {
                    engine.setParam('co_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="co_fv">1000 Hz</span>
              </label>
              <span className="readout" id="co_out">
                1000 Hz → máx. en x ≈ 60 % de la basilar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
