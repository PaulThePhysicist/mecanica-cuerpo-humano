import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">11 · 1</span>
        <span className="mtitle">La retina: bastones y conos</span>
        <span className="msub">{"\\(\\sim 120\\times10^6\\ \\text{bastones}\\quad \\sim 6{,}5\\times10^6\\ \\text{conos}\\)"}</span>
        <span className="mslide-count">2 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌙</span> Bastones: sensibles, ciegos al color
            </div>
            <div className="card-body">
              <p>
                Hay <strong>~120 millones de bastones</strong> (diámetro ~2 µm) con pico de absorción en{' '}
                <strong>500 nm</strong>. Son ~1 000× más sensibles que los conos: los usamos de noche, en{' '}
                <em>visión escotópica</em>, sin percibir color.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">☀️</span> Conos: tres familias para el color
            </div>
            <div className="card-body">
              <p>
                <strong>~6,5 millones de conos</strong> (diámetro 1,0–1,5 µm), concentrados en la <strong>fóvea</strong>{' '}
                (~300 µm, ≈1° de campo), con picos en <span className="tag">445 nm (S · azul)</span>{' '}
                <span className="tag">535 nm (M · verde)</span> <span className="tag">570 nm (L · rojo)</span>. El{' '}
                <strong>punto ciego</strong> queda 13–18° nasal y el <strong>nervio óptico</strong> reúne ~1 millón de
                fibras.
              </p>
              <div className="eq-block">
                {"\\[ \\text{agudeza máx} = \\frac{\\text{conos foveales}}{\\text{fibras del nervio}} \\Rightarrow \\text{retina 1:1 en la fóvea} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Mueve la excentricidad: en el centro mandan los conos (fóvea, agudeza y color); hacia la periferia dominan
              los bastones (sensibilidad, sin color). Por eso miramos <em>de reojo</em> para ver estrellas débiles.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-retina" className="sim" />
            <div className="prof-controls">
              <span className="badge">retina</span>
              <label>
                Excentricidad{' '}
                <input
                  type="range"
                  id="rt_ex"
                  min="0"
                  max="80"
                  defaultValue={params.rt_ex}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('rt_ex', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="rt_exv">0° (fóvea)</span>
              </label>
              <span className="readout" id="rt_out">
                0° · fóvea: conos ≈ 160 000/mm²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
