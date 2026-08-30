import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="18" data-module="7">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">La escala de la difusión</span>
        <span className="msub">Difusión para micras, flujo para centímetros</span>
        <span className="mslide-count">18 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⏳</span> Tiempos por distancia
            </div>
            <div className="card-body">
              <p>
                De {"\\(x \\sim \\sqrt{2Dt}\\)"} sale el tiempo para difundir una distancia {"\\(x\\)"}:{' '}
                <span className="tag">{"\\(t \\sim x^2 / 2D\\)"}</span>.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Medio</th>
                    <th>D (cm²/s)</th>
                    <th>Distancia en 1 s</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gas</td>
                    <td>≈ 10⁻¹</td>
                    <td>≈ 1 cm</td>
                  </tr>
                  <tr>
                    <td>Líquido</td>
                    <td>≈ 10⁻⁵</td>
                    <td>≈ 10⁻² cm</td>
                  </tr>
                  <tr>
                    <td>Sólido</td>
                    <td>≈ 10⁻⁹</td>
                    <td>≈ 10⁻⁴ cm</td>
                  </tr>
                </tbody>
              </table>
              <p>
                En un líquido, difundir 1 cm toma {"\\(t \\approx 10^5\\ \\text{s} \\approx 28\\ \\text{h}\\)"} — inútil.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔬</span> Difusión solo a corta distancia
            </div>
            <div className="card-body">
              <p>
                La difusión es eficiente en <span className="tag">1 a 100 μm</span>: la célula de 2 μm, la hendidura
                sináptica, la pared alveolar. A distancias mayores, el cuerpo <strong>lleva el soluto con flujo</strong>:
                sangre, peristalsis, transporte activo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫁</span> El oxígeno de punta a punta
            </div>
            <div className="card-body">
              <p>
                Del alvéolo a la mitocondria hay solo <strong>≈ 100 μm</strong> de difusión; el resto del camino (hasta el
                músculo de la pierna) lo recorre la sangre <em>convectiva</em>. Cada transporte usa la física que le toca.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              Esta es la «tabla que explica todo»: el olor se difunde en gas en segundos, un nutriente en líquido tarda horas
              en recorrer centímetros. Por eso el cuerpo no «espera» la difusión: bombea. Mueve la distancia en el canvas y
              mira cómo el tiempo del líquido se dispara cuadráticamente.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-diffusion2" />
            <div className="prof-controls">
              <span className="badge">escala</span>
              <label>
                x{' '}
                <input
                  type="range"
                  id="d2_x"
                  min="1"
                  max="1000"
                  step="1"
                  defaultValue={params.d2_x}
                  onInput={(e) => {
                    engine.setParam('d2_x', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="d2_xv">100 μm</span>
              </label>
              <span className="readout" id="d2_out">
                t_líq = x²/2D
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
