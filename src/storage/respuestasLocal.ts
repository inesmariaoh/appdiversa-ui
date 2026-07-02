/**
 * Acceso local a respuestas en IndexedDB.
 */

import type { RegistroRespuestaLocal } from './appDiversaDb';
import { appDiversaDb } from './appDiversaDb';

export async function guardarRespuestaLocal(
  registro: RegistroRespuestaLocal
): Promise<void> {
  await appDiversaDb.respuestas_locales.put(registro);
}

export async function obtenerRespuestasPorSesion(
  uuidSesion: string
): Promise<RegistroRespuestaLocal[]> {
  return appDiversaDb.respuestas_locales
    .where('uuid_sesion')
    .equals(uuidSesion)
    .toArray();
}

export async function obtenerRespuestaLocal(uuidLocal: string) {
  return appDiversaDb.respuestas_locales.get(uuidLocal);
}

export async function eliminarRespuestasLocalesPorPregunta(
  uuidSesion: string,
  codigoPregunta: string,
): Promise<void> {
  await appDiversaDb.respuestas_locales
    .where('uuid_sesion')
    .equals(uuidSesion)
    .and((registro) => registro.codigo_pregunta === codigoPregunta)
    .delete();
}
