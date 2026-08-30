import React, { useState, useEffect, useRef } from 'react';
import AntagonistCanvas, { type AntagonistMode, type EyeGaze } from './AntagonistCanvas';
import HudPanel from './HudPanel';
import ChapterImageLightbox from './ChapterImageLightbox';

const EYE_GAZE_PRESETS: Record<EyeGaze, { x: number; y: number; label: string; activeMuscles: string; desc: string }> = {
  center: {
    x: 0,
    y: 0,
    label: 'Centro',
    activeMuscles: 'Tono basal equilibrado',
    desc: '<b>Mirada central:</b> Los 6 músculos extraoculares mantienen un tono muscular basal en perfecto equilibrio ortogonal.',
  },
  right: {
    x: 1,
    y: 0,
    label: 'Derecha (Abducción)',
    activeMuscles: 'Recto lateral activo (RL) · Recto medial relajado',
    desc: '<b>Mirada a la derecha (Abducción):</b> El músculo <b>Recto lateral</b> se contrae activamente tirando de la esclera temporal, mientras el <b>Recto medial</b> se relaja.',
  },
  left: {
    x: -1,
    y: 0,
    label: 'Izquierda (Aducción)',
    activeMuscles: 'Recto medial activo (RM) · Recto lateral relajado',
    desc: '<b>Mirada a la izquierda (Aducción):</b> El músculo <b>Recto medial</b> se contrae acercando la córnea al tabique nasal, mientras su antagonista se distiende.',
  },
  up: {
    x: 0,
    y: 1,
    label: 'Arriba (Elevación)',
    activeMuscles: 'Recto superior + Oblicuo inferior (RS + OI)',
    desc: '<b>Elevación:</b> El <b>Recto superior</b> y el <b>Oblicuo inferior</b> colaboran para elevar el polo anterior; el recto superior aporta además intorsión y aducción, compensadas por el oblicuo inferior.',
  },
  down: {
    x: 0,
    y: -1,
    label: 'Abajo (Depresión)',
    activeMuscles: 'Recto inferior + Oblicuo superior (RI + OS)',
    desc: '<b>Depresión:</b> El <b>Recto inferior</b> y el <b>Oblicuo superior</b> colaboran para descender el polo anterior; sus acciones torsionales se compensan entre sí.',
  },
  up_right: {
    x: 0.85,
    y: 0.85,
    label: 'Arriba-Derecha',
    activeMuscles: 'Recto superior + Recto lateral',
    desc: '<b>Mirada oblicua Arriba-Derecha:</b> Sinergia combinada del Recto superior y el Recto lateral en el mismo ojo.',
  },
  up_left: {
    x: -0.85,
    y: 0.85,
    label: 'Arriba-Izquierda',
    activeMuscles: 'Oblicuo inferior (OI) + Recto medial',
    desc: '<b>Mirada Arriba-Izquierda:</b> En aducción, el <b>Oblicuo inferior</b> se convierte en el elevador primario más eficiente.',
  },
  down_right: {
    x: 0.85,
    y: -0.85,
    label: 'Abajo-Derecha',
    activeMuscles: 'Recto inferior + Recto lateral',
    desc: '<b>Mirada Abajo-Derecha:</b> Acción combinada de depresión por el Recto inferior y abducción por el Recto lateral.',
  },
  down_left: {
    x: -0.85,
    y: -0.85,
    label: 'Abajo-Izquierda',
    activeMuscles: 'Oblicuo superior (OS) + Recto medial',
    desc: '<b>Mirada Abajo-Izquierda (Test troclear):</b> En aducción, el <b>Oblicuo superior</b> que pasa por la polea troclear tira hacia abajo e intorsiona el ojo con máxima palanca.',
  },
};

