import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { KDE_GRADIENT } from '../../lib/config';

/**
 * Kernel Density Estimation (KDE) heat layer driven by point intensity weights.
 */
export default function HeatmapLayer({ points, visible, radius, blur }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return undefined;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (visible && points.length > 0) {
      const heatPoints = points.map((p) => [
        parseFloat(p.latitud ?? p.lat),
        parseFloat(p.longitud ?? p.lng),
        p.peso_intensidad ?? p.pesoIntensidad ?? 0.8,
      ]);

      layerRef.current = L.heatLayer(heatPoints, {
        radius: parseInt(radius, 10),
        blur: parseInt(blur, 10),
        maxZoom: 19,
        gradient: KDE_GRADIENT,
      }).addTo(map);
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, visible, radius, blur]);

  return null;
}
