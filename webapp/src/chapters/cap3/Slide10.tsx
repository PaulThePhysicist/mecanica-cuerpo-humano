import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="4">
      <SlideHeader index={10} num="3.5.2–3.5.3" title="Pértiga, altura y longitud" sub="Convertir la carrera en altura o en distancia" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎽</span> Salto con pértiga: KE → elástica → PE
            </div>
            <div className="card-body">
              <p>
                La energía cinética horizontal se guarda en la pértiga y vuelve como energía potencial. Si la conversión es
                total, con el CM a {'\\(h_{\\text{CM}} \\approx 0{,}9\\ \\text{m}\\)'} en carrera y un margen{' '}
                {'\\(h_{\\min} \\approx 0{,}1\\ \\text{m}\\)'} sobre el listón:
              </p>
              <div className="eq-block">{'\\[ h_{\\text{bar}} = h_{\\text{CM}} - h_{\\min} + \\frac{v_{H,i}^2}{2g} \\]'}</div>
              <p>
                Con {'\\(v_{H,i} = 9{,}5\\ \\text{m/s}\\)'}: {'\\(h_{\\text{bar}} = 5{,}4\\ \\text{m}\\)'}. El récord (6,16 m,
                2014) lo supera porque el saltador se empuja con los brazos desde la pértiga ya vertical. Despegue a
                13–15° de la vertical; hay una rigidez de pértiga óptima.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Altura vs longitud (modelo de rodilla, Fig. 3.43)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Salto</th>
                    <th>Pierna al plantar</th>
                    <th>Aproximación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <b>Altura</b> (Fosbury)
                    </td>
                    <td>45–50°</td>
                    <td>≈ 7 m/s</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Longitud</b>
                    </td>
                    <td>60–70° (más pronunciado)</td>
                    <td>lo más rápido posible, ≈ 11 m/s</td>
                  </tr>
                </tbody>
              </table>
              <p>
                En altura, aproximaciones más rápidas que ≈ 7 m/s dan <em>menos</em> elevación {'\\(H_2\\)'}; en longitud,
                más rapidez siempre ayuda.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Velocistas de clase mundial llegan a 10,4 m/s sin pértiga: con v = 10,4 m/s el modelo daría ≈ 6,3 m. En el
              Fosbury flop el CM puede pasar por debajo del listón (Fig. 3.41).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-vault" className="sim" label="Altura del listón frente a la rapidez de carrera" />
            <div className="prof-controls">
              <span className="badge">{'\\(\\tfrac12 m v^2 = m g\\,\\Delta h\\)'}</span>
              <label>
                {'\\(v_{H,i}\\)'}
                <input
                  type="range"
                  min="5"
                  max="11"
                  step="0.1"
                  defaultValue={params.va_v}
                  aria-label="Rapidez horizontal inicial en m/s"
                  onChange={(e) => {
                    engine.setParam('va_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="va_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
