import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">5.1</span>
        <span className="mtitle">La estructura: fascículos y arquitectura de fibras</span>
        <span className="msub">Paralelas vs pinnadas: longitud frente a fuerza</span>
        <span className="mslide-count">2 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧬</span> Jerarquía de fibras
            </div>
            <div className="card-body">
              <p>
                Vientre muscular → <strong>fascículos</strong> → <strong>fibras</strong> (células musculares) →{' '}
                <strong>miofibrillas</strong> → <strong>sarcómeros</strong> de ≈ <span className="tag">2–3 μm</span>. Hay{' '}
                <span className="tag">10⁴–10⁷</span> fibras por músculo y el diámetro típico es{' '}
                <span className="tag">50 μm</span> — que se <strong>duplica con el entrenamiento con pesas</strong>.
              </p>
              <p>
                Filamentos <strong>gruesos</strong> (miosina) y <strong>delgados</strong> (F-actina + tropomiosina +
                troponina T); la interacción miosina–actina, inducida químicamente por la <strong>hidrólisis de ATP</strong>,
                es la fuerza fundamental del músculo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🪶</span> Paralelas vs pinnadas
            </div>
            <div className="card-body">
              <p>
                <strong>Fusiforme/paralelo</strong> — el sartorio (el más largo del cuerpo: cadera → tibia), el recto del
                abdomen. Muchas unidades de sarcómero <em>en serie</em>: se acortan mucho y rápido, generan gran movimiento.
              </p>
              <p>
                <strong>Pinnado</strong> (unipinnado, bipinnado como el recto femoral, multipinnado como el deltoides):
                muchas fibras cortas <em>en paralelo</em> unidas al tendón en un ángulo θ. Más fibras y más movimiento del
                tendón central → <strong>más fuerza</strong>, pero solo <span className="tag">F·cos θ</span> se transmite
                efectivamente.
              </p>
              <p>
                También: <strong>circulares</strong> (orbicular de los ojos) y <strong>convergentes</strong> (pectoral mayor,
                ancho en el origen, estrecho en la inserción).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦵</span> Biarticulares y PCA · Tabla 5.4
            </div>
            <div className="card-body">
              <p>
                Muchos músculos de la pierna cruzan dos articulaciones: el <strong>gastrocnemio</strong> flexiona la
                rodilla y plantarflexiona el tobillo (brazo de momento <span className="tag">5 cm</span> vs{' '}
                <span className="tag">3,5 cm</span>). Los músculos <strong>más largos</strong> permiten mayor rotación;{' '}
                <strong>más PCA</strong>, más fuerza.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Músculo</th>
                    <th>Masa (g)</th>
                    <th>L. fibra (cm)</th>
                    <th>PCA (cm²)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sartorio</td>
                    <td>75</td>
                    <td>38</td>
                    <td>1,9</td>
                  </tr>
                  <tr>
                    <td>Bíceps femoral (largo)</td>
                    <td>150</td>
                    <td>9</td>
                    <td>15,8</td>
                  </tr>
                  <tr>
                    <td>Sóleo</td>
                    <td>215</td>
                    <td>3,0</td>
                    <td>58</td>
                  </tr>
                  <tr>
                    <td>Gastrocnemio</td>
                    <td>158</td>
                    <td>4,8</td>
                    <td>30</td>
                  </tr>
                  <tr>
                    <td>Recto femoral</td>
                    <td>90</td>
                    <td>6,8</td>
                    <td>12,5</td>
                  </tr>
                  <tr>
                    <td>Vasto lateral</td>
                    <td>210</td>
                    <td>6,7</td>
                    <td>30</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              La pregunta clave: ¿por qué el sóleo tiene PCA = 58 cm² con fibras de solo 3 cm? Porque es <strong>pinnado</strong>
              : empaqueta muchísimas fibras cortas en paralelo → máxima fuerza. Mueve el ángulo θ en el canvas y observa cómo
              cae la fuerza transmitida al tendón (F·cos θ).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-arch" />
            <div className="prof-controls">
              <span className="badge">arquitectura</span>
              <label>
                θ pinnación{' '}
                <input
                  type="range"
                  id="ar_ang"
                  min="0"
                  max="40"
                  step="1"
                  defaultValue={params.ar_ang}
                  onChange={(e) => {
                    engine.setParam('ar_ang', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="ar_out">
                F transmitida = F·cos 15°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
