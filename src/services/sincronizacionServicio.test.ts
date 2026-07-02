import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import { sincronizarBatch } from './sincronizacionServicio';

vi.mock('./api', () => ({
  apiCliente: { post: vi.fn() },
}));

describe('sincronizacionServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.post).mockReset();
  });

  it('envia lote de operaciones offline', async () => {
    const salida = { procesadas: 1, errores: [] };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: salida });

    const entrada = {
      uuid_sesion: 'sesion-1',
      token_cliente: 'token-1',
      dispositivo: 'vitest',
      version_app: '0.1.0',
      operaciones: [],
    };

    const resultado = await sincronizarBatch(entrada, {
      uuidSesion: 'sesion-1',
      tokenCliente: 'token-1',
    });

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/sincronizacion/',
      entrada,
      expect.any(Object)
    );
    expect(resultado).toEqual(salida);
  });
});
