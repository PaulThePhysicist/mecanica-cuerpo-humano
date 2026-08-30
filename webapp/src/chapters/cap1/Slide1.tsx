import React, { useState } from 'react';
import AnatomyCanvas from './AnatomyCanvas';
import HudPanel from './HudPanel';

interface Slide1Props {
  hl?: string | null;
  slideCount?: string;
}

const TERM_DESCRIPTIONS: Record<string, string> = {
  'axis-z': '<b>Eje Z (Superior / Inferior):</b> Superior (hacia la cabeza o cefálico) vs. Inferior (hacia los pies o podálico / caudal).',
  'axis-x': '<b>Eje X (Anterior / Posterior):</b> Anterior (frente / ventral) vs. Posterior (espalda / dorsal).',
  'axis-y': '<b>Eje Y (Derecha / Izquierda):</b> Siempre desde la perspectiva propia del paciente (dextral vs sinistral).',
  'axis-medial': '<b>|y| Medial / Lateral:</b> Medial (hacia la línea media sagital) vs. Lateral (hacia los costados exteriores).',
  'coord-r-proximal': '<b>Coordenada r (Proximal / Distal):</b> Proximal (cerca del tronco / origen del miembro) vs. Distal (lejos del tronco, hacia manos o pies).',
  'coord-rho-superficial': '<b>Coordenada ρ (Superficial / Profundo):</b> Superficial (hacia la piel exterior) vs. Profundo (hacia el interior de los órganos y cavidades).',
  'coord-right': '<b>Derecha del paciente:</b> y < 0 en el sistema de coordenadas corporales.',
  'coord-left': '<b>Izquierda del paciente:</b> y > 0 en el sistema de coordenadas corporales.',
};

