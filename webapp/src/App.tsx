import React, { useState, Suspense, lazy } from 'react';
import './App.css';

// Lazy loading de todos los 13 capítulos para rendimiento y modularidad óptima
const Capitulo1 = lazy(() => import('./chapters/Capitulo1'));
const Capitulo2 = lazy(() => import('./chapters/cap2/Capitulo2'));
const Capitulo3 = lazy(() => import('./chapters/cap3/Capitulo3'));
const Capitulo4 = lazy(() => import('./chapters/cap4/Capitulo4'));
const Capitulo5 = lazy(() => import('./chapters/cap5/Capitulo5'));
const Capitulo6 = lazy(() => import('./chapters/cap6/Capitulo6'));
const Capitulo7 = lazy(() => import('./chapters/cap7/Capitulo7'));
const Capitulo8 = lazy(() => import('./chapters/cap8/Capitulo8'));
const Capitulo9 = lazy(() => import('./chapters/cap9/Capitulo9'));
const Capitulo10 = lazy(() => import('./chapters/cap10/Capitulo10'));
const Capitulo11 = lazy(() => import('./chapters/cap11/Capitulo11'));
const Capitulo12 = lazy(() => import('./chapters/cap12/Capitulo12'));
const Capitulo13 = lazy(() => import('./chapters/cap13/Capitulo13'));

interface ChapterMeta {
  id: number;
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  badgeColor: string;
  available?: boolean;
}

