import React from 'react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset?: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: React.CSSProperties;
}

export default function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  position = 'top-right',
  style: customStyle,
}: ZoomControlsProps) {
  const posStyle: React.CSSProperties =
    position === 'top-left' ? { top: '12px', left: '12px' } :
    position === 'bottom-left' ? { bottom: '12px', left: '12px' } :
    position === 'bottom-right' ? { bottom: '12px', right: '12px' } :
    { top: '12px', right: '12px' };

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyle,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        background: 'rgba(255, 253, 248, 0.94)',
        border: '1px solid var(--line)',
        borderRadius: '7px',
        padding: '3px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(4px)',
        ...customStyle,
      }}
    >
      <button
        type="button"
        onClick={onZoomIn}
        title="Acercar vista (Zoom in)"
        aria-label="Acercar vista"
        style={{
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid transparent',
          borderRadius: '4px',
          background: 'transparent',
          color: 'var(--ink)',
          fontSize: '1.05rem',
          fontWeight: 700,
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--paper-2)';
          e.currentTarget.style.borderColor = 'var(--line)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        +
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        title="Alejar vista (Zoom out)"
        aria-label="Alejar vista"
        style={{
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid transparent',
          borderRadius: '4px',
          background: 'transparent',
          color: 'var(--ink)',
          fontSize: '1.05rem',
          fontWeight: 700,
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--paper-2)';
          e.currentTarget.style.borderColor = 'var(--line)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        −
      </button>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          title="Restablecer posición y zoom"
          aria-label="Restablecer cámara"
          style={{
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderTop: '1px solid var(--line-soft)',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--ink-3)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
            marginTop: '2px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--paper-2)';
            e.currentTarget.style.color = 'var(--ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--ink-3)';
          }}
        >
          ↺
        </button>
      )}
    </div>
  );
}
