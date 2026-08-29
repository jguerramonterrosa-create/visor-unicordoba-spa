import React, { useMemo, useState } from 'react';
import { useGeoData } from './hooks/useGeoData';
import TopBar from './components/TopBar';
import MapCanvas from './components/map/MapCanvas';
import MapLegend from './components/map/MapLegend';
import ControlPanel from './components/panels/ControlPanel';
import SurveyPanel from './components/panels/SurveyPanel';
import DashboardPanel from './components/panels/DashboardPanel';
import Toast from './components/ui/Toast';

export default function App() {
  const { puntos, encuestas, savePunto, saveEncuesta } = useGeoData();

  const [tab, setTab] = useState('mapa');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [toast, setToast] = useState(null);

  // Kernel density params
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [kdeRadius, setKdeRadius] = useState(25);
  const [kdeBlur, setKdeBlur] = useState(15);

  // Spatial filters
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [filterHorario, setFilterHorario] = useState('TODOS');

  const filteredPoints = useMemo(
    () =>
      puntos.filter((p) => {
        const matchTipo =
          filterTipo === 'TODOS' || (p.tipo_punto ?? p.tipoPunto) === filterTipo;
        const matchHorario = filterHorario === 'TODOS' || p.horario === filterHorario;
        return matchTipo && matchHorario;
      }),
    [puntos, filterTipo, filterHorario],
  );

  const handleSavePunto = async (formValues) => {
    const result = await savePunto({ position: selectedPoint, ...formValues });
    setToast(result);
    if (result.ok) setSelectedPoint(null);
    return result;
  };

  const handleSaveEncuesta = async (payload) => {
    const result = await saveEncuesta(payload);
    setToast(result);
    return result;
  };

  return (
    <main className="relative h-full w-full overflow-hidden bg-background">
      {/* Full-screen cartographic surface */}
      <div className="absolute inset-0">
        <MapCanvas
          points={filteredPoints}
          showHeatmap={showHeatmap}
          kdeRadius={kdeRadius}
          kdeBlur={kdeBlur}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
        />
      </div>

      {/* Floating chrome */}
      <TopBar
        tab={tab}
        onTabChange={setTab}
        puntos={puntos.length}
        encuestas={encuestas.length}
      />

      {tab === 'mapa' && (
        <>
          <ControlPanel
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
            kdeRadius={kdeRadius}
            setKdeRadius={setKdeRadius}
            kdeBlur={kdeBlur}
            setKdeBlur={setKdeBlur}
            filterTipo={filterTipo}
            setFilterTipo={setFilterTipo}
            filterHorario={filterHorario}
            setFilterHorario={setFilterHorario}
            selectedPoint={selectedPoint}
            onSavePunto={handleSavePunto}
          />
          <MapLegend showHeatmap={showHeatmap} />
        </>
      )}

      {tab === 'encuesta' && (
        <SurveyPanel onClose={() => setTab('mapa')} onSubmit={handleSaveEncuesta} />
      )}

      {tab === 'dashboard' && (
        <DashboardPanel
          onClose={() => setTab('mapa')}
          puntos={puntos}
          encuestas={encuestas}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
