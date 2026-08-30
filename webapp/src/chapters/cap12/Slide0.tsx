import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({
  engine,
  goModule,
  onBack,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
      <h1>
        <span className="chapno">Capítulo 12</span>
        Propiedades Eléctricas y Magnéticas
      </h1>
      <p className="subtitle">
        De los iones que cruzan la membrana al campo magnético del corazón: cómo la electricidad y el magnetismo
        gobiernan el cuerpo. La bioelectricidad (Coulomb, Ohm, Kirchhoff, conductividad de las soluciones y resistividad
        de los tejidos), la neurona y su membrana (reposo, Nernst, Goldman y potencial de acción), el modelo de cable y
        velocidad de conducción, la célula ciliada (oído y acelerómetros), el dipolo cardíaco (Einthoven, ECG normal,
        despolarización y arritmias), el EEG, descargas y desfibrilación, y el biomagnetismo con las ondas EM.
      </p>
      <div className="rule"></div>
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => goModule(1)}>
          <span className="ico">⚡</span> Repaso eléctrico
        </span>
        <span className="mpill" onClick={() => goModule(2)}>
          <span className="ico">🩸</span> Tejidos del cuerpo
        </span>
        <span className="mpill" onClick={() => goModule(3)}>
          <span className="ico">🧠</span> La neurona y su membrana
        </span>
        <span className="mpill" onClick={() => goModule(4)}>
          <span className="ico">🚀</span> Potencial de acción y el cable
        </span>
        <span className="mpill" onClick={() => goModule(5)}>
          <span className="ico">👂</span> Células ciliadas y sentidos
        </span>
        <span className="mpill" onClick={() => goModule(6)}>
          <span className="ico">❤️</span> El corazón eléctrico
        </span>
        <span className="mpill" onClick={() => goModule(7)}>
          <span className="ico">🌊</span> EEG y descargas
        </span>
        <span className="mpill" onClick={() => goModule(8)}>
          <span className="ico">🧲</span> Magnetismo
        </span>
        <span className="mpill" onClick={() => goModule(9)}>
          <span className="ico">🧾</span> Resumen
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.9rem', flexWrap: 'wrap' }}>
        {onBack && (
          <button
            type="button"
            className="start-btn"
            onClick={onBack}
            style={{
              background: 'var(--card, #fbf8f0)',
              color: 'var(--ink-2, #43505c)',
              borderColor: 'var(--line, #cfc3a9)',
              boxShadow: '0 1px 3px rgba(35,44,54,0.08)',
            }}
          >
            ← Volver al Índice
          </button>
        )}
        <button type="button" className="start-btn" onClick={() => goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </>
  );
}
