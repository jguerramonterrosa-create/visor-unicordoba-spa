import React from 'react';

/**
 * Centered, scrollable frosted panel that floats over the full-screen map.
 * The map stays visible (and slightly dimmed) behind it.
 */
export default function OverlayShell({ title, subtitle, badge, onClose, maxWidth = 'max-w-4xl', children }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-[1050] flex animate-fade-in items-start justify-center overflow-y-auto bg-slate-900/25 px-4 pb-8 pt-24 backdrop-blur-[2px]">
      <div
        className={`glass-panel w-full ${maxWidth} animate-panel-in overflow-hidden rounded-2xl shadow-float-lg`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border bg-white/60 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {badge}
            <button
              onClick={onClose}
              aria-label="Cerrar y volver al mapa"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white/80 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="thin-scroll max-h-[calc(100vh-11rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