const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    num: 'Capítulo 1',
    title: 'Antropometría y Anatomía',
    subtitle: 'Terminología, el Humano Estándar y el Escalado',
    desc: 'Sistemas de coordenadas, planos anatómicos, grados de libertad, proporciones corporales y alometría.',
    icon: '🧭',
    badgeColor: '#0d6e64',
    available: true,
  },
  {
    id: 2,
    num: 'Capítulo 2',
    title: 'Estática del Cuerpo',
    subtitle: 'Fuerzas, torques y equilibrio articular',
    desc: 'Equilibrio estático, palancas corporales (clases 1, 2 y 3), fuerzas en articulaciones, columna lumbar y mandíbula.',
    icon: '⚖️',
    badgeColor: '#0d6e64',
    available: false,
  },
  {
    id: 3,
    num: 'Capítulo 3',
    title: 'El Movimiento',
    subtitle: 'Cinemática, dinámica y bioenergética',
    desc: 'Bipedestación, marcha humana, carrera, saltos, lanzamientos, bateo, colisiones y aerodinámica balística.',
    icon: '🏃',
    badgeColor: '#0d6e64',
    available: false,
  },
  {
    id: 4,
    num: 'Capítulo 4',
    title: 'Propiedades Mecánicas',
    subtitle: 'Elasticidad, resistencia y reología tisular',
    desc: 'Esfuerzo-deformación, módulo de Young, viscoelasticidad (Maxwell/Voigt), microestructura ósea y fracturas.',
    icon: '🦴',
    badgeColor: '#a92a1e',
    available: false,
  },
  {
    id: 5,
    num: 'Capítulo 5',
    title: 'Músculos',
    subtitle: 'Mecánica de la contracción y generación de fuerza',
    desc: 'Sarcómeros, puentes cruzados, modelo de Hill, relación fuerza-longitud-velocidad, electromiografía (EMG).',
    icon: '💪',
    badgeColor: '#a92a1e',
    available: false,
  },
  {
    id: 6,
    num: 'Capítulo 6',
    title: 'Metabolismo, Energía y Calor',
    subtitle: 'Termodinámica fisiológica y bioenergética',
    desc: 'Tasa metabólica basal (BMR), leyes alométricas de Kleiber, termorregulación, conducción, convección y radiación.',
    icon: '🔥',
    badgeColor: '#a92a1e',
    available: false,
  },
  {
    id: 7,
    num: 'Capítulo 7',
    title: 'Fluidos del Cuerpo',
    subtitle: 'Presión de Fluidos, Flujo y Movimiento en Fluidos',
    desc: 'Presión hidrostática, ley de Laplace, continuidad y Bernoulli, Poiseuille, compliancia vascular, leyes de Fick, natación y vuelo.',
    icon: '🩸',
    badgeColor: '#0d6e64',
    available: false,
  },
  {
    id: 8,
    num: 'Capítulo 8',
    title: 'Sistema Cardiovascular',
    subtitle: 'Hemodinámica, trabajo cardíaco y modelos vasculares',
    desc: 'Gasto cardíaco (5 L/min), efecto gravitacional, Reynolds y turbulencia, modelo Windkessel y disfunción valvular.',
    icon: '🫀',
    badgeColor: '#5d4fa8',
    available: false,
  },
  {
    id: 9,
    num: 'Capítulo 9',
    title: 'Los Pulmones y la Respiración',
    subtitle: 'Mecánica respiratoria, surfactante y trabajo pulmonar',
    desc: 'Árbol bronquial, ley de Laplace alveolar y surfactante, curva P-V e histéresis, espirometría, hipoxia en altitud y eficiencia.',
    icon: '🫁',
    badgeColor: '#5d4fa8',
    available: false,
  },
  {
    id: 10,
    num: 'Capítulo 10',
    title: 'Sonido, Habla y Audición',
    subtitle: 'Acústica física, fonación, resonadores y percepción auditiva',
    desc: 'Ondas sonoras, escala en dB, impedancia acústica, formantes vocales, modelo de dos tubos, cóclea, fones y ecografía Doppler.',
    icon: '👂',
    badgeColor: '#0d6e64',
    available: false,
  },
  {
    id: 11,
    num: 'Capítulo 11',
    title: 'Luz, Ojos y Visión',
    subtitle: 'Óptica ocular, fotorreceptores y visión del color',
    desc: 'Anatomía del globo, bastones y conos, lentes y vergencias, ley de Snell, ojo esquemático, difracción, ametropías y espacio CIE.',
    icon: '🧿',
    badgeColor: '#0d6e64',
    available: false,
  },
  {
    id: 12,
    num: 'Capítulo 12',
    title: 'Propiedades Eléctricas y Magnéticas',
    subtitle: 'Bioelectricidad, neuronas, modelo de cable, ECG y EEG',
    desc: 'Potencial de Nernst/Goldman, potencial de acción de Hodgkin-Huxley, dipolo cardíaco de Einthoven, ECG de 12 derivaciones y EEG.',
    icon: '⚡',
    badgeColor: '#9a5b00',
    available: false,
  },
  {
    id: 13,
    num: 'Capítulo 13',
    title: 'Retroalimentación y Control',
    subtitle: 'Cibernética fisiológica, homeostasis y estabilidad',
    desc: 'Homeostasis del LEC, criterio de estabilidad con retardo (g·τd ≤ π/2), regulación térmica (bucle abierto vs cerrado), barorreflejo y pupila 3D.',
    icon: '🔁',
    badgeColor: '#0d6e64',
    available: false,
  },
];

