import React, { useState } from 'react';
import BiomechSummaryCanvas from './BiomechSummaryCanvas';
import HudPanel from './HudPanel';
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
    badge: '1ª Clase',
    desc: '<b>Cabeza y Cuello (Atlas C1 - Palanca 1ª Clase):</b> El fulcro está en los cóndilos occipitales. La musculatura posterior nucal ($F_m$) compensa el peso del cráneo ($W$) que cae por delante del eje, con una tensión muscular $F_m \\approx 2{,}4 \\times W$.',
  },
  {
    id: 'jaw',
    label: 'ATM / Mandíbula',
    badge: '2ª/3ª Clase',
    desc: '<b>ATM y Mandíbula:</b> Palanca biomecánica con ventaja de fuerza en molares ($>600\\text{ N}$, cerca de la ATM) y velocidad/alcance en incisivos ($\\sim 200\\text{ N}$, alejados del fulcro).',
  },
  {
    id: 'elbow',
    label: 'Codo / Bíceps',
    badge: '3ª Clase',
    desc: '<b>Codo y Bíceps (Palanca 3ª Clase):</b> La inserción a solo $4\\text{ cm}$ del eje exige una fuerza muscular $F_m \\approx 8{,}75 \\times W$, multiplicando casi por 9 la velocidad y amplitud distal de la mano.',
  },
  {
    id: 'spine',
    label: 'Columna L5-S1',
    badge: 'Grúa Lumbar',
    desc: '<b>Columna Lumbar L5-S1 (Grúa Invertida):</b> El brazo de palanca desfavorable $10:1$ de los erectores espinales genera compresiones discales masivas ($>3500\\text{ N}$, $P > 2{,}8\\text{ MPa}$) al inclinarse con peso.',
  },
  {
    id: 'hip',
    label: 'Cadera / Bastón',
    badge: '1ª Pélvica',
    desc: '<b>Cadera y Apoyo Monopodal (Palanca 1ª Clase):</b> El glúteo medio tracciona con $F_{\\text{abd}} \\approx 2\\times W_b$, generando una fuerza articular acetabular de $2{,}7\\times$ el peso corporal total. Un bastón contralateral reduce esta carga en un $50\\%$.',
  },
  {
    id: 'ankle',
    label: 'Tobillo / Aquiles',
    badge: '2ª Clase',
    desc: '<b>Tobillo y Tendón de Aquiles (Palanca 2ª Clase):</b> Al pararse en puntillas, el tendón tira del calcáneo por detrás del punto de apoyo del suelo, logrando una verdadera ventaja de fuerza mecánica ($VM > 1{,}3$).',
  },
  {
    id: 'foot',
    label: 'Pie / GRF',
    badge: 'Plataforma',
    desc: '<b>Plataforma de Marcha y Fuerzas de Reacción del Suelo (GRF):</b> El vector de impacto vertical alcanza $1{,}2\\times$ el peso corporal, mientras el mecanismo de Windlass en la fascia plantar almacena y libera energía elástica.',
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

  const curNode = NODE_BUTTONS.find((b) => b.id === selectedNode) || NODE_BUTTONS[2];

  const handleSelectNode = (node: 'neck' | 'jaw' | 'elbow' | 'spine' | 'hip' | 'ankle' | 'foot') => {
    setSelectedNode(node);
    const detail = NODE_BUTTONS.find((b) => b.id === node);
    const info = document.getElementById('info-text-18');
    if (info && detail) {
      info.innerHTML = detail.desc;
    }
  };

  const handleReset = () => {
    setSelectedNode('elbow');
    const info = document.getElementById('info-text-18');
    if (info) {
      info.innerHTML = NODE_BUTTONS[2].desc;
    }
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">H2</span>
        <span className="mtitle">Síntesis y mapa biomecánico integral</span>
        <span className="msub">Mapa interactivo de palancas anatómicas, momentos de fuerza y cargas articulares del cuerpo humano</span>
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
                <span className="pill" style={{ borderLeft: '3px solid #0d8577' }}>
                  <b>1. Estática Corpórea:</b> {'$\\Sigma \\vec{F} = 0$ y $\\Sigma \\vec{\\tau} = 0$ rigen todo el soporte postural.'}
                </span>
                <span className="pill" style={{ borderLeft: '3px solid #2563eb' }}>
                  <b>2. Dominio de la 3ª Clase:</b> La mayoría de músculos sacrifican fuerza para maximizar la velocidad angular distal.
                </span>
                <span className="pill" style={{ borderLeft: '3px solid #b02318' }}>
                  <b>3. Fuerzas Articulares Masivas:</b> {'La tensión muscular multiplica la compresión en cadera ($2{,}7\\times W$) y L5-S1 ($>3500\\text{ N}$).'}
                </span>
                <span className="pill" style={{ borderLeft: '3px solid #d97706' }}>
                  <b>4. Alivio Terapéutico:</b> Bastón contralateral ($-50\\%$) y levantamiento con rodillas flexionadas.
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
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Cátedra de Biomecánica</div>
            <div className="a-text" id="info-text-18">
              <span dangerouslySetInnerHTML={{ __html: curNode.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="SÍNTESIS BIOMECÁNICA"
            badge={`${selectedNode.toUpperCase()} · DCL ACTIVO`}
            icon="🌟"
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

          <BiomechSummaryCanvas
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
          />
          <div className="prof-controls">
            <span className="badge">2.8 · Síntesis</span>
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
