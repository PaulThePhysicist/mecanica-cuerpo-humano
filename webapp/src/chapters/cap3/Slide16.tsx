import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

/** Ejemplos del libro (§3.10.2): cabeza contra viga, salto de 1 m, cabeza a 50 mph en 10 ms. */
const PRESETS = {
  head: { v: 1, dx: 0.005, m: 3 },
  jump: { v: 4.43, dx: 0.01, m: 70 },
  crash: { v: 22.3, dx: 0.1115, m: 3 },
} as const;

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  const setPreset = (k: keyof typeof PRESETS) => {
    const s = PRESETS[k];
    engine.setParam('co_v', s.v);
    engine.setParam('co_dx', s.dx);
    engine.setParam('co_m', s.m);
    const sync = (id: string, v: number) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = String(v);
    };
    sync('co_v', s.v);
    sync('co_dx', s.dx);
    sync('co_m', s.m);
    engine.requestDraw();
  };
  const slider = (key: 'co_v' | 'co_dx' | 'co_m', label: string, min: number, max: number, step: number, aria: string) => (
    <label>
      {label}
      <input
        type="range"
        id={key}
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
    <div className="slide active" data-slide="16" data-module="7">
      <SlideHeader index={16} num="3.10.1–3.10.2" title="Colisiones: frenar en poco espacio" sub="Desaceleración, fractura y supervivencia" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💥</span> Cinemática de una colisión
            </div>
            <div className="card-body">
              <p>Si el cuerpo pasa de {'\\(v_i\\)'} a 0 con desaceleración uniforme (ec. 3.105–3.107):</p>
              <div className="eq-block">
                {'\\[ a_{\\text{decel}} = \\frac{v_i^2}{2\\,\\Delta x}, \\qquad |F| = \\frac{m v_i}{t_{\\text{col}}}, \\qquad P = \\frac{m v_i}{A\\,t_{\\text{col}}} \\]'}
              </div>
              <p>
                Cabeza de 3 kg a 1 m/s contra una viga en 10 ms (5 mm): ≈ <span className="tag">10 g</span>,{' '}
                <span className="tag">300 N</span>. Para reducir el daño: más {'\\(t_{\\text{col}}\\)'} (acolchado, flexionar
                las rodillas, rodar) y más área {'\\(A\\)'}.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦴</span> Saltar de 1 m con la pierna rígida
            </div>
            <div className="card-body">
              <p>
                {'\\(v_i = \\sqrt{2gh} \\approx 4{,}5\\ \\text{m/s}\\)'}; el talón amortigua {'\\(\\Delta x = 1\\ \\text{cm}\\)'}:{' '}
                {'\\(a = 100\\,g\\)'} y {'\\(F = 7\\times10^4\\ \\text{N}\\)'}. Sobre la tibia ({'\\(A \\approx 3\\ \\text{cm}^2\\)'}):
                {' '}
                {'\\(\\sigma = 230\\ \\text{N/mm}^2\\)'}, <strong>por encima</strong> de la tensión de compresión última del
                hueso (UCS ≈ 170 MPa): fractura.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Índices de severidad
            </div>
            <div className="card-body">
              <div className="eq-block">
                {'\\[ \\text{GSI} = \\int \\left(\\frac{a_{\\text{decel}}}{g}\\right)^{2{,}5} dt = \\left(\\frac{\\Delta v}{g\\,t_{\\text{col}}}\\right)^{2{,}5} t_{\\text{col}} \\]'}
              </div>
              <p>
                GSI ≈ 1000: 50 % de fatalidad; ≈ 400: conmoción leve. HIC = 1000 → 7 % de muerte; 1500 → 26 %. Cabeza a
                50 mph frenada en 10 ms: GSI ≈ 7800 (inelástica) o 44 000 (elástica). Por encima de 175–200 g las colisiones
                no son supervivibles (Fig. 3.61).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              En placajes de fútbol americano, ≈ 98 g en 15 ms causaron conmoción y ≈ 60 g no (umbrales GSI ≈ 300, HIC ≈
              250). Duplique Δx en el lienzo: la desaceleración cae a la mitad — eso hacen cascos y bolsas de aire.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-collision" className="sim" label="Objeto que frena sobre una distancia y factor G" />
            <div className="prof-controls">
              <span className="badge">{'\\(G = v^2/(2g\\,\\Delta x)\\)'}</span>
              <button type="button" onClick={() => setPreset('head')}>
                🧠 Cabeza 1 m/s
              </button>
              <button type="button" onClick={() => setPreset('jump')}>
                🦘 Salto 1 m
              </button>
              <button type="button" onClick={() => setPreset('crash')}>
                🚗 Cabeza 50 mph
              </button>
              {slider('co_v', 'v', 0.5, 25, 0.01, 'Rapidez inicial en m/s')}
              {slider('co_dx', 'Δx', 0.001, 0.3, 0.0005, 'Distancia de frenado en metros')}
              {slider('co_m', 'm', 1, 90, 1, 'Masa que frena en kg')}
              <span className="readout" id="co_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
