import { useState, Suspense } from 'react';
import MovementCanvas from './MovementCanvas';
import { useHarmonicClock } from './three/useHarmonicClock';
import type { MovementType } from './MovementCanvas';
import HudPanel from './HudPanel';
import ChapterImageLightbox from './ChapterImageLightbox';

interface Slide6Props {
  toggleMovementAnimation?: () => void;
  slideCount?: string;
}

interface MovementMeta {
  id: MovementType;
  name: string;
  plane: string;
  axis: string;
  agonist: string;
  antagonist: string;
  pairId?: MovementType;
  formula: string;
  rom: string;
  desc: string;
  biomechanics: string;
}

const MOVEMENTS_DATA: Record<MovementType, MovementMeta> = {
  flexion: {
    id: 'flexion',
    name: 'Flexión',
    plane: 'Plano Sagital',
    axis: 'Eje Transversal (Frontal X)',
    agonist: 'Bíceps braquial / Braquial anterior',
    antagonist: 'Tríceps braquial',
    pairId: 'extension',
    rom: '0° → 135° (Codo)',
    formula: '$\\tau_{\\text{net}} = \\tau_{\\text{bíceps}} - \\tau_{\\text{tríceps}} > 0$',
    desc: '<b>Flexión (Plano Sagital):</b> Reduce el ángulo articular doblando el antebrazo hacia el brazo. El bíceps braquial y braquial anterior actúan como <b>agonistas primarios</b> contrayéndose y ensanchando su vientre muscular, mientras el tríceps se relaja y elonga como <b>antagonista</b>.',
    biomechanics: 'Momento de fuerza flexor sobre la tróclea humeral. El radio y cúbito giran en el plano sagital alrededor del eje transversal del codo.',
  },
  extension: {
    id: 'extension',
    name: 'Extensión',
    plane: 'Plano Sagital',
    axis: 'Eje Transversal (Frontal X)',
    agonist: 'Tríceps braquial',
    antagonist: 'Bíceps braquial / Braquial anterior',
    pairId: 'flexion',
    rom: '135° → 0° (Codo)',
    formula: '$\\tau_{\\text{tríceps}} > \\tau_{\\text{bíceps}} \\implies \\ddot{\\theta} < 0$',
    desc: '<b>Extensión (Plano Sagital):</b> Aumenta el ángulo articular retornando el miembro a la postura recta o hacia posterior. El tríceps braquial es el <b>agonista potente</b>, traccionando del olécranon cubital para alinear el antebrazo.',
    biomechanics: 'Brazo de palanca corto en el olécranon que genera gran velocidad angular en la extensión completa del codo.',
  },
  abduction: {
    id: 'abduction',
    name: 'Abducción',
    plane: 'Plano Coronal (Frontal)',
    axis: 'Eje Anteroposterior (Sagital Z)',
    agonist: 'Deltoides (fibras medias) / Supraespinoso',
    antagonist: 'Pectoral mayor / Dorsal ancho',
    pairId: 'adduction',
    rom: '0° → 95° (Hombro)',
    formula: '$\\vec{F}_{\\text{deltoides}} \\cdot \\vec{r}_{\\perp} = \\tau_{\\text{elevación}}$',
    desc: '<b>Abducción (Plano Coronal):</b> Separa el miembro superior de la línea media del tronco. El supraespinoso inicia los primeros 15° y las fibras medias del deltoides elevan el húmero hasta la horizontal.',
    biomechanics: 'Coopla de fuerzas glenohumeral: el manguito rotador centra la cabeza humeral en la fosa glenoidea contra el ascenso generado por el deltoides.',
  },
  adduction: {
    id: 'adduction',
    name: 'Aducción',
    plane: 'Plano Coronal (Frontal)',
    axis: 'Eje Anteroposterior (Sagital Z)',
    agonist: 'Pectoral mayor / Dorsal ancho',
    antagonist: 'Deltoides (fibras medias)',
    pairId: 'abduction',
    rom: '40° → -20° (Línea media)',
    formula: '$\\vec{F}_{\\text{pectoral}} \\to \\text{Aproximación medial}$',
    desc: '<b>Aducción (Plano Coronal):</b> Aproxima el brazo hacia la línea media corporal o lo cruza por delante del tórax. El pectoral mayor y dorsal ancho actúan como potentes agonistas aductores.',
    biomechanics: 'Gran ventaja mecánica y brazo de momento aductor provisto por la amplia inserción en el esternón y crestas costales.',
  },
  rotation_med: {
    id: 'rotation_med',
    name: 'Rotación Medial (Interna)',
    plane: 'Eje Longitudinal (Vertical Y)',
    axis: 'Eje Longitudinal Diafisario',
    agonist: 'Subescapular / Pectoral mayor',
    antagonist: 'Infraespinoso / Redondo menor',
    pairId: 'rotation_lat',
    rom: '0° → +70° (Axial)',
    formula: '$\\tau_y = I_{yy} \\ddot{\\theta}_y > 0$',
    desc: '<b>Rotación Medial (Interna):</b> Rota la cara anterior del húmero hacia el interior del cuerpo (hacia el ombligo). El músculo subescapular tracciona del troquín (tubérculo menor) en la cara anterior.',
    biomechanics: 'Con el codo a 90°, el antebrazo actúa como aguja indicadora directa del ángulo de rotación axial glenohumeral.',
  },
  rotation_lat: {
    id: 'rotation_lat',
    name: 'Rotación Lateral (Externa)',
    plane: 'Eje Longitudinal (Vertical Y)',
    axis: 'Eje Longitudinal Diafisario',
    agonist: 'Infraespinoso / Redondo menor',
    antagonist: 'Subescapular',
    pairId: 'rotation_med',
    rom: '0° → -65° (Axial)',
    formula: '$\\tau_y = I_{yy} \\ddot{\\theta}_y < 0$',
    desc: '<b>Rotación Lateral (Externa):</b> Rota la cara anterior del húmero hacia afuera, alejándola del plano medio. El infraespinoso y redondo menor tiran del troquíter (tubérculo mayor) desde la fosa infraespinosa posterior.',
    biomechanics: 'Crucial para el despeje subacromial del troquíter durante la elevación del brazo por encima de los 90°.',
  },
  pronation: {
    id: 'pronation',
    name: 'Pronación',
    plane: 'Pivote Radiocubital Oblicuo',
    axis: 'Eje Cabeza Radial ↔ Cabeza Cubital',
    agonist: 'Pronador redondo / Pronador cuadrado',
    antagonist: 'Supinador / Bíceps braquial',
    pairId: 'supination',
    rom: '0° → 80° (Pivote)',
    formula: '$\\theta_{\\text{pivote}} \\in [0^\\circ, 80^\\circ]$',
    desc: '<b>Pronación (Pivote 3D):</b> El hueso radio cruza oblicuamente por delante del cúbito (que permanece fijo en la bisagra). La palma se orienta hacia abajo o hacia posterior.',
    biomechanics: 'La cabeza del radio rota en el ligamento anular mientras su extremo distal describe un arco semicircular sobre la cabeza cubital.',
  },
  supination: {
    id: 'supination',
    name: 'Supinación',
    plane: 'Pivote Radiocubital Oblicuo',
    axis: 'Eje Cabeza Radial ↔ Cabeza Cubital',
    agonist: 'Supinador / Bíceps braquial',
    antagonist: 'Pronador redondo',
    pairId: 'pronation',
    rom: '80° → 0° (Posición anatómica)',
    formula: '$\\theta_{\\text{pivote}} \\to 0^\\circ \\implies \\text{Huesos paralelos}$',
    desc: '<b>Supinación (Pivote 3D):</b> El radio se descruza volviendo a situarse paralelo al cúbito. La palma queda orientada hacia arriba / adelante (postura anatómica estándar). El bíceps actúa como un potentísimo supinador cuando el codo está flexionado.',
    biomechanics: 'El tendón bicipital se desenrolla de la tuberosidad radial produciendo el máximo torque de supinación.',
  },
  circumduction: {
    id: 'circumduction',
    name: 'Circunducción (Cono 3D)',
    plane: 'Movimiento Compuesto Triaxial',
    axis: 'Cono Espacial Alrededor de Glenohumeral',
    agonist: 'Complejo Deltoides + Manguito Rotador',
    antagonist: 'Coordinación secuencial continua',
    rom: '360° Fase Cónica',
    formula: '$\\vec{r}(t) = R_0\\cos(\\omega t)\\hat{i} + R_0\\sin(\\omega t)\\hat{k} - H\\hat{j}$',
    desc: '<b>Circunducción (Cono 3D):</b> Movimiento compuesto que encadena de forma continua flexión, abducción, extensión y aducción. La articulación del hombro constituye el vértice fijo del cono y la mano traza la circunferencia base.',
    biomechanics: 'Requiere la activación rítmica secuencial en anillo de deltoides anterior → medio → posterior → aductores pectorales.',
  },
};

