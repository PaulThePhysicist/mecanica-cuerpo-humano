import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide15({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <SlideHeader index={15} num="3.10.4" title="Bateo: el bate óptimo" sub="Colisión bate–pelota, peso ideal y punto dulce" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏏</span> Colisión parcialmente elástica
            </div>
            <div className="card-body">
              <p>
                Momento lineal conservado y coeficiente de restitución {'\\(e\\)'} (ec. 3.108–3.110), con pesos en lugar de
                masas (la {'\\(g\\)'} se cancela):
              </p>
              <div className="eq-block">
                {"\\[ v'_{\\text{pelota}} = \\frac{(W_{\\text{pelota}} - e\\,W_{\\text{bate}})\\,v_{\\text{pelota}} + (1+e)\\,W_{\\text{bate}}\\,v_{\\text{bate}}}{W_{\\text{pelota}} + W_{\\text{bate}}} \\]"}
              </div>
              <p>
                {'\\(W_{\\text{pelota}} = 5{,}125\\ \\text{oz}\\)'}, {'\\(e = 0{,}55\\)'} (bate de madera, Tabla 3.10),
                lanzamiento a {'\\(v_{\\text{pelota}} = -80\\ \\text{mph}\\)'}. Un bate pesado golpea más fuerte pero se mueve
                más lento.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> El peso óptimo
            </div>
            <div className="card-body">
              <p>Para un bateador de poder se midió {'\\(v_{\\text{bate}} = 63 - 0{,}39\\,W_{\\text{bate}}\\)'} (mph, oz). Maximizando:</p>
              <div className="eq-block">
                {'\\[ \\frac{W_{\\text{bate,ideal}}}{W_{\\text{pelota}}} = \\sqrt{1 + \\frac{A - v_{\\text{pelota}}}{B\\,W_{\\text{pelota}}}} - 1 \\quad\\Rightarrow\\quad 38{,}5\\ \\text{oz},\\ \\ 95{,}1\\ \\text{mph} \\]'}
              </div>
              <p>
                La curva es muy plana: la velocidad de salida cambia poco en un amplio rango de pesos (los bates de grandes
                ligas pesan ≈ 32 oz). El criterio de mínima energía daría solo 15 oz.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Un jonrón necesita ≈ 100 mph de salida a ≈ 35° (no a 45°, por el arrastre), es decir ≈ 50 mph en el CM del bate
              o ≈ 58 mph en el <strong>punto dulce</strong>: a ⅔ del mango en un bate uniforme, donde coinciden el centro de
              percusión (el mango no se mueve) y el nodo del primer modo de vibración.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bat" className="sim" label="Velocidad de salida frente al peso del bate y punto dulce" />
            <div className="prof-controls">
              <span className="badge">{"\\(v' \\text{ máx. en } 38{,}5\\ \\text{oz}\\)"}</span>
              <label>
                {'\\(W_{\\text{bate}}\\)'}
                <input
                  type="range"
                  min="15"
                  max="70"
                  step="0.5"
                  defaultValue={params.ba_w}
                  aria-label="Peso del bate en onzas"
                  onChange={(e) => {
                    engine.setParam('ba_w', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="ba_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
