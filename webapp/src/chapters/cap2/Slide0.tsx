import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({
  goModule,
  onBack,
}: {
  isActive?: boolean;
  engine?: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  setLever?: (n: number) => void;
  toggleForearmMuscles?: () => void;
  hipToggleBreakdown?: () => void;
  toggleCane?: () => void;
  toggleBackLoad?: () => void;
  setDiscPosture?: (p: string) => void;
  setJawPos?: (m: string) => void;
  threeStep?: (d: number) => void;
  touchStim?: (k: string) => void;
  convertPreset?: (k: string) => void;
  onBack?: () => void;
}) {
  return (
    <>
      <h1>
        <span className="chapno">Capítulo 2</span>
        La <span className="vol">Estática</span> del Cuerpo
      </h1>
      <p className="subtitle">
        Las fuerzas, los torques y el equilibrio se revisan primero y luego se aplican a la estática en un plano y a la
        palanca. Analizamos el antebrazo, la cadera, el hombro, la rodilla, el tobillo, las mandíbulas y la parte baja de la
        espalda — donde las fuerzas internas pueden superar varias veces el peso corporal.
      </p>
      <div className="rule"></div>
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => goModule(1)}>
          <span className="ico">🧲</span> Fuerzas · Torques
        </span>
        <span className="mpill" onClick={() => goModule(2)}>
          <span className="ico">⚖️</span> Palancas · Antebrazo
        </span>
        <span className="mpill" onClick={() => goModule(3)}>
          <span className="ico">🦴</span> La cadera
        </span>
        <span className="mpill" onClick={() => goModule(4)}>
          <span className="ico">🏋️</span> La espalda
        </span>
        <span className="mpill" onClick={() => goModule(5)}>
          <span className="ico">🦷</span> Articulaciones · Mandíbula
        </span>
        <span className="mpill" onClick={() => goModule(6)}>
          <span className="ico">📐</span> Métodos
        </span>
        <span className="mpill" onClick={() => goModule(7)}>
          <span className="ico">✋</span> El tacto
        </span>
        <span className="mpill" onClick={() => goModule(8)}>
          <span className="ico">✓</span> Unidades · Resumen
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
        <button className="start-btn" onClick={() => goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </>
  );
}
