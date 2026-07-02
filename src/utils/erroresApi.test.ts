import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { ErrorApi, extraerDetalleError, crearErrorApiDesdeAxios } from './erroresApi';

describe('erroresApi', () => {
  it('extrae detalle desde respuesta axios', () => {
    const error = new axios.AxiosError(
      'fallo',
      'ERR',
      undefined,
      undefined,
      {
        status: 400,
        data: { detalle: 'El token de sesion no es valido.' },
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
      }
    );

    expect(extraerDetalleError(error)).toBe('El token de sesion no es valido.');
  });

  it('crea ErrorApi con estado http', () => {
    const errorApi = new ErrorApi('Mensaje funcional', 403);
    const convertido = crearErrorApiDesdeAxios(errorApi);

    expect(convertido).toBe(errorApi);
    expect(convertido.estadoHttp).toBe(403);
  });

  it('retorna mensaje generico para errores desconocidos', () => {
    expect(extraerDetalleError({})).toMatch(/no fue posible completar/i);
  });

  it('extrae detalle desde instancia ErrorApi y Error generico', () => {
    expect(extraerDetalleError(new ErrorApi('Sesion expirada', 403))).toBe('Sesion expirada');
    expect(extraerDetalleError(new Error('Fallo local'))).toBe('Fallo local');
  });

  it('crea ErrorApi desde axios sin detalle en body', () => {
    const error = new axios.AxiosError('timeout', 'ERR');
    const convertido = crearErrorApiDesdeAxios(error);
    expect(convertido).toBeInstanceOf(ErrorApi);
    expect(convertido.estadoHttp).toBeUndefined();
  });

  it('ignora detalle vacio o no textual en respuesta axios', () => {
    const errorVacio = new axios.AxiosError(
      'fallo',
      'ERR',
      undefined,
      undefined,
      {
        status: 422,
        data: { detalle: '   ' },
        statusText: 'Unprocessable',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
      },
    );
    expect(extraerDetalleError(errorVacio)).toBe('fallo');

    const errorNumerico = new axios.AxiosError(
      'fallo',
      'ERR',
      undefined,
      undefined,
      {
        status: 422,
        data: { detalle: 123 },
        statusText: 'Unprocessable',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
      },
    );
    expect(extraerDetalleError(errorNumerico)).toBe('fallo');
  });

  it('crea ErrorApi desde error no axios', () => {
    const convertido = crearErrorApiDesdeAxios(new Error('Error de red'));
    expect(convertido.detalle).toBe('Error de red');
    expect(convertido.estadoHttp).toBeUndefined();
  });
});
