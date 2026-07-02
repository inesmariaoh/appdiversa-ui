import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import { evaluarReglasSesion, evaluarReglasPregunta } from './reglasServicio';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';

vi.mock('./api', () => ({
  apiCliente: { post: vi.fn() },
}));

const credenciales = { uuidSesion: 'sesion-1', tokenCliente: 'token-1' };

describe('reglasServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.post).mockReset();
    vi.mocked(apiCliente.post).mockResolvedValue({ data: RESULTADO_REGLAS_VACIO });
  });

  it('evalua reglas de sesion completa', async () => {
    const resultado = await evaluarReglasSesion(credenciales);

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/sesiones/sesion-1/evaluar-reglas/',
      {},
      expect.any(Object)
    );
    expect(resultado).toEqual(RESULTADO_REGLAS_VACIO);
  });

  it('evalua reglas por pregunta', async () => {
    await evaluarReglasPregunta(credenciales, 'P1');

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/sesiones/sesion-1/preguntas/P1/evaluar-reglas/',
      {},
      expect.any(Object)
    );
  });
});
