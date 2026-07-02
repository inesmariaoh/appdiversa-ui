'use client';

/**
 * Pregunta de tipo texto_corto.
 */

import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import type { PropsPregunta } from '../types';

export function PreguntaTextoCorto({
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
  const idAyuda = pregunta.tooltip ? `${id}-ayuda` : undefined;
  const valorTexto = typeof valor === 'string' ? valor : '';

  return (
    <fieldset
      className="border-0 p-0 m-0 w-full"
      disabled={deshabilitada}
      aria-describedby={[idAyuda, idError].filter(Boolean).join(' ') || undefined}
    >
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
        idAyuda={idAyuda}
      />
      <input
        id={id}
        type="text"
        value={valorTexto}
        required={obligatoria ?? pregunta.es_obligatoria}
        disabled={deshabilitada}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={idError}
        maxLength={pregunta.longitud_maxima ?? undefined}
        className="w-full rounded-lg px-3 py-2.5 text-sm"
        style={{
          border: error
            ? '1.5px solid var(--color-error)'
            : '1.5px solid var(--color-borde-fuerte)',
          backgroundColor: deshabilitada
            ? 'var(--color-deshabilitado-fondo)'
            : 'var(--color-fondo-tarjeta)',
          color: 'var(--color-texto-primario)',
          minHeight: 'var(--tamano-control-min)',
        }}
        onChange={(e) => onCambio(e.target.value)}
      />
      {error && (
        <p
          id={idError}
          role="alert"
          className="text-xs mt-2"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
