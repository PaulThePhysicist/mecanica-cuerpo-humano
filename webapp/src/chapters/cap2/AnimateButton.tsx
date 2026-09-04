import React from 'react';

/**
 * Botón ▶ Animar / ⏸ Pausar de los slides de cap2. Mismo aspecto y sitio que
 * el de cap1 (Slide4–7): va al final de la fila de `.prof-controls`, junto a
 * "Restablecer". El bucle de animación se lleva con `useHarmonicClock`
 * (`../cap1/three/useHarmonicClock`), que oscila el parámetro de pose del slide.
 */
export function AnimateButton({
  playing,
  onToggle,
  label = 'Animar',
}: {
  playing: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      title={playing ? 'Pausar la animación del gesto' : 'Animar el gesto de forma cíclica'}
      style={{
        background: playing ? 'var(--teal)' : 'var(--paper-2)',
        color: playing ? '#fff' : 'var(--ink)',
        border: `1px solid ${playing ? 'var(--teal)' : 'var(--line)'}`,
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: '0.58rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {playing ? '⏸ Pausar' : `▶ ${label}`}
    </button>
  );
}
