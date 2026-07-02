import { describe, it, expect } from 'vitest';
import {
  construirValorEsperado,
  valorEsperadoAString,
} from '@/utils/editorReglasAdmin';

describe('editorReglasAdmin', () => {
  it('construye valor equals', () => {
    expect(construirValorEsperado('equals', 'si', '')).toBe('si');
  });

  it('construye valor in como lista', () => {
    expect(construirValorEsperado('in', '', 'a, b, c')).toEqual(['a', 'b', 'c']);
  });

  it('construye valor numerico gt', () => {
    expect(construirValorEsperado('gt', '10', '')).toBe(10);
  });

  it('convierte array a string lista', () => {
    expect(valorEsperadoAString(['a', 'b'])).toEqual({ simple: '', lista: 'a, b' });
  });

  it('convierte numero y valores nulos a texto', () => {
    expect(valorEsperadoAString(42)).toEqual({ simple: '42', lista: '' });
    expect(valorEsperadoAString(null)).toEqual({ simple: '', lista: '' });
    expect(valorEsperadoAString(undefined)).toEqual({ simple: '', lista: '' });
    expect(valorEsperadoAString('texto')).toEqual({ simple: 'texto', lista: '' });
  });

  it('construye lt y operadores por defecto', () => {
    expect(construirValorEsperado('lt', '5', '')).toBe(5);
    expect(construirValorEsperado('contains', 'abc', '')).toBe('abc');
  });
});
