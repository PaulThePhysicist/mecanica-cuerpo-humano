import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="12" data-module="5">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">El límite de difracción del ojo</span>
        <span className="msub">{"\\(D \\approx 2{,}44\\,(f/d)\\,\\lambda\\)"}</span>
        <span className="mslide-count">12 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⭕</span> La pupila difracta: disco de Airy
            </div>
            <div className="card-body">
              <p>Toda abertura circular difracta. El punto de luz en la retina (disco de Airy) mide</p>
              <div className="eq-block">
                <span className="eqno">(11.68)</span>
                {"\\[ D \\approx 2{,}44\\,\\frac{f}{d}\\,\\lambda \\]"}
              </div>
              <p>
                {"Con pupila \\(d = 8\\) mm, focal \\(f = 17\\) mm y 500 nm: \\(D \\approx 2{,}5\\ \\mu\\mathrm{m}\\). Con \\(d = 2\\) mm: \\(D \\approx 10\\ \\mu\\mathrm{m}\\). "}
                <strong>La pupila estrecha empeora la difracción</strong> (pero ayuda a la profundidad de campo).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> El fotodetector fija el techo
            </div>
            <div className="card-body">
              <p>
                Los conos foveales (~2 µm) están en la escala de la difracción con pupila grande:{' '}
                <strong>el ojo opera en el límite físico</strong>. A 10 m, dos puntos separados 1,2 mm subtienden 0,12
                mrad = 25 s de arco, justo lo resoluble.
              </p>
              <div className="eq-block">
                {"\\[ \\theta_\\mathrm{min} \\approx \\frac{D}{f} = 2{,}44\\frac{\\lambda}{d} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              Cierra la pupila: el punto de Airy crece. Abre a 8 mm: cae a ~2,5 µm, el tamaño de un cono foveal. El ojo
              «sabe» cuándo la difracción y el detector se empatan.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-diffraction" className="sim" />
            <div className="prof-controls">
              <span className="badge">difracción</span>
              <label>
                Pupila d{' '}
                <input
                  type="range"
                  id="df_d"
                  min="2"
                  max="8"
                  defaultValue={params.df_d}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('df_d', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="df_dv">5,0 mm</span>
              </label>
              <label>
                λ{' '}
                <input
                  type="range"
                  id="df_lam"
                  min="400"
                  max="700"
                  defaultValue={params.df_lam}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('df_lam', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="df_lamv">555 nm</span>
              </label>
              <span className="readout" id="df_out">
                Disco de Airy ≈ 4,1 µm @ 5 mm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
