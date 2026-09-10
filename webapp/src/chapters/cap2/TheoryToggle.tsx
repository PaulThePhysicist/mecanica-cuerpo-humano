/**
 * Mandos que viven en la COLUMNA DE TEORÍA, no sobre el lienzo.
 *
 * La idea (heredada de cap1, p. ej. `cap1/Slide1.tsx`): el hilo del texto es lo
 * que lleva al lector a mirar el 3D. En vez de una fila de botones flotando
 * sobre el modelo, el propio término que se está explicando es pulsable y
 * enciende lo que corresponde en la escena. El lienzo queda para el modelo.
 *
 * `TheoryToggle` reaprovecha el estilo `.pill` / `.pill.active` que ya define
 * cap2.css, así que un mando y un término descriptivo se ven igual: la única
 * diferencia es que el mando responde.
 */

export function TheoryToggle({
  on,
  onClick,
  title,
  accent,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title?: string;
  /** Color de la barra izquierda, para atar el mando a su fuerza/elemento. */
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`pill ${on ? 'active' : ''}`}
      aria-pressed={on}
      title={title}
      onClick={onClick}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </button>
  );
}

/** Línea de cortesía al pie de una tarjeta: dice qué pasa al pulsar. */
export function TheoryCue({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '.6rem', color: 'var(--ink-3)', marginTop: '.35rem', lineHeight: 1.45 }}>
      💡 {children}
    </p>
  );
}
