import { describe, it, expect, vi, beforeEach, assert } from 'vitest';
import axios, { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { apiCliente } from './api';
import { useSesionStore } from '@/store/sesionStore';
import { ErrorApi } from '@/utils/erroresApi';
import { HEADER_SESION_ANONIMA } from '@/utils/headersSesion';

describe('apiCliente', () => {
  beforeEach(() => {
    useSesionStore.getState().limpiar();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('asigna baseURL en el interceptor de request', async () => {
    const config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig;

    const handlers = apiCliente.interceptors.request.handlers ?? [];
    const handler = handlers[0]?.fulfilled;
    assert.isDefined(handler);
    const resultado = await handler(config);

    expect(resultado?.baseURL).toBeTruthy();
  });

  it('transforma errores axios en ErrorApi', async () => {
    const error = new axios.AxiosError(
      'fallo',
      'ERR',
      undefined,
      undefined,
      {
        status: 400,
        data: { detalle: 'Solicitud invalida.' },
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    const handlersResp = apiCliente.interceptors.response.handlers ?? [];
    const handler = handlersResp[0]?.rejected;
    assert.isDefined(handler);
    await expect(handler(error)).rejects.toBeInstanceOf(ErrorApi);
  });

  it('limpia sesion ante 403 en cliente', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const config = {
      headers: new AxiosHeaders({ [HEADER_SESION_ANONIMA]: 's1' }),
      url: '/api/v1/respuestas/',
    };

    const error = new axios.AxiosError(
      'forbidden',
      'ERR',
      config as never,
      undefined,
      {
        status: 403,
        data: { detalle: 'El token de sesión no es válido.' },
        statusText: 'Forbidden',
        headers: {},
        config: config as never,
      }
    );

    const handlersResp = apiCliente.interceptors.response.handlers ?? [];
    const handler = handlersResp[0]?.rejected;
    assert.isDefined(handler);
    await expect(handler(error)).rejects.toBeInstanceOf(ErrorApi);
    expect(useSesionStore.getState().uuidSesion).toBeNull();
  });

  it('no limpia sesion ante 403 sin header de sesion anonima', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const error = new axios.AxiosError(
      'forbidden',
      'ERR',
      { url: '/api/v1/auth/me/' } as never,
      undefined,
      {
        status: 403,
        data: { detalle: 'No autenticado.' },
        statusText: 'Forbidden',
        headers: {},
        config: { url: '/api/v1/auth/me/' } as never,
      }
    );

    const handlersResp = apiCliente.interceptors.response.handlers ?? [];
    const handler = handlersResp[0]?.rejected;
    assert.isDefined(handler);
    await expect(handler(error)).rejects.toBeInstanceOf(ErrorApi);
    expect(useSesionStore.getState().uuidSesion).toBe('s1');
  });

  it('detecta header de sesion anonima en objeto plano', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const config = {
      headers: { [HEADER_SESION_ANONIMA]: 's1' },
      url: '/api/v1/respuestas/',
    };

    const error = new axios.AxiosError(
      'forbidden',
      'ERR',
      config as never,
      undefined,
      {
        status: 403,
        data: { detalle: 'El token de sesión no es válido.' },
        statusText: 'Forbidden',
        headers: {},
        config: config as never,
      }
    );

    const handlersResp = apiCliente.interceptors.response.handlers ?? [];
    const handler = handlersResp[0]?.rejected;
    assert.isDefined(handler);
    await expect(handler(error)).rejects.toBeInstanceOf(ErrorApi);
    expect(useSesionStore.getState().uuidSesion).toBeNull();
  });

  it('no limpia sesion ante 403 de sesion finalizada', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'finalizada',
    });

    const config = {
      headers: new AxiosHeaders({ [HEADER_SESION_ANONIMA]: 's1' }),
      url: '/api/v1/sesiones/s1/enviar-copia/',
    };

    const error = new axios.AxiosError(
      'forbidden',
      'ERR',
      config as never,
      undefined,
      {
        status: 403,
        data: { detail: 'La sesión ya fue finalizada.' },
        statusText: 'Forbidden',
        headers: {},
        config: config as never,
      }
    );

    const handlersResp = apiCliente.interceptors.response.handlers ?? [];
    const handler = handlersResp[0]?.rejected;
    assert.isDefined(handler);
    await expect(handler(error)).rejects.toBeInstanceOf(ErrorApi);
    expect(useSesionStore.getState().uuidSesion).toBe('s1');
  });

  it('alinea el host local de la API con el host de la pagina', async () => {
    const ventanaOriginal = globalThis.window;
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8000');
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1' } });

    const config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig;

    const handlers = apiCliente.interceptors.request.handlers ?? [];
    const handler = handlers[0]?.fulfilled;
    assert.isDefined(handler);
    const resultado = await handler(config);

    expect(resultado?.baseURL).toBe('http://127.0.0.1:8000');

    vi.unstubAllEnvs();
    vi.stubGlobal('window', ventanaOriginal);
  });

  it('no altera el host de la API cuando es un dominio remoto', async () => {
    const ventanaOriginal = globalThis.window;
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.produccion.example');
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1' } });

    const config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig;

    const handlers = apiCliente.interceptors.request.handlers ?? [];
    const handler = handlers[0]?.fulfilled;
    assert.isDefined(handler);
    const resultado = await handler(config);

    expect(resultado?.baseURL).toBe('https://api.produccion.example');

    vi.unstubAllEnvs();
    vi.stubGlobal('window', ventanaOriginal);
  });

  it('ajusta host en entorno servidor cuando existe API_BASE_URL', async () => {
    const ventanaOriginal = globalThis.window;
    vi.stubGlobal('window', undefined);
    vi.stubEnv('API_BASE_URL', 'https://backend-interno.example');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://localhost.example');

    const config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig;

    const handlers = apiCliente.interceptors.request.handlers ?? [];
    const handler = handlers[0]?.fulfilled;
    const resultado = await handler(config);

    expect(resultado?.baseURL).toBe('https://backend-interno.example');
    expect(resultado?.headers.get('Host')).toBe('localhost.example');

    vi.unstubAllEnvs();
    vi.stubGlobal('window', ventanaOriginal);
  });
});
