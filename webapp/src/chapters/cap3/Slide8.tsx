import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide8({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="3">
      <SlideHeader index={8} num="3.4.3" title="Aceleración hasta el sprint" sub="Zancada a zancada hacia la velocidad final" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💨</span> El trabajo de cada zancada
            </div>
            <div className="card-body">
              <p>
                En cada zancada el pie apoyado empuja con {'\\(F\\)'} a lo largo de {'\\(L\\)'} y acelera el cuerpo superior
                ({'\\(m_b - 2m_{\\text{leg}}\\)'}) y la otra pierna, que <strong>parte de 0</strong> porque acaba de estar
                apoyada. Tras la primera zancada:
              </p>
              <div className="eq-block">{'\\[ FL = \\tfrac12 (m_b - m_{\\text{leg}})\\,v_1^2 \\]'}</div>
              <p>y, sumando la serie geométrica (ec. 3.46):</p>
              <div className="eq-block">
                {'\\[ v_n^2 = \\frac{2FL}{m_{\\text{leg}}}\\left[1 - \\left(\\frac{m_b - 2m_{\\text{leg}}}{m_b - m_{\\text{leg}}}\\right)^{n}\\right] \\quad\\xrightarrow{\\,n\\to\\infty\\,}\\quad v_{\\text{final}} = \\sqrt{\\frac{2FL}{m_{\\text{leg}}}} \\]'}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏅</span> El número del libro
            </div>
            <div className="card-body">
              <p>
                Con {'\\(m_{\\text{leg}} = 0{,}161\\,m_b\\)'} (Tabla 1.7), {'\\(m_b = 70\\ \\text{kg}\\)'},{' '}
                {'\\(F = 560\\ \\text{N}\\)'} y {'\\(L = 1{,}0\\ \\text{m}\\)'}:
              </p>
              <div className="eq-block">
                {'\\[ v_{\\text{final}} = \\sqrt{\\frac{2(560)(1{,}0)}{0{,}161\\cdot 70}} \\approx 10{,}0\\ \\text{m/s} \\]'}
              </div>
              <p>
                Los velocistas de clase mundial promedian ≈ <span className="tag">10,4 m/s</span> en 100 y 200 m (2014); más
                allá de ≈ 200 m se agotan las reservas de energía más rápidas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              El límite lo fija la masa de la pierna, no la del cuerpo: es la pieza que hay que volver a lanzar en cada
              zancada. Para 10,4 m/s hacen falta ≈ 610 N por zancada — pruébelo con el control F.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-sprint" className="sim" label="Rapidez tras cada zancada y velocidad final" />
            <div className="prof-controls">
              <span className="badge">{'\\(v_{\\text{final}} = \\sqrt{2FL/m_{\\text{leg}}}\\)'}</span>
              <label>
                F
                <input
                  type="range"
                  min="200"
                  max="900"
                  step="10"
                  defaultValue={params.sp_F}
                  aria-label="Fuerza de empuje F en newtons"
                  onChange={(e) => {
                    engine.setParam('sp_F', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                {'\\(m_b\\)'}
                <input
                  type="range"
                  min="50"
                  max="100"
                  defaultValue={params.sp_m}
                  aria-label="Masa corporal en kg"
                  onChange={(e) => {
                    engine.setParam('sp_m', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="sp_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
