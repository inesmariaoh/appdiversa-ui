/**
 * Cola de operaciones pendientes de sincronizacion.
 */

import type { RegistroColaSincronizacion } from './appDiversaDb';
import { appDiversaDb } from './appDiversaDb';
import {
  operacionListaParaReintento,
  puedeReintentar,
} from '@/utils/backoffSincronizacion';

interface MetadatosReintento {
  numero_reintentos: number;
  proximo_reintento: string;
}

export async function agregarOperacionCola(
  operacion: RegistroColaSincronizacion
): Promise<void> {
  await appDiversaDb.cola_sincronizacion.put(operacion);
}

export async function obtenerOperacionesPendientes(
  uuidSesion: string
): Promise<RegistroColaSincronizacion[]> {
  return appDiversaDb.cola_sincronizacion
    .where({ uuid_sesion: uuidSesion, estado: 'pendiente' })
    .toArray();
}

export async function eliminarOperacionCola(uuidLocal: string): Promise<void> {
  await appDiversaDb.cola_sincronizacion.delete(uuidLocal);
}

export async function marcarOperacionEstado(
  uuidLocal: string,
  estado: 'pendiente' | 'error',
  metadatos?: MetadatosReintento
): Promise<void> {
  const operacion = await appDiversaDb.cola_sincronizacion.get(uuidLocal);
  if (!operacion) return;

  const actualizada: RegistroColaSincronizacion = { ...operacion, estado };
  if (metadatos) {
    actualizada.numero_reintentos = metadatos.numero_reintentos;
    actualizada.proximo_reintento = metadatos.proximo_reintento;
  }
  await appDiversaDb.cola_sincronizacion.put(actualizada);
}

export async function reactivarOperacionesReintentables(
  uuidSesion: string,
  ahoraMs: number
): Promise<number> {
  const enError = await appDiversaDb.cola_sincronizacion
    .where({ uuid_sesion: uuidSesion, estado: 'error' })
    .toArray();

  const reactivables = enError.filter(
    (operacion) =>
      puedeReintentar(operacion.numero_reintentos ?? 0) &&
      operacionListaParaReintento(operacion.proximo_reintento, ahoraMs)
  );

  await Promise.all(
    reactivables.map((operacion) =>
      appDiversaDb.cola_sincronizacion.put({ ...operacion, estado: 'pendiente' })
    )
  );

  return reactivables.length;
}

export async function eliminarOperacionesExitosas(
  uuidsExitosos: string[]
): Promise<void> {
  await Promise.all(uuidsExitosos.map((uuid) => eliminarOperacionCola(uuid)));
}

export async function registrarErrorSincronizacion(
  uuidLocal: string,
  detalle: string
): Promise<void> {
  await appDiversaDb.errores_sincronizacion.add({
    uuid_local: uuidLocal,
    detalle,
    fecha: new Date().toISOString(),
  });
}

export async function contarOperacionesPendientes(
  uuidSesion: string
): Promise<number> {
  return appDiversaDb.cola_sincronizacion
    .where({ uuid_sesion: uuidSesion, estado: 'pendiente' })
    .count();
}
