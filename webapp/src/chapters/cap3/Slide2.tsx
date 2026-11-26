import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const mode = engine.flagsRef.current.presionMode;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <SlideHeader index={2} num="3.2.2" title="Fuerzas sobre los pies" sub="Repartir el peso sobre una superficie pequeña" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦶</span> De pie: presión = fuerza / área
            </div>
            <div className="card-body">
              <div className="eq-block">{'\\[ P = \\frac{W_b}{A} = \\frac{700\\ \\text{N}}{350\\ \\text{cm}^2} \\approx 2\\ \\text{N/cm}^2 \\]'}</div>
              <p>
                Una persona de {'\\(700\\ \\text{N}\\)'} (160 lb) carga {'\\(350\\ \\text{N}\\)'} en cada pie. Pero el pie
                no apoya entero: casi todo el contacto ocurre en la <strong>almohadilla</strong> y el <strong>talón</strong>,
                donde la presión sube a ≈ {'\\(10\\ \\text{N/cm}^2\\)'}.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚶</span> Al caminar la presión se multiplica
            </div>
            <div className="card-body">
              <p>
                Un solo pie soporta el cuerpo (×2) y las fuerzas de frenado y propulsión pueden duplicar la normal (×2):
                la fuerza máxima llega a ≈ {'\\(1400\\ \\text{N}\\)'} por pie, es decir ≈ {'\\(40\\ \\text{N/cm}^2\\)'}.
                Como el pie rara vez está plano, el área es aún menor y el <strong>pico</strong> alcanza ≈{' '}
                {'\\(60\\ \\text{N/cm}^2\\)'} — treinta veces la media de pie quieto. Al correr es mayor todavía.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Cadena para dictar: 2 → 10 → 40 → 60 N/cm². Estas curvas se miden de rutina con plantillas de presión (la
              Fig. 3.19 del libro muestra un registro). Lo que daña el tejido —úlceras por presión en pacientes encamados—
              es la presión, no la fuerza.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-presion" className="sim" label="Huella plantar y escala de presiones" />
            <div className="prof-controls">
              <span className="badge">{'\\(P = W/A\\)'}</span>
              <label>
                masa
                <input
                  type="range"
                  min="40"
                  max="120"
                  defaultValue={params.pr_mass}
                  aria-label="Masa corporal en kg"
                  onChange={(e) => {
                    engine.setParam('pr_mass', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                aria-pressed={mode === 'walk'}
                onClick={() => {
                  engine.setFlag('presionMode', mode === 'stand' ? 'walk' : 'stand');
                  engine.requestDraw();
                }}
              >
                {mode === 'stand' ? 'De pie' : 'Caminando'}
              </button>
              <span className="readout" id="pr_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
