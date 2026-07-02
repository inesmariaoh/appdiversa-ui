import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  obtenerCatalogos,
  obtenerItemsCatalogo,
  obtenerItemsHijosCatalogo,
} from './catalogosServicio';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
  },
}));

describe('catalogosServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
  });

  it('lista catalogos', async () => {
    const catalogos = [{ codigo: 'departamentos', nombre: 'Departamentos' }];
    vi.mocked(apiCliente.get).mockResolvedValue({ data: catalogos });

    const resultado = await obtenerCatalogos();

    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/catalogos/');
    expect(resultado).toEqual(catalogos);
  });

  it('obtiene items de catalogo con filtros', async () => {
    const items = [{ codigo: '05', nombre: 'Antioquia' }];
    vi.mocked(apiCliente.get).mockResolvedValue({ data: items });

    const resultado = await obtenerItemsCatalogo('departamentos', {
      codigo_padre: 'CO',
      solo_activos: true,
    });

    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/catalogos/departamentos/items/', {
      params: { codigo_padre: 'CO', solo_activos: true },
    });
    expect(resultado).toEqual(items);
  });

  it('obtiene items hijos de un item', async () => {
    const hijos = [{ codigo: '05001', nombre: 'Medellin' }];
    vi.mocked(apiCliente.get).mockResolvedValue({ data: hijos });

    const resultado = await obtenerItemsHijosCatalogo('departamentos', '05');

    expect(apiCliente.get).toHaveBeenCalledWith(
      '/api/v1/catalogos/departamentos/items/05/hijos/',
      { params: undefined }
    );
    expect(resultado).toEqual(hijos);
  });
});
