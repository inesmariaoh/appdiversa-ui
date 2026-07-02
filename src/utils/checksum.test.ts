import { describe, it, expect } from 'vitest';
import { calcularChecksum } from './checksum';

describe('checksum', () => {
  it('genera hash SHA-256 estable para mismos datos', async () => {
    const datos = {
      codigo_pregunta: 'P1',
      valor: 'Ana',
      version_cliente: 1,
    };

    const hash1 = await calcularChecksum(datos);
    const hash2 = await calcularChecksum(datos);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produce hash distinto cuando cambia version_cliente', async () => {
    const base = { codigo_pregunta: 'P1', valor: 'Ana', version_cliente: 1 };
    const hash1 = await calcularChecksum(base);
    const hash2 = await calcularChecksum({ ...base, version_cliente: 2 });

    expect(hash1).not.toBe(hash2);
  });
});
