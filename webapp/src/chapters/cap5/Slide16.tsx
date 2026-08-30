import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;
  const [isPlaying, setIsPlaying] = useState(flags.stPlaying);

  const togglePlay = () => {
    flags.stPlaying = !flags.stPlaying;
    if (flags.stPlaying) flags.stT = 0;
    setIsPlaying(flags.stPlaying);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="16" data-module="7">
      <div className="module-header">
        <span className="mnum">5.8</span>
        <span className="mtitle">Subir escalones: de los puentes cruzados a los 700 W</span>
        <span className="msub">Un cálculo que conecta lo nano con lo macroscópico</span>
        <span className="mslide-count">16 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🪜</span> El problema
            </div>
            <div className="card-body">
              <p>
                Los músculos de la pantorrilla y el muslo se contraen <span className="tag">3 cm</span> por paso, en un
                tiempo de paso de <span className="tag">0,25 s</span>. Con diámetro total ≈ 10 cm y filamento de miosina
                de 20 nm:
              </p>
              <div className="eq-block">
                {"\\[ \\frac{(10\\ \\text{cm})^2}{(20\\ \\text{nm})^2}=2{,}5\\times10^{13}\\ \\text{filamentos} \\]"}
              </div>
              <p>
                × 2 músculos = {"\\(5{,}0\\times10^{13}\\)"}, y con <span className="tag">6 cadenas laterales</span> por
                filamento: <span className="highlight">3×10¹⁴ puentes cruzados</span> en sección transversal.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔋</span> La energía
            </div>
            <div className="card-body">
              <p>
                Cada unión/desprendimiento mueve la cadena <span className="tag">5,3 nm</span>; en 3 cm de contracción
                son:
              </p>
              <div className="eq-block">
                {"\\[ (3{,}0\\times10^{14})\\,\\frac{3\\ \\text{cm}}{5\\ \\text{nm}}=1{,}8\\times10^{21}\\ \\text{uniones} \\]"}
              </div>
              <p>
                Cada una hidroliza un ATP que libera <span className="tag">14 kcal/mol = 9,7×10⁻²⁰ J</span> (Cap. 6):
                energía total ≈ <span className="tag">175 J</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> La potencia
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ P=\\frac{175\\ \\text{J}}{0{,}25\\ \\text{s}}=700\\ \\text{W} \\]"}
              </div>
              <p>
                Consistente con las potencias metabólicas de las actividades vigorosas como subir escaleras. (La
                incertidumbre viene de las secciones transversales efectivas, estimadas de forma muy aproximada).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              Este es el cálculo-estrella del capítulo: 700 W que produce el cuerpo con ~10²¹ ciclos moleculares. Cada ATP
              ≈ 97 zJ, cada puente ≈ 3 pN. Pulsa ▶ y observa las cuentas encadenarse mientras la figura sube el escalón.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-stairs" />
            <div className="prof-controls">
              <span className="badge">escaleras</span>
              <button id="st_play" type="button" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="st_out">
                175 J · 0,25 s → 700 W
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
