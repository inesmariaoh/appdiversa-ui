'use client';

/**
 * Pregunta de tipo hora.
 */

import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { estilosCampoTexto } from '../estilosCampo';
import type { PropsPregunta } from '../types';

export function PreguntaHora({
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
  const valorHora = typeof valor === 'string' ? valor : '';

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <input
        id={id}
        type="time"
        value={valorHora}
        required={obligatoria ?? pregunta.es_obligatoria}
        disabled={deshabilitada}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={idError}
        className="w-full max-w-xs rounded-lg px-3 py-2.5 text-sm"
        style={estilosCampoTexto(error, deshabilitada)}
        onChange={(e) => onCambio(e.target.value)}
      />
      {error && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
