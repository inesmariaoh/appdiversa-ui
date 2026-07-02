/**
 * Servicio para consumir endpoints de sesiones anonimas.
 */

import type {
  CrearSesionAnonimaEntrada,
  FinalizacionFormulario,
  CredencialesSesion,
  ResumenFormularioSesion,
  SesionAnonima,
  ValidacionFinalizacion,
  HistorialSesion,
  EnviarCopiaRespuestasPayload,
} from '@/types/sesion';
import type { RespuestaDetalle } from '@/types/auth';
import type { RespuestasSesion } from '@/types/respuesta';
import { crearConfigConSesion } from '@/utils/headersSesion';
import { apiCliente } from './api';

const RUTA_SESIONES = '/api/v1/sesiones/';
const RUTA_SESION = (uuidSesion: string) => `/api/v1/sesiones/${uuidSesion}/`;
const RUTA_RESPUESTAS_SESION = (uuidSesion: string) =>
  `${RUTA_SESION(uuidSesion)}respuestas/`;
const RUTA_VALIDAR_FINALIZACION = (uuidSesion: string) =>
  `${RUTA_SESION(uuidSesion)}validar-finalizacion/`;
const RUTA_FINALIZAR = (uuidSesion: string) =>
  `${RUTA_SESION(uuidSesion)}finalizar/`;
const RUTA_RESUMEN = (uuidSesion: string) =>
  `${RUTA_SESION(uuidSesion)}resumen/`;
const RUTA_ENVIAR_COPIA = (uuidSesion: string) =>
  `${RUTA_SESION(uuidSesion)}enviar-copia/`;
const RUTA_VINCULAR_USUARIO = (uuidSesion: string) =>
  `${RUTA_SESION(uuidSesion)}vincular-usuario/`;

export async function crearSesionAnonima(
  entrada: CrearSesionAnonimaEntrada
): Promise<SesionAnonima> {
  const respuesta = await apiCliente.post<SesionAnonima>(RUTA_SESIONES, entrada);
  return respuesta.data;
}

export async function obtenerRespuestasSesion(
  credenciales: CredencialesSesion
): Promise<RespuestasSesion> {
  const respuesta = await apiCliente.get<RespuestasSesion>(
    RUTA_RESPUESTAS_SESION(credenciales.uuidSesion),
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}

export async function validarFinalizacion(
  credenciales: CredencialesSesion
): Promise<ValidacionFinalizacion> {
  const respuesta = await apiCliente.post<ValidacionFinalizacion>(
    RUTA_VALIDAR_FINALIZACION(credenciales.uuidSesion),
    {},
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}

export async function finalizarSesion(
  credenciales: CredencialesSesion
): Promise<FinalizacionFormulario> {
  const respuesta = await apiCliente.post<FinalizacionFormulario>(
    RUTA_FINALIZAR(credenciales.uuidSesion),
    {},
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}

export async function obtenerResumenSesion(
  credenciales: CredencialesSesion
): Promise<ResumenFormularioSesion> {
  const config = credenciales.tokenCliente
    ? crearConfigConSesion(credenciales)
    : { withCredentials: true };
  const respuesta = await apiCliente.get<ResumenFormularioSesion>(
    RUTA_RESUMEN(credenciales.uuidSesion),
    config
  );
  return respuesta.data;
}

/**
 * Historial de respuestas del usuario autenticado.
 * GET /api/v1/auth/mis-respuestas/
 */
export interface MisRespuestasSalida {
  resultados: HistorialSesion[];
}

const RUTA_MIS_RESPUESTAS = '/api/v1/auth/mis-respuestas/';
const RUTA_EXPORTAR_MIS_RESPUESTAS = (uuidSesion: string, formato: string) =>
  `${RUTA_MIS_RESPUESTAS}${uuidSesion}/exportar/?formato=${formato}`;

export type FormatoDescargaRespuestas = 'pdf' | 'xlsx';

export async function obtenerHistorialSesiones(): Promise<HistorialSesion[]> {
  const respuesta = await apiCliente.get<MisRespuestasSalida>(RUTA_MIS_RESPUESTAS, {
    withCredentials: true,
  });
  return respuesta.data.resultados;
}

/**
 * Descarga las respuestas de una sesion propia del usuario autenticado.
 * GET /api/v1/auth/mis-respuestas/{uuid}/exportar/?formato=pdf|xlsx
 */
export async function descargarMisRespuestas(
  uuidSesion: string,
  formato: FormatoDescargaRespuestas
): Promise<Blob> {
  const respuesta = await apiCliente.get<Blob>(
    RUTA_EXPORTAR_MIS_RESPUESTAS(uuidSesion, formato),
    { responseType: 'blob', withCredentials: true }
  );
  return respuesta.data;
}

export async function enviarCopiaRespuestas(
  uuidSesion: string,
  tokenCliente: string,
  correo: string
): Promise<RespuestaDetalle> {
  const credenciales: CredencialesSesion = { uuidSesion, tokenCliente };
  const payload: EnviarCopiaRespuestasPayload = { correo };
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_ENVIAR_COPIA(uuidSesion),
    payload,
    crearConfigConSesion(credenciales)
  );
  return respuesta.data;
}

/**
 * Vincula una sesion anonima al usuario autenticado.
 * POST /api/v1/sesiones/{uuid}/vincular-usuario/
 */
export async function vincularUsuarioSesion(
  credenciales: CredencialesSesion
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_VINCULAR_USUARIO(credenciales.uuidSesion),
    {},
    {
      ...crearConfigConSesion(credenciales),
      withCredentials: true,
    }
  );
  return respuesta.data;
}
