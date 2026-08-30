import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="19" data-module="8">
      <div className="module-header">
        <span className="mnum">4.9</span>
        <span className="mtitle">Materiales para cascos</span>
        <span className="msub">La meseta ideal absorbe energía sin "hacer fondo"</span>
        <span className="mslide-count">19 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⛑️</span> Carcasa + revestimiento
            </div>
            <div className="card-body">
              <p>
                Un casco tiene una <strong>carcasa</strong> rígida, tenaz y dura (distribuye el impacto) y un{' '}
                <strong>revestimiento</strong> que absorbe energía deformándose <strong>plásticamente</strong>: EPS
                (poliestireno expandido) o espumas de poliuretano. La energía absorbida es el{' '}
                <span className="highlight">área entre las curvas de carga y descarga</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📉</span> El material ideal (tipo B)
            </div>
            <div className="card-body">
              <p>
                Idealmente la fuerza sube hasta un máximo y luego <strong>se mantiene constante</strong> (meseta) mientras el
                material se aplasta: máxima energía absorbida con fuerza (aceleración) limitada. La compresión máxima debe
                ser <span className="tag">≤ 80 %</span> para no "hacer fondo" y golpear la cabeza.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔁</span> Alta histéresis
            </div>
            <div className="card-body">
              <p>
                El lazo ancho del ciclo convierte la energía cinética del impacto en <strong>calor</strong>, no en rebote.
                Un casco ya comprimido (por un golpe) perdió su meseta: <strong>hay que cambiarlo</strong>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              Compara A (rígido: pico altísimo → mucha aceleración), B (ideal: meseta plana → energía máxima a fuerza
              constante) y C (blando: baja fuerza pero poca energía). El área sombreada es la energía que NO llega al
              cráneo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-helmet" className="sim" />
            <div className="prof-controls">
              <span className="badge">σ–ε de acolchado</span>
              <label>
                material{' '}
                <select
                  id="hl_mat"
                  defaultValue={flags.hl_mat}
                  onChange={(e) => {
                    engine.setFlag('hl_mat', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="B">B ideal</option>
                  <option value="A">A rígido</option>
                  <option value="C">C blando</option>
                </select>
              </label>
              <span className="readout" id="hl_out">
                energía: 60 % · F máx: 60 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
