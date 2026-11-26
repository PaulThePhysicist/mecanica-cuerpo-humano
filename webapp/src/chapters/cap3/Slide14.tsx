import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide14({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="14" data-module="6">
      <SlideHeader index={14} num="3.7" title="El swing de golf" sub="Péndulo doble: brazos + palo y la bisagra de la muñeca" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⛳</span> Un péndulo doble articulado (Fig. 3.53)
            </div>
            <div className="card-body">
              <p>
                De <strong>A</strong> (cerca de los hombros) a <strong>B</strong>, manos y muñecas describen un círculo; de{' '}
                <strong>B</strong> a <strong>C</strong>, el palo gira alrededor de la bisagra de las muñecas. El cuerpo
                aplica un gran torque al primer péndulo y las muñecas uno menor al segundo. Al inicio la cabeza del palo
                «tira» de la bisagra, frena el péndulo superior y deja que el inferior lo alcance.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖐️</span> La muñeca decide cuánta energía llega
            </div>
            <div className="card-body">
              <p>
                Con las <strong>muñecas fijas</strong> (un solo péndulo) solo ≈ <span className="tag">¼</span> de la energía
                llega a la cabeza del palo; armando y liberando las muñecas, ≈ <span className="tag">⅔</span>:
              </p>
              <div className="eq-block">{'\\[ E_{\\text{cabeza}} \\approx \\tfrac{2}{3}\\,E_{\\text{swing}} \\]'}</div>
              <p>
                La transferencia ocurre incluso sin torque en las muñecas; un torque aplicado en fase la aumenta. Potencia:
                ≈ 1,3 kW a la cabeza, ≈ 0,5 kW al mango, ≈ 0,7 kW a manos y brazos → <span className="tag">≈ 2,5 kW</span>{' '}
                (la tasa metabólica para sostenerlo es ≈ 18 veces mayor).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              A ≈ 250 W por kg de músculo activo, 2,5 kW exigen ≈ 10 kg de músculo (≈ 20 kg contando antagonistas) de los ≈
              30 kg de una persona de 73 kg; como ≈ 4/7 del músculo está bajo la cintura, la potencia sale sobre todo de
              piernas y muslos. La misma bisagra: rodilla al patear, codo al lanzar.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-golf" className="sim" label="Péndulo doble del swing y reparto de potencia" />
            <div className="prof-controls">
              <span className="badge">Péndulo doble</span>
              <button type="button" aria-pressed={flags.golfPlaying} onClick={() => engine.setFlag('golfPlaying', !flags.golfPlaying)}>
                {flags.golfPlaying ? '⏸ Pausa' : '▶ Swing'}
              </button>
              <button
                type="button"
                aria-pressed={flags.wrist}
                onClick={() => {
                  engine.setFlag('wrist', !flags.wrist);
                  engine.requestDraw();
                }}
              >
                {flags.wrist ? 'Muñecas: quiebre' : 'Muñecas: fijas'}
              </button>
              <span className="readout" id="gf_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