export default function Slide7({ slideCount }: { slideCount?: string }) {
  const [mode, setMode] = useState<AntagonistMode>('eye');
  const [selectedGaze, setSelectedGaze] = useState<EyeGaze>('center');
  const [gaze, setGaze] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [armFlexion, setArmFlexion] = useState<number>(0.4);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const animTimeRef = useRef(0);
  const animRafRef = useRef<number | null>(null);

  const currentGazeData = EYE_GAZE_PRESETS[selectedGaze];

  const handleSelectGaze = (gId: EyeGaze) => {
    setSelectedGaze(gId);
    setSelectedMuscle(null);
    const target = EYE_GAZE_PRESETS[gId];
    setGaze({ x: target.x, y: target.y });
    setIsAnimating(false);

    const info = document.getElementById('info-text-b4');
    if (info && target.desc) {
      info.innerHTML = target.desc;
    }
  };

  const handleSelectMuscle = (mId: string) => {
    setSelectedMuscle(mId);
    setIsAnimating(false);
    if (mId === 'lateral') setGaze({ x: 1, y: 0 });
    else if (mId === 'medial') setGaze({ x: -1, y: 0 });
    else if (mId === 'superior') setGaze({ x: 0, y: 1 });
    else if (mId === 'inferior') setGaze({ x: 0, y: -1 });
    else if (mId === 'osuperior') setGaze({ x: -0.85, y: -0.85 });
    else if (mId === 'oinferior') setGaze({ x: -0.85, y: 0.85 });
  };

  // Loop de animación armónica
  useEffect(() => {
    if (!isAnimating) {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      return;
    }

    let last = performance.now();
    const hTestOrder: EyeGaze[] = ['center', 'right', 'up_right', 'down_right', 'right', 'center', 'left', 'up_left', 'down_left', 'left', 'center'];

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      if (mode === 'eye') {
        // Recorrido automático del test clínico en H
        const step = Math.floor((t * 0.8) % hTestOrder.length);
        const gKey = hTestOrder[step];
        const target = EYE_GAZE_PRESETS[gKey];
        setSelectedGaze(gKey);
        setGaze({ x: target.x, y: target.y });
      } else {
        // Flexión/Extensión armónica del brazo
        setArmFlexion((Math.sin(t * 2.2) + 1) / 2);
      }

      animRafRef.current = requestAnimationFrame(loop);
    };

    animRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, [isAnimating, mode]);

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setIsAnimating(false);
    setSelectedGaze('center');
    setGaze({ x: 0, y: 0 });
    setArmFlexion(0.4);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B4</span>
        <span className="mtitle">Músculos antagonistas</span>
        <span className="msub">El brazo y el ojo: 6 músculos, 6 direcciones</span>
        <span className="mslide-count">{slideCount ?? '4 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔄</span> Principio antagonista
            </div>
            <div className="card-body">
              <p>
                Los músculos <strong>solo se contraen</strong> (acortan bajo tensión); nunca empujan. Cada movimiento necesita su <strong>antagonista</strong> para relajar y permitir el retorno.
              </p>
              <div className="row">
                <span
                  className={`pill ${mode === 'arm' ? 'active' : ''}`}
                  onClick={() => { setMode('arm'); setIsAnimating(false); }}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Brazo:</b> Bíceps (flexión) ↔ Tríceps (extensión)
                </span>
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)', marginTop: '.2rem' }}>
                El par bíceps/tríceps conforma una <strong>palanca de tercer género</strong> (fulcro en codo, esfuerzo en el radio).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👁️</span> Músculos del ojo (Tablas 1.3–1.4)
            </div>
            <div className="card-body">
              <table className="interactive-table">
                <tbody>
                  <tr><th>Músculo</th><th>Acción Principal</th></tr>
                  <tr
                    onClick={() => { setMode('eye'); handleSelectMuscle('lateral'); }}
                    style={{ cursor: 'pointer', background: selectedMuscle === 'lateral' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Recto lateral (RL)</b></td><td>Abducción (hacia afuera)</td>
                  </tr>
                  <tr
                    onClick={() => { setMode('eye'); handleSelectMuscle('medial'); }}
                    style={{ cursor: 'pointer', background: selectedMuscle === 'medial' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Recto medial (RM)</b></td><td>Aducción (hacia la nariz)</td>
                  </tr>
                  <tr
                    onClick={() => { setMode('eye'); handleSelectMuscle('superior'); }}
                    style={{ cursor: 'pointer', background: selectedMuscle === 'superior' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Recto superior (RS)</b></td><td>Elevación</td>
                  </tr>
                  <tr
                    onClick={() => { setMode('eye'); handleSelectMuscle('inferior'); }}
                    style={{ cursor: 'pointer', background: selectedMuscle === 'inferior' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Recto inferior (RI)</b></td><td>Depresión</td>
                  </tr>
                  <tr
                    onClick={() => { setMode('eye'); handleSelectMuscle('osuperior'); }}
                    style={{ cursor: 'pointer', background: selectedMuscle === 'osuperior' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Oblicuo superior (OS)</b></td><td>Depresión (en aducción) + tróclea</td>
                  </tr>
                  <tr
                    onClick={() => { setMode('eye'); handleSelectMuscle('oinferior'); }}
                    style={{ cursor: 'pointer', background: selectedMuscle === 'oinferior' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Oblicuo inferior (OI)</b></td><td>Elevación (en aducción)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖼️</span> Referencias (Figs. 1.12–1.14)
            </div>
            <div className="card-body">
              <div className="figure-pair" style={{ height: '120px' }}>
                <ChapterImageLightbox src="/assets/cap1/112.png" alt="Flexión y extensión del antebrazo" label="FIG 1.12 · Palanca: bíceps vs. tríceps">
                  <span className="fig-num">FIG 1.12</span>
                  <img src="/assets/cap1/112.png" alt="Flexión y extensión del antebrazo" />
                  <figcaption>Palanca: bíceps vs. tríceps</figcaption>
                </ChapterImageLightbox>
                <ChapterImageLightbox src="/assets/cap1/114.png" alt="Músculos oculares" label="FIG 1.14 · Los 6 músculos del ojo">
                  <span className="fig-num">FIG 1.14</span>
                  <img src="/assets/cap1/114.png" alt="Músculos oculares" />
                  <figcaption>Los 6 músculos del ojo</figcaption>
                </ChapterImageLightbox>
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-b4">
              {mode === 'eye' ? (
                currentGazeData.desc ? (
                  <span dangerouslySetInnerHTML={{ __html: currentGazeData.desc }} />
                ) : (
                  'Cada ojo tiene 3 pares de antagonistas → 6 direcciones cardinales de mirada.'
                )
              ) : (
                'En el brazo, el bíceps y tríceps forman una palanca de 3.er género: el esfuerzo actúa entre el fulcro (codo) y la carga (mano).'
              )}
            </div>
          </div>
        </div>
        <div className="sim-area" style={{ position: 'relative' }}>

          {/* Panel Lateral HUD de Pares Antagónicos en la esquina superior derecha */}
          <HudPanel
            title={mode === 'eye' ? 'MOTOR OCULAR 3D' : 'PALANCA 3.ER GÉNERO'}
            badge={mode === 'eye' ? '6 MÚSCULOS' : 'BÍCEPS / TRÍCEPS'}
            icon="👁️"
            footer={mode === 'eye' ? '💡 Músculos rojos = contraídos activamente' : '💡 Desliza la contracción del bíceps'}
          >
            {mode === 'eye' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* 3 Pares de Antagonistas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.58rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: gaze.x !== 0 ? 'var(--teal-tint)' : 'transparent', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--ink)' }}>↔ Horizontal:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--teal-deep)' }}>RL ↔ RM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: gaze.y !== 0 ? 'var(--teal-tint)' : 'transparent', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--ink)' }}>↕ Vertical:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--teal-deep)' }}>RS ↔ RI</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: (gaze.x !== 0 && gaze.y !== 0) ? 'var(--teal-tint)' : 'transparent', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--ink)' }}>🔀 Oblicuo:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--teal-deep)' }}>OS (Tróclea) ↔ OI</span>
                  </div>
                </div>

                {/* Brújula / Matriz de 9 miradas cardinales */}
                <div style={{ marginTop: '4px', borderTop: '1px solid var(--line)', paddingTop: '4px' }}>
                  <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 'bold' }}>
                    Miradas Cardinales (Test en H):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', marginTop: '3px' }}>
                    {(['up_left', 'up', 'up_right', 'left', 'center', 'right', 'down_left', 'down', 'down_right'] as EyeGaze[]).map((gKey) => {
                      const isSel = selectedGaze === gKey;
                      const symbols: Record<EyeGaze, string> = {
                        up_left: '↖', up: '↑', up_right: '↗',
                        left: '←', center: '•', right: '→',
                        down_left: '↙', down: '↓', down_right: '↘',
                      };
                      return (
                        <button
                          key={gKey}
                          type="button"
                          onClick={() => handleSelectGaze(gKey)}
                          style={{
                            border: `1px solid ${isSel ? 'var(--teal)' : 'var(--line)'}`,
                            background: isSel ? 'var(--teal-tint)' : 'var(--paper-2)',
                            color: isSel ? 'var(--teal-deep)' : 'var(--ink)',
                            fontWeight: isSel ? 700 : 500,
                            borderRadius: '3px',
                            padding: '2px 0',
                            fontSize: '0.64rem',
                            cursor: 'pointer',
                          }}
                        >
                          {symbols[gKey]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 5px', background: armFlexion > 0.35 ? 'var(--teal-tint)' : 'transparent', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Bíceps (Flexor):</span>
                  <span style={{ color: armFlexion > 0.35 ? '#b02318' : 'var(--ink-3)', fontWeight: 'bold' }}>
                    {armFlexion > 0.35 ? 'ACTIVO (Tensión)' : 'Relajado'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 5px', background: armFlexion < 0.45 ? 'var(--teal-tint)' : 'transparent', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Tríceps (Extensor):</span>
                  <span style={{ color: armFlexion < 0.45 ? '#b02318' : 'var(--ink-3)', fontWeight: 'bold' }}>
                    {armFlexion < 0.45 ? 'ACTIVO (Tensión)' : 'Relajado'}
                  </span>
                </div>
                <div style={{ marginTop: '4px', borderTop: '1px dashed var(--line)', paddingTop: '4px', fontSize: '0.54rem', color: 'var(--ink-3)' }}>
                  📐 <b>Palanca de 3.er Género:</b> Fulcro en el codo, Esfuerzo en el bíceps, Carga en la mano.
                </div>
              </div>
            )}
          </HudPanel>

          <AntagonistCanvas
            mode={mode}
            gaze={gaze}
            selectedMuscle={selectedMuscle}
            armFlexion={armFlexion}
            resetSignal={resetSignal}
            zoomSignal={zoomSignal}
          />
          <div className="prof-controls">
            {/* Selector de Modo Dual: Ojo vs Brazo */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: '5px',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => { setMode('eye'); setIsAnimating(false); }}
                style={{
                  border: 'none',
                  background: mode === 'eye' ? 'var(--teal)' : 'transparent',
                  color: mode === 'eye' ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                👁️ Ojo 3D (6 Músculos)
              </button>
              <button
                type="button"
                onClick={() => { setMode('arm'); setIsAnimating(false); }}
                style={{
                  border: 'none',
                  background: mode === 'arm' ? 'var(--teal)' : 'transparent',
                  color: mode === 'arm' ? '#fff' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🦾 Brazo y Palanca
              </button>
            </div>

            {mode === 'eye' ? (
              <span style={{ color: 'var(--ink-2)', fontSize: '0.64rem', fontWeight: 600 }}>
                Mirada: <span style={{ color: 'var(--teal-deep)' }}>{currentGazeData.label}</span>
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem' }}>
                <span>Flexión:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(armFlexion * 100)}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setArmFlexion(parseFloat(e.target.value) / 100);
                  }}
                  style={{ width: '65px' }}
                />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.60rem' }}>
                  {Math.round(armFlexion * 100)}%
                </span>
              </div>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setIsAnimating((a) => !a)}
                style={{
                  background: isAnimating ? 'var(--teal-tint)' : 'var(--paper-2)',
                  borderColor: isAnimating ? 'var(--teal)' : 'var(--line)',
                  color: isAnimating ? 'var(--teal-deep)' : 'var(--ink)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isAnimating ? '⏸ Pausar' : (mode === 'eye' ? '▶ Test en H' : '▶ Animar')}
              </button>

              {/* Controles de Zoom integrados */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 4px' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-3)' }}>Zoom</span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Alejar vista (Zoom −)"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 2px' }}
                >
                  −
                </button>
                <span style={{ color: 'var(--line)', fontSize: '0.60rem' }}>|</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Acercar vista (Zoom +)"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 2px' }}
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
