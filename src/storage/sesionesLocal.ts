/**
 * Acceso local a sesiones anonimas en IndexedDB.
 */

import type { EstadoSesion } from '@/types/sesion';
import { appDiversaDb } from './appDiversaDb';

export async function guardarSesionLocal(datos: {
  uuid_sesion: string;
  token_cliente: string;
  uuid_formulario: string;
  estado: EstadoSesion;
}): Promise<void> {
  await appDiversaDb.sesiones.put({
    ...datos,
    fecha_actualizacion: new Date().toISOString(),
  });
}

export async function obtenerSesionLocal(uuidSesion: string) {
  return appDiversaDb.sesiones.get(uuidSesion);
}
