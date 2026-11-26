import React, { useState } from 'react';
import BiomechSummaryCanvas from './BiomechSummaryCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import KatexHtml from './KatexHtml';
import type { Engine } from './useEngine';

interface NodeButton {
  id: 'neck' | 'jaw' | 'elbow' | 'spine' | 'hip' | 'ankle' | 'foot';
  label: string;
  badge: string;
  desc: string;
}

const NODE_BUTTONS: NodeButton[] = [
  {
    id: 'neck',
    label: 'Cuello',
    badge: '1ª clase',
    desc: '<b>Cabeza sobre la columna (1ª clase, Fig. 2.6a):</b> el peso de la cabeza se equilibra con la fuerza efectiva hacia abajo de los músculos de la nuca; el fulcro soporta $W + M$. El libro no da cifras: el cociente del visor ($M \\approx 2{,}4\\,W$) es ilustrativo.',
  },
  {
    id: 'jaw',
    label: 'ATM / Mandíbula',
    badge: '3ª clase',
    desc: '<b>Mandíbula:</b> el masetero tiene una ventaja mecánica de $0{,}50$ en el incisivo y $0{,}76$ en el primer molar (temporal anterior $0{,}24$/$0{,}48$; posterior $0{,}37$/$0{,}72$). Todas $< 1$.',
  },
  {
    id: 'elbow',
    label: 'Codo / Bíceps',
    badge: '3ª clase',
    desc: '<b>Antebrazo (3ª clase):</b> con el bíceps a $4\\text{ cm}$ y la mano a $36\\text{ cm}$, $M = 9\\,W_W + 3{,}25\\,W_F$: $950\\text{ N}$ para $100\\text{ N}$ en la mano. Con tres flexores (Tabla 2.1): $262 + 399 + 85 = 746\\text{ N}$.',
  },
  {
    id: 'spine',
    label: 'Columna L5-S1',
    badge: 'Espalda',
    desc: '<b>Espalda (Ec. 2.43):</b> a $\\theta = 30^\\circ$, $M = 2{,}5\\,W_b$ ($2200\\text{ N}$) y $R = 2{,}74\\,W_b$ ($2400\\text{ N}$) sobre la quinta lumbar; levantando $0{,}2\\,W_b$ más, $M = 3{,}74\\,W_b$ y $R = 4{,}07\\,W_b$ ($3600\\text{ N}$). Nunca doblar la espalda para levantar.',
  },
  {
    id: 'hip',
    label: 'Cadera / Bastón',
    badge: 'Cadera',
    desc: '<b>Cadera sobre una pierna:</b> $M = 1{,}57\\,W_b$ y $R = 2{,}37\\,W_b$ ($1400$ y $2100\\text{ N}$ para $90\\text{ kg}$). Con un bastón contralateral que soporta $W_b/6$: $M = 0{,}61\\,W_b$ y $R = 1{,}26\\,W_b$, casi la mitad.',
  },
  {
    id: 'ankle',
    label: 'Tobillo / Aquiles',
    badge: 'Puntillas',
    desc: '<b>Tobillo de puntillas (Ecs. 2.39–2.40):</b> la normal del suelo, el Aquiles y la reacción en el astrágalo forman un sistema concurrente. Para $\\theta = 45^\\circ$ y $\\beta = 60^\\circ$: $M = 1{,}93\\,W_b$ y $R = 2{,}73\\,W_b$, ambas muy por encima del peso corporal.',
  },
  {
    id: 'foot',
    label: 'Pie / GRF',
    badge: 'Complementario',
    desc: '<b>Plataforma de fuerza (contenido complementario, no está en §2):</b> la fuerza vertical del suelo en la marcha llega a $\\sim 1{,}2\\,W_b$. El libro sí da la reacción en la rodilla durante la marcha: $\\sim 3\\text{--}4\\,W_b$.',
  },
];

