import React, { useState } from 'react';
import BodySegmentsCanvas from './BodySegmentsCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

interface PostureOpt {
  id: 'standing' | 'arms_up' | 'bent_forward' | 'squat';
  name: string;
  badge: string;
  desc: string;
}

const POSTURES: PostureOpt[] = [
  {
    id: 'standing',
    name: 'De pie erguido',
    badge: 'BIPEDESTACIÓN (56% H)',
    desc: '<b>De pie erguido ($56\\%\\, H$):</b> En bipedestación anatómica neutra, el centro de gravedad global ($CG$) se ubica a la altura de la 2ª vértebra sacra ($S2$), proyectando su línea de plomada en el tercio medio del polígono podal con mínimo gasto muscular.',
  },
  {
    id: 'arms_up',
    name: 'Brazos arriba',
    badge: 'ASCENSO CG (+8 cm)',
    desc: '<b>Brazos elevados ($60{,}5\\%\\, H$):</b> El ascenso de la masa de las extremidades superiores eleva el $CG$ global unos $\\approx 6\\text{--}8\\text{ cm}$, acortando el cono de estabilidad y aumentando el brazo de palanca ante perturbaciones externas.',
  },
  {
    id: 'bent_forward',
    name: 'Inclinado adelante',
    badge: 'CG ANTERIOR EXTERNO',
    desc: '<b>Inclinación anterior del tronco:</b> El $CG$ se traslada fuera de los contornos anatómicos del cuerpo y migra hacia el borde anterior del polígono podal, requiriendo un potente momento compensatorio del tríceps sural e isquiotibiales.',
  },
  {
    id: 'squat',
    name: 'Sentadilla profunda',
    badge: 'MÁXIMA ESTABILIDAD (38% H)',
    desc: '<b>Sentadilla profunda (Cuclillas, $38\\%\\, H$):</b> El descenso drástico del baricentro hacia el suelo y el ensanchamiento biomecánico de la base de apoyo otorgan el máximo índice de estabilidad estática.',
  },
];

export default function Slide13({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [posture, setPosture] = useState<'standing' | 'arms_up' | 'bent_forward' | 'squat'>('standing');
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [bodyHeightCm, setBodyHeightCm] = useState<number>(175);
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);

  const curOpt = POSTURES.find((p) => p.id === posture) || POSTURES[0];

  const handleSelect = (id: 'standing' | 'arms_up' | 'bent_forward' | 'squat') => {
    setPosture(id);
  };

  const handleReset = () => {
    setPosture('standing');
    setBodyHeightCm(175);
    setBodyMassKg(70);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">F1</span>
        <h2 className="mtitle">Método de segmentos corporales</h2>
        <span className="msub">Cálculo del centro de gravedad (CG) total y polígono de sustentación</span>
        <span className="mslide-count">1 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎯</span> Teorema de Varignon y Baricentro
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'El centro de gravedad global $(X_{\\text{cg}}, Y_{\\text{cg}})$ es la media ponderada por masa de los centros de gravedad segmentarios:'}
              </p>
              <div className="eq-block">
                {'\\[ X_{\\text{cg}} = \\frac{\\sum_{i=1}^n m_i\\, x_i}{M} \\qquad Y_{\\text{cg}} = \\frac{\\sum_{i=1}^n m_i\\, y_i}{M} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Donde $M = \\sum m_i$ es la masa corporal total y los coeficientes $m_i$ provienen de los estándares antropométricos cadavéricos de Dempster (7 segmentos principales).'}
              </p>
            
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>🏷️ Rotular el CG y la base de apoyo</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Marca el centro de gravedad, la base de sustentación (<b>BoS</b>) y el margen de estabilidad que queda entre ambos.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> Criterio de estabilidad estática
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                Para mantener el equilibrio postural sin dar un paso reactivo, <strong>la línea de plomada gravitacional debe intersecar el polígono de sustentación</strong> delimitado por los bordes externos de ambos pies.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-13">
              <span dangerouslySetInnerHTML={{ __html: curOpt.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="BARICENTRO SEGMENTARIO"
            badge={curOpt.badge}
            icon="🎯"
            footer="💡 Selecciona una postura para ver cómo se traslada el CG global y la línea de plomada"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Postura Seleccionada:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{curOpt.name}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Estatura (H):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{bodyHeightCm} cm</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Masa Corporal:</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{bodyMassKg} kg (100%)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Modelo Antropométrico:</span>
                <b style={{ color: '#0d6e64' }}>Dempster (7 Segm.)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Estado de Estabilidad:</span>
                <b style={{ color: posture === 'bent_forward' ? '#f59e0b' : '#0d6e64' }}>
                  {posture === 'bent_forward' ? 'Límite Anterior (Alerta)' : 'Equilibrio Estable'}
                </b>
              </div>
            </div>
          </HudPanel>

          <BodySegmentsCanvas showLabels={showLabels}
            posture={posture}
            bodyHeightCm={bodyHeightCm}
            bodyMassKg={bodyMassKg}
          />
          <div className="prof-controls">
            <span className="badge">2.6 · Segmentos</span>
            <span>Postura: <b style={{ color: 'var(--teal-deep)' }}>{curOpt.name}</b></span>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {POSTURES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    style={{
                      background: posture === p.id ? 'var(--teal)' : 'transparent',
                      color: posture === p.id ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '3px 7px',
                      fontSize: '0.58rem',
                      fontWeight: posture === p.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Estatura:</span>
                <input
                  type="range"
                  min="150"
                  max="200"
                  value={bodyHeightCm}
                  onChange={(e) => setBodyHeightCm(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{bodyHeightCm} cm</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Masa:</span>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={bodyMassKg}
                  onChange={(e) => setBodyMassKg(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{bodyMassKg} kg</b>
              </label>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
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
