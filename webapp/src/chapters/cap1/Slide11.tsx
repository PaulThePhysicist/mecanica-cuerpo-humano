import React, { useState } from 'react';
import SomatotypeCanvas from './SomatotypeCanvas';

type SomatotypeKey = 'ecto' | 'meso' | 'endo';

interface SomatotypeDetail {
  id: SomatotypeKey;
  name: string;
  emoji: string;
  color: string;
  tag: string;
  scores: string;
  desc: string;
  features: string;
  athletes: string;
}

const SOMATO_DATA: Record<SomatotypeKey, SomatotypeDetail> = {
  ecto: {
    id: 'ecto',
    name: 'Ectomorfo',
    emoji: '🏃',
    color: '#0d6e64',
    tag: 'Ectomorfia alta',
    scores: '1,0 · 1,5 · 6,5',
    desc: '<b>Ectomorfo (Linealidad dominante):</b> Predominio de longitud sobre masa. Miembros largos y finos, escasa grasa subcutánea y caja torácica plana.',
    features: 'Estatura relativa alta, caderas anchas en proporción a hombros, índice ponderal elevado.',
    athletes: 'Corredores de fondo, maratón, salto de altura, baloncesto.',
  },
  meso: {
    id: 'meso',
    name: 'Mesomorfo',
    emoji: '💪',
    color: '#c0681e',
    tag: 'Mesomorfia alta',
    scores: '2,0 · 6,5 · 1,5',
    desc: '<b>Mesomorfo (Desarrollo musculoesquelético):</b> Predominio óseo y muscular. Hombros anchos, tórax en V, cintura estrecha y articulaciones robustas.',
    features: 'Gran masa magra, relación hombro/cadera > 1,15, alta fuerza específica.',
    athletes: 'Gimnastas, velocistas, boxeadores, halterofilia.',
  },
  endo: {
    id: 'endo',
    name: 'Endomorfo',
    emoji: '🍐',
    color: '#6d5fbf',
    tag: 'Endomorfia alta',
    scores: '6,5 · 3,5 · 1,0',
    desc: '<b>Endomorfo (Adiposidad y volumen):</b> Predominio del tejido adiposo y órganos digestivos. Silueta redondeada, hombros y caderas anchos (forma de pera).',
    features: 'Mayor flotabilidad, centro de gravedad bajo, densidad ósea elevada.',
    athletes: 'Luchadores de sumo, lanzadores de disco/peso, pilares de rugby.',
  },
};

export default function Slide11({ slideCount }: { slideCount?: string }) {
  const [selectedType, setSelectedType] = useState<SomatotypeKey>('meso');

  const currentDetail = SOMATO_DATA[selectedType];

  const handleSelectType = (typeKey: SomatotypeKey) => {
    setSelectedType(typeKey);
  };

  const handleReset = () => {
    setSelectedType('meso');
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C4</span>
        <span className="mtitle">Somatotipos y variación</span>
        <span className="msub">Ecto · meso · endo · Técnica de Heath-Carter</span>
        <span className="mslide-count">{slideCount ?? '4 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧬</span> Los 3 somatotipos de Heath-Carter
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                {(['ecto', 'meso', 'endo'] as SomatotypeKey[]).map((k) => {
                  const item = SOMATO_DATA[k];
                  const isSel = selectedType === k;
                  return (
                    <div
                      key={k}
                      onClick={() => handleSelectType(k)}
                      style={{
                        padding: '.35rem .5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: isSel ? 'var(--teal-tint)' : 'var(--paper-2)',
                        border: `1px solid ${isSel ? item.color : 'var(--line)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <b style={{ color: isSel ? item.color : 'var(--ink)' }}>{item.name}</b>
                        <span style={{ fontSize: '.54rem', color: 'var(--ink-3)', marginLeft: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                          [{item.scores}]
                        </span>
                        <br />
                        <span style={{ fontSize: '.55rem', color: 'var(--ink-2)' }}>{item.features}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '.52rem',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isSel ? item.color : 'var(--line)',
                          color: isSel ? '#fff' : 'var(--ink-2)',
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-2)', marginTop: '.35rem' }}>
                La <strong>técnica de Heath-Carter</strong> evalúa cada somatotipo en una escala del 1 al 7 como un <strong>continuo tridimensional</strong>, no como categorías aisladas.
              </p>
              <p style={{ fontSize: '.62rem', color: 'var(--ink)', marginTop: '.35rem', lineHeight: 1.35 }}>
                <strong>Cómo leer la somatocarta:</strong> cada vértice representa un predominio: <strong>ECTO</strong> = linealidad, <strong>MESO</strong> = desarrollo musculoesquelético y <strong>ENDO</strong> = adiposidad y volumen. El punto indica la combinación de los tres componentes del tipo seleccionado.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🛰️</span> El cuerpo en el espacio (Microgravedad)
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                En ingravidez, los astronautas <strong>crecen ~2,5 cm</strong> por descompresión elástica de los discos intervertebrales y desarrollan el síndrome de «<strong>cara hinchada y piernas de pájaro</strong>» debido a la redistribución cefálica de los fluidos corporales.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-c4">
              <span dangerouslySetInnerHTML={{ __html: currentDetail.desc }} />
            </div>
          </div>
        </div>
        <div className="sim-area c4-somatotype-area" style={{ position: 'relative' }}>
          <SomatotypeCanvas
            selectedType={selectedType}
          />
          <div className="prof-controls">
            <span className="badge">C4 · Tipos</span>
            <span>Somatotipo activo: <b style={{ color: currentDetail.color }}>{currentDetail.name}</b></span>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  marginLeft: '4px',
                }}
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
