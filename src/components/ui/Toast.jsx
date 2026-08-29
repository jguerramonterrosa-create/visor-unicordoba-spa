import React, { useEffect } from 'react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDismiss, 3800);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const ok = toast.ok;
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-[1200] -translate-x-1/2">
      <div
        className={`glass-panel pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-float animate-panel-in ${
          ok ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-spa-high'
        }`}
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-full text-white"
          style={{ backgroundColor: ok ? 'var(--primary)' : 'var(--spa-high)' }}
        >
          {ok ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </span>
        <p className="max-w-xs text-sm text-foreground">{toast.message}</p>
      </div>
    </div>
  );
}
