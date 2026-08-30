import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide15({ engine }: SlideProps) {
  const iVal = engine?.paramsRef.current.ex_i ?? 50;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 6</span>
        <span className="mtitle">El ejercicio: todo se regula a la vez</span>
        <span className="msub">barorreceptores + mecanorreceptores + cerebro</span>
        <span className="mslide-count">15 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏃</span> Cardiovascular y ventilación
            </div>
            <div className="card-body">
              <p>
                Barorreceptores arteriales + mecanorreceptores musculares + comando motor central cerebral → centro cardiovascular
                bulbar → actividad simpática en corazón, vasos y médula adrenal → ↑ gasto cardíaco y presión arterial media (Fig. 13.6).
              </p>
              <p>
                Ventilación: quimiorreceptores carotídeos y aórticos + mecanorreceptores torácicos → ↑ frecuencia y volumen corriente
                respiratorio → regulación fina de {"\\(p\\text{O}_2\\)"}, {"\\(p\\text{CO}_2\\)"} y pH (Fig. 13.1).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌡️</span> Y la temperatura
            </div>
            <div className="card-body">
              <p>
                Durante el ejercicio el metabolismo aumenta hasta 20× y el cuerpo debe disipar calor masivamente por sudoración
                (Fig. 13.4). Los tres lazos (cardiovascular, respiratorio y térmico) se acoplan e integran armónicamente.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Mueve la intensidad de ejercicio: suben en conjunto el gasto cardíaco, la ventilación y la tasa de disipación térmica,
              cada uno regulado por su lazo de retroalimentación. El cuerpo orquesta múltiples subsistemas a la vez.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ex" />
            <div className="prof-controls">
              <span className="badge">ejercicio</span>
              <label>
                Intensidad{' '}
                <input
                  type="range"
                  id="ex_i"
                  min="0"
                  max="100"
                  value={iVal}
                  step="1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ex_i', v);
                    const span = document.getElementById('ex_iv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ex_iv">{iVal}</span>
              </label>
              <span className="readout" id="ex_out">
                PA ↑ · GC ↑ · ventilación ↑
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
