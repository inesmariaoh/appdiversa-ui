/**
 * Servicio para la gestion administrativa de la configuracion de interfaz.
 * Endpoints bajo /api/v1/interfaz/admin/.
 */

import type { AccesibilidadAdminDatos } from '@/types/interfaz';
import { apiCliente } from './api';

const CONFIG_SESION = { withCredentials: true };
const RUTA_ACCESIBILIDAD = '/api/v1/interfaz/admin/accesibilidad/';

export async function obtenerAccesibilidadAdmin(): Promise<AccesibilidadAdminDatos> {
  const respuesta = await apiCliente.get<AccesibilidadAdminDatos>(
    RUTA_ACCESIBILIDAD,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarAccesibilidadAdmin(
  entrada: Partial<AccesibilidadAdminDatos>
): Promise<AccesibilidadAdminDatos> {
  const respuesta = await apiCliente.patch<AccesibilidadAdminDatos>(
    RUTA_ACCESIBILIDAD,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}
