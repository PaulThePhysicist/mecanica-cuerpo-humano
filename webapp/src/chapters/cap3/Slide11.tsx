import type { Engine } from './useEngine';
import Sim from './Sim';
import SlideHeader from './SlideHeader';

const CASES: [string, string, string, string, string][] = [
  ['a', '2 in · ⟨sin θ⟩ = 0,707', '81,7', '5,77', '12,9'],
  ['b', '2 in · ⟨sin θ⟩ = 1', '115,5', '6,86', '15,3'],
  ['c', '3 in · ⟨sin θ⟩ = 1', '308', '11,2', '25,0'],
  ['d', '3 in · sin gravedad', '346', '11,9', '26,5'],
];

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="5">
      <SlideHeader index={11} num="3.6" title="Lanzar: el modelo de un segmento" sub="El antebrazo gira alrededor del codo (modelo d)" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💪</span> Torque y momento de inercia
            </div>
            <div className="card-body">
              <p>
                El bíceps braquial (inserción a {'\\(d_M = 4\\ \\text{cm}\\)'}) gira el antebrazo con el húmero vertical; θ
                va de 135° a 45°, la región más eficiente del músculo:
              </p>
              <div className="eq-block">
                {'\\[ \\tau_z = (M d_M - W_F d_F - W_B d_B)\\sin\\theta, \\qquad I = \\tfrac13 m_F L^2 + m_B L^2 \\]'}
              </div>
              <p>
                {'\\(L = 0{,}2\\,H \\approx 36\\ \\text{cm}\\)'}, {'\\(m_F \\approx 2\\ \\text{kg}\\)'} (jugador de 90 kg),
                pelota {'\\(0{,}146\\ \\text{kg}\\)'} → {'\\(I = 1053\\ \\text{kg}\\cdot\\text{cm}^2\\)'}. Con 20 N/cm² y 2 in de
                diámetro, {'\\(M = 405\\ \\text{N}\\)'}. Si {'\\(\\alpha\\)'} es constante:
              </p>
              <div className="eq-block">{'\\[ t_{\\text{final}} = \\sqrt{\\pi/\\alpha}, \\qquad v_B = L\\sqrt{\\pi\\alpha} \\]'}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> Los cuatro casos del libro
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Caso · bíceps</th>
                    <th>{'\\(\\alpha\\)'} (s⁻²)</th>
                    <th>{'\\(v_B\\)'} (m/s)</th>
                    <th>mph</th>
                  </tr>
                </thead>
                <tbody>
                  {CASES.map(([k, d, a, v, mph]) => (
                    <tr key={k} className={params.th_case === k ? 'is-active' : undefined}>
                      <td>
                        <b>{k}</b> · {d}
                      </td>
                      <td>{a}</td>
                      <td>{v}</td>
                      <td>{mph}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                Muy lejos de los 90–100 mph de un lanzador. Con 30 N/cm² y los demás flexores (×2,6) se llega a ≈ 45 mph:{' '}
                <strong>la física es correcta, el modelo es demasiado simple</strong> — faltan piernas, tronco y hombro.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              «Es una catapulta de dos brazos» (Sandy Koufax). Pulse «▶ Lanzar»: el gesto real dura 0,1–0,2 s, aquí va a
              cámara lenta. Siguiente diapositiva: sumamos segmentos y la velocidad aparece.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-throw" className="sim" label="Antebrazo girando alrededor del codo y tabla de casos" />
            <div className="prof-controls">
              <span className="badge">{'\\(v_B = L\\sqrt{\\pi\\alpha}\\)'}</span>
              <label>
                caso
                <select
                  defaultValue={params.th_case}
                  aria-label="Caso del modelo de lanzamiento"
                  onChange={(e) => {
                    engine.setParam('th_case', e.target.value as 'a' | 'b' | 'c' | 'd');
                    engine.setFlag('throwPhase', 0);
                    engine.requestDraw();
                  }}
                >
                  <option value="a">a · 2 in, ⟨sin⟩ 0,707</option>
                  <option value="b">b · 2 in, ⟨sin⟩ 1</option>
                  <option value="c">c · 3 in, ⟨sin⟩ 1</option>
                  <option value="d">d · 3 in, sin gravedad</option>
                </select>
              </label>
              <button
                type="button"
                aria-pressed={flags.throwPlaying}
                onClick={() => {
                  if (flags.throwPlaying) {
                    engine.setFlag('throwPlaying', false);
                  } else {
                    engine.setFlag('throwPhase', 0);
                    engine.setFlag('throwPlaying', true);
                  }
                }}
              >
                {flags.throwPlaying ? '⏸ Pausa' : '▶ Lanzar'}
              </button>
              <span className="readout" id="th_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
