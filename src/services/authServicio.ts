/**
 * Servicio de autenticacion Django por sesion.
 * Endpoints: login, logout, me, cambiar-password.
 */

import type {
  CambiarPasswordEntrada,
  LoginEntrada,
  PerfilActualizacionEntrada,
  PerfilAutenticado,
  PerfilEditable,
  RegistroCorreoEntrada,
  RespuestaDetalle,
  RestaurarPasswordPayload,
  SolicitarRestaurarPasswordPayload,
} from '@/types/auth';
import { apiCliente } from './api';

const RUTA_LOGIN = '/api/v1/auth/login/';
const RUTA_LOGOUT = '/api/v1/auth/logout/';
const RUTA_REGISTRO_CORREO = '/api/v1/auth/registro/correo/';
const RUTA_ME = '/api/v1/auth/me/';
const RUTA_PERFIL = '/api/v1/auth/perfil/';
const RUTA_CAMBIAR_PASSWORD = '/api/v1/auth/cambiar-password/';
const RUTA_SOLICITAR_RESTAURAR_PASSWORD = '/api/v1/auth/solicitar-restaurar-password/';
const RUTA_RESTAURAR_PASSWORD = '/api/v1/auth/restaurar-password/';
const RUTA_VERIFICAR_CORREO = '/api/v1/auth/verificar-correo/';
const RUTA_REENVIAR_VERIFICACION = '/api/v1/auth/reenviar-verificacion/';

const CONFIG_SESION = { withCredentials: true };

export async function iniciarSesion(entrada: LoginEntrada): Promise<PerfilAutenticado> {
  const respuesta = await apiCliente.post<PerfilAutenticado>(
    RUTA_LOGIN,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function cerrarSesion(): Promise<void> {
  await apiCliente.post(RUTA_LOGOUT, {}, CONFIG_SESION);
}

export async function registrarCorreo(
  entrada: RegistroCorreoEntrada,
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_REGISTRO_CORREO,
    entrada,
  );
  return respuesta.data;
}

export async function obtenerPerfilActual(): Promise<PerfilAutenticado> {
  const respuesta = await apiCliente.get<PerfilAutenticado>(RUTA_ME, CONFIG_SESION);
  return respuesta.data;
}

export async function obtenerPerfilEditable(): Promise<PerfilEditable> {
  const respuesta = await apiCliente.get<PerfilEditable>(RUTA_PERFIL, CONFIG_SESION);
  return respuesta.data;
}

export async function actualizarPerfil(
  entrada: PerfilActualizacionEntrada,
): Promise<PerfilEditable> {
  const respuesta = await apiCliente.patch<PerfilEditable>(
    RUTA_PERFIL,
    entrada,
    CONFIG_SESION,
  );
  return respuesta.data;
}

export async function cambiarPassword(entrada: CambiarPasswordEntrada): Promise<void> {
  await apiCliente.post(
    RUTA_CAMBIAR_PASSWORD,
    {
      password_actual: entrada.password_actual,
      password_nueva: entrada.password_nueva,
      password_confirmacion: entrada.password_nueva_confirmacion,
    },
    CONFIG_SESION,
  );
}

export async function solicitarRestaurarPassword(
  payload: SolicitarRestaurarPasswordPayload
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_SOLICITAR_RESTAURAR_PASSWORD,
    payload
  );
  return respuesta.data;
}

export async function restaurarPassword(
  payload: RestaurarPasswordPayload
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_RESTAURAR_PASSWORD,
    payload
  );
  return respuesta.data;
}

export async function verificarCorreo(
  uid: string,
  token: string
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_VERIFICAR_CORREO,
    { uid, token }
  );
  return respuesta.data;
}

export async function reenviarVerificacion(
  email: string
): Promise<RespuestaDetalle> {
  const respuesta = await apiCliente.post<RespuestaDetalle>(
    RUTA_REENVIAR_VERIFICACION,
    { email }
  );
  return respuesta.data;
}
