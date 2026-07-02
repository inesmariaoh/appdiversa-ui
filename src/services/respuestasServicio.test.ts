import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import { guardarRespuesta } from './respuestasServicio';

vi.mock('./api', () => ({
  apiCliente: {
    post: vi.fn(),
  },
}));

describe('respuestasServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.post).mockReset();
  });

  it('guarda respuesta con credenciales de sesion', async () => {
    const salida = { version_respuesta: 1 };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: salida });

    const entrada = {
      uuid_sesion: 'sesion-1',
      codigo_pregunta: 'P1',
      valor: 'texto',
      origen_respuesta: 'web' as const,
      fecha_respuesta_cliente: '2026-01-01T00:00:00.000Z',
      token_cliente: 'token-1',
    };

    const resultado = await guardarRespuesta(entrada, {
      uuidSesion: 'sesion-1',
      tokenCliente: 'token-1',
    });

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/respuestas/',
      entrada,
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(resultado).toEqual(salida);
  });
});
