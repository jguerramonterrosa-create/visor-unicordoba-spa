import L from 'leaflet';

// Campus centroid (Universidad de Córdoba, Montería)
export const MAP_CENTER = [8.7836, -75.855];
export const MAP_ZOOM = 17;

// Kernel density (KDE) heat gradient
export const KDE_GRADIENT = {
  0.2: '#3b82f6',
  0.4: '#06b6d4',
  0.6: '#10b981',
  0.8: '#eab308',
  1.0: '#ef4444',
};

// Socio-spatial classification categories (single source of truth)
export const CATEGORIES = [
  {
    value: 'Alta Frecuencia / Consumo SPA',
    short: 'Alta Frecuencia SPA',
    dot: '🔴',
    color: '#ef4444',
    weight: 1.0,
  },
  {
    value: 'Zonas de Transición / Fricción',
    short: 'Zonas de Transición',
    dot: '🟠',
    color: '#f59e0b',
    weight: 0.7,
  },
  {
    value: 'Bajo Impacto / Confort Espacial',
    short: 'Bajo Impacto / Confort',
    dot: '🟡',
    color: '#84cc16',
    weight: 0.4,
  },
  {
    value: 'Propuesta Zona Libre / Reivindicada',
    short: 'Propuesta Zona Libre',
    dot: '🟢',
    color: '#10b981',
    weight: 0.2,
  },
];

export const getCategory = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];

export const weightForCategory = (value) => getCategory(value).weight;

// Leaflet DivIcon factory (high-contrast GIS pin)
export const makeMarker = (color) =>
  new L.DivIcon({
    className: 'custom-pin',
    html: `<div style="background-color:${color};width:16px;height:16px;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export const SELECTION_MARKER = makeMarker('#0e7490');

// Category value -> Leaflet icon
export const CATEGORY_ICONS = CATEGORIES.reduce((acc, c) => {
  acc[c.value] = makeMarker(c.color);
  return acc;
}, {});

export const iconForCategory = (value) =>
  CATEGORY_ICONS[value] || CATEGORY_ICONS[CATEGORIES[0].value];

// Base tile layers offered in the layer switcher
export const BASE_LAYERS = [
  {
    name: 'OpenStreetMap (Bloques y Aulas)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    checked: true,
  },
  {
    name: 'Google Maps (Calles y Edificios)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    checked: false,
  },
  {
    name: 'Google Maps (Satélite + Rotulado)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    checked: false,
  },
];

// Reusable option lists for the forms
export const PERFILES = [
  'Estudiante de Pregrado',
  'Estudiante de Posgrado',
  'Docente',
  'Personal Administrativo',
  'Servicios Generales / Mantenimiento',
  'Seguridad / Vigilancia',
  'Directivo / Decana(o)',
];

export const SECTORES = [
  'Corredores / Bloques de Aulas',
  'Zonas Verdes / Pasillos Exteriores',
  'Canchas y Zonas Deportivas',
  'Plazas / Cafeterías',
];

export const HORARIOS = [
  'Mañana (6:00 - 12:00)',
  'Tarde (12:00 - 18:00)',
  'Noche (18:00 en adelante)',
];

export const PERMANENCIAS = [
  'Menos de 4 horas',
  'Jornada Completa (4 a 8 horas)',
  'Jornada Extendida (Más de 8 horas)',
];

export const RELACIONES_SPA = [
  'No consumidor/a',
  'Consumidor/a Ocasional',
  'Consumidor/a Frecuente',
  'Prefiero no responder',
];

export const FRECUENCIAS = [
  'Diariamente',
  'Varias veces por semana',
  'Rara vez',
  'Nunca',
];

export const PERCEPCIONES = [
  'Espacio de segregación / tensión espacial',
  'Espacio de encuentro pedagógico / sociocultural',
  'Zona en neutralidad y libre tránsito',
  'Área con deficiencia en gestión ambiental/aseo',
];

export const AFECTACIONES = [
  'Salud respiratoria / Humo de segunda mano',
  'Dificultad de concentración en aulas/trabajo',
  'Afectación a las labores de mantenimiento y limpieza',
  'Percepción de seguridad en los trayectos',
  'Sin impacto negativo observado',
];

export const DISPOSICIONES = [
  'Totalmente de acuerdo',
  'De acuerdo con condiciones',
  'Poco de acuerdo',
  'En desacuerdo',
];

export const MECANISMOS = [
  'Zonificación participativa y distribución del uso del suelo',
  'Campañas pedagógicas y sensibilización de cultura ciudadana',
  'Adecuación de infraestructura, aireación y áreas verdes',
  'Mesas permanentes de diálogo inter-estamentos',
];
