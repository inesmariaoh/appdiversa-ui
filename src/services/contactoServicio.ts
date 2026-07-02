/**
 * Servicio para envio de mensajes de contacto.
 * Endpoint: POST /api/v1/contacto/
 */

import type { RespuestaDetalle } from '@/types/auth';
import type { ContactoPayload } from '@/types/contacto';
import { apiCliente } from './api';

const RUTA_CONTACTO = '/api/v1/contacto/';

export async function enviarMensajeContacto(
  payload: ContactoPayload
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(RUTA_CONTACTO, payload);
  return respuesta.data;
}
