import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_LAYERS, MAP_CENTER, MAP_ZOOM, iconForCategory } from '../../lib/config';
import HeatmapLayer from './HeatmapLayer';
import LocationMarker from './LocationMarker';

/**
 * The full-screen cartographic surface. All UI floats on top of this.
 */
export default function MapCanvas({
  points,
  showHeatmap,
  kdeRadius,
  kdeBlur,
  selectedPoint,
  onSelectPoint,
}) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      zoomControl
      className="h-full w-full"
      style={{ background: '#dbe4ea' }}
    >
      <LayersControl position="topright">
        {BASE_LAYERS.map((layer) => (
          <LayersControl.BaseLayer key={layer.name} checked={layer.checked} name={layer.name}>
            <TileLayer
              url={layer.url}
              attribution={layer.attribution}
              maxZoom={layer.maxZoom}
            />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>

      <HeatmapLayer points={points} visible={showHeatmap} radius={kdeRadius} blur={kdeBlur} />
      <LocationMarker position={selectedPoint} onSelect={onSelectPoint} />

      {points.map((item, idx) => {
        const lat = parseFloat(item.latitud ?? item.lat);
        const lng = parseFloat(item.longitud ?? item.lng);
        const tipo = item.tipo_punto ?? item.tipoPunto;
        return (
          <Marker key={item.id ?? idx} position={[lat, lng]} icon={iconForCategory(tipo)}>
            <Popup>
              <div className="font-sans text-xs text-foreground">
                <strong className="text-primary">{tipo}</strong>
                <br />
                <b>Estamento:</b> {item.perfil}
                <br />
                <b>Sector:</b> {item.sector}
                <br />
                <b>Franja:</b> {item.horario}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
