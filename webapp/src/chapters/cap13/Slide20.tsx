import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide20({ engine }: SlideProps) {
  const isHot = engine?.flagsRef.current.cc2Hot ?? true;

  const toggleHeat = () => {
    if (!engine) return;
    const next = !engine.flagsRef.current.cc2Hot;
    engine.setFlag('cc2Hot', next);
    engine.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 8</span>
        <span className="mtitle">Modelos y problemas: contracorriente</span>
        <span className="msub">Problema 13.1 · redirigir flujo sanguíneo</span>
        <span className="mslide-count">20 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔀</span> Problema 13.1
            </div>
            <div className="card-body">
              <p>
                Diseñar un diagrama de decisión de retroalimentación (análogo a la Fig. 13.2) que redirija el flujo sanguíneo
                entre lechos superficiales y profundos para optimizar la termorregulación, según el principio a contracorriente
                del Cap. 8.
              </p>
              <p>
                <strong>Calor ambiental / ejercicio:</strong> vasodilatación periférica → flujo a plexos dérmicos superficiales
                (máxima transferencia de calor al aire).<br />
                <strong>Frío ambiental:</strong> vasoconstricción periférica → derivación a venas profundas satélites de las
                arterias (intercambio a contracorriente que preserva el calor central).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌿</span> El mecanismo a contracorriente
            </div>
            <div className="card-body">
              <p>
                Las arterias y venas profundas adyacentes transfieren calor radialmente: la sangre arterial caliente enfría
                gradualmente hacia la periferia, mientras la sangre venosa fría se precalienta antes de ingresar al tórax,
                minimizando el gradiente térmico con el exterior.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              Haz clic en el panel interactivo para alternar entre el modo calor (superficial) y el modo frío (profundo
              contracorriente).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area" onClick={toggleHeat} style={{ cursor: 'pointer' }} title="Clic para alternar Calor / Frío">
            <Sim id="sim-cc2" />
            <div className="prof-controls">
              <span className="badge">flujo</span>
              <button type="button" onClick={toggleHeat}>
                {isHot ? '❄️ Cambiar a Frío' : '🔥 Cambiar a Calor'}
              </button>
              <span className="readout" id="cc2_out">
                {isHot ? 'superficial (pierde calor)' : 'profundo (conserva)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
