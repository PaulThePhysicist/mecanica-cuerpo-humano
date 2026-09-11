import React from 'react';
import { STANDARD_MAN } from './standardMan';

interface Slide16Props {
  go?: (n: number) => void;
  goModule?: (m: number) => void;
  slideCount?: string;
}

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
        <div className="theory" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', overflow: 'visible' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => goModule?.(1)}>
            <div className="card-hdr">
              <span className="icon">🧭</span> Terminología anatómica
            </div>
            <div className="card-body" style={{ fontSize: '.68rem' }}>
              Coordenadas (x, y, z, r, ρ), direcciones opuestas y 3 planos de sección. Toda posición se describe desde la perspectiva del paciente.
            </div>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => goModule?.(2)}>
            <div className="card-hdr">
              <span className="icon">🦾</span> El movimiento de la máquina
            </div>
            <div className="card-body" style={{ fontSize: '.68rem' }}>
              6 GL (3 traslacionales + 3 rotacionales). Articulaciones sinoviales de 1–3 GL. El brazo suma 7 con el pivote radiocubital.
            </div>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => goModule?.(3)}>
            <div className="card-hdr">
              <span className="icon">📐</span> El Humano Estándar
            </div>
            <div className="card-body" style={{ fontSize: '.68rem' }}>
              {STANDARD_MAN.massKg} kg, {String(STANDARD_MAN.heightM).replace('.', ',')} m, {String(STANDARD_MAN.bsaM2).replace('.', ',')} m², TMB {STANDARD_MAN.bmrKcalH} kcal/h, {STANDARD_MAN.fatPercent} % grasa. Proporciones segmentarias fijas L/H. Somatotipos y Heath-Carter.
            </div>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => goModule?.(4)}>
            <div className="card-hdr">
              <span className="icon">📈</span> Relaciones de escala
            </div>
            <div className="card-body" style={{ fontSize: '.68rem' }}>
              {'Alometría $f = a \\cdot m^\\alpha$, huesos $w \\propto L^{3/2}$, índices S y BMI, Du Bois (A), y la Ley de Stevens $P = K\\,(S - S_0)^n$.'}
            </div>
          </div>
        </div>
        <div className="prof-controls" style={{ justifyContent: 'center' }}>
          <span className="badge">✅</span>
          <span>¿Puedes explicar los 4 pilares? Haz clic en cada tarjeta para repasar</span>
          <button onClick={() => go?.(0)}>← Volver al inicio</button>
        </div>
      </div>
    </>
  );
}
