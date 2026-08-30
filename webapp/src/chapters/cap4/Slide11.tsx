import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="5">
      <div className="module-header">
        <span className="mnum">4.4</span>
        <span className="mtitle">Por qué los huesos largos son huecos</span>
        <span className="msub">Perder 6 % de rigidez para ahorrar 25 % de masa</span>
        <span className="mslide-count">11 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🥖</span> Tubo vs cilindro macizo
            </div>
            <div className="card-body">
              <p>
                Para un cilindro macizo de radio {"\\(a\\)"} y uno hueco de radios {"\\(a_2\\)"} (exterior) y {"\\(a_1\\)"}{' '}
                (interior):
              </p>
              <div className="eq-block">
                {"\\[ I_A=\\frac{\\pi a^4}{4}\\qquad(\\text{macizo})\\qquad I_A=\\frac{\\pi(a_2^4-a_1^4)}{4}\\qquad(\\text{hueco}) \\]"}
              </div>
              <p>Como el material cerca del eje aporta {"\\(y^2\\)"} ≈ 0, quitarlo casi no cuesta rigidez.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> La Tabla 4.4
            </div>
            <div className="card-body">
              <p>
                Con {"\\(a_1/a_2=0{,}5\\)"}, el tubo hueco conserva
              </p>
              <div className="eq-block">
                {"\\[ \\frac{I_{\\text{hueco}}}{I_{\\text{macizo}}}=1-0{,}5^4=0{,}94 \\qquad \\frac{\\text{masa}}{\\text{masa}}=1-0{,}5^2=0{,}75 \\]"}
              </div>
              <p>
                Se pierde <span className="tag">solo 6 % de rigidez</span> y se ahorra <span className="tag">25 % de masa</span>.
                Por eso el fémur es un tubo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦴</span> Dos beneficios extra
            </div>
            <div className="card-body">
              <p>
                El interior hueco aloja la <strong>médula ósea</strong> (donde se fabrica la sangre) y, al reducir masa,
                baja el momento de inercia al balancear la pierna: menos energía para moverla en cada zancada.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              Desliza la relación a₁/a₂: la barra de masa cae rápido mientras la de rigidez apenas se mueve. Es el mismo
              compromiso de puentes y alas de avión — la naturaleza lo encontró primero.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-hollow" className="sim" />
            <div className="prof-controls">
              <span className="badge">I_A hueco</span>
              <label>
                a₁/a₂{' '}
                <input
                  type="range"
                  id="ho_r"
                  min="0"
                  max="0.9"
                  step="0.01"
                  defaultValue={params.ho_r}
                  onChange={(e) => {
                    engine.setParam('ho_r', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="ho_out">
                rigidez 94 % · masa 75 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
