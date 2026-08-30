import React, { useState } from 'react';
import PlanesCanvas from './PlanesCanvas';
import HudPanel from './HudPanel';

interface Slide2Props {
  planeSel?: string | null;
  slideCount?: string;
}

const PLANE_DESCRIPTIONS: Record<string, string> = {
  'plane-sagittal': '<b>Plano sagital (x = cte):</b> Divide el cuerpo en mitades derecha e izquierda. Plano principal para flexión y extensión. El plano midsagital (x = 0) pasa por el centro.',
  'plane-coronal': '<b>Plano coronal o frontal (y = cte):</b> Divide en porciones anterior y posterior (ventral y dorsal). Plano principal para abducción y aducción.',
  'plane-transverse': '<b>Plano transverso u horizontal (z = cte):</b> Divide en mitades superior e inferior (cefálica y podálica). Plano principal para rotaciones axiales.',
};

export default function Slide2({ planeSel: parentPlaneSel, slideCount }: Slide2Props) {
  const [localPlane, setLocalPlane] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [movingPlanes, setMovingPlanes] = useState<Record<string, boolean>>({});
  const [motionSpeed, setMotionSpeed] = useState(1);
  const [planeOffsets, setPlaneOffsets] = useState<Record<string, number>>({});
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const activePlane = localPlane !== null ? localPlane : parentPlaneSel;

  const handleSelectPlane = (pId: string) => {
    const next = activePlane === pId ? null : pId;
    setLocalPlane(next);
    const info = document.getElementById('info-text-a2');
    if (info) {
      if (next && PLANE_DESCRIPTIONS[next]) {
        info.innerHTML = PLANE_DESCRIPTIONS[next];
      } else {
        info.innerHTML = 'Pasa el cursor o haz clic sobre cada plano para aislarlo en 3D y ver su uso clínico.';
      }
    }
  };

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setLocalPlane(null);
    setMovingPlanes({});
    setMotionSpeed(1);
    setPlaneOffsets({});
  };

  const togglePlaneMotion = (planeId: string) => {
    setMovingPlanes((current) => ({ ...current, [planeId]: !current[planeId] }));
  };

  const offsetSlider = (planeId: string, label: string) => (
    <label onClick={(event) => event.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', marginLeft: 'auto', fontSize: '.56rem', color: 'var(--ink-3)', cursor: 'ew-resize' }}>
      <span>Pos.</span>
      <input aria-label={`Posición del plano ${label}`} type="range" min="-0.42" max="0.42" step="0.01" value={planeOffsets[planeId] ?? 0} onChange={(event) => setPlaneOffsets((current) => ({ ...current, [planeId]: Number(event.target.value) }))} style={{ width: '76px' }} />
    </label>
  );

  return (
    <>
      <div className="module-header">
        <span className="mnum">A2</span>
        <span className="mtitle">Planos de sección</span>
        <span className="msub">Cortes bidimensionales del cuerpo</span>
        <span className="mslide-count">{slideCount ?? '2 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">▦</span> Los tres planos anatómicos
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                <div
                  className={`pill ${activePlane === 'plane-sagittal' ? 'active' : ''}`}
                  data-highlight="plane-sagittal"
                  onClick={() => handleSelectPlane('plane-sagittal')}
                  style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.4rem .55rem', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 700, fontSize: '.7rem', color: 'var(--sagittal)' }}>Sagital</span>
                  <span className="tag">x = cte</span>
                  <span style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>derecha / izquierda</span>
                  <span className="tag" style={{ fontSize: '.52rem' }}>midsagital: x = 0</span>
                  {offsetSlider('plane-sagittal', 'sagital')}
                </div>
                <div
                  className={`pill ${activePlane === 'plane-coronal' ? 'active' : ''}`}
                  data-highlight="plane-coronal"
                  onClick={() => handleSelectPlane('plane-coronal')}
                  style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.4rem .55rem', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 700, fontSize: '.7rem', color: 'var(--coronal)' }}>Coronal</span>
                  <span className="tag">y = cte</span>
                  <span style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>anterior / posterior</span>
                  <span style={{ fontSize: '.58rem', color: 'var(--ink-3)' }}>(frontal)</span>
                  {offsetSlider('plane-coronal', 'coronal')}
                </div>
                <div
                  className={`pill ${activePlane === 'plane-transverse' ? 'active' : ''}`}
                  data-highlight="plane-transverse"
                  onClick={() => handleSelectPlane('plane-transverse')}
                  style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.4rem .55rem', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 700, fontSize: '.7rem', color: 'var(--transverse)' }}>Transverso</span>
                  <span className="tag">z = cte</span>
                  <span style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>superior / inferior</span>
                  <span style={{ fontSize: '.58rem', color: 'var(--ink-3)' }}>(horizontal)</span>
                  {offsetSlider('plane-transverse', 'transverso')}
                </div>
              </div>
              <p
                style={{
                  fontSize: '.64rem',
                  color: 'var(--ink-2)',
                  marginTop: '.4rem',
                  padding: '.35rem .45rem',
                  background: 'var(--paper-2)',
                  borderRadius: '6px',
                }}
              >
                🏥 <strong>En la clínica:</strong> la RM sagital muestra la médula espinal; la TC coronal, los senos paranasales; el corte transverso es el estándar de la radiología de tórax y abdomen.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-a2">
              Pasa el cursor o haz clic sobre cada plano para aislarlo en 3D y ver su uso clínico.
            </div>
          </div>
        </div>
        <div className="sim-area" id="sim-planes" style={{ position: 'relative' }}>

          {/* Panel Lateral HUD de Inspección de Planos en la esquina superior derecha */}
          <HudPanel
            title="PLANOS ANATÓMICOS"
            badge="3 ORTOGONALES"
            icon="▦"
            footer="💡 Clic para aislar el plano en 3D"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                onClick={() => handleSelectPlane('plane-sagittal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activePlane === 'plane-sagittal' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activePlane === 'plane-sagittal' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6d5fbf' }} />
                  <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Sagital</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>x = cte · Der/Izq</span>
              </div>

              <div
                onClick={() => handleSelectPlane('plane-coronal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activePlane === 'plane-coronal' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activePlane === 'plane-coronal' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d6e64' }} />
                  <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Coronal</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>y = cte · Ant/Post</span>
              </div>

              <div
                onClick={() => handleSelectPlane('plane-transverse')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: activePlane === 'plane-transverse' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${activePlane === 'plane-transverse' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c0681e' }} />
                  <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--ink)' }}>Transverso</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-2)' }}>z = cte · Sup/Inf</span>
              </div>
            </div>
          </HudPanel>

          <PlanesCanvas
            planeSel={activePlane}
            showLabels={showLabels}
            showAll={showAll}
            autoRotate={autoRotate}
            movingPlanes={movingPlanes}
            motionSpeed={motionSpeed}
            planeOffsets={planeOffsets}
            resetSignal={resetSignal}
            zoomSignal={zoomSignal}
          />
          <div className="a2-plane-motion-rail" role="group" aria-label="Reproducir movimiento de planos">
            {[
              ['plane-sagittal', 'Sagital'],
              ['plane-coronal', 'Coronal'],
              ['plane-transverse', 'Transverso'],
            ].map(([id, label]) => (
              <button key={id} type="button" aria-pressed={Boolean(movingPlanes[id])} onClick={() => togglePlaneMotion(id)} title={`Mover plano ${label} a lo largo de su eje`}>
                {movingPlanes[id] ? '⏸' : '▶'} {label}
              </button>
            ))}
          </div>
          <div className="prof-controls" data-default-collapsed="true">
            <span className="badge">A2 · 3D</span>
            <span>{activePlane ? 'Plano aislado en 3D' : 'Los 3 planos ortogonales intersecados'}</span>

            <div role="group" aria-label="Animación de planos" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '0.55rem' }}>
              {[
                ['plane-sagittal', 'Sagital'],
                ['plane-coronal', 'Coronal'],
                ['plane-transverse', 'Transverso'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={Boolean(movingPlanes[id])}
                  onClick={() => togglePlaneMotion(id)}
                  title={`Mover plano ${label} a lo largo de su eje`}
                  style={{
                    display: 'none',
                    border: `1px solid ${movingPlanes[id] ? 'var(--teal)' : 'var(--line)'}`,
                    background: movingPlanes[id] ? 'var(--teal-tint)' : 'var(--paper-2)',
                    color: 'var(--ink)', borderRadius: '4px', padding: '2px 5px',
                    fontSize: '0.58rem', cursor: 'pointer',
                  }}
                >
                  {movingPlanes[id] ? '⏸' : '▶'} {label}
                </button>
              ))}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.58rem', color: 'var(--ink-2)' }}>
                Vel.
                <input
                  aria-label="Velocidad de desplazamiento de planos"
                  type="range" min="0.25" max="2" step="0.25" value={motionSpeed}
                  onChange={(e) => setMotionSpeed(Number(e.target.value))}
                  style={{ width: '58px' }}
                />
              </label>
              <label style={{ display: 'none' }}>
                Pos. {activePlane ? activePlane.replace('plane-', '').replace('transverse', 'transverso') : 'sagital'}
                <input
                  aria-label="Posición manual del plano seleccionado"
                  type="range" min="-0.42" max="0.42" step="0.01"
                  value={planeOffsets[activePlane || 'plane-sagittal'] ?? 0}
                  onChange={(e) => setPlaneOffsets((current) => ({ ...current, [activePlane || 'plane-sagittal']: Number(e.target.value) }))}
                  style={{ width: '68px' }}
                />
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              {/* Controles de Zoom integrados */}
              <div style={{ display: 'none' }}>
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
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                  color: 'var(--ink)'
                }}
              >
                Restablecer
              </button>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.66rem' }}>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                Etiquetas 3D
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.66rem' }}>
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                />
                Mostrar todos
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.66rem' }}>
                <input
                  type="checkbox"
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