export default function Slide6({ toggleMovementAnimation, slideCount }: Slide6Props) {
  const [movement, setMovement] = useState<MovementType>('flexion');
  const [progress, setProgress] = useState<number>(0.65);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);
  const [showMuscles, setShowMuscles] = useState<boolean>(true);
  const [showPlanes, setShowPlanes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const currentMeta = MOVEMENTS_DATA[movement];

  const handleSelectMovement = (mId: MovementType) => {
    setMovement(mId);
    setProgress(0.65);
  };

  // Loop de animación continua (reloj compartido)
  useHarmonicClock({ playing: isAnimating, speed: animSpeed }, (t) => {
    if (movement === 'circumduction') {
      setProgress((t * 0.35) % 1.0);
    } else {
      setProgress((Math.sin(t * 1.8) + 1) / 2); // pendular suave 0..1
    }
  });

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setProgress(0.65);
    setIsAnimating(false);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B3</span>
        <span className="mtitle">Tipos de movimiento</span>
        <span className="msub">Pares antagónicos y cinemática articular 3D</span>
        <span className="mslide-count">{slideCount ?? '3 / 4'}</span>
      </div>

      <div className="content-grid">
        <div className="theory">
          {/* Tarjeta 1: Selector Anatómico de Movimientos */}
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">↔️</span> Pares de movimiento alrededor de ejes
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '.62rem' }}>
                <span
                  className={`pill ${movement === 'flexion' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('flexion')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Flexión</b>: doblar
                </span>
                <span
                  className={`pill ${movement === 'extension' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('extension')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Extensión</b>: estirar
                </span>
                <span
                  className={`pill ${movement === 'abduction' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('abduction')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Abducción</b>: alejar
                </span>
                <span
                  className={`pill ${movement === 'adduction' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('adduction')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Aducción</b>: acercar
                </span>
                <span
                  className={`pill ${movement === 'rotation_med' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('rotation_med')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Rot. Medial</b>: interna
                </span>
                <span
                  className={`pill ${movement === 'rotation_lat' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('rotation_lat')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Rot. Lateral</b>: externa
                </span>
                <span
                  className={`pill ${movement === 'pronation' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('pronation')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Pronación</b>: palma abajo
                </span>
                <span
                  className={`pill ${movement === 'supination' ? 'active' : ''}`}
                  onClick={() => handleSelectMovement('supination')}
                  style={{ cursor: 'pointer' }}
                >
                  <b>Supinación</b>: palma arriba
                </span>
              </div>

              {/* Botón especial para Circunducción 3D */}
              <div
                className={`pill ${movement === 'circumduction' ? 'active' : ''}`}
                onClick={() => handleSelectMovement('circumduction')}
                style={{
                  marginTop: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                <span><b>Circunducción</b>: cono compuesto 3D</span>
                <span style={{ fontSize: '0.52rem', background: 'var(--teal-tint)', color: 'var(--teal-deep)', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                  TRIAXIAL
                </span>
              </div>

              <div style={{ marginTop: '0.45rem', padding: '6px 8px', background: 'var(--paper-2)', borderRadius: '4px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '0.58rem', color: 'var(--ink-2)', fontWeight: 600 }}>
                  Par Antagónico Activo:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', fontSize: '0.62rem' }}>
                  <span style={{ color: '#b02318', fontWeight: 'bold' }}>
                    Agonista: {currentMeta.agonist.split('/')[0]}
                  </span>
                  {currentMeta.pairId && (
                    <button
                      type="button"
                      onClick={() => handleSelectMovement(currentMeta.pairId!)}
                      style={{
                        background: 'var(--teal-tint)',
                        border: '1px solid var(--teal)',
                        color: 'var(--teal-deep)',
                        borderRadius: '3px',
                        fontSize: '0.55rem',
                        fontWeight: 600,
                        padding: '1px 6px',
                        cursor: 'pointer',
                      }}
                    >
                      ↔ Cambiar a {MOVEMENTS_DATA[currentMeta.pairId].name}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '0.58rem', color: '#8c534b', marginTop: '2px' }}>
                  Antagonista: {currentMeta.antagonist}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Figuras Anatómicas Clásicas */}
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖼️</span> Movimientos antagónicos (Figs. 1.9–1.10)
            </div>
            <div className="card-body">
              <div className="figure-pair" style={{ height: '130px' }}>
                <ChapterImageLightbox src="/assets/cap1/19.png" alt="Movimientos antagónicos" label="FIG 1.9 · Movimientos antagónicos">
                  <span className="fig-num">FIG 1.9</span>
                  <img src="/assets/cap1/19.png" alt="Movimientos antagónicos" />
                  <figcaption>Flexión · extensión · abducción · aducción</figcaption>
                </ChapterImageLightbox>
                <ChapterImageLightbox src="/assets/cap1/110.png" alt="Más movimientos antagónicos" label="FIG 1.10 · Rotación, pronación y supinación">
                  <span className="fig-num">FIG 1.10</span>
                  <img src="/assets/cap1/110.png" alt="Más movimientos antagónicos" />
                  <figcaption>Rotación · pronación · supinación</figcaption>
                </ChapterImageLightbox>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Apunte de Cátedra & Cinemática */}
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra · {currentMeta.name}
            </div>
            <div className="a-text" id="info-text-b3">
              <div dangerouslySetInnerHTML={{ __html: currentMeta.desc }} />
              <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--line)', fontSize: '0.58rem', color: 'var(--ink-2)' }}>
                <b>Eje cinemático:</b> {currentMeta.axis} · <b>ROM:</b> {currentMeta.rom}
              </div>
              <div style={{ marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.56rem', color: 'var(--teal-deep)' }}>
                {currentMeta.formula}
              </div>
            </div>
          </div>
        </div>

        {/* Área del Simulador 3D con Huesos Reales y Músculos Estriados */}
        <div className="sim-area" style={{ position: 'relative' }}>

          {/* Panel Lateral HUD de Pares Antagónicos en la esquina superior derecha */}
          <HudPanel
            title="PARES ANTAGÓNICOS"
            badge={currentMeta.name.toUpperCase()}
            icon="↔️"
            footer="💡 Huesos BodyParts3D con vientres musculares estriados"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {/* Sección Plano Sagital */}
              <div style={{ fontSize: '0.50rem', fontWeight: 'bold', color: 'var(--ink-3)', marginTop: '1px', textTransform: 'uppercase' }}>
                Plano Sagital
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                <div
                  onClick={() => handleSelectMovement('flexion')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'flexion' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'flexion' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b02318' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Flexión</span>
                </div>
                <div
                  onClick={() => handleSelectMovement('extension')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'extension' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'extension' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d6e64' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Extensión</span>
                </div>
              </div>

              {/* Sección Plano Coronal */}
              <div style={{ fontSize: '0.50rem', fontWeight: 'bold', color: 'var(--ink-3)', marginTop: '3px', textTransform: 'uppercase' }}>
                Plano Coronal
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                <div
                  onClick={() => handleSelectMovement('abduction')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'abduction' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'abduction' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5c6bc0' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Abducción</span>
                </div>
                <div
                  onClick={() => handleSelectMovement('adduction')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'adduction' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'adduction' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Aducción</span>
                </div>
              </div>

              {/* Sección Rotación Axial */}
              <div style={{ fontSize: '0.50rem', fontWeight: 'bold', color: 'var(--ink-3)', marginTop: '3px', textTransform: 'uppercase' }}>
                Rotación Axial
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                <div
                  onClick={() => handleSelectMovement('rotation_med')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'rotation_med' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'rotation_med' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Rot. Medial</span>
                </div>
                <div
                  onClick={() => handleSelectMovement('rotation_lat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'rotation_lat' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'rotation_lat' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Rot. Lateral</span>
                </div>
              </div>

              {/* Sección Pivote Radiocubital */}
              <div style={{ fontSize: '0.50rem', fontWeight: 'bold', color: 'var(--ink-3)', marginTop: '3px', textTransform: 'uppercase' }}>
                Pivote Radiocubital
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                <div
                  onClick={() => handleSelectMovement('pronation')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'pronation' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'pronation' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e11d48' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Pronación</span>
                </div>
                <div
                  onClick={() => handleSelectMovement('supination')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: movement === 'supination' ? 'var(--teal-tint)' : 'transparent',
                    border: `1px solid ${movement === 'supination' ? 'var(--teal)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Supinación</span>
                </div>
              </div>

              {/* Circunducción 3D */}
              <div
                onClick={() => handleSelectMovement('circumduction')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '3px',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: movement === 'circumduction' ? 'var(--teal-tint)' : 'transparent',
                  border: `1px solid ${movement === 'circumduction' ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>Circunducción (Cono)</span>
                </div>
                <span style={{ fontSize: '0.52rem', color: 'var(--teal-deep)', fontWeight: 'bold' }}>3D</span>
              </div>

              {/* Capas Visuales Toggles */}
              <div style={{ marginTop: '5px', paddingTop: '4px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '0.48rem', fontWeight: 'bold', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                  Capas Visuales
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowMuscles((m) => !m)}
                    style={{
                      flex: '1 1 auto',
                      fontSize: '0.54rem',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: showMuscles ? 'var(--teal-tint)' : 'var(--paper-2)',
                      border: `1px solid ${showMuscles ? 'var(--teal)' : 'var(--line)'}`,
                      color: showMuscles ? 'var(--teal-deep)' : 'var(--ink-3)',
                      fontWeight: 600,
                    }}
                  >
                    💪 Músculos {showMuscles ? '✓' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPlanes((p) => !p)}
                    style={{
                      flex: '1 1 auto',
                      fontSize: '0.54rem',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: showPlanes ? 'var(--teal-tint)' : 'var(--paper-2)',
                      border: `1px solid ${showPlanes ? 'var(--teal)' : 'var(--line)'}`,
                      color: showPlanes ? 'var(--teal-deep)' : 'var(--ink-3)',
                      fontWeight: 600,
                    }}
                  >
                    📐 Planos {showPlanes ? '✓' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabels((l) => !l)}
                    style={{
                      flex: '1 1 auto',
                      fontSize: '0.54rem',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: showLabels ? 'var(--teal-tint)' : 'var(--paper-2)',
                      border: `1px solid ${showLabels ? 'var(--teal)' : 'var(--line)'}`,
                      color: showLabels ? 'var(--teal-deep)' : 'var(--ink-3)',
                      fontWeight: 600,
                    }}
                  >
                    🏷️ Rótulos {showLabels ? '✓' : ''}
                  </button>
                </div>
              </div>
            </div>
          </HudPanel>

          <Suspense fallback={<div className="loading-overlay">Cargando anatomía 3D...</div>}>
            <MovementCanvas
              movement={movement}
              progress={progress}
              showMuscles={showMuscles}
              showPlanes={showPlanes}
              showLabels={showLabels}
              resetSignal={resetSignal}
              zoomSignal={zoomSignal}
            />
          </Suspense>
          <div className="prof-controls">
            <span className="badge">B3 · 3D</span>
            <span style={{ color: 'var(--ink-2)', fontSize: '0.66rem', fontWeight: 600 }}>
              {currentMeta.name}: <span style={{ color: 'var(--teal-deep)' }}>{currentMeta.plane}</span>
            </span>

            {/* Slider de Fase y Ángulo Articular */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.62rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Fase</span>:
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(progress * 100)}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setProgress(parseFloat(e.target.value) / 100);
                  }}
                  style={{ width: '75px' }}
                />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.60rem', minWidth: '28px' }}>
                  {Math.round(progress * 100)}%
                </span>
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
              {/* Selector de Velocidad */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 3px' }}>
                {[0.5, 1.0, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setAnimSpeed(spd)}
                    style={{
                      border: 'none',
                      background: animSpeed === spd ? 'var(--teal)' : 'transparent',
                      color: animSpeed === spd ? '#ffffff' : 'var(--ink-3)',
                      borderRadius: '2px',
                      padding: '1px 4px',
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Botón Animar / Pausar */}
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
                {isAnimating ? '⏸ Pausar' : '▶ Animar'}
              </button>

              {/* Controles de Zoom */}
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

              {/* Botón Restablecer */}
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

        {/* Barra de Controles Inferior del Profesor */}
      </div>
    </>
  );
}
