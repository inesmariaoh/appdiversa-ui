'use client';

/**
 * Pregunta de tipo archivo con subida multipart al repositorio.
 */

import { useState } from 'react';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { useSubirArchivo } from '@/hooks/useSubirArchivo';
import { descargarArchivo } from '@/services/archivosServicio';
import type { ValorArchivoRespuesta } from '@/types/archivo';
import type { PropsPregunta } from '../types';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const TAMANO_MAXIMO_MB = 25;

function normalizarArchivo(valor: unknown): ValorArchivoRespuesta | null {
  if (valor && typeof valor === 'object' && 'uuid' in valor) {
    return valor as ValorArchivoRespuesta;
  }
  return null;
}

export function PreguntaArchivo({
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
  const archivo = normalizarArchivo(valor);
  const { subir, subiendo, error: errorSubida } = useSubirArchivo();
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  async function manejarDescarga() {
    if (!archivo?.uuid) return;
    setDescargando(true);
    try {
      const blob = await descargarArchivo(archivo.uuid);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = archivo.nombre;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorLocal('No fue posible descargar el archivo.');
    } finally {
      setDescargando(false);
    }
  }

  async function manejarArchivo(file: File | undefined) {
    setErrorLocal(null);
    if (!file) {
      onCambio(null);
      return;
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setErrorLocal(`El archivo supera ${TAMANO_MAXIMO_MB} MB.`);
      return;
    }
    try {
      const resultado = await subir({
        archivo: file,
        tipo_archivo: 'documento',
        origen: 'respuesta',
        es_publico: true,
      });
      onCambio({
        uuid: resultado.uuid,
        nombre: resultado.nombre_original,
        url: resultado.url,
        mime_type: resultado.mime_type,
        tamano_bytes: resultado.tamano_bytes,
      });
    } catch {
      // El hook ya registra el error funcional.
    }
  }

  const errorMostrar = error ?? errorSubida ?? errorLocal ?? undefined;

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada || subiendo}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <input
        id={id}
        type="file"
        required={obligatoria ?? pregunta.es_obligatoria}
        disabled={deshabilitada || subiendo}
        aria-invalid={errorMostrar ? 'true' : undefined}
        aria-describedby={idError}
        className="w-full text-sm"
        style={{ color: 'var(--color-texto-primario)' }}
        onChange={(e) => ejecutarSinEspera(manejarArchivo(e.target.files?.[0]))}
      />
      {subiendo && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-texto-secundario)' }}>
          Subiendo archivo...
        </p>
      )}
      {archivo && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-texto-secundario)' }}>
          Archivo: {archivo.nombre}{' '}
          {archivo.url ? (
            <a href={archivo.url} target="_blank" rel="noopener noreferrer">
              Ver archivo
            </a>
          ) : (
            <button
              type="button"
              className="underline"
              disabled={descargando}
              onClick={() => ejecutarSinEspera(manejarDescarga())}
            >
              {descargando ? 'Descargando...' : 'Descargar'}
            </button>
          )}
        </p>
      )}
      {errorMostrar && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {errorMostrar}
        </p>
      )}
    </fieldset>
  );
}
