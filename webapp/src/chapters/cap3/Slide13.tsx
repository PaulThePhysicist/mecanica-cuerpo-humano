import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="5">
      <SlideHeader index={13} num="3.6.2" title="Potencia generada durante un lanzamiento" sub="P = τΩ, incluso para un lanzamiento lento" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Del movimiento lineal al rotacional
            </div>
            <div className="card-body">
              <div className="eq-block">
                {'\\[ W = F\\,\\Delta x,\\ \\ P = F v \\qquad\\longleftrightarrow\\qquad W = \\tau\\,\\Delta\\theta,\\ \\ P = \\tau\\,\\Omega \\]'}
              </div>
              <p>
                Son la misma ley: con {'\\(\\tau = rF\\)'} y {'\\(v = \\Omega r\\)'}, {'\\(\\tau\\Omega = Fv\\)'}. Para
                varias articulaciones, {'\\(P = \\sum_k \\tau_k \\Omega_k\\)'}.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚀</span> Caso c (bíceps de 3 in, 25 mph)
            </div>
            <div className="card-body">
              <p>
                {'\\(\\tau = 3645\\ \\text{N}\\cdot\\text{cm} = 36{,}45\\ \\text{N}\\cdot\\text{m}\\)'} constante; {'\\(\\Delta\\theta = \\pi/2\\)'} en{' '}
                {'\\(0{,}10\\ \\text{s}\\)'}: {'\\(\\Omega_{\\text{prom}} = 15{,}7\\ \\text{rad/s}\\)'}, y Ω crece lineal hasta{' '}
                {'\\(\\Omega_{\\max} = 31{,}4\\ \\text{rad/s}\\)'}.
              </p>
              <div className="eq-block">
                {'\\[ P_{\\text{prom}} = 36{,}45 \\times 15{,}7 \\approx 570\\ \\text{W} = 0{,}76\\ \\text{hp} \\]'}
              </div>
              <div className="eq-block">
                {'\\[ P_{\\max} = 36{,}45 \\times 31{,}4 \\approx 1140\\ \\text{W} = 1{,}5\\ \\text{hp} \\]'}
              </div>
              <p>Con el bíceps de 2 in: 178 W de media y 356 W de máximo.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Un caballo de vapor y medio en un lanzamiento lento de un solo segmento. Comparación del libro: un lanzador de
              grandes ligas lanza a 90–100 mph una pelota de 0,14 kg; un mariscal de campo, a 50–60 mph un balón de 0,42 kg —
              el objeto más pesado ralentiza la rotación del codo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-power" className="sim" label="Antebrazo, velocidad angular y potencia instantánea" />
            <div className="prof-controls">
              <span className="badge">{'\\(P = \\tau\\Omega\\)'}</span>
              <label>
                Ω
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.1"
                  defaultValue={params.pw_om}
                  aria-label="Velocidad angular Ω en rad/s"
                  onChange={(e) => {
                    engine.setParam('pw_om', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="pw_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
