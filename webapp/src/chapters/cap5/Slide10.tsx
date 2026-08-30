import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="4">
      <div className="module-header">
        <span className="mnum">5.5</span>
        <span className="mtitle">La prueba cotidiana: el puño y la muñeca</span>
        <span className="msub">Fuera del rango útil de longitud muscular</span>
        <span className="mslide-count">10 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">✊</span> El experimento
            </div>
            <div className="card-body">
              <p>
                Aprieta una pelota con el puño cerrado: cuesta arrebatarla. Ahora <strong>flexiona la muñeca hacia abajo</strong>{' '}
                todo lo que puedas y vuelve a apretar: tu compañero la tomará con facilidad.
              </p>
              <p>
                Con la muñeca flexionada, los músculos <strong>extensores de los dedos ya están estirados</strong> y los{' '}
                <strong>flexores están flojos</strong>; al apretar, ambos entran en regímenes{' '}
                <strong>fuera del rango normal de longitud muscular</strong> → poca tensión.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖐️</span> Los números de la mano
            </div>
            <div className="card-body">
              <p>
                <span className="tag">20 músculos en la mano ≈ 91 g</span> · mano completa ≈ <span className="tag">600 g</span>{' '}
                · <span className="tag">20 en el antebrazo ≈ 766 g</span>. De ellos,{' '}
                <span className="highlight">9 (≈ 401 g)</span> —extensores y flexores— se conectan a la mano por{' '}
                <strong>tendones largos</strong>. Si vivieran en la mano, esta sería sumamente voluminosa.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🗡️</span> La aplicación práctica
            </div>
            <div className="card-body">
              <blockquote style={{ fontStyle: 'italic', borderLeft: '3px solid var(--amber)', paddingLeft: '0.6rem', color: 'var(--ink)' }}>
                «Se puede hacer que un asesino con un cuchillo en la mano lo suelte doblando con fuerza su muñeca».
              </blockquote>
              <p style={{ marginTop: '0.4rem' }}>
                Tampoco puedes estirar los dedos con la muñeca <strong>hiperextendida</strong>: los flexores quedan
                estirados y los extensores flojos — otra vez, fuera del rango útil.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              El mejor demorstración de aula de la curva F–L: sin herramientas, en 30 segundos, tu alumno «pierde fuerza»
              con solo girar la muñeca. Mueve el ángulo en el canvas: la fuerza de agarre disponible colapsa al flexionar.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-wrist" />
            <div className="prof-controls">
              <span className="badge">muñeca</span>
              <label>
                flexión{' '}
                <input
                  type="range"
                  id="wr_ang"
                  min="0"
                  max="90"
                  step="1"
                  defaultValue={params.wr_ang}
                  onChange={(e) => {
                    engine.setParam('wr_ang', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="wr_angv">{params.wr_ang}°</span>
              </label>
              <span className="readout" id="wr_out">
                agarre: fuerte
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
