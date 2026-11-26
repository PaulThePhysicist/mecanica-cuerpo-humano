import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const glove = engine.flagsRef.current.glove;

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <SlideHeader index={17} num="3.10.3" title="Boxeo: guantes vs puño limpio" sub="Colisión inelástica frente a elástica y el GSI" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🥊</span> Con guantes: colisión inelástica
            </div>
            <div className="card-body">
              <p>
                Masa efectiva del brazo {'\\(0{,}050\\,m_b\\)'} (velocidad media {'\\(v/2\\)'}) contra cabeza y cuello{' '}
                {'\\(0{,}081\\,m_b\\)'}; puño y cabeza salen juntos (ec. 3.121–3.122):
              </p>
              <div className="eq-block">
                {'\\[ v_f = \\frac{v_{\\text{puño}}}{1 + 2\\,m_{\\text{cabeza}}/m_{\\text{brazo}}} = 0{,}236\\,v_{\\text{puño}} \\]'}
              </div>
              <p>
                A 30 mph (13,4 m/s) con 1 cm de guante: {'\\(v_f = 3{,}2\\ \\text{m/s}\\)'}, <span className="tag">51 g</span>{' '}
                en 6,3 ms → <span className="tag">GSI ≈ 117</span> (daño, no fatal). Con 0,5 cm de relleno: 332; a 45 mph:
                593. Un golpe sólido de peso pesado ronda GSI ≈ 400 (nocaut).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩸</span> A puño limpio: colisión elástica
            </div>
            <div className="card-body">
              <p>Se conservan momento y energía cinética (ec. 3.123–3.125) y el frenado es de ≈ 1 mm:</p>
              <div className="eq-block">
                {'\\[ v_{\\text{cabeza}} = 0{,}382\\,v_{\\text{puño}} \\approx 5{,}1\\ \\text{m/s} \\quad\\rightarrow\\quad 1340\\,g,\\quad \\text{GSI} \\approx 25\\,600 \\]'}
              </div>
              <p>
                Potencialmente mortal — y fractura los nudillos del que golpea (fractura del boxeador, Fig. 3.66). El guante
                protege a ambos: alarga {'\\(t_{\\text{col}}\\)'}, reparte el área y vuelve inelástica la colisión, así que
                baja la desaceleración de la cabeza.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Mismo puño, GSI 117 frente a 25 600. Kárate: el golpe de martillo llega a 10–14 m/s y sobre hormigón frena a
              hasta 4000 m/s² en ≈ 5 ms (≤ 2800 N); la tabla cede en tracción antes que el hueso en compresión.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-boxing" className="sim" label="Puño y cabeza con escala logarítmica del GSI" />
            <div className="prof-controls">
              <span className="badge">GSI</span>
              <label>
                {'\\(v_{\\text{puño}}\\)'}
                <input
                  type="range"
                  min="20"
                  max="55"
                  step="1"
                  defaultValue={params.bx_v}
                  aria-label="Rapidez del puño en mph"
                  onChange={(e) => {
                    engine.setParam('bx_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                aria-pressed={!glove}
                onClick={() => {
                  engine.setFlag('glove', !glove);
                  engine.requestDraw();
                }}
              >
                {glove ? '🥊 Guantes' : '✊ Puño limpio'}
              </button>
              <span className="readout" id="bx_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
