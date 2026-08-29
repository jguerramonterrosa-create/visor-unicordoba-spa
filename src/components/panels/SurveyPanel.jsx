import React, { useState } from 'react';
import OverlayShell from './OverlayShell';
import { SelectField, TextareaField, RangeField } from '../ui/controls';
import {
  PERFILES,
  PERMANENCIAS,
  RELACIONES_SPA,
  HORARIOS,
  FRECUENCIAS,
  PERCEPCIONES,
  AFECTACIONES,
  DISPOSICIONES,
  MECANISMOS,
} from '../../lib/config';

function Block({ index, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-slate-100/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
          {index}
        </span>
        <span className="section-eyebrow">{title}</span>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function SurveyPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    vinculo_comunidad: PERFILES[0],
    permanencia_campus: PERMANENCIAS[1],
    relacion_spa: RELACIONES_SPA[0],
    franja_critica: HORARIOS[1],
    frecuencia_friccion: FRECUENCIAS[0],
    percepcion_apropiacion: PERCEPCIONES[0],
    afectacion_principal: AFECTACIONES[0],
    nivel_confort: '3',
    disposicion_pacto: DISPOSICIONES[0],
    mecanismo_gestion: MECANISMOS[0],
    propuesta_cualitativa: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSubmit({
      ...form,
      nivel_confort: Number(form.nivel_confort),
    });
    setSaving(false);
    if (result?.ok) {
      setForm((f) => ({ ...f, propuesta_cualitativa: '' }));
    }
  };

  return (
    <OverlayShell
      title="Cuestionario de Recolección Socioespacial"
      subtitle="Instrumento inclusivo para toda la comunidad universitaria — percepción y apropiación territorial sobre SPA."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Block index="I" title="Caracterización institucional y permanencia">
          <SelectField label="1. Vínculo institucional" value={form.vinculo_comunidad} onChange={set('vinculo_comunidad')} options={PERFILES} />
          <SelectField label="2. Permanencia diaria en el campus" value={form.permanencia_campus} onChange={set('permanencia_campus')} options={PERMANENCIAS} />
          <SelectField label="3. Hábitos / relación con SPA" value={form.relacion_spa} onChange={set('relacion_spa')} options={RELACIONES_SPA} />
          <SelectField label="4. Franja horaria de mayor fricción" value={form.franja_critica} onChange={set('franja_critica')} options={HORARIOS} />
        </Block>

        <Block index="II" title="Percepción y apropiación territorial">
          <SelectField label="5. Frecuencia de presencia SPA en tu entorno" value={form.frecuencia_friccion} onChange={set('frecuencia_friccion')} options={FRECUENCIAS} />
          <SelectField label="6. Percepción sobre la apropiación del espacio" value={form.percepcion_apropiacion} onChange={set('percepcion_apropiacion')} options={PERCEPCIONES} />
          <SelectField className="sm:col-span-2" label="7. Factor principal de impacto observado" value={form.afectacion_principal} onChange={set('afectacion_principal')} options={AFECTACIONES} />
          <div className="sm:col-span-2">
            <RangeField
              label="8. Confort ambiental y espacial en los bloques"
              valueLabel={`Nivel ${form.nivel_confort}`}
              min={1}
              max={5}
              value={form.nivel_confort}
              onChange={set('nivel_confort')}
              hint={['1 · Desconfort alto', '3 · Neutro', '5 · Confort óptimo']}
            />
          </div>
        </Block>

        <Block index="III" title="Acuerdos y propuestas socioespaciales">
          <SelectField label="9. Disposición a pactos de convivencia" value={form.disposicion_pacto} onChange={set('disposicion_pacto')} options={DISPOSICIONES} />
          <SelectField label="10. Estrategia prioritaria territorial" value={form.mecanismo_gestion} onChange={set('mecanismo_gestion')} options={MECANISMOS} />
          <TextareaField
            className="sm:col-span-2"
            label="Recomendaciones para la reivindicación y distribución del espacio"
            value={form.propuesta_cualitativa}
            onChange={set('propuesta_cualitativa')}
            placeholder="Comparta propuestas específicas sobre la distribución territorial y la convivencia en el campus…"
            rows={3}
          />
        </Block>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 rounded-lg bg-primary py-3 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm transition hover:bg-primary-strong disabled:opacity-60"
        >
          {saving ? 'Enviando…' : 'Enviar respuestas al Sistema de Información Geográfica'}
        </button>
      </form>
    </OverlayShell>
  );
}
