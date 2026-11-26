import React, { useState } from 'react';
import SomatotypeCanvas from './SomatotypeCanvas';
import Tex from './Tex';

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
}

const SOMATO_DATA: Record<SomatotypeKey, SomatotypeDetail> = {
  ecto: {
    id: 'ecto',
    name: 'Ectomorfo',
    emoji: '🏃',
    color: '#0d6e64',
    tag: 'Ectomorfia alta',
    scores: '1,0 · 1,5 · 6,5',
    desc: '<b>Ectomorfo (Linealidad dominante):</b> Cuerpo largo y magro. Prototipos: bailarines de ballet, saltadores de altura y corredores de maratón (alta ectomorfia, baja mesomorfia y endomorfia).',
    features: 'Cuerpo largo, delgado y magro; huesos finos, poca grasa y poco músculo; caderas más anchas que los hombros. Ballet, salto de altura, maratón.',
  },
  meso: {
    id: 'meso',
    name: 'Mesomorfo',
    emoji: '💪',
    color: '#c0681e',
    tag: 'Mesomorfia alta',
    scores: '2,0 · 6,5 · 1,5',
    desc: '<b>Mesomorfo (Desarrollo musculoesquelético):</b> Cuerpo sólido y atlético. Atletas de fuerza: halterofilia, boxeo y lucha.',
    features: 'Cuerpo sólido, musculoso y atlético; hombros más anchos que las caderas. Halterofilia, boxeo, lucha.',
  },
  endo: {
    id: 'endo',
    name: 'Endomorfo',
    emoji: '🍐',
    color: '#6d5fbf',
    tag: 'Endomorfia alta',
    scores: '6,5 · 3,5 · 1,0',
    desc: '<b>Endomorfo (Adiposidad y volumen):</b> Cuerpo redondeado con exceso de tejido graso. Prototipos: luchadores de sumo y hombres sedentarios de mediana edad.',
    features: 'Cuerpo redondeado, en forma de pera; huesos grandes y exceso de tejido graso; hombros algo más anchos que las caderas. Sumo; adultos sedentarios.',
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
                        <span style={{ fontSize:  'max(12px, .54rem)', color: 'var(--ink-3)', marginLeft: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                          [{item.scores}]
                        </span>
                        <br />
                        <span style={{ fontSize:  'max(12px, .55rem)', color: 'var(--ink-2)' }}>{item.features}</span>
                      </div>
                      <span
                        style={{
                          fontSize:  'max(12px, .52rem)',
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
              <p style={{ fontSize:  'max(12px, .55rem)', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                Terna ilustrativa (endo · meso · ecto), escala 1–7. De lanzadores a velocistas a fondistas, la mesomorfia baja y la ectomorfia sube.
              </p>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-2)', marginTop: '.35rem' }}>
                La <strong>técnica de Heath-Carter</strong> evalúa cada somatotipo en una escala del 1 al 7 como un <strong>continuo tridimensional</strong>, no como categorías aisladas. La ectomorfia se deriva de la masa y la altura; la mesomorfia, de los tamaños del codo, la rodilla, el brazo y la pantorrilla respecto a la altura; la endomorfia, de los pliegues cutáneos del brazo y del tronco.
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
              <p style={{ marginBottom: '.3rem' }}>
                En ingravidez (<Tex>{'g = 0'}</Tex>) el cuerpo cambia, y cada efecto es un capítulo del curso:
              </p>
              <ul className="effect-list">
                <li><b>+2,5 cm de estatura</b> sin compresión de los discos <span className="cap-ref">Cap. 2</span></li>
                <li><b>Cara hinchada, piernas de pájaro</b> por los fluidos <span className="cap-ref">Cap. 8</span></li>
                <li><b>Presión intracraneal</b> que deforma el ojo y afecta la visión <span className="cap-ref">Cap. 11</span></li>
                <li><b>Menos volumen de sangre</b> <span className="cap-ref">Cap. 8</span></li>
                <li><b>Mareo</b>: canales semicirculares <span className="cap-ref">Cap. 12</span></li>
                <li><b>Se traga por peristalsis</b>, no por gravedad</li>
                <li><b>Atrofia</b> de músculo, hueso y corazón <span className="cap-ref">Caps. 5, 4, 8</span></li>
              </ul>
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
