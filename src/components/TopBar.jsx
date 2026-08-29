import React from 'react';

const TABS = [
  { id: 'mapa', label: 'Cartografía', icon: MapIcon },
  { id: 'encuesta', label: 'Encuesta', icon: FormIcon },
  { id: 'dashboard', label: 'Analítica', icon: ChartIcon },
];

export default function TopBar({ tab, onTabChange, puntos, encuestas }) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[1100] flex justify-center px-4 pt-4">
      <div className="glass-panel pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5 shadow-float">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CompassIcon />
          </div>
          <div className="leading-tight">
            <h1 className="text-[13px] font-bold tracking-tight text-foreground">
              Visor Socioespacial SPA
            </h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Percepción y Apropiación del Territorio · UNICÓRDOBA
            </p>
          </div>
        </div>

        {/* Segmented tabs */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-100/70 p-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live counters */}
        <div className="hidden items-center gap-4 pr-1 lg:flex">
          <Counter value={puntos} label="Puntos" />
          <div className="h-8 w-px bg-border" />
          <Counter value={encuestas} label="Encuestas" />
        </div>
      </div>
    </header>
  );
}

function Counter({ value, label }) {
  return (
    <div className="text-right leading-tight">
      <div className="font-mono text-base font-semibold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

/* --- inline icons (16px, stroke) --- */
function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function FormIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
