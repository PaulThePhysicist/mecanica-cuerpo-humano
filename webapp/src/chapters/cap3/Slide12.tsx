import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';
import { PHASES_END } from './sims';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const playing = engine.flagsRef.current.phPlaying;

  return (
    <div className="slide active" data-slide="12" data-module="5">
      <SlideHeader index={12} num="3.6" title="Las seis fases del pitcheo" sub="La cadena cinética: velocidades que se suman" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⏳</span> Cronometría del lanzamiento (Fig. 3.49)
            </div>
            <div className="card-body">
              <div className="row">
                <span className="pill">1 · Preparación</span>
                <span className="pill">2 · Zancada</span>
                <span className="pill">3 · Armado del brazo</span>
                <span className="pill">4 · Aceleración</span>
                <span className="pill">5 · Desaceleración</span>
                <span className="pill">6 · Seguimiento</span>
              </div>
              <p>
                Tras la preparación el lanzador está en el punto de equilibrio ({'\\(t = 0\\)'}). El pie delantero toca el
                suelo a {'\\(t \\approx 0{,}50\\ \\text{s}\\)'} y la pelota sale a {'\\(t \\approx 0{,}64\\ \\text{s}\\)'}: la
                aceleración dura ≈ 0,14 s, coherente con los ≈ 0,1 s del modelo de un segmento.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧬</span> Velocidades que se suman
            </div>
            <div className="card-body">
              <p>
                Tobillo, rodilla y cadera (la propulsión del paso) aportan ≈ <strong>10 mph</strong>; el hombro y el codo,
                que giran ángulos y tiempos parecidos, ≈ <strong>45 mph</strong> cada uno:
              </p>
              <div className="eq-block">{'\\[ v_{\\text{pelota}} \\approx 10 + 45 + 45 \\approx 100\\ \\text{mph} \\]'}</div>
              <p>
                Velocidades angulares máximas: pelvis 550–700 °/s, tronco 1100–1350 °/s, codo 2200–2800 °/s, hombro
                6900–9800 °/s — la rotación del húmero es la más rápida del cuerpo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Quizá ≈ 90 % de los ≈ 200 J guardados en ligamentos y tendones del hombro durante el armado se devuelven: ≈ 54
              % de los ≈ 346 J de trabajo rotacional del húmero. Ese almacenamiento también explica las lesiones por
              lanzamiento. La muñeca aporta poca velocidad pero mucho giro.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-phases" className="sim" label="Línea de tiempo de las seis fases y suma de velocidades" />
            <div className="prof-controls">
              <span className="badge">Cadena cinética</span>
              <label>
                t
                <input
                  type="range"
                  id="ph_t"
                  min="0"
                  max={PHASES_END}
                  step="0.01"
                  defaultValue={params.ph_t}
                  aria-label="Tiempo desde el punto de equilibrio en segundos"
                  onChange={(e) => {
                    engine.setParam('ph_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                aria-pressed={playing}
                onClick={() => {
                  if (!playing && params.ph_t >= PHASES_END) engine.setParam('ph_t', 0);
                  engine.setFlag('phPlaying', !playing);
                }}
              >
                {playing ? '⏸ Pausa' : '▶ Reproducir'}
              </button>
              <span className="readout" id="ph_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
