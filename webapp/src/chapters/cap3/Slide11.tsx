import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="5">
      <div className="module-header">
        <span className="mnum">3.8</span>
        <span className="mtitle">Lanzar: el modelo de un segmento</span>
        <span className="msub">El antebrazo como cuerpo rígido giratorio</span>
        <span className="mslide-count">11 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💪</span> La rotación del antebrazo
            </div>
            <div className="card-body">
              <p>Modelo simple: el antebrazo gira alrededor del codo, empujado por el bíceps. La aceleración angular:</p>
              <div className="eq-block">
                {"\\[ \\alpha = \\frac{(M d_M - W_F d_F - W_B d_B)\\sin\\theta}{I} \\]"}
              </div>
              <p>
                {"Con \\(L = 0{,}2H \\approx 36\\ \\text{cm}\\), \\(m_F \\approx 2\\ \\text{kg}\\), pelota \\(0{,}146\\ \\text{kg}\\):"}
              </p>
              <div className="eq-block">
                {"\\[ I = \\tfrac{1}{3}m_F L^2 + m_B L^2 = 0{,}105\\ \\text{kg·m}^2 \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> Los cuatro casos del libro
            </div>
            <div className="card-body">
              <p>
                {"Según los supuestos (tamaño del bíceps, si la gravedad cuenta), la rapidez final \\(v_B = L\\sqrt{\\pi\\alpha}\\) cambia:"}
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Caso</th>
                    <th>v (m/s)</th>
                    <th>mph</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <b>a</b> bíceps 2 in, sin gravedad
                    </td>
                    <td>5,77</td>
                    <td>12,9</td>
                  </tr>
                  <tr>
                    <td>
                      <b>b</b> bíceps 3 in, sin gravedad
                    </td>
                    <td>6,86</td>
                    <td>15,3</td>
                  </tr>
                  <tr>
                    <td>
                      <b>c</b> bíceps 2 in, con gravedad
                    </td>
                    <td>11,2</td>
                    <td>25,0</td>
                  </tr>
                  <tr>
                    <td>
                      <b>d</b> bíceps 3 in, con gravedad
                    </td>
                    <td>11,9</td>
                    <td>26,5</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Ninguno alcanza a un pitcher (90–100 mph):{' '}
                <strong>la física es correcta, el modelo es demasiado simple</strong> — hacen falta más segmentos.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              La moraleja: un buen modelo captura la física pero puede subestimar — aquí le falta la cadera y el tronco. En
              la siguiente diapositiva los sumamos y la velocidad "aparece".
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-throw" className="sim" />
            <div className="prof-controls">
              <span className="badge">v_B = L√(πα)</span>
              <label>
                caso{' '}
                <select
                  id="th_case"
                  defaultValue={params.th_case}
                  onChange={(e) => {
                    engine.setParam('th_case', e.target.value as 'a' | 'b' | 'c' | 'd');
                    engine.requestDraw();
                  }}
                >
                  <option value="a">a · 2in, sin g</option>
                  <option value="b">b · 3in, sin g</option>
                  <option value="c">c · 2in, con g</option>
                  <option value="d">d · 3in, con g</option>
                </select>
              </label>
              <span className="readout" id="th_out">
                v = 11,2 m/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
