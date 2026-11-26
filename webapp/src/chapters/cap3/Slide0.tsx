import type { Engine } from './useEngine';
import { MODULES } from './sims';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 3</span>
        El <span className="vol">Movimiento</span>
      </h1>
      <p className="subtitle">
        Del reposo al movimiento: estar de pie, caminar, correr, saltar, lanzar, golpear, chocar y volar. Para cada
        destreza seguimos su cinemática, las fuerzas que la causan, los músculos que las aportan y su energética — y vemos
        que cada una tiene su física (y su número) dentro del cuerpo humano.
      </p>
      <div className="rule" />
      <div className="module-preview">
        {MODULES.filter((m) => m.id !== 0).map((m) => (
          <button key={m.id} type="button" className="mpill" onClick={() => engine.goModule(m.id)}>
            <span className="ico" aria-hidden="true">
              {m.ico}
            </span>{' '}
            {m.name}
          </button>
        ))}
      </div>
      <div className="cover-actions">
        {onBack && (
          <button type="button" className="start-btn start-btn--ghost" onClick={onBack}>
            ← Volver al Índice
          </button>
        )}
        <button type="button" className="start-btn" onClick={() => engine.goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016) · Cap. 3</p>
    </div>
  );
}
