import { describe, it, expect, vi } from 'vitest';
import { ejecutarSinEspera } from './ejecutarSinEspera';

describe('ejecutarSinEspera', () => {
  it('absorbe rechazos de promesas sin propagarlos', async () => {
    expect(() => {
      ejecutarSinEspera(Promise.reject(new Error('fallo controlado')));
    }).not.toThrow();

    await Promise.resolve();
  });

  it('acepta valores no promesa sin lanzar error', () => {
    expect(() => {
      // @ts-expect-error se valida tolerancia a entradas no promesa en tiempo de ejecucion
      ejecutarSinEspera(undefined);
    }).not.toThrow();
  });

  it('ejecuta promesas resueltas sin bloquear', async () => {
    const tarea = vi.fn().mockResolvedValue(undefined);
    ejecutarSinEspera(tarea());
    await Promise.resolve();
    expect(tarea).toHaveBeenCalled();
  });
});
