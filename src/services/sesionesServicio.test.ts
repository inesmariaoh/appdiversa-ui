import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  crearSesionAnonima,
  obtenerRespuestasSesion,
  validarFinalizacion,
  finalizarSesion,
  obtenerResumenSesion,
  obtenerHistorialSesiones,
  enviarCopiaRespuestas,
  vincularUsuarioSesion,
} from './sesionesServicio';
import { HEADER_SESION_ANONIMA, HEADER_TOKEN_SESION } from '@/utils/headersSesion';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const credenciales = { uuidSesion: 'sesion-1', tokenCliente: 'token-1' };

describe('sesionesServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(apiCliente.post).mockReset();
  });

  it('crea sesion anonima', async () => {
    const sesion = { uuid_sesion: 'sesion-1', token_cliente: 'token-1', estado: 'activa' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: sesion });

    const resultado = await crearSesionAnonima({
      uuid_sesion: 'sesion-1',
      uuid_formulario: 'form-1',
      idioma: 'es',
      es_offline: false,
    });

    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/sesiones/', {
      uuid_sesion: 'sesion-1',
      uuid_formulario: 'form-1',
      idioma: 'es',
      es_offline: false,
    });
    expect(resultado).toEqual(sesion);
  });

  it('obtiene respuestas de sesion', async () => {
    const salida = { respuestas: [] };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: salida });

    const resultado = await obtenerRespuestasSesion(credenciales);

    expect(apiCliente.get).toHaveBeenCalledWith(
      '/api/v1/sesiones/sesion-1/respuestas/',
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(resultado).toEqual(salida);
  });

  it('valida finalizacion', async () => {
    const validacion = { es_valido: true, total_pendientes: 0, preguntas_pendientes: [] };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: validacion });

    const resultado = await validarFinalizacion(credenciales);

    expect(resultado.es_valido).toBe(true);
  });

  it('finaliza sesion', async () => {
    const finalizacion = { mensaje: 'Enviado' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: finalizacion });

    const resultado = await finalizarSesion(credenciales);

    expect(resultado.mensaje).toBe('Enviado');
  });

  it('obtiene resumen de sesion', async () => {
    const resumen = { respuestas: [] };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: resumen });

    const resultado = await obtenerResumenSesion(credenciales);

    expect(resultado).toEqual(resumen);
  });

  it('obtiene resumen de sesion vinculada sin token anonimo', async () => {
    const resumen = { respuestas: [] };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: resumen });

    const resultado = await obtenerResumenSesion({ uuidSesion: 'sesion-1' });

    expect(apiCliente.get).toHaveBeenCalledWith(
      '/api/v1/sesiones/sesion-1/resumen/',
      { withCredentials: true }
    );
    expect(resultado).toEqual(resumen);
  });

  it('obtiene historial de respuestas del usuario autenticado', async () => {
    const historial = [
      {
        uuid_sesion: 'sesion-1',
        uuid_formulario: 'form-1',
        codigo_formulario: 'DISC-001',
        nombre_formulario: 'Encuesta',
        fecha_finalizacion: '2025-01-01T00:00:00Z',
        total_respuestas: 3,
        estado: 'finalizada',
      },
    ];
    vi.mocked(apiCliente.get).mockResolvedValue({ data: { resultados: historial } });

    const resultado = await obtenerHistorialSesiones();

    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/auth/mis-respuestas/', {
      withCredentials: true,
    });
    expect(resultado).toEqual(historial);
  });

  it('envia copia de respuestas con headers de sesion anonima', async () => {
    const detalle = { detalle: 'La copia de respuestas fue enviada al correo indicado.' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: detalle });

    const resultado = await enviarCopiaRespuestas(
      'sesion-1',
      'token-1',
      'usuario@correo.com'
    );

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/sesiones/sesion-1/enviar-copia/',
      { correo: 'usuario@correo.com' },
      {
        headers: {
          [HEADER_SESION_ANONIMA]: 'sesion-1',
          [HEADER_TOKEN_SESION]: 'token-1',
        },
      }
    );
    expect(resultado).toEqual(detalle);
  });

  it('vincula sesion anonima al usuario autenticado', async () => {
    const detalle = { detalle: 'Sesion vinculada al usuario autenticado.' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: detalle });

    const resultado = await vincularUsuarioSesion(credenciales);

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/sesiones/sesion-1/vincular-usuario/',
      {},
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          [HEADER_SESION_ANONIMA]: 'sesion-1',
          [HEADER_TOKEN_SESION]: 'token-1',
        }),
      })
    );
    expect(resultado).toEqual(detalle);
  });
});
