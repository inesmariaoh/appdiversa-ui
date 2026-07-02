/**
 * Cliente HTTP central basado en Axios.
 * Todos los servicios deben importar esta instancia; no crear clientes adicionales.
 */

import axios, { type InternalAxiosRequestConfig } from 'axios';
import { crearErrorApiDesdeAxios, debeInvalidarSesionAnonima } from '@/utils/erroresApi';
import { HEADER_SESION_ANONIMA } from '@/utils/headersSesion';
import { useSesionStore } from '@/store/sesionStore';

function requestIncluyoSesionAnonima(
  headers: InternalAxiosRequestConfig['headers'] | undefined
): boolean {
  if (!headers) return false;
  if (typeof headers.get === 'function') {
    return Boolean(headers.get(HEADER_SESION_ANONIMA));
  }
  const plano = headers as Record<string, string | undefined>;
  return Boolean(plano[HEADER_SESION_ANONIMA]);
}

function obtenerUrlPublicaApi(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';
}

function obtenerBaseUrlApi(): string {
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL ?? obtenerUrlPublicaApi();
  }

  return obtenerUrlPublicaApi();
}

export const apiCliente = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

apiCliente.interceptors.request.use((config) => {
  config.baseURL = obtenerBaseUrlApi();

  // Django valida ALLOWED_HOSTS; desde Docker el host de conexion no coincide con localhost.
  if (typeof window === 'undefined' && process.env.API_BASE_URL) {
    try {
      config.headers.set('Host', new URL(obtenerUrlPublicaApi()).host);
    } catch {
      // Se conserva el host por defecto si la URL publica no es valida.
    }
  }

  return config;
});

apiCliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const tieneSesionAnonima = requestIncluyoSesionAnonima(error.config?.headers);
      if (
        tieneSesionAnonima &&
        typeof globalThis.window !== 'undefined' &&
        debeInvalidarSesionAnonima(error)
      ) {
        useSesionStore.getState().limpiar();
      }
    }
    return Promise.reject(crearErrorApiDesdeAxios(error));
  }
);
