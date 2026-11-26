import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const mode = engine.flagsRef.current.jumpMode;
  const slider = (key: 'jp_mass' | 'jp_N' | 'jp_s', label: string, min: number, max: number, step: number, aria: string) => (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={params[key]}
        aria-label={aria}
        onChange={(e) => {
          engine.setParam(key, parseFloat(e.target.value));
          engine.requestDraw();
        }}
      />
    </label>
  );

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <SlideHeader index={9} num="3.5.1" title="El salto vertical" sub="Del empuje contra el suelo a la altura" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦘</span> Energía: de la extensión al vuelo
            </div>
            <div className="card-body">
              <p>
                De pie el CM está a ≈ 1,0 m; agachado, a 0,65 m; en el despegue (de puntillas), a 1,05 m. Durante la
                extensión el CM sube {'\\(s\\)'} con fuerza neta {'\\(N(t) - m_b g\\)'}:
              </p>
              <div className="eq-block">
                {'\\[ H = \\frac{v_{TO}^2}{2g} = \\frac{\\int_0^s F_V\\,dz}{m_b g} \\approx \\frac{(\\langle N \\rangle - m_b g)\\,s}{m_b g} \\]'}
              </div>
              <p>
                Ejemplo del libro: {'\\(W_b = 140\\ \\text{lb}\\)'} (620 N), {'\\(\\langle N \\rangle = 300\\ \\text{lb}\\)'}{' '}
                (1334 N), {'\\(s = 1{,}4\\ \\text{ft}\\)'} (0,43 m):
              </p>
              <div className="eq-block">
                {'\\[ H = 0{,}49\\ \\text{m},\\qquad v_{TO} = 3{,}1\\ \\text{m/s},\\qquad \\tau = 0{,}28\\ \\text{s} \\]'}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Extender más rápido = saltar más alto
            </div>
            <div className="card-body">
              <div className="eq-block">{'\\[ v_{TO} = \\frac{2s}{\\tau} \\quad\\Rightarrow\\quad H = \\frac{2s^2}{g\\,\\tau^2} \\]'}</div>
              <p>
                <strong>Desde cuclillas</strong> las fuerzas musculares rondan 0,2× el nivel isométrico y 0,4× justo antes
                del despegue. Con <strong>contramovimiento</strong> el cuerpo cae libre, los músculos frenan (contracción
                excéntrica) por encima del nivel isométrico y estiran más los tendones: el salto es más alto.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Paradoja de plataforma de fuerzas: un corredor pisa con hasta 1710 N, pero en el salto de altura cada pie
              empuja solo ≈ 715 N — los músculos se contraen más rápido y desarrollan menos tensión (Cap. 5).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-jump" className="sim" label="Fuerza del suelo durante la extensión y altura alcanzada" />
            <div className="prof-controls">
              <span className="badge">{'\\(H = v_{TO}^2/2g\\)'}</span>
              {slider('jp_mass', 'm', 40, 110, 0.5, 'Masa corporal en kg')}
              {slider('jp_N', '⟨N⟩', 700, 2500, 2, 'Fuerza normal media en newtons')}
              {slider('jp_s', 's', 0.1, 0.7, 0.01, 'Recorrido de extensión s en metros')}
              <button
                type="button"
                aria-pressed={mode === 'sq'}
                onClick={() => {
                  engine.setFlag('jumpMode', mode === 'cm' ? 'sq' : 'cm');
                  engine.requestDraw();
                }}
              >
                {mode === 'cm' ? 'Contramovimiento' : 'Desde cuclillas'}
              </button>
              <span className="readout" id="jp_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
