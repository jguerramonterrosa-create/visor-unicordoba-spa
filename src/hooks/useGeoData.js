import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { weightForCategory } from '../lib/config';

/**
 * Centralizes all Supabase reads/writes for the geospatial viewer.
 * Returns the two datasets plus memoized mutation helpers.
 */
export function useGeoData() {
  const [puntos, setPuntos] = useState([]);
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPuntos = useCallback(async () => {
    const { data, error } = await supabase.from('puntos_mapa').select('*');
    if (!error && data) setPuntos(data);
  }, []);

  const fetchEncuestas = useCallback(async () => {
    const { data, error } = await supabase
      .from('respuestas_encuesta')
      .select('*');
    if (!error && data) setEncuestas(data);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchPuntos(), fetchEncuestas()]);
      setLoading(false);
    })();
  }, [fetchPuntos, fetchEncuestas]);

  const savePunto = useCallback(async ({ position, perfil, tipoPunto, sector, horario }) => {
    if (!position) return { ok: false, message: 'Sin coordenadas seleccionadas.' };

    const nuevoPunto = {
      latitud: position[0],
      longitud: position[1],
      perfil,
      tipo_punto: tipoPunto,
      peso_intensidad: weightForCategory(tipoPunto),
      sector,
      horario,
      geom: `POINT(${position[1]} ${position[0]})`,
    };

    const { data, error } = await supabase
      .from('puntos_mapa')
      .insert([nuevoPunto])
      .select();

    if (error) return { ok: false, message: 'Error PostGIS: ' + error.message };

    setPuntos((prev) => [...prev, data[0]]);
    return { ok: true, message: 'Punto geográfico registrado correctamente.' };
  }, []);

  const saveEncuesta = useCallback(async (payload) => {
    const { data, error } = await supabase
      .from('respuestas_encuesta')
      .insert([payload])
      .select();

    if (error) return { ok: false, message: 'Error en el envío: ' + error.message };

    setEncuestas((prev) => [...prev, data[0]]);
    return { ok: true, message: 'Instrumento socioespacial procesado exitosamente.' };
  }, []);

  return {
    puntos,
    encuestas,
    loading,
    savePunto,
    saveEncuesta,
  };
}
