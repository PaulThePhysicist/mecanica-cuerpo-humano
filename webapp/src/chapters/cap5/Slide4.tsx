import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [isPlaying, setIsPlaying] = useState(flags.smPlaying);

  const togglePlay = () => {
    flags.smPlaying = !flags.smPlaying;
    if (flags.smPlaying) flags.smT = 0;
    setIsPlaying(flags.smPlaying);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">5.2</span>
        <span className="mtitle">Sumación y tétanos</span>
        <span className="msub">Las sacudidas se suman hasta fundirse</span>
        <span className="mslide-count">4 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">➕</span> Dos sacudidas seguidas
            </div>
            <div className="card-body">
              <p>
                Tras el pulso 1 (on <span className="tag">t₁</span>), la tensión decae con τ durante el intervalo{' '}
                <span className="tag">t₂</span>; al empezar el pulso 2 la tensión residual es:
              </p>
              <div className="eq-block">
                {"\\[ T(t_1+t_2)=T_0\\bigl(1-e^{-t_1/\\tau}\\bigr)\\,e^{-t_2/\\tau} \\qquad \\text{(eq. 5.11)} \\]"}
              </div>
              <p>Al final de la segunda sacudida la tensión vale:</p>
              <div className="eq-block">
                {"\\[ T = T_0\\bigl(1-e^{-t_1/\\tau}\\bigr)\\bigl[1+e^{-(t_1+t_2)/\\tau}\\bigr] \\qquad \\text{(eq. 5.15)} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">♾️</span> El estado tetanizado
            </div>
            <div className="card-body">
              <p>
                Tras <strong>N</strong> sacudidas la tensión crece con la suma geométrica{' '}
                {"\\(1+x+x^2+\\cdots\\to 1/(1-x)\\)"}, con {"\\(x=e^{-(t_1+t_2)/\\tau}\\)"}. En el límite:
              </p>
              <div className="eq-block">
                {"\\[ T_{\\text{tetanizado}}=T_0\\,\\frac{1-e^{-t_1/\\tau}}{1-e^{-(t_1+t_2)/\\tau}} \\qquad \\text{(eq. 5.16)} \\]"}
              </div>
              <p>
                Si los pulsos se suceden sin pausa (<span className="tag">t₂ = 0</span>) → <span className="highlight">T = T₀</span>.
                En mamíferos basta con ≈ <span className="tag">50–60 pulsos/s</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              Aquí está el puente entre la sacudida individual y la fuerza sostenida: el cuerpo regula la fuerza de un
              músculo cambiando la <strong>frecuencia</strong> de descargas nerviosas. Sube la frecuencia en el canvas:
              primero ves las sacudidas individuales, luego ondas (tétanos incompleto) y por fin una meseta plana (tétanos
              completo).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-summ" />
            <div className="prof-controls">
              <span className="badge">sumación</span>
              <label>
                frecuencia{' '}
                <input
                  type="range"
                  id="sm_f"
                  min="5"
                  max="120"
                  step="1"
                  defaultValue={params.sm_f}
                  onChange={(e) => {
                    engine.setParam('sm_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="sm_fv">{params.sm_f}/s</span>
              </label>
              <button id="sm_play" type="button" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="sm_out">
                tétanos incompleto
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
