import React, { useState } from 'react';

interface HudPanelProps {
  title: string;
  badge?: string;
  icon?: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export default function HudPanel({
  title,
  badge,
  icon = '🧭',
  defaultCollapsed = true,
  children,
  footer,
  width = '215px',
}: HudPanelProps) {
  // Siempre colapsado al entrar: el panel no debe tapar el canvas. Se abre con el
  // botón de icono. `defaultCollapsed={false}` explícito lo fuerza abierto.
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        title={`Expandir panel: ${title}`}
        aria-label={`Expandir panel ${title}`}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 253, 248, 0.94)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--line)',
          borderRadius: '7px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          fontSize: '0.95rem',
          color: 'var(--ink)',
          transition: 'all 0.15s ease',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--paper-2)';
          e.currentTarget.style.borderColor = 'var(--teal)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 253, 248, 0.94)';
          e.currentTarget.style.borderColor = 'var(--line)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {icon}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10,
        width: width,
        background: 'rgba(255, 253, 248, 0.94)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        padding: '8px 10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontFamily: 'var(--sans)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '4px',
        }}
      >
        <span
          style={{
            fontSize: '0.56rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'bold',
            color: 'var(--ink-3)',
          }}
        >
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {badge && (
            <span
              style={{
                fontSize: '0.60rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 'bold',
                color: 'var(--teal-deep)',
                background: 'var(--teal-tint)',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
            >
              {badge}
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Colapsar panel"
            aria-label="Colapsar panel"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.72rem',
              color: 'var(--ink-3)',
              padding: '1px 3px',
              lineHeight: 1,
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ink)';
              e.currentTarget.style.background = 'var(--paper-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ink-3)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {children}

      {footer && (
        <div
          style={{
            marginTop: '5px',
            paddingTop: '3px',
            borderTop: '1px dashed var(--line)',
            fontSize: '0.52rem',
            color: 'var(--ink-3)',
            textAlign: 'center',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
