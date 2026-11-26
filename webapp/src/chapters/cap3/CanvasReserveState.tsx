/**
 * Estado de reserva de un lienzo (patrón E5-02 de cap2, copia local para que el
 * capítulo no dependa del chunk de otro): si `getContext('2d')` devuelve `null`
 * —o la escena 3D no puede crear su contexto WebGL— el aviso vive en el DOM,
 * superpuesto, con tokens de `:root`, para que el fallo se lea como fallo y no
 * como una diapositiva vacía.
 */
export default function CanvasReserveState({ label }: { label: string }) {
  return (
    <div role="status" className="cap3-reserve">
      Vista no disponible — {label}
    </div>
  );
}
