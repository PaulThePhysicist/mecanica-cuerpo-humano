import React, { useState } from 'react';
import AnatomyCanvas from './AnatomyCanvas';

interface Slide1Props {
  hl?: string | null;
  slideCount?: string;
}

export default function Slide1({ hl, slideCount }: Slide1Props) {
  const [localTerm, setLocalTerm] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const activeTerm = hl || localTerm;

  // El texto del apunte (#info-text-a1) lo escribe Capitulo1.tsx desde su mapa
  // DESCRIPTIONS, que es la única fuente. Aquí solo llevamos el estado local del
  // resaltado (píldoras + vector 3D).
  const handleSelectTerm = (termKey: string) => {
    setLocalTerm((prev) => (prev === termKey ? null : termKey));
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
