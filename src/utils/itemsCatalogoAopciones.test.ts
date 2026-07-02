import { describe, expect, it } from 'vitest';
import { itemsCatalogoAopciones } from './itemsCatalogoAopciones';
import type { ItemCatalogo } from '@/types/catalogo';

const itemsBase: ItemCatalogo[] = [
  {
    codigo: 'B',
    codigo_catalogo: 'CAT',
    nombre: 'Segundo',
    descripcion: '',
    valor: 'V2',
    codigo_padre: null,
    codigo_externo: '',
    metadatos: {},
    orden: 2,
    esta_activo: true,
  },
  {
    codigo: 'A',
    codigo_catalogo: 'CAT',
    nombre: 'Primero',
    descripcion: '',
    valor: '',
    codigo_padre: null,
    codigo_externo: '',
    metadatos: {},
    orden: 1,
    esta_activo: true,
  },
];

describe('itemsCatalogoAopciones', () => {
  it('ordena por campo orden y mapea etiquetas', () => {
    const opciones = itemsCatalogoAopciones(itemsBase);
    expect(opciones.map((o) => o.codigo)).toEqual(['A', 'B']);
    expect(opciones[0]?.etiqueta).toBe('Primero');
    expect(opciones[0]?.valor).toBe('A');
    expect(opciones[1]?.valor).toBe('V2');
  });
});
