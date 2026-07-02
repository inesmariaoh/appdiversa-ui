import { describe, expect, it } from 'vitest';
import { extraerCodigoCatalogo } from './extraerCodigoCatalogo';

describe('extraerCodigoCatalogo', () => {
  it('retorna codigo directo cuando existe', () => {
    expect(
      extraerCodigoCatalogo({
        codigo: 'CAT-01',
        endpoint_items: '/api/v1/catalogos/CAT-01/items/',
      })
    ).toBe('CAT-01');
  });

  it('extrae codigo desde endpoint cuando no hay codigo', () => {
    expect(
      extraerCodigoCatalogo({
        codigo: '',
        endpoint_items: '/api/v1/catalogos/DEPARTAMENTOS/items/',
      })
    ).toBe('DEPARTAMENTOS');
  });

  it('retorna null si no hay datos', () => {
    expect(extraerCodigoCatalogo(null)).toBeNull();
    expect(extraerCodigoCatalogo(undefined)).toBeNull();
    expect(extraerCodigoCatalogo({ endpoint_items: '' })).toBeNull();
    expect(extraerCodigoCatalogo({ endpoint_items: '/otro/ruta/' })).toBeNull();
  });
});
