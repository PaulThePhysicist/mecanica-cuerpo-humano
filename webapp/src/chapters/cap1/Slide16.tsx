import React from 'react';
import { STANDARD_MAN } from './standardMan';
import { fmt } from './format';

interface Slide16Props {
  go?: (n: number) => void;
  goModule?: (m: number) => void;
  slideCount?: string;
}

const SM = STANDARD_MAN;

/* P6-37 · Cada pilar del §1.5 en tres viñetas: una idea, una cifra y una
   pregunta de repaso. Las fórmulas van entre $…$ y las renderiza KaTeX
   (auto-render del capítulo). */
const PILLARS: { module: number; icon: string; title: string; idea: string; figure: string; question: string }[] = [
  {
    module: 1,
    icon: '🧭',
    title: 'Terminología anatómica',
    idea: 'Toda dirección se dice desde el paciente: $x$ anteroposterior, $y$ mediolateral (derecha $y < 0$), $z$ longitudinal; $\\rho$ mide la profundidad.',
    figure: '33 términos regionales (Tablas 1.1–1.2) y 3 planos de corte: transverso ($z$ fija), sagital ($y$ fija) y coronal ($x$ fija).',
    question: '¿El corazón es superior o inferior al intestino grueso?',
  },
  {
    module: 2,
    icon: '🦾',
    title: 'El movimiento de la máquina',
    idea: 'Los huesos giran en las articulaciones y los músculos solo tiran: por eso trabajan en pares antagonistas (bíceps/tríceps, tres pares por ojo).',
    figure: 'Pierna $3 + 1 + 2 = 6$ GL; brazo $3 + 1 + 2 + 1 = 7$ GL: un grado redundante.',
    question: '¿Por qué la mano puede quedar en el mismo sitio con el codo en posturas distintas?',
  },
  {
    module: 3,
    icon: '📐',
    title: 'El humano estándar',
    idea: `Un varón de ${SM.massKg} kg y ${fmt(SM.heightM, 2)} m es la referencia; las tablas dan longitud, masa, centro de masa y radio de giro de cada segmento.`,
    figure: `${fmt(SM.coreTempC, 1)} °C · ${SM.systolicMmHg}/${SM.diastolicMmHg} mmHg · ${fmt(SM.cardiacOutputRestLMin, 1)} L/min · TMB ${SM.bmrKcalH} kcal/h · ${SM.fatPercent} % de grasa.`,
    question: '¿Qué fracción de la masa corporal es el tronco? ¿Y la pierna entera?',
  },
  {
    module: 4,
    icon: '📈',
    title: 'Relaciones de escala',
    idea: 'Muchas propiedades siguen $f = a\\,m_b^{\\alpha}$; los huesos engrosan como $w \\propto L^{3/2}$ y la percepción sigue $P = K\\,(S - S_0)^n$.',
    figure: 'Kleiber: $\\alpha = 0{,}75$. Cualquier mamífero late $\\sim 1{,}5 \\times 10^{9}$ veces en su vida.',
    question: '¿Por qué duplicar el exceso de corriente sobre el umbral se siente unas 11 veces más fuerte?',
  },
];

export default function Slide16({ go, goModule, slideCount }: Slide16Props) {
  return (
    <>
      <div className="module-header">
        <span className="mnum">✓</span>
        <span className="mtitle">Resumen del capítulo</span>
        <span className="msub">Sección 1.5 · los 4 pilares</span>
        <span className="mslide-count">{slideCount ?? '·'}</span>
      </div>
      <div className="content-grid single-col">
        <div className="theory summary-grid">
          {PILLARS.map((p) => (
            <div key={p.module} className="card summary-card" style={{ cursor: 'pointer' }} onClick={() => goModule?.(p.module)}>
              <div className="card-hdr">
                <span className="icon">{p.icon}</span> {p.title}
              </div>
              <div className="card-body">
                <ul className="summary-list">
                  <li><b>Idea.</b> {p.idea}</li>
                  <li><b>Cifra.</b> {p.figure}</li>
                  <li><b>Repaso.</b> {p.question}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="prof-controls" style={{ justifyContent: 'center' }}>
          <span>¿Puedes explicar los 4 pilares? Haz clic en cada tarjeta para repasar</span>
          <button onClick={() => go?.(0)}>← Volver al inicio</button>
        </div>
      </div>
    </>
  );
}
