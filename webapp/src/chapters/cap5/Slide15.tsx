import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;
  const [isPlaying, setIsPlaying] = useState(flags.dyPlaying);

  const togglePlay = () => {
    flags.dyPlaying = !flags.dyPlaying;
    if (flags.dyPlaying) flags.dyT = 0;
    setIsPlaying(flags.dyPlaying);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <div className="module-header">
        <span className="mnum">5.8</span>
        <span className="mtitle">El ciclo del puente cruzado: la relación de trabajo</span>
        <span className="msub">τ_on ≈ 1 ms · r_duty ≈ 0,02</span>
        <span className="mslide-count">15 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⏱️</span> El ciclo y la relación de trabajo
            </div>
            <div className="card-body">
              <p>
                Cada puente cruzado alterna entre unido ({"\\(\\tau_{\\text{on}}\\)"}) y desprendido (
                {"\\(\\tau_{\\text{off}}\\)"}), con {"\\(\\tau_{\\text{cycle}}=\\tau_{\\text{on}}+\\tau_{\\text{off}}\\)"}
                . La <strong>relación de trabajo</strong> es la fracción de tiempo unido:
              </p>
              <div className="eq-block">
                {"\\[ r_{\\text{duty}}=\\frac{\\tau_{\\text{on}}}{\\tau_{\\text{cycle}}}\\approx 0{,}02 \\qquad\\text{(5.26)} \\]"}
              </div>
              <p>
                Para movimiento continuo hacen falta cabezas en distintas fases: <span className="tag">N_min = 1/r_duty = 50</span>{' '}
                (5.27). De los ≈ <span className="tag">300 puentes</span> de un medio filamento, solo ≈{' '}
                <span className="highlight">6 están unidos y ejerciendo fuerza</span> en cualquier instante — como un bote
                con 8 remos y solo 2 en el agua.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📏</span> Distancias y velocidades
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ \\Delta=\\frac{\\delta}{r_{\\text{duty}}}\\approx 250\\ \\text{nm} \\quad \\text{(5.28)} \\qquad \\tau_{\\text{cycle}}=\\frac{1}{k_{\\text{ATPase}}}\\approx 0{,}05\\ \\text{s} \\quad \\text{(5.29)} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ v=\\frac{\\Delta}{\\tau_{\\text{cycle}}}=\\frac{\\delta}{\\tau_{\\text{on}}} = \\frac{5\\ \\text{nm}}{10^{-3}\\ \\text{s}} = 5\\ \\mu\\text{m/s} \\qquad\\text{(5.30)} \\]"}
              </div>
              <p>
                Distancia de paso entre sitios {"\\(d \\approx 36\\ \\text{nm}\\)"}, con {"\\(\\Delta = nd\\)"} (
                {"\\(n=3\\)"}). En la cinesina {"\\(r \\approx 1\\)"}: casi siempre en contacto,{' '}
                {"\\(\\delta = 8\\ \\text{nm}\\)"}, {"\\(d = 8\\ \\text{nm}\\)"}, {"\\(\\Delta = 16\\ \\text{nm}\\)"}.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              La relación de trabajo es el «secreto» del deslizamiento continuo: ningún puente se queda parado porque
              siempre hay ~6 de 300 en el tirón. La velocidad emerge sola: δ/τ_on = 5 μm/s. En el canvas verás la línea
              de tiempo de un ciclo y las tres distancias características.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-duty" />
            <div className="prof-controls">
              <span className="badge">duty ratio</span>
              <button id="dy_play" type="button" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="dy_out">
                r_duty = 0,02 · N_min = 50
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
