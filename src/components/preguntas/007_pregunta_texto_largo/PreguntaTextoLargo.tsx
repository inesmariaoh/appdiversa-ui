'use client';

/**
 * Pregunta de tipo texto_largo (textarea).
 */

import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { estilosCampoTexto } from '../estilosCampo';
import type { PropsPregunta } from '../types';

export function PreguntaTextoLargo({
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
  const valorTexto = typeof valor === 'string' ? valor : '';

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <textarea
        id={id}
        value={valorTexto}
        rows={5}
        required={obligatoria ?? pregunta.es_obligatoria}
        disabled={deshabilitada}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={idError}
        maxLength={pregunta.longitud_maxima ?? undefined}
        className="w-full rounded-lg px-3 py-2.5 text-sm resize-y"
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
