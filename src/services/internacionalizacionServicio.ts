/**
 * Servicio para traducciones del backend.
 * GET /api/v1/internacionalizacion/traducciones/
 */

import { apiCliente } from './api';

const RUTA_TRADUCCIONES = '/api/v1/internacionalizacion/traducciones/';

export interface ParametrosTraducciones {
  idioma?: string;
  entidad?: string;
  entidad_uuid?: string;
  campo?: string;
}

export interface TraduccionEntrada {
  entidad: string;
  entidad_uuid?: string;
  campo: string;
  valor: string;
  idioma: string;
}

export async function obtenerTraducciones(
  parametros?: ParametrosTraducciones
): Promise<TraduccionEntrada[]> {
  const respuesta = await apiCliente.get<TraduccionEntrada[]>(RUTA_TRADUCCIONES, {
    params: parametros,
  });
  return respuesta.data;
}
