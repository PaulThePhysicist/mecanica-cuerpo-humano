import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.phPlaying);

  const togglePhases = () => {
    const next = !playing;
    setPlaying(next);
    engine.setFlag('phPlaying', next);
  };

  return (
    <div className="slide active" data-slide="12" data-module="5">
      <div className="module-header">
        <span className="mnum">3.8</span>
        <span className="mtitle">Las seis fases del pitcheo</span>
        <span className="msub">La cadena cinética y las velocidades que se suman</span>
        <span className="mslide-count">12 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⏳</span> Cronometría del lanzamiento
            </div>
            <div className="card-body">
              <p>
                {"El pitcheo se divide en <strong>seis fases</strong>; la pelota sale a \\(t = 0{,}64\\ \\text{s}\\):"}
              </p>
              <div className="row">
                <span className="pill">1 · Balance</span>
                <span className="pill">2 · Zancada</span>
                <span className="pill">3 · Armado</span>
                <span className="pill">4 · Aceleración</span>
                <span className="pill">5 · Desaceleración</span>
                <span className="pill">6 · Seguimiento</span>
              </div>
              <p>
                {"El pie delantero toca el suelo en \\(t \\approx 0{,}50\\ \\text{s}\\); la aceleración de la pelota ocurre en los ~0,14 s siguientes."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧬</span> Velocidades que se suman
            </div>
            <div className="card-body">
              <p>
                Cada segmento añade su velocidad angular a la mano: <strong>piernas ≈ 10 mph</strong>,{' '}
                <strong>hombro ≈ 45 mph</strong>, <strong>codo ≈ 45 mph</strong>:
              </p>
              <div className="eq-block">
                {"\\[ v_{\\text{pelota}} \\approx 10 + 45 + 45 \\approx 100\\ \\text{mph} \\]"}
              </div>
              <p>La cadena cinética transfiere el impulso de los segmentos grandes a los pequeños.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              Las velocidades angulares máximas son impresionantes: pelvis 550–700°/s, tronco 1100–1350°/s, codo
              2200–2800°/s, hombro 6900–9800°/s. La muñeca, al final, da el giro (spin) de la pelota.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-phases" className="sim" />
            <div className="prof-controls">
              <span className="badge">Cadena cinética</span>
              <label>
                t{' '}
                <input
                  type="range"
                  id="ph_t"
                  min="0"
                  max="0.64"
                  step="0.01"
                  defaultValue={params.ph_t}
                  onChange={(e) => {
                    engine.setParam('ph_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="ph_play" onClick={togglePhases}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ph_out">
                ≈ 100 mph
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
