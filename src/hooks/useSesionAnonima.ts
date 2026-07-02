'use client';

/**
 * Crea o restaura sesion anonima y la persiste en IndexedDB.
 */

import { useCallback, useEffect, useState } from 'react';
import { crearSesionAnonima } from '@/services/sesionesServicio';
import { useSesionStore } from '@/store/sesionStore';
import { appDiversaDb } from '@/storage/appDiversaDb';
import { guardarSesionLocal } from '@/storage/sesionesLocal';
import { generarUuid } from '@/utils/generarUuid';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface UseSesionAnonimaOpciones {
  uuidFormulario: string;
  idioma?: string;
  esOffline?: boolean;
  /** Cuando es true, no crea sesion (modo preview). */
  deshabilitado?: boolean;
}

interface UseSesionAnonimaResultado {
  listo: boolean;
  error: string | null;
  iniciarSesion: () => Promise<void>;
}

async function persistirSesionRemota(
  uuidFormulario: string,
  idioma: string,
  esOffline: boolean
): Promise<void> {
  const establecerSesion = useSesionStore.getState().establecerSesion;
  const uuidSesion = generarUuid();
  const respuesta = await crearSesionAnonima({
    uuid_sesion: uuidSesion,
    uuid_formulario: uuidFormulario,
    idioma,
    es_offline: esOffline,
  });

  establecerSesion({
    uuidSesion: respuesta.uuid_sesion,
    tokenCliente: respuesta.token_cliente,
    uuidFormulario,
    estado: respuesta.estado,
  });

  guardarSesionLocal({
    uuid_sesion: respuesta.uuid_sesion,
    token_cliente: respuesta.token_cliente,
    uuid_formulario: uuidFormulario,
    estado: respuesta.estado,
  }).catch(() => undefined);
}

async function restaurarSesionDesdeIndexedDb(
  uuidFormulario: string
): Promise<boolean> {
  const sesiones = await appDiversaDb.sesiones
    .where('uuid_formulario')
    .equals(uuidFormulario)
    .toArray();

  const sesionLocal = sesiones.at(-1);
  if (!sesionLocal) return false;

  useSesionStore.getState().establecerSesion({
    uuidSesion: sesionLocal.uuid_sesion,
    tokenCliente: sesionLocal.token_cliente,
    uuidFormulario: sesionLocal.uuid_formulario,
    estado: sesionLocal.estado,
  });
  return true;
}

function sesionStoreActiva(uuidFormulario: string): boolean {
  const estado = useSesionStore.getState();
  return Boolean(
    estado.uuidSesion &&
      estado.uuidFormulario === uuidFormulario &&
      estado.tokenCliente,
  );
}

async function inicializarSesionAnonima(
  uuidFormulario: string,
  idioma: string,
  esOffline: boolean,
): Promise<void> {
  if (sesionStoreActiva(uuidFormulario)) return;

  const enLinea = typeof navigator === 'undefined' ? true : navigator.onLine;

  if (enLinea) {
    await persistirSesionRemota(uuidFormulario, idioma, esOffline);
    return;
  }

  const restaurada = await restaurarSesionDesdeIndexedDb(uuidFormulario);
  if (restaurada) return;

  await persistirSesionRemota(uuidFormulario, idioma, esOffline);
}

async function inicializarSesionConRespaldo(
  uuidFormulario: string,
  idioma: string,
  esOffline: boolean,
): Promise<{ listo: boolean; error: string | null }> {
  try {
    await inicializarSesionAnonima(uuidFormulario, idioma, esOffline);
    return { listo: true, error: null };
  } catch (err) {
    const restaurada = await restaurarSesionDesdeIndexedDb(uuidFormulario).catch(
      () => false,
    );
    if (restaurada) {
      return { listo: true, error: null };
    }
    return { listo: false, error: extraerDetalleError(err) };
  }
}

export function useSesionAnonima({
  uuidFormulario,
  idioma = 'es',
  esOffline = false,
  deshabilitado = false,
}: UseSesionAnonimaOpciones): UseSesionAnonimaResultado {
  const [listo, setListo] = useState(deshabilitado);
  const [error, setError] = useState<string | null>(null);

  const iniciarSesion = useCallback(async () => {
    setError(null);
    try {
      await persistirSesionRemota(uuidFormulario, idioma, esOffline);
      setListo(true);
    } catch (err) {
      setError(extraerDetalleError(err));
      setListo(false);
      throw err;
    }
  }, [uuidFormulario, idioma, esOffline]);

  useEffect(() => {
    if (deshabilitado) {
      return;
    }

    let cancelado = false;

    async function restaurarOCrear() {
      const resultado = await inicializarSesionConRespaldo(
        uuidFormulario,
        idioma,
        esOffline,
      );
      if (!cancelado) {
        setListo(resultado.listo);
        setError(resultado.error);
      }
    }

    ejecutarSinEspera(restaurarOCrear());

    return () => {
      cancelado = true;
    };
  }, [uuidFormulario, idioma, esOffline, deshabilitado]);

  return { listo, error, iniciarSesion };
}
