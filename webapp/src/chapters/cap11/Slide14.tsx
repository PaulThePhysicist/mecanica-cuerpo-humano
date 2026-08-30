import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="14" data-module="5">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">La tabla de Snellen y la agudeza</span>
        <span className="msub">{"\\(\\mathrm{VA} = 1/\\theta_\\mathrm{min}\\ (\\mathrm{min\\ de\\ arco})\\)"}</span>
        <span className="mslide-count">14 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔠</span> La E de 20/20
            </div>
            <div className="card-body">
              <p>
                La tabla de Snellen se mira a <strong>20 pies (6 m)</strong> con 480 lux. En la línea 20/20 la letra E
                mide <span className="tag">8,8 mm</span>: subtiende <strong>5 minutos de arco</strong> y cada uno de sus
                5 elementos (trazo y hueco) subtiende <strong>1 minuto de arco</strong>.
              </p>
              <div className="eq-block">
                {"\\[ \\text{E 20/20}:\\quad \\theta = 5'\\ \\text{totales},\\quad \\text{detalle} = 1' \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📊</span> Agudeza visual
            </div>
            <div className="card-body">
              <p>La agudeza es el recíproco del mínimo ángulo resoluble (en minutos):</p>
              <div className="eq-block">
                {"\\[ \\mathrm{VA} = \\frac{1}{\\theta_\\mathrm{min}} \\]"}
              </div>
              <p>
                El emétrope llega a <span className="tag">VA ≈ 1</span> (θ = 1′). Una línea 20/40 (letra doble de
                grande, θ = 2′) da <span className="tag">VA = 0,5</span>. La notación 20/x significa: lo que el paciente
                ve a 20 pies, el estándar lo ve a x pies.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              Sube la línea de la tabla: la E crece y el ángulo aumenta. Una E que subtiende 10′ de arco corresponde a VA
              = 0,1 (20/200): «legalmente ciego» en muchos países.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-snellen" className="sim" />
            <div className="prof-controls">
              <span className="badge">Snellen</span>
              <label>
                Línea 20/{' '}
                <input
                  type="range"
                  id="va_line"
                  min="20"
                  max="200"
                  defaultValue={params.va_line}
                  step="5"
                  onChange={(e) => {
                    engine.setParam('va_line', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="va_linev">20/20</span>
              </label>
              <span className="readout" id="va_out">
                20/20 · VA = 1,0 · θ = 5′ de arco
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
