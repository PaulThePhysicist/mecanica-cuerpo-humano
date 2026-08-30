import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <nav className="module-bar">
        <div className="brand-mark">
          <div className="treatise">La Mecánica del Cuerpo Humano</div>
          <div className="book">I. P. Herman (2016)</div>
        </div>
        <div className="module-tab active">
          <span className="mod-badge">01</span> Terminología y Escalado
        </div>
      </nav>
      <main className="slides">
        {children}
      </main>
    </>
  );
}
