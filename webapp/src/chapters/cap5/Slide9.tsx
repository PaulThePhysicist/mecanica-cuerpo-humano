import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <div className="module-header">
        <span className="mnum">5.5</span>
        <span className="mtitle">Tensión-longitud: la fuerza depende de la longitud</span>
        <span className="msub">Pico en L₀ · la mitad en 70 % y 130 %</span>
        <span className="mslide-count">9 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎯</span> La curva isométrica
            </div>
            <div className="card-body">
              <p>
                Con los extremos fijos (isométrico), la fuerza máxima ocurre a la <strong>longitud óptima L₀</strong>{' '}
                (algo mayor que la longitud inicial o de reposo {"\\(L_{\\text{i}}\\)"}).
              </p>
              <p>
                El máximo se <strong>reduce a la mitad</strong> cuando el músculo está al <span className="tag">70 %</span>{' '}
                (acortado) o al <span className="tag">130 %</span> (alargado) de L₀, y es <strong>casi cero al 170 %</strong>.
              </p>
              <p>
                Vale tanto para el músculo real como para cada sarcómero de ≈ <span className="tag">2 μm</span>. Base
                física: el grado de <strong>superposición miosina–actina</strong> (puentes cruzados) es máximo en reposo
                y cae al acortarse o estirarse.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">➕</span> Tensión total: activa + pasiva
            </div>
            <div className="card-body">
              <p>
                La contribución pasiva (ec. 5.19) no puede ignorarse al modelar músculos activados: activa + pasiva ={' '}
                <strong>tensión total tetanizada</strong> (Fig. 5.21).
              </p>
              <p>
                En los músculos <strong>paralelos</strong> (sartorio): fibras largas, poco material pasivo → se conserva
                el máximo activo. En los <strong>pinnados</strong> (gastrocnemio): fibras cortas y mucho tejido conectivo
                → la pasiva es grande y el máximo activo queda enmascarado.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              Esta curva explica por qué los músculos trabajan mejor cerca de su longitud de reposo y por qué el cuerpo
              no «usa» músculos muy estirados ni muy acortados. Compara paralelo vs pinnado en el canvas: el pico activo
              se hunde bajo la pasiva en el pinnado.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-tension" />
            <div className="prof-controls">
              <span className="badge">F–L</span>
              <label>
                tipo{' '}
                <select
                  id="tn_tipo"
                  defaultValue={params.tn_tipo}
                  onChange={(e) => {
                    engine.setParam('tn_tipo', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="paralelo">Paralelo (sartorio)</option>
                  <option value="pinnado">Pinnado (gastrocnemio)</option>
                </select>
              </label>
              <span className="readout" id="tn_out">
                pico activo en L₀ visible
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
