import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

export default function Slide7({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <SlideHeader index={7} num="3.4.3–3.4.4" title="El cuerpo como pogo stick" sub="Energía elástica: tendón de Aquiles y arco del pie" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🤸</span> Guardar y devolver la energía
            </div>
            <div className="card-body">
              <p>
                En la pelota que rebota o el saltador (pogo stick), la energía total es constante: al tocar el suelo la
                cinética se convierte en <strong>energía elástica</strong> {'\\(\\text{EE}\\)'} y se devuelve al despegar:
              </p>
              <div className="eq-block">{'\\[ \\text{TE} = \\text{KE} + \\text{PE} + \\text{EE} = \\text{constante} \\]'}</div>
              <p>
                En una carrera de maratón a 4,5 m/s se pierden ≈ <span className="tag">100 J</span> de energía{' '}
                <strong>cinética</strong> cada vez que el pie toca el suelo (la metabólica necesaria para reponerla es
                ≈ 5 veces mayor). La fuerza normal máxima es {'\\(2{,}7\\,W_b \\approx 1900\\ \\text{N}\\)'}; el tendón de
                Aquiles tira con ≈ 4700 N.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦵</span> Los resortes del cuerpo
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Reservorio</th>
                    <th>Almacena</th>
                    <th>Recuperable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tendón de Aquiles</td>
                    <td>≈ 35 J</td>
                    <td>93 %</td>
                  </tr>
                  <tr>
                    <td>Arco del pie</td>
                    <td>≈ 17 J</td>
                    <td>80 %</td>
                  </tr>
                  <tr>
                    <td>Zapatilla (≤ 10 mm)</td>
                    <td>≈ 7 J</td>
                    <td>54–66 %</td>
                  </tr>
                  <tr>
                    <td>Pista sintonizada (Tabla 3.11)</td>
                    <td>≤ 12 J</td>
                    <td>+2 % rapidez</td>
                  </tr>
                </tbody>
              </table>
              <p>
                En total ≈ 50 J vuelven de los resortes y ≈ 50 J los aportan los músculos. Matiz del libro: la Fig. 3.26
                sugiere que solo ≈ 5 % es recuperable — la cifra no es universalmente aceptada.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              La pista sintonizada (k ≈ 240 kN/m, unas 3 veces la rigidez de la pierna inferior, resonancia ≈ 2 Hz) puede
              bajar ≈ 0,2 s en 100 m. Los velocistas compiten con zapatillas casi sin amortiguación: su cuerpo devuelve más.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pogo" className="sim" label="Saltador con resorte y balance de energía por pisada" />
            <div className="prof-controls">
              <span className="badge">{'\\(\\text{TE} = \\text{KE}+\\text{PE}+\\text{EE}\\)'}</span>
              <button type="button" aria-pressed={flags.pogoPlaying} onClick={() => engine.setFlag('pogoPlaying', !flags.pogoPlaying)}>
                {flags.pogoPlaying ? '⏸ Pausa' : '▶ Rebotar'}
              </button>
              <button
                type="button"
                aria-pressed={flags.pogoTrack}
                onClick={() => {
                  engine.setFlag('pogoTrack', !flags.pogoTrack);
                  engine.requestDraw();
                }}
              >
                {flags.pogoTrack ? 'Pista sintonizada' : 'Suelo normal'}
              </button>
              <span className="readout" id="po_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