export default function Slide1({ hl, slideCount }: Slide1Props) {
  const [localTerm, setLocalTerm] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const activeTerm = hl || localTerm;

  const handleSelectTerm = (termKey: string) => {
    const next = localTerm === termKey ? null : termKey;
    setLocalTerm(next);
    const info = document.getElementById('info-text-a1');
    if (info) {
      if (next && TERM_DESCRIPTIONS[next]) {
        info.innerHTML = TERM_DESCRIPTIONS[next];
      } else {
        info.innerHTML = 'Pasa el cursor o haz clic sobre los ejes o las coordenadas locales para ver aquí el detalle anatómico de cada término.';
      }
    }
  };

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setLocalTerm(null);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">A1</span>
        <span className="mtitle">Direcciones y coordenadas</span>
        <span className="msub">Los sistemas de coordenadas del cuerpo</span>
        <span className="mslide-count">{slideCount ?? '1 / 3'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧭</span> Direcciones en pares opuestos
            </div>
            <div className="card-body">
              <p>
                Toda descripción anatómica se hace <strong>desde el punto de vista del paciente</strong>. Los términos vienen en pares opuestos, cada uno atado a una coordenada del cuerpo.
              </p>
              <div className="row">
                <span
                  className={`pill ${activeTerm === 'axis-z' ? 'active' : ''}`}
                  data-highlight="axis-z"
                  onClick={() => handleSelectTerm('axis-z')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>z</b> Superior / Inferior
                </span>
                <span
                  className={`pill ${activeTerm === 'axis-x' ? 'active' : ''}`}
                  data-highlight="axis-x"
                  onClick={() => handleSelectTerm('axis-x')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>x</b> Anterior / Posterior
                </span>
                <span
                  className={`pill ${activeTerm === 'axis-y' ? 'active' : ''}`}
                  data-highlight="axis-y"
                  onClick={() => handleSelectTerm('axis-y')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>y</b> Derecha / Izquierda
                </span>
              </div>
              <div className="row">
                <span
                  className={`pill ${activeTerm === 'axis-medial' ? 'active' : ''}`}
                  data-highlight="axis-medial"
                  onClick={() => handleSelectTerm('axis-medial')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>|y|</b> Medial / Lateral
                </span>
                <span
                  className={`pill ${activeTerm === 'coord-r-proximal' ? 'active' : ''}`}
                  data-highlight="coord-r-proximal"
                  onClick={() => handleSelectTerm('coord-r-proximal')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>r</b> Proximal / Distal
                </span>
                <span
                  className={`pill ${activeTerm === 'coord-rho-superficial' ? 'active' : ''}`}
                  data-highlight="coord-rho-superficial"
                  onClick={() => handleSelectTerm('coord-rho-superficial')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>ρ</b> Superficial / Profundo
                </span>
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                💡 Pasa el cursor o haz clic sobre cada término para aislar su vector en el visor 3D.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">◉</span> Coordenadas locales
            </div>
            <div className="card-body">
              <p>
                Dos coordenadas adicionales sitúan un punto <strong>relativo</strong> a estructuras de referencia:
              </p>
              <div className="row" style={{ marginBottom: '.25rem' }}>
                <span
                  className={`pill ${activeTerm === 'coord-r-proximal' ? 'active' : ''}`}
                  data-highlight="coord-r-proximal"
                  onClick={() => handleSelectTerm('coord-r-proximal')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>r↓</b> Proximal (hombro)
                </span>
                <span
                  className={`pill ${activeTerm === 'coord-r-distal' ? 'active' : ''}`}
                  data-highlight="coord-r-distal"
                  onClick={() => handleSelectTerm('coord-r-distal')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>r↑</b> Distal (mano)
                </span>
              </div>
              <div className="row">
                <span
                  className={`pill ${activeTerm === 'coord-rho-superficial' ? 'active' : ''}`}
                  data-highlight="coord-rho-superficial"
                  onClick={() => handleSelectTerm('coord-rho-superficial')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>ρ↓</b> Superficial (piel)
                </span>
                <span
                  className={`pill ${activeTerm === 'coord-rho-deep' ? 'active' : ''}`}
                  data-highlight="coord-rho-deep"
                  onClick={() => handleSelectTerm('coord-rho-deep')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>ρ↑</b> Profundo (órganos)
                </span>
              </div>
              <p style={{ fontSize: '.64rem', marginTop: '.25rem' }}>
                <strong>Derecha / Izquierda:</strong>{' '}
                <span
                  className={`pill ${activeTerm === 'coord-right' ? 'active' : ''}`}
                  data-highlight="coord-right"
                  onClick={() => handleSelectTerm('coord-right')}
                  style={{ padding: '.1rem .45rem', cursor: 'pointer' }}
                >
                  <b>y &lt; 0</b> derecha
                </span>{' '}
                <span
                  className={`pill ${activeTerm === 'coord-left' ? 'active' : ''}`}
                  data-highlight="coord-left"
                  onClick={() => handleSelectTerm('coord-left')}
                  style={{ padding: '.1rem .45rem', cursor: 'pointer' }}
                >
                  <b>y &gt; 0</b> izquierda
                </span>
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-a1">
              Pasa el cursor o haz clic sobre los ejes o las coordenadas locales para ver aquí el detalle anatómico de cada término.
            </div>
          </div>
        </div>
        <div className="sim-area" id="sim-anatomy-a1" style={{ position: 'relative' }}>

          {/* Panel Lateral HUD de Inspección de Coordenadas en la esquina superior derecha */}
          <HudPanel
            title="SISTEMA CORPORAL"
            badge="X · Y · Z · r · ρ"
            icon="🧭"
            footer="💡 Clic para iluminar en 3D"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div
                onClick={() => handleSelectTerm('axis-z')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activeTerm === 'axis-z' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activeTerm === 'axis-z' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d6e64' }} />
                  <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--ink)' }}>Eje Z</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>Superior / Inferior</span>
              </div>

              <div
                onClick={() => handleSelectTerm('axis-x')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activeTerm === 'axis-x' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activeTerm === 'axis-x' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9a5b00' }} />
                  <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--ink)' }}>Eje X</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>Anterior / Posterior</span>
              </div>

              <div
                onClick={() => handleSelectTerm('axis-y')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activeTerm === 'axis-y' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activeTerm === 'axis-y' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a92a1e' }} />
                  <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--ink)' }}>Eje Y</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>Derecha / Izquierda</span>
              </div>

              <div
                onClick={() => handleSelectTerm('axis-medial')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activeTerm === 'axis-medial' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activeTerm === 'axis-medial' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6d5fbf' }} />
                  <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--ink)' }}>|y| Medial</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>Medial / Lateral</span>
              </div>

              <div
                onClick={() => handleSelectTerm('coord-r-proximal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activeTerm === 'coord-r-proximal' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activeTerm === 'coord-r-proximal' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
                  <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--ink)' }}>Coord. r</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>Proximal / Distal</span>
              </div>

              <div
                onClick={() => handleSelectTerm('coord-rho-superficial')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activeTerm === 'coord-rho-superficial' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activeTerm === 'coord-rho-superficial' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} />
                  <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--ink)' }}>Coord. ρ</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>Superficial / Profundo</span>
              </div>
            </div>
          </HudPanel>

          <AnatomyCanvas
            hoveredTerm={activeTerm}
            showLabels={showLabels}
            autoRotate={autoRotate}
            resetSignal={resetSignal}
            zoomSignal={zoomSignal}
          />
          <div className="prof-controls" data-default-collapsed="true">
          <span className="badge">A1 · 3D</span>
          <span>Explora los ejes y las coordenadas sobre el cuerpo real</span>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            {/* Controles de Zoom integrados */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 5px' }}>
              <span style={{ fontSize: '0.60rem', color: 'var(--ink-3)', marginRight: '2px' }}>Zoom</span>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Alejar vista (Zoom −)"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 3px' }}
              >
                −
              </button>
              <span style={{ color: 'var(--line)', fontSize: '0.65rem' }}>|</span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Acercar vista (Zoom +)"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 3px' }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              id="resetSceneA1"
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

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.66rem' }}>
              <input
                type="checkbox"
                id="toggleLabelsA1"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Etiquetas 3D
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.66rem' }}>
              <input
                type="checkbox"
                id="toggleAutoRotate"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
              />
              Rotación
            </label>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
