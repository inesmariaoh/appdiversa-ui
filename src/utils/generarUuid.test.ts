import { describe, it, expect, vi, afterEach } from 'vitest';
import { generarUuid } from './generarUuid';

describe('generarUuid', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('genera un uuid con formato valido', () => {
    const uuid = generarUuid();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('usa fallback cuando crypto.randomUUID no existe', () => {
    const originalGetRandomValues = crypto.getRandomValues.bind(crypto);
    vi.stubGlobal('crypto', {
      subtle: crypto.subtle,
      getRandomValues: originalGetRandomValues,
    });

    const uuid = generarUuid();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('lanza error cuando no hay fuente criptografica', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => generarUuid()).toThrow(/fuente criptografica/i);
  });
});
