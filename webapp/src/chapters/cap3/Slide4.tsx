import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <SlideHeader index={4} num="3.3.3" title="Fricción: sin ella no caminamos" sub="Buena fuera del cuerpo, mala dentro" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👟</span> Fricción externa: necesaria
            </div>
            <div className="card-body">
              <p>
                Un objeto empezará a deslizar solo si la fuerza lateral supera {'\\(F_f = \\mu_s N\\)'}; ya en movimiento,{' '}
                {'\\(F_f = \\mu_k N\\)'}. Al apoyar el talón la fricción del suelo frena el pie; al despegar, lo propulsa.
                Ambas cosas requieren fuerzas de ≈ {'\\(0{,}15\\,mg\\)'}, así que caminar exige
              </p>
              <div className="eq-block">{'\\[ \\mu_s > 0{,}15 \\qquad (\\approx 0{,}17 \\text{ a } 3\\ \\text{mph}) \\]'}</div>
              <p>
                El coeficiente requerido crece con la rapidez (Fig. 3.17). Hielo sobre hielo: {'\\(\\mu \\approx 0{,}1\\)'}
                ({'\\(0{,}02\\)'} cinético a 4 m/s) — por eso resbalamos.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧴</span> Fricción interna: casi nula
            </div>
            <div className="card-body">
              <p>
                El cartílago de rodilla bañado en líquido sinovial tiene {'\\(\\mu_k = 0{,}003\\text{–}0{,}01\\)'}, menor que
                casi cualquier sistema fabricado (Tabla 3.5). Con lubricación de película fluida ≈ {'\\(0{,}02\\)'}; con
                lubricación límite (superficies a 1–100 nm), dos órdenes de magnitud más.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Tabla 3.5 (selección)</th>
                    <th>μ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Zapatillas de baloncesto / madera limpia</td>
                    <td>1,0–1,2</td>
                  </tr>
                  <tr>
                    <td>Madera sobre madera</td>
                    <td>0,25–0,50</td>
                  </tr>
                  <tr>
                    <td>Hielo sobre hielo</td>
                    <td>0,1</td>
                  </tr>
                  <tr>
                    <td>Cartílago de rodilla (cinético)</td>
                    <td>0,005–0,02</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Baje μ en el lienzo: entre 0,15 y 0,17 solo se puede caminar despacio; por debajo de 0,15 el pie patina.
              Pregunta: ¿por qué sobre hielo damos pasos cortos? (Menor fuerza horizontal por paso → menor μ requerido.)
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-friccion" className="sim" label="Pie empujando el suelo y escala del coeficiente de fricción" />
            <div className="prof-controls">
              <span className="badge">{'\\(F_f \\le \\mu_s N\\)'}</span>
              <label>
                μ
                <input
                  type="range"
                  min="0.02"
                  max="0.4"
                  step="0.01"
                  defaultValue={params.fr_mu}
                  aria-label="Coeficiente de fricción zapato–suelo"
                  onChange={(e) => {
                    engine.setParam('fr_mu', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="fr_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
