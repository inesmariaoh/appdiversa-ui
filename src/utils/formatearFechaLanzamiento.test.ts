import { describe, it, expect } from 'vitest';
import { formatearFechaLanzamiento } from './formatearFechaLanzamiento';

describe('formatearFechaLanzamiento', () => {
  it('formatea mes y anio para inicio de mes', () => {
    expect(formatearFechaLanzamiento('2026-02-01T00:00:00Z')).toBe('Feb 2026');
  });

  it('formatea dia, mes y anio cuando el dia es especifico', () => {
    expect(formatearFechaLanzamiento('2026-07-31T12:00:00Z')).toBe('31 Jul 2026');
  });

  it('devuelve null para fechas invalidas o vacias', () => {
    expect(formatearFechaLanzamiento(null)).toBeNull();
    expect(formatearFechaLanzamiento('')).toBeNull();
    expect(formatearFechaLanzamiento('fecha-invalida')).toBeNull();
  });
});
