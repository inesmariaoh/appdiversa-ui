/**
 * Cola de operaciones pendientes de sincronizacion.
 */

import type { RegistroColaSincronizacion } from './appDiversaDb';
import { appDiversaDb } from './appDiversaDb';

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
  estado: 'pendiente' | 'error'
): Promise<void> {
  const operacion = await appDiversaDb.cola_sincronizacion.get(uuidLocal);
  if (operacion) {
    await appDiversaDb.cola_sincronizacion.put({ ...operacion, estado });
  }
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
