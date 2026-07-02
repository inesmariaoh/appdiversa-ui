/**
 * Servicio para guardar respuestas.
 * POST /api/v1/respuestas/
 */

import type {
  GuardarRespuestaEntrada,
  GuardarRespuestaSalida,
} from '@/types/respuesta';
import type { CredencialesSesion } from '@/types/sesion';
import { crearConfigConSesion } from '@/utils/headersSesion';
import { apiCliente } from './api';

const RUTA_RESPUESTAS = '/api/v1/respuestas/';

export async function guardarRespuesta(
  entrada: GuardarRespuestaEntrada,
  credenciales?: CredencialesSesion
): Promise<GuardarRespuestaSalida> {
  const respuesta = await apiCliente.post<GuardarRespuestaSalida>(
    RUTA_RESPUESTAS,
    entrada,
    credenciales ? crearConfigConSesion(credenciales) : undefined
  );
  return respuesta.data;
}
