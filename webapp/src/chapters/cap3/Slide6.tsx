import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;
  const [mode, setMode] = useState<'walk' | 'run'>(flags.energyMode);

  const toggleEnergy = () => {
    const next = mode === 'walk' ? 'run' : 'walk';
    setMode(next);
    engine.setFlag('energyMode', next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <div className="module-header">
        <span className="mnum">3.5</span>
        <span className="mtitle">Energética: caminar vs correr</span>
        <span className="msub">Energías en fase (correr) y fuera de fase (caminar)</span>
        <span className="mslide-count">6 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🚶</span> Caminar: las energías se compensan
            </div>
            <div className="card-body">
              <p>
                En la marcha el cuerpo se comporta como un péndulo invertido: la <strong>energía cinética vertical</strong>{' '}
                y la <strong>energía potencial</strong> suben y bajan <span className="highlight">fuera de fase</span> —
                cuando una crece la otra decrece — y su suma casi no varía:
              </p>
              <div className="eq-block">
                {"\\[ E_{\\text{caminar}} = KE_H + KE_V + PE \\approx \\text{constante} \\]"}
              </div>
              <p>Economía: la gravedad hace gran parte del trabajo.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Correr: las energías se suman
            </div>
            <div className="card-body">
              <p>
                En la carrera las energías cinética y potencial suben y bajan <span className="highlight">en fase</span> —
                su suma oscila con el doble de amplitud — y el cuerpo debe aportar energía elástica y metabólica para
                compensar. Por eso correr cuesta más que caminar a la misma rapidez.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              En el canvas, alterna caminar/correr y mira la curva de la energía total: plana al caminar, ondulada al correr.
              Esa ondulación es lo que el tendón de Aquiles "almacena" — el puente a la siguiente diapositiva.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-energy" className="sim" />
            <div className="prof-controls">
              <span className="badge">KE + PE</span>
              <button id="en_mode" onClick={toggleEnergy}>
                {mode === 'walk' ? 'Caminar' : 'Correr'}
              </button>
              <span className="readout" id="en_out">
                Fuera de fase ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
