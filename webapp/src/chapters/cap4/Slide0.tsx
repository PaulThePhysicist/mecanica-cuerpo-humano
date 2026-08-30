import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '1.2rem',
            left: '1.5rem',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            color: 'var(--teal-deep)',
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ← Volver al Índice
        </button>
      )}
      <h1>
        <span className="chapno">Capítulo 4</span>
        Propiedades <span className="vol">mecánicas</span> del cuerpo
      </h1>
      <p className="subtitle">
        De la célula al esqueleto: cómo responden huesos, tendones y cartílagos a la carga. Elasticidad, energía
        almacenada, materiales reales, flexión, viscoelasticidad, fracturas y seguridad — la mecánica de materiales
        aplicada a la máquina humana.
      </p>
      <div className="rule"></div>
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🦴</span> Componentes
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">🧲</span> Elásticos
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">⚡</span> Energía
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">📈</span> Materiales
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">📐</span> Flexión
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">⏱️</span> Viscoelasticidad
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">💥</span> Fracturas
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">⛑️</span> Seguridad · Alimentos
        </span>
      </div>
      <button type="button" className="start-btn" onClick={() => engine.goModule(1)}>
        Comenzar la cátedra →
      </button>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </div>
  );
}
