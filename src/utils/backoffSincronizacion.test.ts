import { describe, it, expect } from 'vitest';
import {
  MAX_REINTENTOS_SINCRONIZACION,
  calcularRetrasoBackoff,
  calcularProximoReintento,
  puedeReintentar,
  operacionListaParaReintento,
} from './backoffSincronizacion';

describe('backoffSincronizacion', () => {
  it('crece de forma exponencial y respeta el tope', () => {
    expect(calcularRetrasoBackoff(1)).toBe(5000);
    expect(calcularRetrasoBackoff(2)).toBe(10000);
    expect(calcularRetrasoBackoff(3)).toBe(20000);
    expect(calcularRetrasoBackoff(100)).toBe(5 * 60 * 1000);
  });

  it('nunca retorna retraso negativo', () => {
    expect(calcularRetrasoBackoff(0)).toBe(5000);
    expect(calcularRetrasoBackoff(-3)).toBe(5000);
  });

  it('calcula la marca de tiempo del proximo reintento', () => {
    const ahora = Date.parse('2026-01-01T00:00:00.000Z');
    const proximo = calcularProximoReintento(1, ahora);
    expect(proximo).toBe('2026-01-01T00:00:05.000Z');
  });

  it('limita la cantidad de reintentos', () => {
    expect(puedeReintentar(0)).toBe(true);
    expect(puedeReintentar(MAX_REINTENTOS_SINCRONIZACION - 1)).toBe(true);
    expect(puedeReintentar(MAX_REINTENTOS_SINCRONIZACION)).toBe(false);
  });

  it('determina si una operacion ya puede reintentarse', () => {
    const ahora = Date.parse('2026-01-01T00:00:10.000Z');
    expect(operacionListaParaReintento(undefined, ahora)).toBe(true);
    expect(
      operacionListaParaReintento('2026-01-01T00:00:05.000Z', ahora)
    ).toBe(true);
    expect(
      operacionListaParaReintento('2026-01-01T00:00:20.000Z', ahora)
    ).toBe(false);
  });
});
