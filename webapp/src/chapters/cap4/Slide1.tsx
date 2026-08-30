import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">4.1</span>
        <span className="mtitle">Componentes materiales del cuerpo</span>
        <span className="msub">Hueso, tendones y cartílago: tres materiales con tres curvas</span>
        <span className="mslide-count">1 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> El hueso: un material compuesto
            </div>
            <div className="card-body">
              <p>
                El hueso combina una <strong>matriz mineral</strong> (hidroxiapatita, que da rigidez) con{' '}
                <strong>colágeno</strong> (que da tenacidad). Viene en dos formas: <strong>compacto</strong> (cortical) y{' '}
                <strong>trabecular</strong> (esponjoso, en los extremos articulares).
              </p>
              <div className="eq-block">
                {"\\[ \\sigma=\\frac{F}{A},\\qquad \\varepsilon=\\frac{L-L_0}{L_0},\\qquad \\sigma=Y\\varepsilon \\]"}
              </div>
              <p>
                Hueso compacto: <span className="tag">Y = 17,9 GPa</span> · <span className="tag">UCS = 170 MPa</span> ·{' '}
                <span className="tag">UTS = 120 MPa</span>. El trabecular es{' '}
                <span className="highlight">~100× más blando</span>: <span className="tag">Y = 0,076 GPa</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦵</span> Ligamentos y tendones
            </div>
            <div className="card-body">
              <p>
                Tejido conectivo de <strong>colágeno</strong>: los <strong>tendones</strong> unen músculo a hueso y los{' '}
                <strong>ligamentos</strong> hueso a hueso. Su UTS ≈ <span className="tag">100 MPa</span> y, al ser
                viscoelásticos, su módulo depende de la rapidez de carga.
              </p>
              <p>
                Dato sorprendente de la Tabla 4.2: el <strong>cabello</strong> es el material más fuerte del cuerpo en
                tracción — <span className="tag">UTS = 197 MPa</span> — y el <strong>esmalte dental</strong> es el más duro.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧀</span> El cartílago: amortiguador avascular
            </div>
            <div className="card-body">
              <p>
                Cubre las articulaciones y los discos intervertebrales. Es <strong>viscoelástico</strong>: su módulo salta de
                ≈ <span className="tag">1 MPa</span> bajo carga lenta a ≈ <span className="tag">500 MPa</span> bajo impacto.
                Ese es el puente hacia el módulo 6.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              Tres ideas para retener: (1) hueso = mineral + colágeno → rigidez + tenacidad; (2) el cuerpo "prioriza"
              materiales fuertes en tracción (cabello, tendones); (3) la curva σ–ε es la cédula de identidad de cada tejido.
              Haz clic en la tabla del canvas para cambiar de material.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bone" className="sim" />
            <div className="prof-controls">
              <span className="badge">σ–ε</span>
              <label>
                material{' '}
                <select
                  id="bn_mat"
                  defaultValue={flags.boneMat}
                  onChange={(e) => {
                    engine.setFlag('boneMat', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="compacto">Compacto</option>
                  <option value="trabecular">Trabecular</option>
                  <option value="tendon">Tendón</option>
                  <option value="cabello">Cabello</option>
                </select>
              </label>
              <span className="readout" id="bn_out">
                Y = 17,9 GPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
