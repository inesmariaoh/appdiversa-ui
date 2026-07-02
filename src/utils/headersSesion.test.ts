import { describe, it, expect } from 'vitest';
import axios from 'axios';
import {
  aplicarHeadersSesion,
  crearConfigConSesion,
  HEADER_SESION_ANONIMA,
  HEADER_TOKEN_SESION,
} from './headersSesion';

describe('headersSesion', () => {
  const credenciales = { uuidSesion: 'sesion-1', tokenCliente: 'token-1' };

  it('aplica headers en configuracion axios', () => {
    const interna = {
      headers: new axios.AxiosHeaders(),
    } as Parameters<typeof aplicarHeadersSesion>[0];

    aplicarHeadersSesion(interna, credenciales);

    expect(interna.headers.get(HEADER_SESION_ANONIMA)).toBe('sesion-1');
    expect(interna.headers.get(HEADER_TOKEN_SESION)).toBe('token-1');
  });

  it('crea objeto de configuracion con headers de sesion', () => {
    const config = crearConfigConSesion(credenciales);
    expect(config.headers?.[HEADER_SESION_ANONIMA]).toBe('sesion-1');
    expect(config.headers?.[HEADER_TOKEN_SESION]).toBe('token-1');
  });
});
