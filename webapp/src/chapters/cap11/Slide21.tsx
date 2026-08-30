import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide21({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="21" data-module="8">
      <div className="module-header">
        <span className="mnum">11 · 4</span>
        <span className="mtitle">Glaucoma y daño por la luz</span>
        <span className="msub">{"\\(\\text{riesgo glaucoma} \\propto \\mathrm{PIO}\\ \\cdot\\ \\text{UV 180–400 nm}\\)"}</span>
        <span className="mslide-count">21 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📈</span> La presión mata el nervio óptico
            </div>
            <div className="card-body">
              <p>
                El <strong>glaucoma</strong> lesiona las fibras del nervio óptico, a menudo por presión intraocular alta.
                El riesgo salta con la PIO:
              </p>
              <div className="eq-block">
                {"\\[ \\text{PIO} = 40\\ \\mathrm{mmHg} \\Rightarrow \\text{riesgo} \\approx 40\\times\\ \\text{el de } 15\\ \\mathrm{mmHg} \\]"}
              </div>
              <p>Es la primera causa de ceguera irreversible: detectarlo es medir la PIO y mirar el nervio.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">☀️</span> Bandas de daño fotoquímico y térmico
            </div>
            <div className="card-body">
              <p>
                Cada rango espectral daña de un modo: <span className="tag">UV 180–400 nm: fotoqueratitis (córnea)</span>{' '}
                <span className="tag">azul 400–500 nm: fotoretinitis</span>{' '}
                <span className="tag">400–1 400 nm: daño térmico (láser)</span>{' '}
                <span className="tag">IR 800–3 000 nm: quemadura</span>. El azul penetra y «quema» la retina; por eso
                la protección de la luz azul es tema de higiene visual.
              </p>
              <div className="eq-block">
                {"\\[ \\text{riesgo} \\propto \\int E_\\lambda\\,\\alpha(\\lambda)\\,d\\lambda \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-21">
              Sube la PIO y mira dispararse el factor de riesgo (×40 a 40 mmHg). La franja azul del espectro (400–500
              nm) es la que daña la retina por fotoquímica: la misma ventana que activa los bastones, vista como riesgo
              en exceso de luz.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-glaucoma" className="sim" />
            <div className="prof-controls">
              <span className="badge">glaucoma</span>
              <label>
                PIO{' '}
                <input
                  type="range"
                  id="gd_pio"
                  min="10"
                  max="40"
                  defaultValue={params.gd_pio}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('gd_pio', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="gd_piov">15 mmHg</span>
              </label>
              <span className="readout" id="gd_out">
                PIO 15 mmHg · riesgo ×1 (referencia)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
