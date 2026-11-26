import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const playing = engine.flagsRef.current.gaitPlaying;

  return (
    <div className="slide active" data-slide="3" data-module="2">
      <SlideHeader index={3} num="3.3.1 · 3.4.1" title="El ciclo de la marcha" sub="Apoyo 60–65 % · oscilación 35–40 %" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦵</span> Las fases de un ciclo
            </div>
            <div className="card-body">
              <p>
                Del <strong>golpe de pie</strong> (FS, golpe de talón) al <strong>despegue de los dedos</strong> (TO) va la
                fase de <span className="highlight">apoyo</span>: carga, apoyo medio, apoyo terminal y preoscilación. De TO
                al siguiente FS, la de <span className="highlight">oscilación</span>: inicial, media y terminal.
              </p>
              <div className="row">
                <span className="pill">
                  <b>Apoyo</b> · 60–65 %
                </span>
                <span className="pill">
                  <b>Oscilación</b> · 35–40 %
                </span>
              </div>
              <p>
                Hay <strong>doble apoyo</strong> en el primer y el último ≈ 10 % del apoyo (justo tras FS y justo antes de
                TO); al caminar, ambos pies nunca están en el aire a la vez.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> Ángulos sagitales (Fig. 3.11)
            </div>
            <div className="card-body">
              <p>
                Cadera: ≈ 30° de flexión al contacto, extiende hasta ≈ 10° y vuelve a flexionarse a ≈ 35°. Rodilla: ≈ 5° al
                contacto, 20° en apoyo medio, 40° en preoscilación y 60–70° de flexión en la oscilación media.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Caminar vs correr
            </div>
            <div className="card-body">
              <p>
                Al correr el apoyo ocupa el primer ≈ <span className="tag">40 %</span> del ciclo y el pie está fuera del
                suelo el ≈ <span className="tag">60 %</span> restante: flota 15 %, oscila 30 % y vuelve a flotar 15 %. Aparece
                una <strong>fase de vuelo</strong> sin ningún pie en el suelo — la diferencia que descalificó a Jane Saville
                en la marcha atlética de Sídney 2000.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              En el lienzo, avance el ciclo: la etiqueta «DOBLE APOYO» se enciende dos veces por ciclo, al principio y al
              final del apoyo de cada pierna (≈ 6 % del ciclo cada vez con 62 % de apoyo).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-gait" className="sim" label="Piernas en el ciclo de marcha y barras de apoyo y oscilación" />
            <div className="prof-controls">
              <span className="badge">Ciclo</span>
              <label>
                t
                <input
                  type="range"
                  id="gait_t"
                  min="0"
                  max="99"
                  defaultValue={params.gait_t}
                  aria-label="Instante del ciclo en %"
                  onChange={(e) => {
                    engine.setParam('gait_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button type="button" aria-pressed={playing} aria-label={playing ? 'Pausar' : 'Reproducir'} onClick={() => engine.setFlag('gaitPlaying', !playing)}>
                {playing ? '⏸ Pausa' : '▶ Animar'}
              </button>
              <span className="readout" id="gait_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
