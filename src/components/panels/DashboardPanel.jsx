import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import OverlayShell from './OverlayShell';
import { CATEGORIES } from '../../lib/config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const HIGH = CATEGORIES[0].value;
const FREE = CATEGORIES[3].value;

function Kpi({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-white/70 p-4">
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 font-mono text-3xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-white/70 p-4">
      <span className="mb-3 block text-[11px] font-bold uppercase tracking-wide text-foreground">
        {title}
      </span>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function DashboardPanel({ onClose, puntos, encuestas }) {
  const tipoDe = (p) => p.tipo_punto ?? p.tipoPunto;

  const barData = useMemo(
    () => ({
      labels: ['Bloques / Aulas', 'Zonas Verdes', 'Canchas / Deportes', 'Cafeterías / Plazas'],
      datasets: [
        {
          label: 'Georreferenciaciones',
          data: [
            puntos.filter((p) => p.sector?.includes('Bloques')).length,
            puntos.filter((p) => p.sector?.includes('Verdes')).length,
            puntos.filter((p) => p.sector?.includes('Deportivas')).length,
            puntos.filter((p) => p.sector?.includes('Cafeterías')).length,
          ],
          backgroundColor: '#0e7490',
          borderRadius: 6,
          maxBarThickness: 54,
        },
      ],
    }),
    [puntos],
  );

  const pieData = useMemo(
    () => ({
      labels: ['Estudiantes', 'Docentes', 'Administrativos', 'Servicios / Vigilancia', 'Directivos'],
      datasets: [
        {
          data: [
            encuestas.filter((r) => r.vinculo_comunidad?.includes('Estudiante')).length,
            encuestas.filter((r) => r.vinculo_comunidad === 'Docente').length,
            encuestas.filter((r) => r.vinculo_comunidad === 'Personal Administrativo').length,
            encuestas.filter(
              (r) =>
                r.vinculo_comunidad?.includes('Servicios') ||
                r.vinculo_comunidad?.includes('Seguridad'),
            ).length,
            encuestas.filter((r) => r.vinculo_comunidad === 'Directivo / Decana(o)').length,
          ],
          backgroundColor: ['#0e7490', '#10b981', '#f59e0b', '#6366f1', '#ec4899'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    }),
    [encuestas],
  );

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { precision: 0, color: '#64748b' }, grid: { color: '#e2e8f0' } },
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
    },
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, color: '#0f172a' } } },
  };

  return (
    <OverlayShell
      title="Panel de Gobernanza Espacial SPA"
      subtitle="Resultados consolidados de la herramienta de recolección."
      onClose={onClose}
      badge={
        <span className="hidden rounded-md bg-primary-soft px-2.5 py-1 font-mono text-[10px] font-bold text-primary sm:inline">
          SUPABASE + POSTGIS
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Puntos registrados" value={puntos.length} accent="#0e7490" />
        <Kpi label="Instrumentos diligenciados" value={encuestas.length} accent="#10b981" />
        <Kpi
          label="Zonas de frecuencia alta"
          value={puntos.filter((p) => tipoDe(p) === HIGH).length}
          accent="#ef4444"
        />
        <Kpi
          label="Zonas libres propuestas"
          value={puntos.filter((p) => tipoDe(p) === FREE).length}
          accent="#f59e0b"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Distribución por sector universitario">
          <Bar data={barData} options={barOptions} />
        </ChartCard>
        <ChartCard title="Participación según vínculo institucional">
          <Doughnut data={pieData} options={pieOptions} />
        </ChartCard>
      </div>
    </OverlayShell>
  );
}
