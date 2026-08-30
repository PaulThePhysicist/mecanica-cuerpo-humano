import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="19" data-module="7">
      <div className="module-header">
        <span className="mnum">10 · 6</span>
        <span className="mtitle">Enmascaramiento y localización</span>
        <span className="msub">{"\\(\\text{ITD} \\approx 10\\ \\mu s/^\\circ\\)"}</span>
        <span className="mslide-count">19 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔕</span> Un sonido puede esconder a otro
            </div>
            <div className="card-body">
              <p>
                El <strong>enmascaramiento</strong>: un sonido intenso eleva el umbral de uno más débil cercano en
                frecuencia (los graves enmascaran más a los agudos que al revés). La banda crítica de la cóclea
                determina cuánto.
              </p>
              <div className="eq-block">
                {"\\[ \\text{máscara} \\approx 3{,}5\\ \\mathrm{kHz} \\text{ para } f \\approx 1\\ \\mathrm{kHz} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> Localización espacial del sonido
            </div>
            <div className="card-body">
              <p>
                Localizamos una fuente por la <strong>diferencia interaural de tiempo</strong> (ITD) y de intensidad
                (ILD). En el plano horizontal el cerebro resuelve diferencias de menos de 10 µs y ángulos de 1–2°. La
                cabeza produce «sombra acústica» en agudos.
              </p>
              <div className="eq-block">
                {"\\[ \\text{ángulo} \\approx \\frac{c\\ \\cdot\\ \\mathrm{ITD}}{d_\\mathrm{orejas}} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              Mueve el tono de la sonda y el ángulo de la fuente: el enmascarador pinta una «montaña» sobre el
              espectro y el sonido débil cae bajo ella. Cambia el ángulo y mira cómo crece la ITD.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-masking" className="sim" />
            <div className="prof-controls">
              <span className="badge">enmascaramiento</span>
              <label>
                Sonda{' '}
                <input
                  type="range"
                  id="ms_f"
                  min="200"
                  max="8000"
                  defaultValue={params.ms_f}
                  step="50"
                  onChange={(e) => {
                    engine.setParam('ms_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ms_fv">2000 Hz</span>
              </label>
              <label>
                Azimut{' '}
                <input
                  type="range"
                  id="ms_th"
                  min="-60"
                  max="60"
                  defaultValue={params.ms_th}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ms_th', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ms_tv">0°</span>
              </label>
              <span className="readout" id="ms_out">
                ITD = 0 µs (centro) · sin enmascarar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
