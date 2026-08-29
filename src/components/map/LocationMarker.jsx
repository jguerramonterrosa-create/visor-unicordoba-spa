import { Marker, useMapEvents } from 'react-leaflet';
import { SELECTION_MARKER } from '../../lib/config';

/**
 * Captures a click on the map and renders the pending selection pin.
 */
export default function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  if (!position) return null;
  return <Marker position={position} icon={SELECTION_MARKER} />;
}
