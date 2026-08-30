import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide16({ engine }: SlideProps) {
  const iVal = engine?.paramsRef.current.cv_i ?? 50;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 6</span>
        <span className="mtitle">Curvas de respuesta al ejercicio</span>
        <span className="msub">{"\\(\\text{GC}, \\dot V \\propto \\text{intensidad}\\)"}</span>
        <span className="mslide-count">16 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📊</span> Dos curvas que suben juntas
            </div>
            <div className="card-body">
              <p>
                El gasto cardíaco (GC) y la ventilación ({"\\(\\dot V\\)"}) aumentan monótonamente con la intensidad del
                ejercicio, regulados por los lazos de retroalimentación en paralelo. La curva de ventilación se vuelve más
                empinada al superar el <strong>umbral anaeróbico</strong> (~60% {"\\(\\text{VO}_{2\\text{máx}}\\)"}).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩺</span> Por qué se mide
            </div>
            <div className="card-body">
              <p>
                Estas curvas son el fundamento biofísico de la ergometría clínica: evaluación de capacidad aeróbica funcional,
                detección de isquemia miocárdica y determinación del umbral ventilatorio en atletas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              Desliza la intensidad: GC y ventilación crecen con ella. Por encima del umbral anaeróbico la ventilación se dispara
              para lavar el CO₂ metabólico generado por la acidosis láctica.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cv" />
            <div className="prof-controls">
              <span className="badge">curvas</span>
              <label>
                Intensidad{' '}
                <input
                  type="range"
                  id="cv_i"
                  min="0"
                  max="100"
                  value={iVal}
                  step="1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('cv_i', v);
                    const span = document.getElementById('cv_iv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="cv_iv">{iVal}</span>
              </label>
              <span className="readout" id="cv_out">
                GC y ventilación suben
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
