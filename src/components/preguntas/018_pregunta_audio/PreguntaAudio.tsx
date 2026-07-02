'use client';

/**
 * Pregunta de tipo audio con subida al repositorio documental.
 */

import { useState } from 'react';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { useSubirArchivo } from '@/hooks/useSubirArchivo';
import type { ValorArchivoRespuesta } from '@/types/archivo';
import type { PropsPregunta } from '../types';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const TAMANO_MAXIMO_MB = 50;

function normalizarAudio(valor: unknown): ValorArchivoRespuesta | null {
  if (valor && typeof valor === 'object' && 'uuid' in valor) {
    return valor as ValorArchivoRespuesta;
  }
  return null;
}

export function PreguntaAudio({
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
  const audio = normalizarAudio(valor);
  const { subir, subiendo, error: errorSubida } = useSubirArchivo();
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  async function manejarArchivo(file: File | undefined) {
    setErrorLocal(null);
    if (!file) {
      onCambio(null);
      return;
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setErrorLocal(`El audio supera ${TAMANO_MAXIMO_MB} MB.`);
      return;
    }
    try {
      const resultado = await subir({
        archivo: file,
        tipo_archivo: 'audio',
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
        accept="audio/*"
        capture="user"
        required={obligatoria ?? pregunta.es_obligatoria}
        disabled={deshabilitada || subiendo}
        aria-invalid={errorMostrar ? 'true' : undefined}
        aria-describedby={idError}
        className="w-full text-sm"
        onChange={(e) => ejecutarSinEspera(manejarArchivo(e.target.files?.[0]))}
      />
      {subiendo && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-texto-secundario)' }}>
          Subiendo audio...
        </p>
      )}
      {audio && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-texto-secundario)' }}>
          Audio: {audio.nombre}
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
