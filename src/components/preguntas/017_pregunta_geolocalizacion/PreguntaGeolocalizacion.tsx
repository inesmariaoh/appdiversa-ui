'use client';

/**
 * Pregunta de tipo geolocalizacion.
 */

import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { Boton } from '@/components/ui/001_boton';
import type { PropsPregunta } from '../types';

export interface ValorGeolocalizacion {
  latitud: number;
  longitud: number;
  precision?: number;
}

function normalizarGeo(valor: unknown): ValorGeolocalizacion | null {
  if (
    valor &&
    typeof valor === 'object' &&
    'latitud' in valor &&
    'longitud' in valor
  ) {
    return valor as ValorGeolocalizacion;
  }
  return null;
}

export function PreguntaGeolocalizacion({
  pregunta,
  valor,
  onCambio,
  deshabilitada = false,
  obligatoria,
  error,
  idPrefijo,
}: PropsPregunta) {
  const id = idPrefijo ?? pregunta.codigo;
  const idError = error ? `${id}-error` : undefined;
  const geo = normalizarGeo(valor);

  function capturarUbicacion() {
    if (!navigator.geolocation) {
      onCambio({ latitud: 0, longitud: 0 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCambio({
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
          precision: pos.coords.accuracy,
        });
      },
      () => onCambio(null)
    );
  }

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <output
        id={id}
        className="block text-sm mb-2"
        style={{ color: 'var(--color-texto-secundario)' }}
        aria-live="polite"
      >
        {geo
          ? `Lat: ${geo.latitud.toFixed(6)}, Lng: ${geo.longitud.toFixed(6)}`
          : 'Ubicación no capturada'}
      </output>
      <Boton
        type="button"
        variante="secundario"
        ancho="auto"
        onClick={capturarUbicacion}
        disabled={deshabilitada}
      >
        Obtener ubicación
      </Boton>
      {error && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
