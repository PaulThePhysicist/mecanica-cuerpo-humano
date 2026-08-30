import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">4.2</span>
        <span className="mtitle">Tendón de Aquiles vs fémur</span>
        <span className="msub">35 J elásticos por cada paso de carrera</span>
        <span className="mslide-count">7 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏃</span> El Aquiles, al borde del UTS
            </div>
            <div className="card-body">
              <p>
                En la carrera, la fuerza sobre el tendón de Aquiles es {"\\(F=4.700\\ \\text{N}\\)"}. Con{" "}
                {"\\(A=89\\ \\text{mm}^2\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ \\sigma=\\frac{4.700}{89}=53\\ \\text{MPa}\\qquad (\\text{UTS}\\approx 100\\ \\text{MPa}) \\]"}
              </div>
              <p>
                Con {"\\(\\varepsilon=6\\ \\%\\)"} y {"\\(L_0=250\\ \\text{mm}\\)"} (ΔL = 15 mm), la energía (4.18–4.19) es
              </p>
              <div className="eq-block">
                {"\\[ \\text{PE}=\\tfrac{1}{2}\\sigma\\varepsilon V=\\tfrac{1}{2}(53)(0{,}06)(89)(250)=35\\ \\text{J} \\]"}
              </div>
              <p>
                El tendón trabaja al <span className="tag">53 % del UTS</span>: sin margen. Por eso se rompen los de los
                velocistas.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦴</span> El fémur, casi nada
            </div>
            <div className="card-body">
              <p>
                En el mismo paso, el fémur ({"\\(F=6.400\\ \\text{N}\\)"}, {"\\(A=330\\ \\text{mm}^2\\)"},{" "}
                {"\\(Y=17,9\\)"} GPa, {"\\(V=165.000\\ \\text{mm}^3\\)"}) almacena (4.20–4.21):
              </p>
              <div className="eq-block">
                {"\\[ \\text{PE}=\\frac{\\sigma^2}{2Y}V=\\frac{(19{,}4)^2}{2(17.900)}165.000\\approx 2\\ \\text{J} \\]"}
              </div>
              <p>
                El tendón almacena <span className="tag">≈ 18× más</span> que el hueso. En total los huesos largos guardan
                ~3–4 J frente a los <span className="highlight">100 J de energía cinética</span> que se pierde en cada
                paso.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Pulsa ▶ y compara: el tendón recupera energía "gratis" en cada zancada; el hueso, casi nada. El 35 J es la
              cantidad exacta que se decía almacenada en cada paso de carrera. La elasticidad es el motor oculto de la
              marcha.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-achilles" className="sim" />
            <div className="prof-controls">
              <span className="badge">PE por paso</span>
              <button
                type="button"
                id="ach_play"
                onClick={() => {
                  const next = !flags.achPlaying;
                  engine.setFlag('achPlaying', next);
                  if (next) engine.setFlag('achT', 0);
                  const b = document.getElementById('ach_play');
                  if (b) b.textContent = next ? '⏸' : '▶';
                }}
              >
                {flags.achPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ach_out">
                Aquiles 35 J · fémur 2 J
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
