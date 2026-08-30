import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="3">
      <div className="module-header">
        <span className="mnum">6.3</span>
        <span className="mtitle">El ATP: la moneda energética</span>
        <span className="msub">Una molécula pequeña, un puente entre comida y trabajo</span>
        <span className="mslide-count">5 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧬</span> Estructura y reacción
            </div>
            <div className="card-body">
              <p>
                El <strong>ATP</strong> = adenina + ribosa + <strong>tres grupos fosfato</strong>. La hidrólisis del último fosfato
                libera energía (eq. 6.13):
              </p>
              <div className="eq-block">
                {"\\[ \\text{ATP} + \\text{H}_2\\text{O} \\rightarrow \\text{ADP} + \\text{P}_i + \\text{energía} \\]"}
              </div>
              <p>
                La energía libre de la hidrólisis es de <span className="tag">7 a 14 kcal/mol</span>; en la célula se usa típicamente{' '}
                <span className="tag">12–14 kcal/mol</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔁</span> Del combustible al ATP
            </div>
            <div className="card-body">
              <p>
                Oxidar una glucosa rinde ≈ <strong>30 mol de ATP</strong>:
              </p>
              <div className="eq-block">
                {"\\[ 30\\ \\text{mol ATP} \\times 14{,}0\\ \\frac{\\text{kcal}}{\\text{mol}} = 420\\ \\text{kcal} \\qquad \\text{(eq. 6.14)} \\]"}
              </div>
              <p>La glucosa en sí aporta 686 kcal (eq. 6.15: 180 g × 3,8):</p>
              <div className="eq-block">{"\\[ \\frac{420}{686} \\approx 61\\text{–}65\\,\\% \\]"}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🤔</span> ¿Por qué el ATP importa tanto?
            </div>
            <div className="card-body">
              <p>
                Almacena <strong>poca energía por gramo</strong> comparado con la grasa, pero la entrega <em>inmediatamente</em> donde
                se necesita. El ATP en el cuerpo es de solo <span className="tag">~0,2 mol</span>: se recicla miles de veces al día
                (ADP → ATP → ADP…).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              El ATP es el «intermediario» entre la comida y el músculo. La eficiencia del 61–65 % es alta porque el cuerpo captura
              una fracción grande de la energía química de la glucosa en forma de ATP. Pulsa ▶ para ver la hidrólisis que suelta el
              tercer fosfato.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-atp" className="sim" />
            <div className="prof-controls">
              <span className="badge">ATP</span>
              <label>
                ΔG{' '}
                <input
                  type="range"
                  id="at_g"
                  min="7"
                  max="14"
                  step="0.5"
                  defaultValue={params.at_g}
                  onChange={(e) => {
                    engine.setParam('at_g', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="at_gv">{params.at_g}</span>
              </label>
              <button
                type="button"
                id="at_play"
                onClick={() => {
                  const nextPlaying = !flags.atPlaying;
                  engine.setFlag('atPlaying', nextPlaying);
                  if (nextPlaying) flags.atT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.atPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="at_out">
                ATP + H₂O → ADP + Pᵢ + 14 kcal/mol
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
