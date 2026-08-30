import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ChapterImageLightboxProps {
  src: string;
  alt: string;
  label: string;
  children: React.ReactNode;
}

export default function ChapterImageLightbox({ src, alt, label, children }: ChapterImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  const activate = (event?: React.KeyboardEvent<HTMLElement>) => {
    if (event && event.key !== 'Enter' && event.key !== ' ') return;
    event?.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <figure
        className="zoomable-figure"
        tabIndex={0}
        role="button"
        aria-label={`Ampliar ${label}`}
        onClick={() => setOpen(true)}
        onKeyDown={activate}
      >
        {children}
      </figure>
      {open && createPortal((
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`Vista ampliada: ${label}`} onClick={() => setOpen(false)}>
          <div className="image-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <div className="image-lightbox-toolbar">
              <span>{label}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar imagen ampliada" title="Cerrar (Esc)">×</button>
            </div>
            <img src={src} alt={alt} />
            <p>Haz clic fuera de la imagen o presiona Esc para cerrar.</p>
          </div>
        </div>
      ), document.body)}
    </>
  );
}
