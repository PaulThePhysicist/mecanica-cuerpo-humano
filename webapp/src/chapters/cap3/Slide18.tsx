import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [air, setAir] = useState(flags.air);
  const [mag, setMag] = useState(flags.mag);

  const toggleAir = () => {
    const next = !air;
    setAir(next);
    engine.setFlag('air', next);
    engine.requestDraw();
  };

  const toggleMag = () => {
    const next = !mag;
    setMag(next);
    engine.setFlag('mag', next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="18" data-module="8">
      <div className="module-header">
        <span className="mnum">3.12</span>
        <span className="mtitle">El vuelo de la pelota</span>
        <span className="msub">Resistencia del aire, giro y el resumen del capítulo</span>
        <span className="mslide-count">18 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎈</span> El arrastre del aire
            </div>
            <div className="card-body">
              <p>El aire frena a la pelota con una fuerza proporcional al cuadrado de la rapidez:</p>
              <div className="eq-block">
                {"\\[ m\\,\\frac{dv_z}{dt} = -mg - \\tfrac{1}{2} C_D A \\rho\\,v\\,v_z \\]"}
              </div>
              <p>
                {"Para esferas lisas \\(C_D \\approx 0{,}45\\). El ángulo óptimo baja de "}<span className="tag">45°</span>{" (vacío) a ≈ "}<span className="tag">35–40°</span>{" en el aire. Regla del libro: el alcance con aire ≈ \\(\\tfrac{3}{2} v_0 - 105\\) (pies)."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌀</span> El efecto Magnus
            </div>
            <div className="card-body">
              <p>
                Una pelota con <strong>efecto retrógrado</strong> (backspin) se curva hacia arriba (sustentación); con{' '}
                <strong>efecto superior</strong> (topspin), cae. Las pelotas de golf con hoyuelos reducen el arrastre y
                giran 50–130 rev/s → vuelan más lejos y más rectas.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧭</span> Resumen del capítulo
            </div>
            <div className="card-body">
              <div className="concept-flow">
                <span className="step done" onClick={() => engine.goModule(1)}>
                  Estabilidad
                </span>
                <span className="arrow">→</span>
                <span className="step done" onClick={() => engine.goModule(2)}>
                  Marcha
                </span>
                <span className="arrow">→</span>
                <span className="step done" onClick={() => engine.goModule(3)}>
                  Carrera
                </span>
                <span className="arrow">→</span>
                <span className="step done" onClick={() => engine.goModule(4)}>
                  Salto
                </span>
                <span className="arrow">→</span>
                <span className="step done" onClick={() => engine.goModule(5)}>
                  Lanzar
                </span>
                <span className="arrow">→</span>
                <span className="step done" onClick={() => engine.goModule(7)}>
                  Colisiones
                </span>
                <span className="arrow">→</span>
                <span className="step done" onClick={() => engine.goModule(8)}>
                  Vuelo
                </span>
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              Cierre: activa/desactiva el arrastre en el canvas — la diferencia de alcance es la "dama de los juegos". La
              misma física del péndulo (slide 5) reaparece en cada destreza del capítulo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-flight" className="sim" />
            <div className="prof-controls">
              <span className="badge">Proyectil</span>
              <label>
                v₀{' '}
                <input
                  type="range"
                  id="fl_v"
                  min="8"
                  max="30"
                  step="0.5"
                  defaultValue={params.fl_v}
                  onChange={(e) => {
                    engine.setParam('fl_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                θ{' '}
                <input
                  type="range"
                  id="fl_theta"
                  min="10"
                  max="70"
                  defaultValue={params.fl_theta}
                  onChange={(e) => {
                    engine.setParam('fl_theta', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="fl_air" onClick={toggleAir}>
                {air ? 'Con aire' : 'Vacío'}
              </button>
              <button id="fl_mag" onClick={toggleMag}>
                {mag ? 'Magnus: on' : 'Magnus: off'}
              </button>
              <span className="readout" id="fl_out">
                D = 33 m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
