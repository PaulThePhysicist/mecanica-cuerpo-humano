import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide4({ engine }: SlideProps) {
  const thV = engine?.paramsRef.current.th_v ?? 37;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 2</span>
        <span className="mtitle">La estabilidad térmica del cuerpo</span>
        <span className="msub">{"\\(37\\pm 2\\ ^\\circ\\mathrm{C}\\)"} · umbrales de peligro</span>
        <span className="mslide-count">4 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌡️</span> La zona de supervivencia
            </div>
            <div className="card-body">
              <p>
                La temperatura central normal es {"\\(37\\pm 2\\ ^\\circ\\mathrm{C}\\)"} ({"\\(98{,}6\\pm 3{,}6\\ ^\\circ\\mathrm{F}\\)"}).
                Fuera de ese margen, problemas graves:
              </p>
              <div className="row">
                <span className="pill"><b>41 °C</b> convulsiones (SNC)</span>
                <span className="pill"><b>45 °C</b> desnaturalización → muerte</span>
                <span className="pill"><b>33 °C</b> pérdida de conocimiento</span>
                <span className="pill"><b>30 °C</b> falla el control térmico</span>
                <span className="pill"><b>28 °C</b> fibrilación → muerte</span>
              </div>
              <p>
                Punto de consigna individual ±0,3 °C; media de piel ≈ 33 °C (el cap. 6 usó 34 °C). Piel &gt; 34,5 °C →
                sudoración; &lt; 30 °C → escalofríos.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧊</span> Notas de sexo y edad
            </div>
            <div className="card-body">
              <p>
                Las mujeres prefieren ambientes hasta ~3 °C más cálidos (mismo confort a {"\\(T_\\text{piel}\\approx 33\\ ^\\circ\\mathrm{C}\\)"};
                las oficinas usan BMR masculino de reposo). Con la edad hay menos calor metabólico, menos vasoconstricción y
                menos sudor, pero el sistema no se compromete mucho si se descuentan enfermedades crónicas y sedentarismo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              La escala térmica es estrecha: entre 33 y 41 °C el cuerpo aún se defiende; a 45 °C las proteínas se desnaturalizan.
              Mueve el cursor por la barra derecha para ver en qué zona cae cada temperatura.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-th" />
            <div className="prof-controls">
              <span className="badge">escala</span>
              <label>
                T (°C){' '}
                <input
                  type="range"
                  id="th_v"
                  min="26"
                  max="47"
                  value={thV}
                  step="0.5"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('th_v', v);
                    engine?.setParam('th_set', v);
                    const span = document.getElementById('th_vv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="th_vv">{thV.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="th_out">
                37,0 °C · normal
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
