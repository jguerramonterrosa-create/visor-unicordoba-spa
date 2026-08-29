import React from 'react';
import { CATEGORIES } from '../../lib/config';

export default function MapLegend({ showHeatmap }) {
  return (
    <div className="glass-panel pointer-events-auto absolute bottom-6 right-6 z-[1000] w-56 rounded-2xl p-4 shadow-float">
      <span className="section-eyebrow mb-2.5 block text-foreground">
        Convenciones SPA
      </span>
      <ul className="flex flex-col gap-2 text-xs text-foreground">
        {CATEGORIES.map((c) => (
          <li key={c.value} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: c.color }}
            />
            <span>{c.short}</span>
          </li>
        ))}
      </ul>

      {showHeatmap && (
        <div className="mt-3 border-t border-border pt-3">
          <span className="mb-1.5 block text-[10px] text-muted-foreground">
            Densidad de concentración (KDE)
          </span>
          <div
            className="h-2 rounded-full"
            style={{
              background:
                'linear-gradient(to right, #3b82f6, #06b6d4, #10b981, #eab308, #ef4444)',
            }}
          />
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>Baja</span>
            <span>Alta</span>
          </div>
        </div>
      )}
    </div>
  );
}
