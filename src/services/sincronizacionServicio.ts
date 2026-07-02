/**
 * Servicio para sincronizacion offline por lotes.
 * POST /api/v1/sincronizacion/
 */

import type {
  SincronizarBatchEntrada,
  SincronizarBatchSalida,
} from '@/types/sincronizacion';
import type { CredencialesSesion } from '@/types/sesion';
import { crearConfigConSesion } from '@/utils/headersSesion';
import { apiCliente } from './api';

const RUTA_SINCRONIZACION = '/api/v1/sincronizacion/';

export async function sincronizarBatch(
  entrada: SincronizarBatchEntrada,
  credenciales: CredencialesSesion
): Promise<SincronizarBatchSalida> {
  const respuesta = await apiCliente.post<SincronizarBatchSalida>(
    RUTA_SINCRONIZACION,
    entrada,
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}
