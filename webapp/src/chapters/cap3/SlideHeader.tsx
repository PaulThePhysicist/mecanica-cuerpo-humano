import { TOTAL } from './sims';

/**
 * Encabezado común de diapositiva. `num` cita la (sub)sección real del `.tex`
 * (AUDITORIA_CAP3 F-00) y el contador usa el mismo índice que la barra
 * inferior (antes decía «1 / 19» en la diapositiva 2).
 */
export default function SlideHeader({ index, num, title, sub }: { index: number; num: string; title: string; sub: string }) {
  return (
    <div className="module-header">
      <span className="mnum">§ {num}</span>
      <h2 className="mtitle">{title}</h2>
      <span className="msub">{sub}</span>
      <span className="mslide-count">
        {index + 1} / {TOTAL}
      </span>
    </div>
  );
}
