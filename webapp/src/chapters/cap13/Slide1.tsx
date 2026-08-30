import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide1({ engine }: SlideProps) {
  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 1</span>
        <span className="mtitle">Homeostasis: el cuerpo se mantiene a sí mismo</span>
        <span className="msub">{"\\(\\text{LEC}\\approx \\tfrac13\\)"} del líquido corporal</span>
        <span className="mslide-count">1 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎯</span> El líquido extracelular (LEC)
            </div>
            <div className="card-body">
              <p>
                La <strong>homeostasis</strong> es la estabilidad de las condiciones químicas y físicas del líquido que rodea a
                las células. Ese <strong>líquido extracelular</strong> (LEC) es ≈ 1/3 del líquido corporal total: plasma sanguíneo +
                líquido intersticial. Los otros 2/3 son <strong>intracelulares</strong>.
              </p>
              <div className="eq-block">
                {"\\[ \\text{LEC} \\approx \\frac13\\,\\text{líquido corporal}\\quad (\\text{plasma}+\\text{intersticial})\\qquad \\frac23\\,\\text{intracelular} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧪</span> Ocho variables controladas
            </div>
            <div className="card-body">
              <p>El LEC se controla para regular:</p>
              <div className="row">
                <span className="pill"><b>a</b> temperatura corporal</span>
                <span className="pill"><b>b</b> presión en los vasos</span>
                <span className="pill"><b>c</b> O₂ y CO₂</span>
                <span className="pill"><b>d</b> pH</span>
                <span className="pill"><b>e</b> Na⁺/K⁺/Ca²⁺</span>
                <span className="pill"><b>f</b> volumen</span>
                <span className="pill"><b>g</b> osmolalidad</span>
                <span className="pill"><b>h</b> glucosa</span>
              </div>
              <p>
                Y también: iris (luz), músculos ciliares (acomodación), fuerza de agarre (retroalimentación de fuerza normal).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              La homeostasis es <strong>retroalimentación y control continuos</strong>: nada del cuerpo funciona "a ciegas". Las
              ocho variables de la barra derecha son el menú del termostato interno.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ho" />
            <div className="prof-controls">
              <span className="badge">LEC</span>
              <span className="readout" id="ho_out">
                8 variables en rango
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
