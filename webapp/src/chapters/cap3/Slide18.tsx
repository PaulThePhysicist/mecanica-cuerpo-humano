import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

const FLOW: [number, string][] = [
  [1, 'Estabilidad'],
  [2, 'Marcha'],
  [3, 'Carrera'],
  [4, 'Salto'],
  [5, 'Lanzar'],
  [6, 'Bateo'],
  [7, 'Colisiones'],
  [8, 'Vuelo'],
];

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="18" data-module="8">
      <SlideHeader index={18} num="3.12 · 3.13" title="El vuelo de la pelota" sub="Arrastre, efecto Magnus y resumen del capítulo" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎈</span> El arrastre: «el gran igualador»
            </div>
            <div className="card-body">
              <p>
                En régimen turbulento {'\\(F_{\\text{arrastre}} = \\tfrac12 C_D A \\rho v^2\\)'}, con{' '}
                {'\\(C_D \\simeq 0{,}45\\)'} para esferas lisas ({'\\(Re \\sim 10^3\\text{–}2\\times10^5\\)'}):
              </p>
              <div className="eq-block">
                {'\\[ m\\frac{dv_x}{dt} = -\\tfrac12 C_D A\\rho\\,v\\,v_x, \\qquad m\\frac{dv_z}{dt} = -mg - \\tfrac12 C_D A\\rho\\,v\\,v_z \\]'}
              </div>
              <p>
                El alcance máximo pasa de <span className="tag">45°</span> en el vacío a ≈ <span className="tag">35–40°</span>{' '}
                en el aire, y la trayectoria se vuelve asimétrica. En el vacío el alcance crece como {'\\(v_0^2\\)'}; con
                arrastre, cada m/s extra rinde mucho menos. Regla empírica para la pelota de <strong>golf</strong>: vuelo
                (yd) ≈ {'\\(\\tfrac32 v_0 - 105\\)'} con {'\\(v_0\\)'} en ft/s.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌀</span> El efecto Magnus
            </div>
            <div className="card-body">
              <p>
                Con <strong>backspin</strong> la fuerza de Magnus empuja hacia arriba (sustentación) y la pelota vuela más
                lejos; con <strong>topspin</strong>, hacia abajo y cae antes. Los hoyuelos de la pelota de golf bajan el{' '}
                {'\\(Re\\)'} crítico (menor {'\\(C_D\\)'}) y aumentan la sustentación.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧭</span> Resumen del capítulo (§3.13)
            </div>
            <div className="card-body">
              <p>
                Cinemática, dinámica y energética, más estabilidad y acción muscular: modelos simples que se refinan, y
                colisiones que explican el deporte y el daño en un choque.
              </p>
              <div className="concept-flow">
                {FLOW.map(([mod, label], i) => (
                  <span key={mod} className="concept-flow__item">
                    {i > 0 && (
                      <span className="arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                    <button type="button" className="step done" onClick={() => engine.goModule(mod)}>
                      {label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Alterne «Con aire / Vacío»: lanzar más fuerte ayuda mucho menos de lo que predice la parábola. Un balón de
              fútbol a 30 m/s supera el Re crítico y vuela ≈ 60 m en vez de ≈ 40 m.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-flight" className="sim" label="Trayectorias de una pelota de béisbol en el vacío y con arrastre" />
            <div className="prof-controls">
              <span className="badge">Proyectil</span>
              <label>
                {'\\(v_0\\)'}
                <input
                  type="range"
                  min="8"
                  max="45"
                  step="0.5"
                  defaultValue={params.fl_v}
                  aria-label="Rapidez inicial en m/s"
                  onChange={(e) => {
                    engine.setParam('fl_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                θ
                <input
                  type="range"
                  min="10"
                  max="70"
                  defaultValue={params.fl_theta}
                  aria-label="Ángulo de lanzamiento en grados"
                  onChange={(e) => {
                    engine.setParam('fl_theta', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                aria-pressed={flags.air}
                onClick={() => {
                  engine.setFlag('air', !flags.air);
                  engine.requestDraw();
                }}
              >
                {flags.air ? 'Con aire' : 'Vacío'}
              </button>
              <button
                type="button"
                aria-pressed={flags.mag}
                disabled={!flags.air}
                onClick={() => {
                  engine.setFlag('mag', !flags.mag);
                  engine.requestDraw();
                }}
              >
                {flags.mag ? 'Backspin: sí' : 'Backspin: no'}
              </button>
              <span className="readout" id="fl_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
