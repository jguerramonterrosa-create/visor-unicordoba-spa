import React, { useState } from 'react';
import { SelectField, RangeField, Toggle } from '../ui/controls';
import { CATEGORIES, PERFILES, SECTORES, HORARIOS } from '../../lib/config';

const filterCategoryOptions = [
  { value: 'TODOS', label: 'Ver todas las categorías' },
  ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.dot} ${c.short}` })),
];
const filterHorarioOptions = [
  { value: 'TODOS', label: 'Todas las franjas horarias' },
  ...HORARIOS,
];
const categoryOptions = CATEGORIES.map((c) => ({
  value: c.value,
  label: `${c.dot} ${c.short}`,
}));

function PanelCard({ eyebrow, action, children }) {
  return (
    <section className="rounded-xl border border-border bg-slate-100/60 p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <span className="section-eyebrow text-foreground">{eyebrow}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ControlPanel({
  showHeatmap,
  setShowHeatmap,
  kdeRadius,
  setKdeRadius,
  kdeBlur,
  setKdeBlur,
  filterTipo,
  setFilterTipo,
  filterHorario,
  setFilterHorario,
  selectedPoint,
  onSavePunto,
}) {
  const [perfil, setPerfil] = useState(PERFILES[0]);
  const [tipoPunto, setTipoPunto] = useState(CATEGORIES[0].value);
  const [sector, setSector] = useState(SECTORES[0]);
  const [horario, setHorario] = useState(HORARIOS[1]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSavePunto({ perfil, tipoPunto, sector, horario });
    setSaving(false);
  };

  return (
    <div className="glass-panel pointer-events-auto absolute left-4 top-24 z-[1050] flex max-h-[calc(100vh-8rem)] w-[360px] max-w-[calc(100vw-2rem)] animate-panel-in flex-col overflow-hidden rounded-2xl shadow-float">
      <div className="thin-scroll flex flex-col gap-4 overflow-y-auto p-4">
        {/* KDE */}
        <PanelCard
          eyebrow="Densidad Kernel (KDE)"
          action={<Toggle checked={showHeatmap} onChange={setShowHeatmap} />}
        >
          <div className="flex flex-col gap-3.5">
            <RangeField
              label="Radio del kernel"
              valueLabel={`${kdeRadius} px`}
              min={10}
              max={60}
              value={kdeRadius}
              onChange={(v) => setKdeRadius(Number(v))}
            />
            <RangeField
              label="Suavizado (blur)"
              valueLabel={`${kdeBlur} px`}
              min={5}
              max={35}
              value={kdeBlur}
              onChange={(v) => setKdeBlur(Number(v))}
            />
          </div>
        </PanelCard>

        {/* Filters */}
        <PanelCard eyebrow="Filtros de Percepción">
          <div className="flex flex-col gap-3">
            <SelectField
              label="Clasificación de uso / percepción"
              value={filterTipo}
              onChange={setFilterTipo}
              options={filterCategoryOptions}
            />
            <SelectField
              label="Franja horaria"
              value={filterHorario}
              onChange={setFilterHorario}
              options={filterHorarioOptions}
            />
          </div>
        </PanelCard>

        {/* Capture */}
        <PanelCard eyebrow="Capturar Punto SPA">
          <div className="flex flex-col gap-3">
            <SelectField
              label="Vínculo institucional"
              value={perfil}
              onChange={setPerfil}
              options={PERFILES}
            />
            <SelectField
              label="Categoría socioespacial"
              value={tipoPunto}
              onChange={setTipoPunto}
              options={categoryOptions}
            />
            <SelectField
              label="Sector / infraestructura"
              value={sector}
              onChange={setSector}
              options={SECTORES}
            />

            <div
              className={`rounded-lg border px-3 py-2 font-mono text-[11px] transition ${
                selectedPoint
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-dashed border-border bg-white/60 text-muted-foreground'
              }`}
            >
              {selectedPoint
                ? `LAT ${selectedPoint[0].toFixed(6)}  ·  LNG ${selectedPoint[1].toFixed(6)}`
                : 'Haz clic sobre el mapa para señalar un sitio.'}
            </div>

            <button
              onClick={handleSave}
              disabled={!selectedPoint || saving}
              className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Registrando…' : 'Registrar punto geográfico'}
            </button>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
