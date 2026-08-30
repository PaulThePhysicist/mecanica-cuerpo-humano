import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.gaitPlaying);

  const toggleGait = () => {
    const next = !playing;
    setPlaying(next);
    engine.setFlag('gaitPlaying', next);
  };

  return (
    <div className="slide active" data-slide="3" data-module="2">
      <div className="module-header">
        <span className="mnum">3.3</span>
        <span className="mtitle">El ciclo de la marcha</span>
        <span className="msub">Apoyo 60–65 % · balanceo 35–40 %</span>
        <span className="mslide-count">3 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦵</span> Las fases de un paso
            </div>
            <div className="card-body">
              <p>El ciclo de la marcha tiene dos grandes fases por pierna:</p>
              <div className="row">
                <span className="pill">
                  <b>Apoyo</b> · 60–65 %
                </span>
                <span className="pill">
                  <b>Balanceo</b> · 35–40 %
                </span>
              </div>
              <p>
                En el <span className="highlight">apoyo</span> el pie toca el suelo (talón → dedos) y el cuerpo avanza sobre
                él; en el <span className="highlight">balanceo</span> el pie despega y avanza. Hay <strong>doble apoyo</strong>{' '}
                (~12 % del ciclo) cuando ambos pies están en el suelo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Caminar vs correr
            </div>
            <div className="card-body">
              <p>
                En la <strong>carrera</strong> el porcentaje de apoyo baja a ≈ <span className="tag">40 %</span> y el de
                balanceo sube a ≈ <span className="tag">60 %</span> — y aparece una <strong>fase de vuelo</strong> en la que
                ningún pie toca el suelo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              En el canvas: mueve el ciclo y observa cómo cambia la fracción de apoyo. La doble gráfica talón-dedos ilustra
              que el apoyo empieza en el talón y termina en los dedos.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-gait" className="sim" />
            <div className="prof-controls">
              <span className="badge">Ciclo</span>
              <label>
                t{' '}
                <input
                  type="range"
                  id="gait_t"
                  min="0"
                  max="100"
                  defaultValue={params.gait_t}
                  onChange={(e) => {
                    engine.setParam('gait_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="gait_play" onClick={toggleGait}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="gait_out">
                Apoyo 62 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
