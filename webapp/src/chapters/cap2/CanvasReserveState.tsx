import React from 'react';

/**
 * E5-02: cuando `canvas.getContext('2d')` devuelve null no hay forma de pintar
 * nada con ese contexto -- el aviso vive en el DOM, superpuesto al lienzo, en
 * vez de intentar dibujarlo dentro del propio canvas (que ya es inalcanzable).
 * Retícula plana + leyenda, con tokens de :root, para que el fallo se lea como
 * fallo y no como una decisión de diseño.
 */
export default function CanvasReserveState({ label }: { label: string }) {
  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1rem',
        backgroundColor: 'var(--paper-2)',
        backgroundImage:
          'linear-gradient(var(--line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--line-soft) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        color: 'var(--ink-2)',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '.02em',
      }}
    >
      Vista no disponible — {label}
    </div>
  );
}
