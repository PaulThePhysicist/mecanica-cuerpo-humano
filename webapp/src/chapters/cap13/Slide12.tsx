import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide12({ engine }: SlideProps) {
  const isPlaying = engine?.flagsRef.current.crPlaying ?? false;

  const togglePlay = () => {
    if (!engine) return;
    const next = !engine.flagsRef.current.crPlaying;
    engine.setFlag('crPlaying', next);
    if (next) engine.setFlag('crT', 0);
    engine.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 4</span>
        <span className="mtitle">¿Por qué el bucle cerrado importa?</span>
        <span className="msub">{"\\(\\tau_r: 2{,}4\\ \\text{h} \\to 4{,}7\\ \\text{min}\\)"}</span>
        <span className="mslide-count">12 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Dos constantes de tiempo
            </div>
            <div className="card-body">
              <p>
                Bucle abierto (solo pérdida pasiva): {"\\(\\tau_r = C/\\lambda = 2{,}4\\ \\text{h}\\)"} → el cuerpo tardaría ~5 h en
                estabilizar. Bucle cerrado (con sudoración, {"\\(K/\\lambda=30\\)"}):{" "}
                {"\\(\\tau_r = C/(\\lambda+K) = 2{,}4/31 \\approx 4{,}7\\ \\text{min}\\)"}.
              </p>
              <div className="eq-block">
                {"\\[ \\tau_r^\\text{abierto}=2{,}4\\ \\text{h}\\qquad \\tau_r^\\text{cerrado}\\approx 4{,}7\\ \\text{min} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔁</span> La lección del capítulo
            </div>
            <div className="card-body">
              <p>
                Los resultados absurdos del bucle abierto (24 °C en reposo, 49 °C en ejercicio) demuestran que el{' '}
                <strong>término de control es imprescindible</strong>. Sin retroalimentación, el cuerpo no sobrevive. El control
                aumenta la ganancia efectiva para operar en escalas de minutos.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              ▶ anima la respuesta {"\\(T(t)\\)"} abierto vs cerrado ante el mismo escalón: el abierto apenas se mueve en 5 h; el
              cerrado llega a 37 °C en minutos. La diferencia es el lazo de control.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cr" />
            <div className="prof-controls">
              <span className="badge">τr</span>
              <button id="cr_play" onClick={togglePlay} type="button">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="cr_out">
                abierto vs cerrado · factor 31×
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
