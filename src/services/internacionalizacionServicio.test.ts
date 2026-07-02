import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import { obtenerTraducciones } from './internacionalizacionServicio';

vi.mock('./api', () => ({
  apiCliente: { get: vi.fn() },
}));

describe('internacionalizacionServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
  });

  it('obtiene traducciones con idioma', async () => {
    const traducciones = [{ entidad: 'app', campo: 'titulo', valor: 'Inicio', idioma: 'es' }];
    vi.mocked(apiCliente.get).mockResolvedValue({ data: traducciones });

    const resultado = await obtenerTraducciones({ idioma: 'es' });

    expect(apiCliente.get).toHaveBeenCalledWith(
      '/api/v1/internacionalizacion/traducciones/',
      { params: { idioma: 'es' } }
    );
    expect(resultado).toEqual(traducciones);
  });
});
