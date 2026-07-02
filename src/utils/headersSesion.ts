/**
 * Utilidades para aplicar headers de sesion anonima en peticiones Axios.
 */

import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import type { CredencialesSesion } from '@/types/sesion';

export const HEADER_SESION_ANONIMA = 'X-Sesion-Anonima';
export const HEADER_TOKEN_SESION = 'X-Token-Sesion';

export function aplicarHeadersSesion(
  config: InternalAxiosRequestConfig,
  credenciales: CredencialesSesion
): InternalAxiosRequestConfig {
  config.headers.set(HEADER_SESION_ANONIMA, credenciales.uuidSesion);
  if (credenciales.tokenCliente) {
    config.headers.set(HEADER_TOKEN_SESION, credenciales.tokenCliente);
  }
  return config;
}

export function crearConfigConSesion(
  credenciales: CredencialesSesion
): AxiosRequestConfig {
  const headers: Record<string, string> = {
    [HEADER_SESION_ANONIMA]: credenciales.uuidSesion,
  };
  if (credenciales.tokenCliente) {
    headers[HEADER_TOKEN_SESION] = credenciales.tokenCliente;
  }
  return { headers };
}
