/**
 * Elimina progreso local de una sesion anonima en IndexedDB y memoria.
 */

import { useRespuestasStore } from '@/store/respuestasStore';
import { useReglasStore } from '@/store/reglasStore';
import { useOfflineStore } from '@/store/offlineStore';
import { appDiversaDb } from './appDiversaDb';
import { limpiarAceptacionTerminosSesion } from './aceptacionesTerminos';

export async function limpiarProgresoLocalSesion(uuidSesion: string): Promise<void> {
  await appDiversaDb.respuestas_locales.where('uuid_sesion').equals(uuidSesion).delete();
  await appDiversaDb.cola_sincronizacion.where('uuid_sesion').equals(uuidSesion).delete();
  await limpiarAceptacionTerminosSesion(uuidSesion);

  useRespuestasStore.getState().limpiar();
  useReglasStore.getState().limpiar();
  useOfflineStore.getState().establecerOperacionesPendientes(0);
  useOfflineStore.getState().establecerFinalizacionPendiente(false);
}
