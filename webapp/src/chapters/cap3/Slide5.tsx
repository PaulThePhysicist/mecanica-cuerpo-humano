import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const playing = engine.flagsRef.current.pePlaying;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <SlideHeader index={5} num="3.3.5–3.3.7" title="La pierna como péndulo" sub="Modelo balístico y péndulo invertido" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🪢</span> Modelo balístico: un paso = medio periodo
            </div>
            <div className="card-body">
              <p>
                En la oscilación la pierna se balancea como un péndulo; un paso dura medio periodo. Con{' '}
                {'\\(L_{\\text{leg}} = 0{,}53\\,H = 0{,}95\\ \\text{m}\\)'} ({'\\(H = 1{,}8\\ \\text{m}\\)'}):
              </p>
              <div className="eq-block">
                {'\\[ T_{1/2} = \\pi\\sqrt{\\frac{L}{g}} = \\pi\\sqrt{\\frac{0{,}95}{9{,}8}} = 0{,}98\\ \\text{s} \\]'}
              </div>
              <p>
                La marcha lenta real (0,5 m/s, pasos de 0,3 m) tarda ≈ <span className="tag">0,60 s</span> por paso: el
                modelo de bola en un hilo es solo aceptable. La marcha rápida (≈ 0,35 s) ya es un péndulo forzado.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚙️</span> Refinar la distribución de masa
            </div>
            <div className="card-body">
              <p>
                <strong>Varilla uniforme</strong>: {'\\(I = \\tfrac13 m L^2\\)'}, {'\\(d = L/2\\)'} →{' '}
                {'\\(\\omega = \\sqrt{3g/2L}\\)'} y {'\\(T_{1/2} = 0{,}80\\ \\text{s}\\)'}, mucho más cerca. Con{' '}
                <strong>muslo y pierna</strong> de distinta densidad ({'\\(d = 0{,}421\\,L\\)'},{' '}
                {'\\(I = 0{,}256\\,m L^2\\)'}): {'\\(T_{1/2} = \\pi\\sqrt{0{,}61\\,L/g} = 0{,}76\\ \\text{s}\\)'} — apenas
                4,5 % mejor. La pierna no oscila pasiva ni recta: el modelo no es cuantitativamente exacto.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌕</span> Péndulo invertido: el límite de la marcha
            </div>
            <div className="card-body">
              <p>En el apoyo el CM describe un arco de radio R; no se despega del suelo mientras {'\\(m v^2/R < m g\\)'}:</p>
              <div className="eq-block">{'\\[ v_{\\max} = \\sqrt{g R} \\approx 3{,}0\\ \\text{m/s} \\quad (R = 0{,}9\\ \\text{m}) \\]'}</div>
              <p>
                Luna ({'\\(0{,}17\\,g\\)'}): 1,2 m/s · Marte ({'\\(0{,}4\\,g\\)'}): 1,9 m/s. Los adultos ya corren a
                ≈ 2,0 m/s; la marcha atlética llega a ≈ 4 m/s.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Elija «Luna» y anime: la pierna oscila más lenta y la marcha se limita a 1,2 m/s — por eso los astronautas
              avanzaban a saltos. Los niños, con R menor, corren antes.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pendulo" className="sim" label="Pierna como péndulo y comparación de los tres modelos" />
            <div className="prof-controls">
              <span className="badge">{'\\(T_{1/2} = \\pi\\sqrt{L/g}\\)'}</span>
              <label>
                H
                <input
                  type="range"
                  min="1.4"
                  max="2.1"
                  step="0.01"
                  defaultValue={params.pe_H}
                  aria-label="Estatura H en metros"
                  onChange={(e) => {
                    engine.setParam('pe_H', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                g
                <select
                  defaultValue={params.pe_planet}
                  aria-label="Gravedad"
                  onChange={(e) => {
                    engine.setParam('pe_planet', e.target.value as 'earth' | 'moon' | 'mars');
                    engine.requestDraw();
                  }}
                >
                  <option value="earth">Tierra</option>
                  <option value="moon">Luna (0,17 g)</option>
                  <option value="mars">Marte (0,4 g)</option>
                </select>
              </label>
              <button type="button" aria-pressed={playing} onClick={() => engine.setFlag('pePlaying', !playing)}>
                {playing ? '⏸ Pausa' : '▶ Oscilar'}
              </button>
              <span className="readout" id="pe_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