export default function Slide18({
  isActive,
  engine,
  go,
}: {
  isActive?: boolean;
  engine?: Engine;
  go?: (n: number) => void;
  [key: string]: any;
}) {
  const [selectedNode, setSelectedNode] = useState<'neck' | 'jaw' | 'elbow' | 'spine' | 'hip' | 'ankle' | 'foot'>('elbow');
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);

  const curNode = NODE_BUTTONS.find((b) => b.id === selectedNode) || NODE_BUTTONS[2];

  const handleSelectNode = (node: 'neck' | 'jaw' | 'elbow' | 'spine' | 'hip' | 'ankle' | 'foot') => {
    setSelectedNode(node);
  };

  const handleReset = () => {
    setSelectedNode('elbow');
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">H2</span>
        <h2 className="mtitle">Síntesis y mapa biomecánico integral</h2>
        <span className="msub">§2.6 Resumen · mapa de palancas y cargas articulares con las cifras del capítulo</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎓</span> Principios rectores del Capítulo 2
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '.62rem' }}>
                <span className="pill has-marker">
                  <span className="pill-dot" style={{ background: '#0d8577' }} />
                  <span><b>1. Palancas:</b> {'el equilibrio de fuerzas y torques ($\\Sigma \\vec{F} = 0$, $\\Sigma \\vec{\\tau} = 0$) a menudo se analiza como una palanca, como en el antebrazo.'}</span>
                </span>
                <span className="pill has-marker">
                  <span className="pill-dot" style={{ background: '#2563eb' }} />
                  <span><b>2. Todo y parte:</b> el equilibrio de una parte del cuerpo se estudia con las fuerzas de gravedad, músculos y reacciones sobre el cuerpo entero y sobre esa parte por separado.</span>
                </span>
                <span className="pill has-marker">
                  <span className="pill-dot" style={{ background: '#b02318' }} />
                  <span><b>3. Fuerzas internas enormes:</b> {'las fuerzas musculares y de reacción superan el peso corporal: cadera $R \\approx 2{,}4\\,W_b$, quinta lumbar $R \\approx 2{,}7\\,W_b$ (y $4{,}1\\,W_b$ levantando $0{,}2\\,W_b$).'}</span>
                </span>
                <span className="pill has-marker">
                  <span className="pill-dot" style={{ background: '#d97706' }} />
                  <span><b>4. Consecuencias:</b> {'por eso la cadera y la parte baja de la espalda dan problemas; un bastón contralateral casi divide por dos $R$ y se debe levantar peso con las piernas.'}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🗺️</span> Selección de articulaciones
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {NODE_BUTTONS.map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => handleSelectNode(btn.id)}
                    style={{
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontSize: '0.58rem',
                      background: selectedNode === btn.id ? 'var(--teal)' : 'var(--paper-2)',
                      color: selectedNode === btn.id ? '#fff' : 'var(--ink)',
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                      fontWeight: selectedNode === btn.id ? 700 : 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {btn.label} <span style={{ opacity: 0.8, fontSize: '0.52rem' }}>({btn.badge})</span>
                  </button>
                ))}
              </div>
            
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular la articulación elegida</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Pone sobre el nodo seleccionado las fuerzas y el factor multiplicador que resume su mecánica.</TheoryCue>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Cátedra de Biomecánica</div>
            <div className="a-text" id="info-text-18">
              <KatexHtml html={curNode.desc} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="SÍNTESIS BIOMECÁNICA"
            badge={`${selectedNode.toUpperCase()} · DCL ACTIVO`}
            footer="💡 Haz clic en los nódulos del maniquí para explorar las ecuaciones y multiplicadores de palanca"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Región Anatómica:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{selectedNode.toUpperCase()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Condición Estática:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>ΣF = 0, Στ = 0</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Mapeo Corporal:</span>
                <b style={{ color: '#0d8577' }}>7 Palancas Clave</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ventaja Mecánica:</span>
                <b style={{ color: '#b02318' }}>
                  {selectedNode === 'ankle' || selectedNode === 'jaw' ? 'Fuerza (VM > 1)' : 'Velocidad (VM < 1)'}
                </b>
              </div>
            </div>
          </HudPanel>

          <BiomechSummaryCanvas showLabels={showLabels}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
          />
          <div className="prof-controls">
            <span className="badge">§2.6 · Resumen</span>
            <span>Nódulo: <b style={{ color: 'var(--teal-deep)' }}>{selectedNode.toUpperCase()}</b></span>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'rgba(255,255,255,0.6)' }}>
                {NODE_BUTTONS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectNode(b.id)}
                    style={{
                      background: selectedNode === b.id ? 'var(--teal)' : 'transparent',
                      color: selectedNode === b.id ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 5px',
                      fontSize: '0.56rem',
                      fontWeight: selectedNode === b.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {b.label.split(' ')[0]}
                  </button>
                ))}
              </div>

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
