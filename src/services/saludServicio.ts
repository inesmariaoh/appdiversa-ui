/**
 * Servicio de verificacion de salud del backend.
 * GET /api/v1/salud/
 */

import { apiCliente } from './api';

const RUTA_SALUD = '/api/v1/salud/';

export interface RespuestaSalud {
  estado: string;
}

export async function verificarSaludApi(): Promise<boolean> {
  try {
    const respuesta = await apiCliente.get<RespuestaSalud>(RUTA_SALUD, {
      timeout: 5000,
    });
    return respuesta.data.estado === 'ok';
  } catch {
    return false;
  }
}
