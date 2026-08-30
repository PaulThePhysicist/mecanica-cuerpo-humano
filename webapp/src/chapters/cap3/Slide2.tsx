import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [mode, setMode] = useState<'stand' | 'walk'>(flags.presionMode);

  const togglePresion = () => {
    const next = mode === 'stand' ? 'walk' : 'stand';
    setMode(next);
    engine.setFlag('presionMode', next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">3.2</span>
        <span className="mtitle">La presión bajo los pies</span>
        <span className="msub">Repartir el peso sobre una superficie pequeña</span>
        <span className="mslide-count">2 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦶</span> Presión = fuerza entre área
            </div>
            <div className="card-body">
              <p>El peso corporal se reparte sobre la huella de ambos pies. La presión media vale:</p>
              <div className="eq-block">
                {"\\[ P = \\frac{W_b}{A} \\]"}
              </div>
              <p>
                Para una persona típica de pie, la presión media es de <span className="tag">≈ 2 N/cm²</span> — pero en el
                talón y en la base de los dedos concentra <span className="tag">≈ 10 N/cm²</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚶</span> Al caminar la presión se dispara
            </div>
            <div className="card-body">
              <p>
                En el ciclo de la marcha, <strong>un solo pie</strong> soporta el peso, con fuerzas que llegan a{' '}
                <span className="tag">≈ 1400 N</span> (casi el doble del peso) sobre un área de contacto de ≈ 23 cm²:
              </p>
              <div className="eq-block">
                {"\\[ P \\approx \\frac{1400\\ \\text{N}}{23\\ \\text{cm}^2} \\approx 60\\ \\text{N/cm}^2 \\]"}
              </div>
              <p>Treinta veces la presión media de pie quieto.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Analogía en clase: caminar sobre nieve con raquetas reparte el peso sobre un área mayor. La presión (no la
              fuerza) es lo que deforma el suelo — y lo que daña el tejido en pacientes encamados.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-presion" className="sim" />
            <div className="prof-controls">
              <span className="badge">P = W / A</span>
              <label>
                masa{' '}
                <input
                  type="range"
                  id="pr_mass"
                  min="40"
                  max="120"
                  defaultValue={params.pr_mass}
                  onChange={(e) => {
                    engine.setParam('pr_mass', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="pr_mode" onClick={togglePresion}>
                {mode === 'stand' ? 'De pie' : 'Caminando'}
              </button>
              <span className="readout" id="pr_out">
                2 N/cm²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
