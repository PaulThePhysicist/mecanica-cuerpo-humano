import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 6</span>
        Metabolismo: <span className="vol">Energía, Calor, Trabajo y Potencia</span>
      </h1>
      <p className="subtitle">
        Cómo el cuerpo convierte los alimentos en trabajo y en calor: el balance energético de la primera ley, el contenido
        energético de los combustibles corporales, las moléculas de almacenamiento (ATP, fosfágenos, glucógeno y grasa), las
        tasas metabólicas basal y de actividad, la eficiencia del trabajo mecánico, los cuatro modos de pérdida de calor y la
        regulación de la temperatura corporal.
      </p>
      <div className="rule" />
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🔥</span> Energía · Calor
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">🍩</span> Combustibles
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">🔋</span> Almacenamiento
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">💤</span> Tasa basal
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">🏃</span> Locomoción
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">⚙️</span> Trabajo · Potencia
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">❄️</span> Pérdida de calor
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">🌡️</span> Temperatura
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
        <button type="button" className="start-btn" onClick={() => engine.goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </div>
  );
}
