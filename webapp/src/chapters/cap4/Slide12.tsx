import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="12" data-module="6">
      <div className="module-header">
        <span className="mnum">4.5</span>
        <span className="mtitle">Viscoelasticidad: resorte y amortiguador</span>
        <span className="msub">Creep, relajación de tensión e histéresis</span>
        <span className="mslide-count">12 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌀</span> Dos elementos básicos
            </div>
            <div className="card-body">
              <p>
                El <strong>resorte</strong> (elástico, almacena) y el <strong>amortiguador</strong> (viscoso, disipa):
              </p>
              <div className="eq-block">
                {"\\[ F=kx\\qquad(\\text{resorte})\\qquad F=c\\,\\frac{dx}{dt}\\qquad(\\text{amortiguador}) \\]"}
              </div>
              <p>
                El cuerpo combina ambos: sus tejidos son <strong>viscoelásticos</strong> — su respuesta depende de la{' '}
                <span className="highlight">velocidad de carga</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🕰️</span> Tres manifestaciones
            </div>
            <div className="card-body">
              <p>
                <strong>Creep</strong>: se sigue deformando bajo carga constante. <strong>Relajación de tensión</strong>: la
                fuerza cae a deformación constante. <strong>Histéresis</strong>: el lazo del ciclo carga–descarga disipa
                energía (área del lazo).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧸</span> Silly Putty y cartílago
            </div>
            <div className="card-body">
              <p>
                El <strong>Silly Putty</strong> rebota si se estira en {"\\(t<0{,}1\\ \\text{s}\\)"} (se comporta elástico,{' '}
                {"\\(Y\\approx1{,}7\\times10^6\\ \\text{N/m}^2\\)"}) pero fluye como líquido si se estira despacio (
                {"\\(\\eta\\approx8\\times10^4\\ \\text{Pa·s}\\)"}). El <strong>cartílago</strong>: módulo{' '}
                <span className="tag">1 MPa</span> lento → <span className="tag">500 MPa</span> rápido.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              Viscoelástico = "la respuesta depende de qué tan rápido cargas". Por eso el impacto (milisegundos) fractura
              huesos que aguantarían la misma fuerza aplicada despacio. El lazo de histéresis es la energía que el tendón
              NO devuelve (calor).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-elements" className="sim" />
            <div className="prof-controls">
              <span className="badge">elementos</span>
              <label>
                modo{' '}
                <select
                  id="el_mode"
                  defaultValue={flags.el_mode}
                  onChange={(e) => {
                    engine.setFlag('el_mode', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="spring">Resorte</option>
                  <option value="dashpot">Amortiguador</option>
                </select>
              </label>
              <span className="readout" id="el_out">
                F = kx
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
