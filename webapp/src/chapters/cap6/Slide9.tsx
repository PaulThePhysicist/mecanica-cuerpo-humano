import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <div className="module-header">
        <span className="mnum">6.4</span>
        <span className="mtitle">La ley de Kleiber y Harris–Benedict</span>
        <span className="msub">Cómo escala la BMR con la masa corporal</span>
        <span className="mslide-count">9 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🐭🐘</span> La ley de Kleiber (eq. 6.19)
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ \\text{BMR} = c\\, m_{\\text{b}}^{3/4} \\qquad (c \\approx 90\\ \\text{kcal/kg}^{3/4}\\text{-día}) \\]"}
              </div>
              <p>
                Del ratón (20 g) al elefante (5000 kg) la BMR escala con la masa elevada a <strong>3/4</strong>, no linealmente (Tabla
                6.18): ratón <span className="tag">3</span>, mujer 55 kg <span className="tag">1260</span>, hombre 65 kg{' '}
                <span className="tag">1500</span>, elefante <span className="tag">70000</span> kcal/día.
              </p>
              <p>
                {"Hay debate entre \\(m^{3/4}\\) (redes fractales de transporte) y \\(m^{2/3}\\) (superficie)."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Ecuaciones de Harris–Benedict
            </div>
            <div className="card-body">
              <p>
                {"Con masa \\(m_{\\text{b}}\\) (kg), altura \\(H\\) (cm) y edad \\(Y\\) (años):"}
              </p>
              <div className="eq-block">
                {"\\[ \\text{Hombres: BMR} = 66{,}47 + 13{,}75\\,m_{\\text{b}} + 5{,}00\\,H - 6{,}76\\,Y \\qquad \\text{(eq. 6.28)} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ \\text{Mujeres: BMR} = 655{,}10 + 9{,}56\\,m_{\\text{b}} + 1{,}85\\,H - 4{,}68\\,Y \\qquad \\text{(eq. 6.29)} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🤰</span> Embarazo y edad
            </div>
            <div className="card-body">
              <p>
                La BMR <strong>disminuye con la edad</strong> (Tablas 6.19–6.20) — una razón del aumento de peso con los años. El
                embarazo añade <span className="tag">+200 a 250 kcal/día</span> al final de la gestación.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              La ley de Kleiber es un «hecho escalar» fascinante: mueve el ratón por la escala logarítmica en el canvas. Nota que la
              línea de pendiente 3/4 es más plana que la pendiente 1 (masa): <strong>los animales grandes son metabólicamente más
              eficientes por kg</strong>.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-kleiber" className="sim" />
            <div className="prof-controls">
              <span className="badge">escalado</span>
              <label>
                masa{' '}
                <input
                  type="range"
                  id="kl_m"
                  min="1"
                  max="100"
                  step="1"
                  defaultValue={params.kl_m}
                  onChange={(e) => {
                    engine.setParam('kl_m', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="kl_mv">{params.kl_m} kg</span>
              </label>
              <span className="readout" id="kl_out">
                BMR ≈ 1500·(m/65)^0,75
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
