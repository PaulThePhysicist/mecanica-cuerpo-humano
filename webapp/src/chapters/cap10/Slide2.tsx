import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">10 · 1</span>
        <span className="mtitle">Intensidad sonora y escala en decibelios</span>
        <span className="msub">{"\\(\\beta = 10 \\log_{10}(I/I_0),\\quad I_0 = 10^{-12}\\ \\mathrm{W/m^2}\\)"}</span>
        <span className="mslide-count">2 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔊</span> Potencia repartida sobre una esfera
            </div>
            <div className="card-body">
              <p>
                Una fuente con potencia acústica {"\\(P\\)"} reparte su energía sobre la superficie de una esfera de radio{' '}
                {"\\(R\\)"}. La intensidad {"\\(I\\)"} (W/m²) decae con el cuadrado de la distancia:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.4)</span>
                {"\\[ I = \\frac{P}{4\\pi R^2} \\]"}
              </div>
              <p>
                La intensidad también se escribe con la amplitud de desplazamiento {"\\(u\\)"} o con la amplitud de
                presión {"\\(P\\)"} y la impedancia {"\\(Z\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.7)</span>
                {"\\[ I = \\tfrac{1}{2}\\,\\rho\\, u^{2}\\, v \\qquad\\qquad I = \\frac{P^{2}}{2Z} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> Escala logarítmica: el decibelio
            </div>
            <div className="card-body">
              <p>
                El oído abarca 12 órdenes de magnitud, así que se usa una escala logarítmica con referencia{' '}
                {"\\(I_0 = 10^{-12}\\ \\mathrm{W/m^2}\\)"} (umbral de audición):
              </p>
              <div className="eq-block">
                <span className="eqno">(10.10)</span>
                {"\\[ \\beta = 10 \\log_{10} \\frac{I}{I_0} \\]"}
              </div>
              <p>
                Cada +10 dB multiplica la intensidad por 10; cada +3 dB la duplica. El habla normal ronda los{' '}
                <span className="tag">40–60 dB</span> y el umbral de dolor los <span className="tag">120–140 dB</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Cambia el ruido con el selector y mira el salto en la barra: pasar de 70 a 80 dB no «suma 10», multiplica
              la intensidad por 10. La escala comprime millones de veces en una regla de 0 a 180.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-db" className="sim" />
            <div className="prof-controls">
              <span className="badge">dB</span>
              <label>
                Ruido{' '}
                <select
                  id="db_sel"
                  defaultValue={params.db_sel}
                  onChange={(e) => {
                    engine.setParam('db_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Umbral de audición — 0 dB</option>
                  <option value="1">Susurro — 20 dB</option>
                  <option value="2">Habla normal — 60 dB</option>
                  <option value="3">Tráfico — 80 dB</option>
                  <option value="4">Concierto / moto — 110 dB</option>
                  <option value="5">Umbral de dolor — 130 dB</option>
                  <option value="6">Turborreactor — 160 dB</option>
                  <option value="7">Ruptura del tímpano — 190 dB</option>
                </select>
              </label>
              <span className="readout" id="db_out">
                0 dB → I = 1×10⁻¹² W/m²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
