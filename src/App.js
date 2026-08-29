import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { supabase } from './supabaseClient';

// Importación y registro de Chart.js
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
  LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Marcadores Vectoriales Estilo SIG (Alto Contraste)
const customMarker = (color) => new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const icons = {
  'Alta Frecuencia / Consumo SPA': customMarker('#ef4444'),
  'Zonas de Transición / Fricción': customMarker('#f59e0b'),
  'Bajo Impacto / Confort Espacial': customMarker('#84cc16'),
  'Propuesta Zona Libre / Reivindicada': customMarker('#10b981')
};

// Componente para Densidad de Kernel (KDE)
function AdvancedHeatmapLayer({ points, showHeatmap, radius, blur }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    if (showHeatmap && points.length > 0) {
      const heatPoints = points.map(p => [
        parseFloat(p.latitud || p.lat), 
        parseFloat(p.longitud || p.lng), 
        p.peso_intensidad || p.pesoIntensidad || 0.8
      ]);

      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: parseInt(radius),
        blur: parseInt(blur),
        maxZoom: 19,
        gradient: {
          0.2: '#3b82f6',
          0.4: '#06b6d4',
          0.6: '#10b981',
          0.8: '#eab308',
          1.0: '#ef4444'
        }
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points, showHeatmap, radius, blur]);

  return null;
}

// Capturador de Coordenadas
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customMarker('#2563eb')} />
  );
}

