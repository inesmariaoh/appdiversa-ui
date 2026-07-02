import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import {
  obtenerIdiomaServidor,
  obtenerParametrosIdiomaServidor,
} from './obtenerIdiomaServidor';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('obtenerIdiomaServidor', () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReset();
  });

  it('retorna idioma desde cookie', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (nombre: string) =>
        nombre === 'appdiversa_idioma' ? { value: 'en' } : undefined,
    } as never);

    await expect(obtenerIdiomaServidor()).resolves.toBe('en');
  });

  it('usa es por defecto sin cookie', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    await expect(obtenerIdiomaServidor()).resolves.toBe('es');
  });

  it('incluye flag de accesibilidad en parametros', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (nombre: string) => {
        if (nombre === 'appdiversa_idioma') return { value: 'es' };
        if (nombre === 'appdiversa_incluir_accesibilidad') return { value: '1' };
        return undefined;
      },
    } as never);

    await expect(obtenerParametrosIdiomaServidor()).resolves.toEqual({
      idioma: 'es',
      incluir_accesibilidad: true,
    });
  });
});
