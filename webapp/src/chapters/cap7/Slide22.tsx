import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide22({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="22" data-module="8">
      <div className="module-header">
        <span className="mnum">7.5</span>
        <span className="mtitle">¿Por qué no volamos?</span>
        <span className="msub">La cuenta de fuerzas que impide el vuelo humano</span>
        <span className="mslide-count">22 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">✋</span> Batir los brazos
            </div>
            <div className="card-body">
              <p>
                Cada aleteo desplaza ≈ <span className="tag">0,1 m³</span> de aire ({"\\(\\approx 0{,}1\\)"} kg). Con
                brazos que alcanzan 20 m/s y 3 aleteos/s, el cambio de momento es de:
              </p>
              <div className="eq-block">
                {
                  "\\[ F = (0{,}1\\ \\text{kg})(20\\ \\text{m/s})(3\\ \\text{s}^{-1}) \\approx 6\\ \\text{N} \\]"
                }
              </div>
              <p>
                Frente a un peso de <span className="tag">700 N</span>: ni de lejos.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🪽</span> Con alas
            </div>
            <div className="card-body">
              <p>
                Alas de <span className="tag">2 m²</span> moverían 2 m³ de aire y darían ≈ <span className="tag">120 N</span>{' '}
                hacia arriba. Incluso corriendo a 10 m/s (récord mundial), la sustentación es{' '}
                {"\\(0{,}5 \\times 1{,}2 \\times 2 \\times 1 \\times 100 = 120\\ \\text{N}\\)"} — siempre menos que el
                peso.
              </p>
              <div className="eq-block">
                {"\\[ F_{\\text{sust}} = \\tfrac{1}{2} C_{\\text{sust}} S \\rho u^2 < m_b g \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚴</span> El Gossamer Albatross (1979)
            </div>
            <div className="card-body">
              <p>
                El vuelo humano propulsado sí existe — con una máquina. Bryan Allen pedaleó la aeronave de{' '}
                <span className="tag">30 m de envergadura</span> y <span className="tag">30 kg</span> a través del Canal de
                la Mancha: <span className="tag">35,6 km en 2 h 49 min</span> con <span className="tag">125 W</span>,
                volando a ras para aprovechar el efecto suelo. Premio Kremer.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-22">
              La moraleja física: batir brazos da 6 N, alas dan 120 N, el peso pide 700 N — falta un factor ~6. No es falta
              de fuerza de voluntad: es densidad de aire vs. peso. En el canvas juega con la envergadura y la cadencia: la
              barrera no se cruza, y el punto rojo del peso queda siempre arriba.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-flight" />
            <div className="prof-controls">
              <span className="badge">vuelo</span>
              <label>
                envergadura{' '}
                <input
                  type="range"
                  id="ft_s"
                  min="0.5"
                  max="5"
                  step="0.5"
                  defaultValue={params.ft_s}
                  onInput={(e) => {
                    engine.setParam('ft_s', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ft_sv">1 m</span>
              </label>
              <label>
                aleteo{' '}
                <input
                  type="range"
                  id="ft_f"
                  min="1"
                  max="6"
                  step="1"
                  defaultValue={params.ft_f}
                  onInput={(e) => {
                    engine.setParam('ft_f', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ft_fv">3 /s</span>
              </label>
              <span className="readout" id="ft_out">
                F = 6 N vs peso 700 N
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
