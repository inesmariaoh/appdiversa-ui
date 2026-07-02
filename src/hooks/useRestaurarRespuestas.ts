'use client';

/**
 * Restaura respuestas previas de la sesion desde el backend y, cuando no hay
 * conexion o la peticion falla, desde el almacenamiento local (IndexedDB).
 */

import { useEffect, useRef } from 'react';
import type { UseFormReset } from 'react-hook-form';
import type { Pregunta } from '@/types/formulario';
import type { OrigenRespuesta } from '@/types/respuesta';
import { obtenerRespuestasSesion } from '@/services/sesionesServicio';
import { useSesionStore } from '@/store/sesionStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { useOfflineStore } from '@/store/offlineStore';
import { obtenerRespuestasPorSesion } from '@/storage/respuestasLocal';
import {
  mapaValoresDesdeRespuestasServidor,
  mapaObservacionesDesdeRespuestasServidor,
} from '@/utils/respuestaDesdeServidor';
import { mapaValoresDesdeRespuestasLocales } from '@/utils/respuestaDesdeLocal';
import { construirValoresIniciales } from '@/utils/validacionPregunta';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface UseRestaurarRespuestasOpciones {
  listo: boolean;
  preguntas: Pregunta[];
  reset: UseFormReset<Record<string, unknown>>;
}

interface EntradaRestauracion {
  valor: unknown;
  observacion: string;
  versionCliente: number;
  origenRespuesta: OrigenRespuesta;
  fechaCliente: string;
}

type ResetFormulario = UseFormReset<Record<string, unknown>>;

function aplicarValoresAlFormulario(
  preguntas: Pregunta[],
  reset: ResetFormulario,
  mapa: Record<string, unknown>,
  entradas: Record<string, EntradaRestauracion>
): void {
  const base = construirValoresIniciales(preguntas);
  reset({ ...base, ...mapa });

  const establecerRespuesta = useRespuestasStore.getState().establecerRespuesta;
  for (const codigo of Object.keys(entradas)) {
    establecerRespuesta(codigo, entradas[codigo]);
  }
}

async function restaurarDesdeServidor(
  uuidSesion: string,
  tokenCliente: string,
  preguntas: Pregunta[],
  reset: ResetFormulario
): Promise<boolean> {
  const salida = await obtenerRespuestasSesion({ uuidSesion, tokenCliente });
  if (salida.respuestas.length === 0) return false;

  const mapa = mapaValoresDesdeRespuestasServidor(preguntas, salida.respuestas);
  if (Object.keys(mapa).length === 0) return false;

  const observaciones = mapaObservacionesDesdeRespuestasServidor(salida.respuestas);
  const entradas: Record<string, EntradaRestauracion> = {};
  for (const respuesta of salida.respuestas) {
    if (mapa[respuesta.codigo_pregunta] === undefined) continue;
    entradas[respuesta.codigo_pregunta] = {
      valor: mapa[respuesta.codigo_pregunta],
      observacion: observaciones[respuesta.codigo_pregunta] ?? '',
      versionCliente: respuesta.version_respuesta,
      origenRespuesta: respuesta.origen_respuesta,
      fechaCliente: respuesta.fecha_respuesta_cliente ?? new Date().toISOString(),
    };
  }

  aplicarValoresAlFormulario(preguntas, reset, mapa, entradas);
  return true;
}

async function restaurarDesdeLocal(
  uuidSesion: string,
  preguntas: Pregunta[],
  reset: ResetFormulario
): Promise<boolean> {
  const registros = await obtenerRespuestasPorSesion(uuidSesion);
  if (registros.length === 0) return false;

  const mapa = mapaValoresDesdeRespuestasLocales(preguntas, registros);
  if (Object.keys(mapa).length === 0) return false;

  const entradas: Record<string, EntradaRestauracion> = {};
  for (const registro of registros) {
    if (mapa[registro.codigo_pregunta] === undefined) continue;
    entradas[registro.codigo_pregunta] = {
      valor: registro.valor,
      observacion: '',
      versionCliente: registro.version_cliente,
      origenRespuesta: 'offline',
      fechaCliente: registro.fecha_cliente,
    };
  }

  aplicarValoresAlFormulario(preguntas, reset, mapa, entradas);
  return true;
}

async function ejecutarRestauracion(
  preguntas: Pregunta[],
  reset: ResetFormulario
): Promise<boolean> {
  const { uuidSesion, tokenCliente } = useSesionStore.getState();
  if (!uuidSesion) return false;

  const enLinea = useOfflineStore.getState().enLinea;
  if (enLinea && tokenCliente) {
    try {
      const restaurado = await restaurarDesdeServidor(
        uuidSesion,
        tokenCliente,
        preguntas,
        reset
      );
      if (restaurado) return true;
    } catch {
      // Ante fallo del servidor se recurre a la restauracion local offline.
    }
  }

  return restaurarDesdeLocal(uuidSesion, preguntas, reset);
}

export function useRestaurarRespuestas({
  listo,
  preguntas,
  reset,
}: UseRestaurarRespuestasOpciones): void {
  const restaurado = useRef(false);

  useEffect(() => {
    if (!listo || restaurado.current || preguntas.length === 0) return;

    let cancelado = false;

    async function restaurar() {
      const exito = await ejecutarRestauracion(preguntas, reset);
      if (exito && !cancelado) {
        restaurado.current = true;
      }
    }

    ejecutarSinEspera(restaurar());

    return () => {
      cancelado = true;
    };
  }, [listo, preguntas, reset]);
}