export default function App() {
  const [chapter, setChapter] = useState<number | null>(null);

  const renderActiveChapter = () => {
    const onBack = () => setChapter(null);
    switch (chapter) {
      case 1:
        return <Capitulo1 onBack={onBack} />;
      case 2:
        return <Capitulo2 onBack={onBack} />;
      case 3:
        return <Capitulo3 onBack={onBack} />;
      case 4:
        return <Capitulo4 onBack={onBack} />;
      case 5:
        return <Capitulo5 onBack={onBack} />;
      case 6:
        return <Capitulo6 onBack={onBack} />;
      case 7:
        return <Capitulo7 onBack={onBack} />;
      case 8:
        return <Capitulo8 onBack={onBack} />;
      case 9:
        return <Capitulo9 onBack={onBack} />;
      case 10:
        return <Capitulo10 onBack={onBack} />;
      case 11:
        return <Capitulo11 onBack={onBack} />;
      case 12:
        return <Capitulo12 onBack={onBack} />;
      case 13:
        return <Capitulo13 onBack={onBack} />;
      default:
        return null;
    }
  };

  if (chapter !== null) {
    return (
      <Suspense
        fallback={
          <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif, Georgia, serif)', fontSize: '1.2rem', color: 'var(--ink-2, #43505c)' }}>
            Cargando Capítulo {chapter}...
          </div>
        }
      >
        {renderActiveChapter()}
      </Suspense>
    );
  }

  return (
    <div className="App" style={{ minHeight: '100vh', background: 'var(--paper, #f5f0e4)', padding: '3.5rem 1.8rem 5rem', fontFamily: 'var(--sans, system-ui, sans-serif)' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--teal, #0d6e64)', fontWeight: 700, marginBottom: '0.6rem' }}>
            Tratado Interactivo Universitario
          </div>
          <h1 style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', color: 'var(--ink, #232c36)', marginBottom: '0.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            La Mecánica del Cuerpo Humano
          </h1>
          <p style={{ color: 'var(--ink-2, #43505c)', fontSize: '1.05rem', fontStyle: 'italic', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            Basado en la obra de <strong>Irving P. Herman</strong> (<em>Physics of the Human Body</em>, Springer). Modelos matemáticos, simulaciones 2D y 3D en tiempo real, fórmulas analíticas y anatomía funcional.
          </p>
          <div style={{ width: '90px', height: '2px', background: 'var(--line, #cfc3a9)', margin: '1.8rem auto 0' }} />
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.3rem' }}>
          {CHAPTERS.map((c) => {
            const isAvailable = c.available !== false;
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (isAvailable) setChapter(c.id);
                }}
                disabled={!isAvailable}
                style={{
                  background: isAvailable ? 'var(--card, #fbf8f0)' : '#f3ede0',
                  border: isAvailable ? '1px solid var(--line, #cfc3a9)' : '1px dashed var(--line, #cfc3a9)',
                  borderRadius: '14px',
                  padding: '1.6rem 1.4rem',
                  textAlign: 'left',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.65,
                  boxShadow: isAvailable ? '0 2px 10px rgba(35,44,54,0.05)' : 'none',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(35,44,54,0.1)';
                    e.currentTarget.style.borderColor = c.badgeColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(35,44,54,0.05)';
                    e.currentTarget.style.borderColor = 'var(--line, #cfc3a9)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isAvailable ? c.badgeColor : 'var(--ink-3, #6b7885)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {c.num}
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '999px',
                        background: isAvailable ? 'rgba(13, 110, 100, 0.12)' : 'rgba(107, 120, 133, 0.12)',
                        color: isAvailable ? '#0d6e64' : '#6b7885',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {isAvailable ? '🟢 DISPONIBLE' : '🔒 EN PREPARACIÓN'}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.4rem', filter: isAvailable ? 'none' : 'grayscale(0.8)' }}>{c.icon}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: '1.24rem', fontWeight: 700, color: 'var(--ink, #232c36)', marginBottom: '0.35rem', lineHeight: 1.25 }}>
                  {c.title}
                </h2>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-3, #6b7885)', marginBottom: '0.7rem' }}>
                  {c.subtitle}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-2, #43505c)', lineHeight: 1.48, margin: 0, marginTop: 'auto' }}>
                  {c.desc}
                </p>
              </button>
            );
          })}
        </div>

        <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--ink-3, #6b7885)', fontSize: '0.82rem', borderTop: '1px solid var(--line, #cfc3a9)', paddingTop: '1.6rem' }}>
          Universidad de Paul · La Mecánica del Cuerpo Humano · Compilado con React + TypeScript + Vite + Canvas 2D + Three.js + KaTeX
        </footer>
      </div>
    </div>
  );
}
