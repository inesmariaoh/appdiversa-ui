'use client';
/**
 * Botones de descarga de las respuestas de una sesion del historial.
 * Permite exportar en PDF o Excel lo diligenciado por el usuario.
 */

import { useState } from 'react';
import {
  descargarMisRespuestas,
  type FormatoDescargaRespuestas,
} from '@/services/sesionesServicio';
import { dispararDescargaBlob } from '@/utils/descargaArchivos';

interface BotonesDescargaRespuestasProps {
  readonly uuidSesion: string;
  readonly nombreFormulario: string;
}

const OPCIONES_DESCARGA: ReadonlyArray<{
  readonly formato: FormatoDescargaRespuestas;
  readonly etiqueta: string;
  readonly extension: string;
}> = [
  { formato: 'pdf', etiqueta: 'PDF', extension: 'pdf' },
  { formato: 'xlsx', etiqueta: 'Excel', extension: 'xlsx' },
];

const MENSAJE_ERROR_DESCARGA =
  'No fue posible generar la descarga. Intenta nuevamente.';

export function BotonesDescargaRespuestas({
  uuidSesion,
  nombreFormulario,
}: BotonesDescargaRespuestasProps) {
  const [formatoEnProceso, setFormatoEnProceso] =
    useState<FormatoDescargaRespuestas | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function manejarDescarga(
    formato: FormatoDescargaRespuestas,
    extension: string
  ): Promise<void> {
    setFormatoEnProceso(formato);
    setError(null);
    try {
      const blob = await descargarMisRespuestas(uuidSesion, formato);
      dispararDescargaBlob(blob, `mis_respuestas_${uuidSesion}.${extension}`);
    } catch {
      setError(MENSAJE_ERROR_DESCARGA);
    } finally {
      setFormatoEnProceso(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <fieldset className="flex gap-2 border-0 p-0 m-0">
        <legend className="sr-only">{`Descargar respuestas de ${nombreFormulario}`}</legend>
        {OPCIONES_DESCARGA.map(({ formato, etiqueta, extension }) => (
          <button
            key={formato}
            type="button"
            onClick={() => manejarDescarga(formato, extension)}
            disabled={formatoEnProceso !== null}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              border: '1px solid var(--color-primario)',
              color: 'var(--color-primario)',
              backgroundColor: 'transparent',
            }}
            aria-label={`Descargar respuestas de ${nombreFormulario} en ${etiqueta}`}
          >
            {formatoEnProceso === formato ? 'Generando…' : `Descargar ${etiqueta}`}
          </button>
        ))}
      </fieldset>
      {error ? (
        <p role="alert" className="text-xs" style={{ color: 'var(--color-error, #dc2626)' }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
