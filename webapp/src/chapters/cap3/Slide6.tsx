import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide6({ engine }: { engine: Engine }) {
  const mode = engine.flagsRef.current.energyMode;

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <SlideHeader index={6} num="3.3.4 · 3.4.3" title="Energética: caminar vs correr" sub="Energías fuera de fase (caminar) y en fase (correr)" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🚶</span> Caminar: un intercambio casi perfecto
            </div>
            <div className="card-body">
              <p>Con x horizontal y z vertical (ec. 3.1–3.5):</p>
              <div className="eq-block">
                {'\\[ \\text{KE}_H = \\tfrac12 m_b v_x^2,\\quad \\text{KE}_V = \\tfrac12 m_b v_z^2,\\quad \\text{PE} = m_b g\\, z_{\\text{CM}} \\]'}
              </div>
              <p>
                Al apoyar el talón el pie frena ({'\\(\\text{KE}_H\\)'} baja) mientras la pierna se endereza y el CM sube
                ({'\\(\\text{PE}\\)'} sube); al propulsar ocurre lo contrario. {'\\(\\text{PE} + \\text{KE}_V\\)'} y{' '}
                {'\\(\\text{KE}_H\\)'} están <span className="highlight">fuera de fase</span> y su suma es casi constante, como
                en un péndulo o un huevo que rueda (Figs. 3.20–3.21).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Correr: el péndulo ya no sirve
            </div>
            <div className="card-body">
              <p>
                Con el pie apoyado (etapa b) la pierna está flexionada: CM bajo y cuerpo frenado; en el vuelo (etapa d)
                ambos máximos coinciden (ec. 3.35–3.37):
              </p>
              <div className="eq-block">
                {'\\[ \\text{KE}_H(b) + \\text{PE}(b) \\ll \\text{KE}_H(d) + \\text{PE}(d) \\]'}
              </div>
              <p>
                Las energías van <span className="highlight">en fase</span> y su suma oscila mucho en cada zancada: el modelo
                de péndulo no se aplica en absoluto a la carrera.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Según la Fig. 3.26, al caminar se recupera algo más del 70 % de la energía por paso; al correr, quizá solo
              ≈ 5 %. Lo que falta debe guardarse en resortes del cuerpo o aportarlo el músculo — el puente al pogo stick.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-energy" className="sim" label="Curvas de energía potencial, cinética horizontal y total durante un paso" />
            <div className="prof-controls">
              <span className="badge">{'\\(E = \\text{KE} + \\text{PE}\\)'}</span>
              <button
                type="button"
                aria-pressed={mode === 'run'}
                onClick={() => {
                  engine.setFlag('energyMode', mode === 'walk' ? 'run' : 'walk');
                  engine.requestDraw();
                }}
              >
                {mode === 'walk' ? '🚶 Caminar' : '🏃 Correr'}
              </button>
              <span className="readout" id="en_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
