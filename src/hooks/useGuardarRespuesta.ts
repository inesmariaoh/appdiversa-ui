'use client';

/**
 * Guarda respuestas con debounce; online via API, offline en IndexedDB.
 */

import { useCallback, useRef } from 'react';
import { guardarRespuesta } from '@/services/respuestasServicio';
import { evaluarReglasPregunta } from '@/services/reglasServicio';
import { useSesionStore } from '@/store/sesionStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { useReglasStore } from '@/store/reglasStore';
import { useOfflineStore } from '@/store/offlineStore';
import { agregarOperacionCola, contarOperacionesPendientes, eliminarOperacionCola } from '@/storage/colaSincronizacion';
import { guardarRespuestaLocal } from '@/storage/respuestasLocal';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { calcularChecksum } from '@/utils/checksum';
import { generarUuid } from '@/utils/generarUuid';
import { extraerDetalleError } from '@/utils/erroresApi';
import type { Pregunta } from '@/types/formulario';

const DEBOUNCE_MS = 500;

const uuidLocalPorPregunta = new Map<string, string>();

function obtenerUuidLocal(codigoPregunta: string): string {
  const existente = uuidLocalPorPregunta.get(codigoPregunta);
  if (existente) return existente;
  const nuevo = generarUuid();
  uuidLocalPorPregunta.set(codigoPregunta, nuevo);
  return nuevo;
}

export function useGuardarRespuesta() {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const enLinea = useOfflineStore((s) => s.enLinea);
  const establecerOperacionesPendientes = useOfflineStore(
    (s) => s.establecerOperacionesPendientes
  );
  const establecerRespuesta = useRespuestasStore((s) => s.establecerRespuesta);
  const establecerResultadoReglas = useReglasStore((s) => s.establecerResultado);

  const persistirOffline = useCallback(
    async (pregunta: Pregunta, valor: unknown, versionCliente: number) => {
      const { uuidSesion } = useSesionStore.getState();
      if (!uuidSesion) return;

      const uuidLocal = obtenerUuidLocal(pregunta.codigo);
      const fechaCliente = new Date().toISOString();
      const checksum = await calcularChecksum({
        codigo_pregunta: pregunta.codigo,
        valor,
        version_cliente: versionCliente,
      });

      await guardarRespuestaLocal({
        uuid_local: uuidLocal,
        uuid_sesion: uuidSesion,
        codigo_pregunta: pregunta.codigo,
        valor,
        version_cliente: versionCliente,
        fecha_cliente: fechaCliente,
        checksum,
      });

      await agregarOperacionCola({
        uuid_local: uuidLocal,
        uuid_sesion: uuidSesion,
        codigo_pregunta: pregunta.codigo,
        valor,
        version_cliente: versionCliente,
        fecha_cliente: fechaCliente,
        checksum,
        estado: 'pendiente',
      });

      const pendientes = await contarOperacionesPendientes(uuidSesion);
      establecerOperacionesPendientes(pendientes);
    },
    [establecerOperacionesPendientes]
  );

  const guardarEnServidor = useCallback(
    async (pregunta: Pregunta, valor: unknown, observacion: string) => {
      const { uuidSesion, tokenCliente } = useSesionStore.getState();
      if (!uuidSesion || !tokenCliente) return;

      const salida = await guardarRespuesta(
        {
          uuid_sesion: uuidSesion,
          codigo_pregunta: pregunta.codigo,
          valor,
          observacion,
          origen_respuesta: 'web',
          fecha_respuesta_cliente: new Date().toISOString(),
          token_cliente: tokenCliente,
        },
        { uuidSesion, tokenCliente }
      );

      if (salida.reglas) {
        establecerResultadoReglas(salida.reglas);
      } else {
        const reglas = await evaluarReglasPregunta(
          { uuidSesion, tokenCliente },
          pregunta.codigo
        );
        establecerResultadoReglas(reglas);
      }

      const uuidLocal = obtenerUuidLocal(pregunta.codigo);
      await eliminarOperacionCola(uuidLocal);
      const pendientes = await contarOperacionesPendientes(uuidSesion);
      establecerOperacionesPendientes(pendientes);
    },
    [establecerOperacionesPendientes, establecerResultadoReglas]
  );

  const persistirRespuesta = useCallback(
    async (
      pregunta: Pregunta,
      valor: unknown,
      versionCliente: number,
      observacion: string,
    ) => {
      const enLineaActual = useOfflineStore.getState().enLinea;
      try {
        if (enLineaActual) {
          await guardarEnServidor(pregunta, valor, observacion);
        } else {
          await persistirOffline(pregunta, valor, versionCliente);
        }
      } catch (err) {
        await persistirOffline(pregunta, valor, versionCliente);
        establecerOperacionesPendientes(
          useOfflineStore.getState().operacionesPendientes + 1
        );
        extraerDetalleError(err);
      }
    },
    [guardarEnServidor, persistirOffline, establecerOperacionesPendientes]
  );

  const guardarInmediato = useCallback(
    async (pregunta: Pregunta, valor: unknown, observacion?: string) => {
      const codigo = pregunta.codigo;
      const timerPrevio = timers.current.get(codigo);
      if (timerPrevio) clearTimeout(timerPrevio);

      const respuestaPrev = useRespuestasStore.getState().obtenerRespuesta(codigo);
      const versionCliente = (respuestaPrev?.versionCliente ?? 0) + 1;
      const enLineaActual = useOfflineStore.getState().enLinea;
      const observacionFinal = observacion ?? respuestaPrev?.observacion ?? '';

      establecerRespuesta(codigo, {
        valor,
        observacion: observacionFinal,
        versionCliente,
        origenRespuesta: enLineaActual ? 'web' : 'offline',
        fechaCliente: new Date().toISOString(),
      });

      await persistirRespuesta(pregunta, valor, versionCliente, observacionFinal);
    },
    [establecerRespuesta, persistirRespuesta]
  );

  const programarGuardado = useCallback(
    (pregunta: Pregunta, valor: unknown, observacion?: string) => {
      const codigo = pregunta.codigo;
      const timerPrevio = timers.current.get(codigo);
      if (timerPrevio) clearTimeout(timerPrevio);

      const respuestaPrev = useRespuestasStore.getState().obtenerRespuesta(codigo);
      const versionCliente = (respuestaPrev?.versionCliente ?? 0) + 1;
      const fechaCliente = new Date().toISOString();
      const observacionFinal = observacion ?? respuestaPrev?.observacion ?? '';

      establecerRespuesta(codigo, {
        valor,
        observacion: observacionFinal,
        versionCliente,
        origenRespuesta: enLinea ? 'web' : 'offline',
        fechaCliente,
      });

      const timer = setTimeout(() => {
        ejecutarSinEspera(
          persistirRespuesta(pregunta, valor, versionCliente, observacionFinal),
        );
      }, DEBOUNCE_MS);

      timers.current.set(codigo, timer);
    },
    [enLinea, establecerRespuesta, persistirRespuesta]
  );

  return { programarGuardado, guardarInmediato };
}