export default function App() {
  const [tab, setTab] = useState('mapa');
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Parámetros Kernel
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [kdeRadius, setKdeRadius] = useState(25);
  const [kdeBlur, setKdeBlur] = useState(15);

  // Filtros Espaciales
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [filterHorario, setFilterHorario] = useState('TODOS');

  // Formulario Mapa (Instrumento de Captura Espacial)
  const [perfilMap, setPerfilMap] = useState('Estudiante de Pregrado');
  const [tipoPunto, setTipoPunto] = useState('Alta Frecuencia / Consumo SPA');
  const [sectorCampus, setSectorCampus] = useState('Corredores / Bloques de Aulas');
  const [horarioPicoMap, setHorarioPicoMap] = useState('Tarde (12:00 - 18:00)');

  // Formulario Encuesta Inclusiva de Percepción y Apropiación Territorial SPA
  const [vinculoComunidad, setVinculoComunidad] = useState('Estudiante de Pregrado');
  const [permanenciaCampus, setPermanenciaCampus] = useState('Jornada Completa (4 a 8 horas)');
  const [relacionSPA, setRelacionSPA] = useState('No consumidor/a');
  const [frecuenciaFriccion, setFrecuenciaFriccion] = useState('Diariamente');
  const [percepcionApropiacion, setPercepcionApropiacion] = useState('Espacio de segregación / tensión espacial');
  const [afectacionPrincipal, setAfectacionPrincipal] = useState('Salud respiratoria / Humo de segunda mano');
  const [nivelConfort, setNivelConfort] = useState('3');
  const [franjaCritica, setFranjaCritica] = useState('Tarde (12:00 - 18:00)');
  const [disposicionPacto, setDisposicionPacto] = useState('Totalmente de acuerdo');
  const [mecanismoGestion, setMecanismoGestion] = useState('Zonificación participativa y distribución del uso del suelo');
  const [propuestaCualitativa, setPropuestaCualitativa] = useState('');

  // Bases de Datos
  const [respuestasMap, setRespuestasMap] = useState([]);
  const [respuestasEncuesta, setRespuestasEncuesta] = useState([]);

  useEffect(() => {
    fetchPuntos();
    fetchEncuestas();
  }, []);

  const fetchPuntos = async () => {
    const { data, error } = await supabase.from('puntos_mapa').select('*');
    if (!error && data) setRespuestasMap(data);
  };

  const fetchEncuestas = async () => {
    const { data, error } = await supabase.from('respuestas_encuesta').select('*');
    if (!error && data) setRespuestasEncuesta(data);
  };

  const handleGuardarPunto = async () => {
    if (!selectedPoint) return;
    let peso = 0.5;
    if (tipoPunto === 'Alta Frecuencia / Consumo SPA') peso = 1.0;
    if (tipoPunto === 'Zonas de Transición / Fricción') peso = 0.7;
    if (tipoPunto === 'Bajo Impacto / Confort Espacial') peso = 0.4;
    if (tipoPunto === 'Propuesta Zona Libre / Reivindicada') peso = 0.2;

    const nuevoPunto = {
      latitud: selectedPoint[0],
      longitud: selectedPoint[1],
      perfil: perfilMap,
      tipo_punto: tipoPunto,
      peso_intensidad: peso,
      sector: sectorCampus,
      horario: horarioPicoMap,
      geom: `POINT(${selectedPoint[1]} ${selectedPoint[0]})`
    };

    const { data, error } = await supabase.from('puntos_mapa').insert([nuevoPunto]).select();

    if (error) {
      alert('Error PostGIS: ' + error.message);
    } else {
      setRespuestasMap([...respuestasMap, data[0]]);
      setSelectedPoint(null);
      alert('Punto geográfico registrado correctamente.');
    }
  };

  const handleGuardarEncuesta = async (e) => {
    e.preventDefault();
    const nuevaEncuesta = {
      vinculo_comunidad: vinculoComunidad,
      permanencia_campus: permanenciaCampus,
      relacion_spa: relacionSPA,
      frecuencia_friccion: frecuenciaFriccion,
      percepcion_apropiacion: percepcionApropiacion,
      afectacion_principal: afectacionPrincipal,
      nivel_confort: Number(nivelConfort),
      franja_critica: franjaCritica,
      disposicion_pacto: disposicionPacto,
      mecanismo_gestion: mecanismoGestion,
      propuesta_cualitativa: propuestaCualitativa
    };

    const { data, error } = await supabase.from('respuestas_encuesta').insert([nuevaEncuesta]).select();

    if (error) {
      alert('Error en el envío: ' + error.message);
    } else {
      setRespuestasEncuesta([...respuestasEncuesta, data[0]]);
      setPropuestaCualitativa('');
      alert('Instrumento socioespacial procesado exitosamente.');
    }
  };

  const filteredPoints = respuestasMap.filter(p => {
    const matchTipo = filterTipo === 'TODOS' || (p.tipo_punto || p.tipoPunto) === filterTipo;
    const matchHorario = filterHorario === 'TODOS' || p.horario === filterHorario;
    return matchTipo && matchHorario;
  });

  const dataBarSectores = {
    labels: ['Bloques / Aulas', 'Zonas Verdes', 'Canchas / Deportes', 'Cafeterías / Plazas'],
    datasets: [{
      label: 'Georeferenciaciones',
      data: [
        filteredPoints.filter(p => p.sector?.includes('Bloques')).length,
        filteredPoints.filter(p => p.sector?.includes('Verdes')).length,
        filteredPoints.filter(p => p.sector?.includes('Deportivas')).length,
        filteredPoints.filter(p => p.sector?.includes('Cafeterías')).length,
      ],
      backgroundColor: '#0284c7',
      borderRadius: 6
    }]
  };

  const dataPieVinculo = {
    labels: ['Estudiantes', 'Docentes', 'Administrativos', 'Servicios / Vigilancia', 'Directivos'],
    datasets: [{
      data: [
        respuestasEncuesta.filter(r => r.vinculo_comunidad?.includes('Estudiante')).length,
        respuestasEncuesta.filter(r => r.vinculo_comunidad === 'Docente').length,
        respuestasEncuesta.filter(r => r.vinculo_comunidad === 'Personal Administrativo').length,
        respuestasEncuesta.filter(r => r.vinculo_comunidad?.includes('Servicios') || r.vinculo_comunidad?.includes('Seguridad')).length,
        respuestasEncuesta.filter(r => r.vinculo_comunidad === 'Directivo / Decana(o)').length,
      ],
      backgroundColor: ['#0284c7', '#10b981', '#f59e0b', '#6366f1', '#ec4899'],
      borderWidth: 1
    }]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: '#f8fafc', color: '#0f172a' }}>
      
      {/* CABECERA INSTITUCIONAL */}
      <header style={{ backgroundColor: '#ffffff', padding: '12px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0284c7' }}></div>
          <div>
            <h1 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700', letterSpacing: '-0.2px' }}>
              INSTRUMENTO DE RECOLECCIÓN SOCIOESPACIAL SOBRE SUSTANCIAS PSICOACTIVAS (SPA) | UNICÓRDOBA
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              Diagnóstico, Identificación y Percepción de la Apropiación del Territorio Universitario
            </p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button onClick={() => setTab('mapa')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: tab === 'mapa' ? '#ffffff' : 'transparent', color: tab === 'mapa' ? '#0284c7' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '12px', boxShadow: tab === 'mapa' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
            🗺️ Visor y Cartografía SPA
          </button>
          <button onClick={() => setTab('encuesta')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: tab === 'encuesta' ? '#ffffff' : 'transparent', color: tab === 'encuesta' ? '#0284c7' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '12px', boxShadow: tab === 'encuesta' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
            📋 Encuesta de Apropiación
          </button>
          <button onClick={() => setTab('dashboard')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: tab === 'dashboard' ? '#ffffff' : 'transparent', color: tab === 'dashboard' ? '#0284c7' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '12px', boxShadow: tab === 'dashboard' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
            📊 Analítica Socioespacial
          </button>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* MAPA Y PANELES */}
        {tab === 'mapa' && (
          <>
            <div style={{ width: '380px', padding: '20px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* CONFIGURACIÓN DENSIDAD KERNEL */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>Densidad Kernel (KDE SPA)</span>
                  <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} style={{ cursor: 'pointer' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Radio del Kernel:</span>
                      <b>{kdeRadius} px</b>
                    </div>
                    <input type="range" min="10" max="60" value={kdeRadius} onChange={(e) => setKdeRadius(e.target.value)} style={{ width: '100%', accentColor: '#0284c7' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Suavizado (Blur):</span>
                      <b>{kdeBlur} px</b>
                    </div>
                    <input type="range" min="5" max="35" value={kdeBlur} onChange={(e) => setKdeBlur(e.target.value)} style={{ width: '100%', accentColor: '#0284c7' }} />
                  </div>
                </div>
              </div>

              {/* FILTROS CARTOGRÁFICOS */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Filtros de Percepción Espacial</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>Clasificación de Uso / Percepción:</label>
                    <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                      <option value="TODOS">Ver todas las categorías</option>
                      <option value="Alta Frecuencia / Consumo SPA">🔴 Alta Frecuencia / Consumo SPA</option>
                      <option value="Zonas de Transición / Fricción">🟠 Zonas de Transición / Fricción</option>
                      <option value="Bajo Impacto / Confort Espacial">🟡 Convivencia / Confort</option>
                      <option value="Propuesta Zona Libre / Reivindicada">🟢 Propuesta Zona Libre de Humo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>Franja Horaria:</label>
                    <select value={filterHorario} onChange={(e) => setFilterHorario(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                      <option value="TODOS">Todas las franjas horarias</option>
                      <option value="Mañana (6:00 - 12:00)">Mañana (6:00 - 12:00)</option>
                      <option value="Tarde (12:00 - 18:00)">Tarde (12:00 - 18:00)</option>
                      <option value="Noche (18:00 en adelante)">Noche (18:00 en adelante)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FORMULARIO GEOGRÁFICO */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Capturar Punto de Percepción SPA</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>Vínculo Institucional:</label>
                    <select value={perfilMap} onChange={(e) => setPerfilMap(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                      <option value="Estudiante de Pregrado">Estudiante de Pregrado</option>
                      <option value="Estudiante de Posgrado">Estudiante de Posgrado</option>
                      <option value="Docente">Docente</option>
                      <option value="Personal Administrativo">Personal Administrativo</option>
                      <option value="Servicios Generales / Mantenimiento">Servicios Generales / Mantenimiento</option>
                      <option value="Seguridad / Vigilancia">Seguridad / Vigilancia</option>
                      <option value="Directivo / Decana(o)">Directivo / Decana(o)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>Categoría Socioespacial del Punto:</label>
                    <select value={tipoPunto} onChange={(e) => setTipoPunto(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                      <option value="Alta Frecuencia / Consumo SPA">🔴 Alta Frecuencia / Consumo SPA</option>
                      <option value="Zonas de Transición / Fricción">🟠 Zonas de Transición / Fricción</option>
                      <option value="Bajo Impacto / Confort Espacial">🟡 Convivencia / Confort</option>
                      <option value="Propuesta Zona Libre / Reivindicada">🟢 Propuesta Zona Libre de Humo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>Sector / Infraestructura:</label>
                    <select value={sectorCampus} onChange={(e) => setSectorCampus(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                      <option value="Corredores / Bloques de Aulas">Corredores / Bloques de Aulas</option>
                      <option value="Zonas Verdes / Pasillos Exteriores">Zonas Verdes / Pasillos Exteriores</option>
                      <option value="Canchas y Zonas Deportivas">Canchas y Zonas Deportivas</option>
                      <option value="Plazas / Cafeterías">Plazas / Cafeterías</option>
                    </select>
                  </div>

                  <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '10px', color: '#0284c7' }}>
                    {selectedPoint ? `LAT: ${selectedPoint[0].toFixed(6)} | LNG: ${selectedPoint[1].toFixed(6)}` : 'Haz clic sobre el mapa para señalar un sitio.'}
                  </div>

                  <button onClick={handleGuardarPunto} disabled={!selectedPoint} style={{ width: '100%', padding: '10px', backgroundColor: selectedPoint ? '#0284c7' : '#94a3b8', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: selectedPoint ? 'pointer' : 'not-allowed', fontSize: '11px', textTransform: 'uppercase' }}>
                    Registrar Punto Geográfico
                  </button>
                </div>
              </div>

            </div>

            {/* VISOR CARTOGRÁFICO GARANTIZADO DE ALTO CONSTRASTE Y NOMBRES DE BLOQUES */}
            <div style={{ flex: 1, height: '100%', position: 'relative' }}>
              <MapContainer center={[8.7836, -75.8550]} zoom={17} style={{ height: '100%', width: '100%', backgroundColor: '#e2e8f0' }}>
                <LayersControl position="topright">
                  {/* Capa 1: OpenStreetMap Standard (La más confiable en México/Colombia con todos los bloques nombrados) */}
                  <LayersControl.BaseLayer checked name="OpenStreetMap (Ver Bloques y Aulas)">
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>

                  {/* Capa 2: Google Maps Calles (Ideal para orientación por nombres de vías y edificios) */}
                  <LayersControl.BaseLayer name="Google Maps (Calles y Edificios)">
                    <TileLayer 
                      url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
                      attribution='&copy; Google Maps'
                      maxZoom={20}
                    />
                  </LayersControl.BaseLayer>

                  {/* Capa 3: Google Maps Híbrido (Satélite con rotulación de áreas) */}
                  <LayersControl.BaseLayer name="Google Maps (Satélite + Rotulado)">
                    <TileLayer 
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
                      attribution='&copy; Google Maps'
                      maxZoom={20}
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                <AdvancedHeatmapLayer points={filteredPoints} showHeatmap={showHeatmap} radius={kdeRadius} blur={kdeBlur} />
                <LocationMarker position={selectedPoint} setPosition={setSelectedPoint} />

                {filteredPoints.map((item, idx) => (
                  <Marker key={idx} position={[parseFloat(item.latitud || item.lat), parseFloat(item.longitud || item.lng)]} icon={icons[item.tipo_punto || item.tipoPunto] || icons['Alta Frecuencia / Consumo SPA']}>
                    <Popup>
                      <div style={{ fontFamily: 'sans-serif', fontSize: '11px', color: '#0f172a' }}>
                        <strong style={{ color: '#0284c7' }}>{item.tipo_punto || item.tipoPunto}</strong><br />
                        <b>Estamento:</b> {item.perfil}<br />
                        <b>Sector:</b> {item.sector}<br />
                        <b>Franja:</b> {item.horario}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* LEYENDA TÉCNICA DINÁMICA */}
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '220px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Convenciones SPA</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                    <span>Alta Frecuencia SPA</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                    <span>Zonas de Transición</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#84cc16' }}></div>
                    <span>Bajo Impacto / Confort</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                    <span>Propuesta Zona Libre</span>
                  </div>
                </div>
                
                {showHeatmap && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Densidad de Concentración (KDE)</span>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #3b82f6, #06b6d4, #10b981, #eab308, #ef4444)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                      <span>Baja</span>
                      <span>Alta</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* INSTRUMENTO DE ENCUESTA */}
        {tab === 'encuesta' && (
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto', maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#0f172a', marginTop: 0, fontSize: '18px', fontWeight: '700' }}>Cuestionario de Recolección Socioespacial y Percepción Territorial sobre SPA</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '-8px', marginBottom: '24px' }}>
                Instrumento inclusivo para la comunidad universitaria (Estudiantes, Docentes, Administrativos, Mantenimiento, Vigilancia y Directivos).
              </p>

              <form onSubmit={handleGuardarEncuesta} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* BLOQUE I */}
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                    BLOQUE I: CARACTERIZACIÓN INSTITUCIONAL Y PERMANENCIA
                  </span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>1. Vínculo Institucional:</label>
                      <select value={vinculoComunidad} onChange={(e) => setVinculoComunidad(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Estudiante de Pregrado">Estudiante de Pregrado</option>
                        <option value="Estudiante de Posgrado">Estudiante de Posgrado</option>
                        <option value="Docente">Docente</option>
                        <option value="Personal Administrativo">Personal Administrativo</option>
                        <option value="Servicios Generales / Mantenimiento">Servicios Generales / Mantenimiento</option>
                        <option value="Seguridad / Vigilancia">Seguridad / Vigilancia</option>
                        <option value="Directivo / Decana(o)">Directivo / Decana(o)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>2. Permanencia Diaria en el Campus:</label>
                      <select value={permanenciaCampus} onChange={(e) => setPermanenciaCampus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Menos de 4 horas">Menos de 4 horas</option>
                        <option value="Jornada Completa (4 a 8 horas)">Jornada Completa (4 a 8 horas)</option>
                        <option value="Jornada Extendida (Más de 8 horas)">Jornada Extendida (Más de 8 horas)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>3. Hábitos / Relación con SPA:</label>
                      <select value={relacionSPA} onChange={(e) => setRelacionSPA(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="No consumidor/a">No consumidor/a</option>
                        <option value="Consumidor/a Ocasional">Consumidor/a Ocasional</option>
                        <option value="Consumidor/a Frecuente">Consumidor/a Frecuente</option>
                        <option value="Prefiero no responder">Prefiero no responder</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>4. Franja Horaria de Mayor Fricción SPA:</label>
                      <select value={franjaCritica} onChange={(e) => setFranjaCritica(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Mañana (6:00 - 12:00)">Mañana (6:00 - 12:00)</option>
                        <option value="Tarde (12:00 - 18:00)">Tarde (12:00 - 18:00)</option>
                        <option value="Noche (18:00 en adelante)">Noche (18:00 en adelante)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BLOQUE II */}
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                    BLOQUE II: PERCEPCIÓN Y APROPIACIÓN TERRITORIAL
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>5. Frecuencia de Presencia SPA en tu Entorno:</label>
                      <select value={frecuenciaFriccion} onChange={(e) => setFrecuenciaFriccion(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Diariamente">Diariamente</option>
                        <option value="Varias veces por semana">Varias veces por semana</option>
                        <option value="Rara vez">Rara vez</option>
                        <option value="Nunca">Nunca</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>6. Percepción sobre la Apropiación del Espacio:</label>
                      <select value={percepcionApropiacion} onChange={(e) => setPercepcionApropiacion(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Espacio de segregación / tensión espacial">Espacio de segregación / tensión espacial</option>
                        <option value="Espacio de encuentro pedagógico / sociocultural">Espacio de encuentro pedagógico / sociocultural</option>
                        <option value="Zona en neutralidad y libre tránsito">Zona en neutralidad y libre tránsito</option>
                        <option value="Área con deficiencia en gestión ambiental/aseo">Área con deficiencia en gestión ambiental/aseo</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>7. Factor Principal de Impacto Observado:</label>
                      <select value={afectacionPrincipal} onChange={(e) => setAfectacionPrincipal(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Salud respiratoria / Humo de segunda mano">Salud respiratoria / Humo de segunda mano</option>
                        <option value="Dificultad de concentración en aulas/trabajo">Dificultad de concentración en aulas/trabajo</option>
                        <option value="Afectación a las labores de mantenimiento y limpieza">Afectación a las labores de mantenimiento y limpieza</option>
                        <option value="Percepción de seguridad en los trayectos">Percepción de seguridad en los trayectos</option>
                        <option value="Sin impacto negativo observado">Sin impacto negativo observado</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        8. Confort Ambiental y Espacial en los Bloques (1 = Muy Incómodo, 5 = Altamente Confortable):
                      </label>
                      <input type="range" min="1" max="5" value={nivelConfort} onChange={(e) => setNivelConfort(e.target.value)} style={{ width: '100%', accentColor: '#0284c7' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                        <span>1 - Desconfort Alto</span>
                        <span>3 - Neutro</span>
                        <span>5 - Confort Óptimo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOQUE III */}
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                    BLOQUE III: ACUERDOS Y PROPUESTAS SOCIOESPACIALES
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>9. Disposición a Pactos de Convivencia SPA:</label>
                      <select value={disposicionPacto} onChange={(e) => setDisposicionPacto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Totalmente de acuerdo">Totalmente de acuerdo</option>
                        <option value="De acuerdo con condiciones">De acuerdo con condiciones</option>
                        <option value="Poco de acuerdo">Poco de acuerdo</option>
                        <option value="En desacuerdo">En desacuerdo</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>10. Estrategia Prioritaria Territorial:</label>
                      <select value={mecanismoGestion} onChange={(e) => setMecanismoGestion(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' }}>
                        <option value="Zonificación participativa y distribución del uso del suelo">Zonificación participativa y distribución del uso del suelo</option>
                        <option value="Campañas pedagógicas y sensibilización de cultura ciudadana">Campañas pedagógicas y sensibilización de cultura ciudadana</option>
                        <option value="Adecuación de infraestructura, aireación y áreas verdes">Adecuación de infraestructura, aireación y áreas verdes</option>
                        <option value="Mesas permanentes de diálogo inter-estamentos">Mesas permanentes de diálogo inter-estamentos</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Recomendaciones para la Reivindicación y Distribución del Espacio:
                      </label>
                      <textarea rows="3" value={propuestaCualitativa} onChange={(e) => setPropuestaCualitativa(e.target.value)} placeholder="Comparta sus propuestas específicas sobre la distribución territorial y convivencia en el campus..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
                    </div>
                  </div>
                </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Enviar Respuestas al Sistema de Información Geográfica
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ANALÍTICA */}
        {tab === 'dashboard' && (
          <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#0f172a', margin: 0, fontSize: '18px', fontWeight: '700' }}>Panel de Gobernanza Espacial SPA</h2>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Resultados consolidados de la herramienta de recolección</p>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '6px 10px', borderRadius: '6px', fontWeight: '700' }}>
                BASE DE DATOS: SUPABASE + POSTGIS
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Puntos Registrados</span>
                <h3 style={{ fontSize: '26px', color: '#0284c7', margin: '4px 0 0 0' }}>{respuestasMap.length}</h3>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Instrumentos Diligenciados</span>
                <h3 style={{ fontSize: '26px', color: '#10b981', margin: '4px 0 0 0' }}>{respuestasEncuesta.length}</h3>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Zonas de Frecuencia Alta</span>
                <h3 style={{ fontSize: '26px', color: '#ef4444', margin: '4px 0 0 0' }}>{respuestasMap.filter(r => (r.tipo_punto || r.tipoPunto) === 'Alta Frecuencia / Consumo SPA').length}</h3>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Zonas Libres Propuestas</span>
                <h3 style={{ fontSize: '26px', color: '#f59e0b', margin: '4px 0 0 0' }}>{respuestasMap.filter(r => (r.tipo_punto || r.tipoPunto) === 'Propuesta Zona Libre / Reivindicada').length}</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '300px' }}>
                <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '700', display: 'block', marginBottom: '12px' }}>DISTRIBUCIÓN POR SECTOR UNIVERSITARIO</span>
                <Bar data={dataBarSectores} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '300px' }}>
                <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '700', display: 'block', marginBottom: '12px' }}>PARTICIPACIÓN SEGÚN VÍNCULO INSTITUCIONAL</span>
                <Pie data={dataPieVinculo} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}