/**
 * Servicio para evaluar reglas de formulario.
 */

import type { ResultadoReglas } from '@/types/reglas';
import type { CredencialesSesion } from '@/types/sesion';
import { crearConfigConSesion } from '@/utils/headersSesion';
import { apiCliente } from './api';

const RUTA_EVALUAR_REGLAS = (uuidSesion: string) =>
  `/api/v1/sesiones/${uuidSesion}/evaluar-reglas/`;
const RUTA_EVALUAR_REGLAS_PREGUNTA = (
  uuidSesion: string,
  codigoPregunta: string
) =>
  `/api/v1/sesiones/${uuidSesion}/preguntas/${codigoPregunta}/evaluar-reglas/`;

export async function evaluarReglasSesion(
  credenciales: CredencialesSesion
): Promise<ResultadoReglas> {
  const respuesta = await apiCliente.post<ResultadoReglas>(
    RUTA_EVALUAR_REGLAS(credenciales.uuidSesion),
    {},
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}

export async function evaluarReglasPregunta(
  credenciales: CredencialesSesion,
  codigoPregunta: string
): Promise<ResultadoReglas> {
  const respuesta = await apiCliente.post<ResultadoReglas>(
    RUTA_EVALUAR_REGLAS_PREGUNTA(credenciales.uuidSesion, codigoPregunta),
    {},
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}
