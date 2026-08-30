import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">10 · 6</span>
        <span className="mtitle">Sonoridad: fones y sonios</span>
        <span className="msub">
          {"\\(L_p = 10\\log_{10}(I/10^{-12})\\ \\mathrm{ph}\\quad S = (I/10^{-8})^{0{,}3}\\ \\mathrm{sone}\\)"}
        </span>
        <span className="mslide-count">17 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔊</span> Sonoridad: la percepción del nivel
            </div>
            <div className="card-body">
              <p>
                El nivel de sonoridad en <strong>fones</strong> es el nivel (en dB) de un tono de 1 kHz que suena igual
                de fuerte. A 1 kHz, fones ≈ dB; a otras frecuencias, la curva fónica lo corrige.
              </p>
              <div className="eq-block">
                <span className="eqno">(10.64)</span>
                {"\\[ L_p = 10 \\log_{10}\\frac{I}{10^{-12}}\\ \\mathrm{ph} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> El sonio: sonoridad lineal
            </div>
            <div className="card-body">
              <p>
                El <strong>sonio</strong> es la escala lineal de sonoridad: 1 sone = 40 ph; cada vez que la sonoridad se
                duplica, los fones suben 10. Relación experimental con exponente 0,3:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.65)</span>
                {"\\[ S = \\left(\\frac{I}{10^{-8}}\\right)^{0{,}3}\\ \\mathrm{sone} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              Sube el nivel y observa el salto: duplicar la intensidad (+3 dB) apenas añade ~1 sone; multiplicarla por
              10 (+10 dB) la duplica. El oído comprime el mundo físico.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-phonsone" className="sim" />
            <div className="prof-controls">
              <span className="badge">fone/sonio</span>
              <label>
                Nivel{' '}
                <input
                  type="range"
                  id="ps_ph"
                  min="0"
                  max="120"
                  defaultValue={params.ps_ph}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ps_ph', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ps_phv">40 ph</span>
              </label>
              <span className="readout" id="ps_out">
                40 ph → 1 sone
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
