import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import { verificarSaludApi } from './saludServicio';

vi.mock('./api', () => ({
  apiCliente: { get: vi.fn() },
}));

describe('saludServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
  });

  it('retorna true cuando la API responde ok', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: { estado: 'ok' } });
    await expect(verificarSaludApi()).resolves.toBe(true);
  });

  it('retorna false cuando la API falla', async () => {
    vi.mocked(apiCliente.get).mockRejectedValue(new Error('timeout'));
    await expect(verificarSaludApi()).resolves.toBe(false);
  });
});
