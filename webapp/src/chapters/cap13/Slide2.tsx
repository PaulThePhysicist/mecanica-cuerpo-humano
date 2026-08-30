import React from 'react';
import ThreeLoop from './ThreeLoop';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide2({ engine }: SlideProps) {
  const currentStep = engine?.flagsRef.current.blkStep ?? 0;

  const handleStep = (step: number) => {
    engine?.setFlag('blkStep', step);
    engine?.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 1</span>
        <span className="mtitle">El diagrama de bloques del control</span>
        <span className="msub">sensor → integración → efector → respuesta</span>
        <span className="mslide-count">2 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔁</span> Los cinco eslabones
            </div>
            <div className="card-body">
              <p>La Fig. 13.2 representa la retroalimentación y el control como un lazo:</p>
              <div className="concept-flow">
                <span className={`step ${currentStep === 0 ? 'active' : ''}`} onClick={() => handleStep(0)}>
                  ① Sensor / receptor
                </span>
                <span className="arrow">→</span>
                <span className={`step ${currentStep === 1 ? 'active' : ''}`} onClick={() => handleStep(1)}>
                  ② Integración (cerebro)
                </span>
                <span className="arrow">→</span>
                <span className={`step ${currentStep === 2 ? 'active' : ''}`} onClick={() => handleStep(2)}>
                  ③ Efector
                </span>
                <span className="arrow">→</span>
                <span className={`step ${currentStep === 3 ? 'active' : ''}`} onClick={() => handleStep(3)}>
                  ④ Respuesta
                </span>
                <span className="arrow">↺</span>
                <span className={`step ${currentStep === 4 ? 'active' : ''}`} onClick={() => handleStep(4)}>
                  ⑤ Retroalimentación
                </span>
              </div>
              <p>
                Ejemplo (presión arterial): el <strong>barorreceptor</strong> mide la presión → la señal va al{' '}
                <strong>cerebro</strong> por nervios → induce una respuesta en el <strong>corazón</strong> (vía motora) →
                cambia la frecuencia cardíaca o el volumen de eyección → el éxito se mide volviendo a medir la presión →{' '}
                <strong>retroalimentación</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧭</span> Más allá del termostato
            </div>
            <div className="card-body">
              <p>
                El mismo esquema rige la respiración (Fig. 13.1), el cardiovascular (Fig. 13.6) y la temperatura (Fig. 13.4)
                durante el ejercicio. Hasta la fuerza de agarre usa retroalimentación de la fuerza normal: si el objeto «cede»,
                aplicamos menos fuerza.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Haz clic en cada eslabón del flujo de arriba: el diagrama 3D resalta y orbita el circuito anatómico. El lazo
              nunca es abierto en el cuerpo sano.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <ThreeLoop activeNode={currentStep} onSelectNode={handleStep} />
          <Sim id="sim-bl" className="sim" />
          <div className="prof-controls">
            <span className="badge">lazo</span>
            <span className="readout" id="bl_out">
              ⑤ eslabones conectados
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
