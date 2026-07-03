import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  listarCatalogosAdmin,
  crearCatalogoAdmin,
  actualizarCatalogoAdmin,
  eliminarCatalogoAdmin,
  listarItemsCatalogoAdmin,
  crearItemCatalogoAdmin,
  actualizarItemCatalogoAdmin,
  eliminarItemCatalogoAdmin,
} from './catalogosAdminServicio';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('catalogosAdminServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(apiCliente.post).mockReset();
    vi.mocked(apiCliente.patch).mockReset();
    vi.mocked(apiCliente.delete).mockReset();
  });

  it('lista catalogos extrayendo results de la respuesta paginada', async () => {
    const catalogos = [{ id: 1, codigo: 'ocupaciones', nombre: 'Ocupaciones' }];
    vi.mocked(apiCliente.get).mockResolvedValue({
      data: { count: 1, next: null, previous: null, results: catalogos },
    });

    const resultado = await listarCatalogosAdmin();

    expect(resultado).toEqual(catalogos);
    expect(apiCliente.get).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/',
      expect.objectContaining({ withCredentials: true })
    );
  });

  it('crea un catalogo', async () => {
    const catalogo = { id: 2, codigo: 'estratos', nombre: 'Estratos' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: catalogo });

    const resultado = await crearCatalogoAdmin({
      codigo: 'estratos',
      nombre: 'Estratos',
      tipo_catalogo: 'socioeconomico',
    });

    expect(resultado).toEqual(catalogo);
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/',
      expect.objectContaining({ codigo: 'estratos' }),
      expect.anything()
    );
  });

  it('actualiza un catalogo', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: { id: 1 } });

    await actualizarCatalogoAdmin(1, { nombre: 'Nuevo' });

    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/1/',
      { nombre: 'Nuevo' },
      expect.anything()
    );
  });

  it('elimina un catalogo', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({ data: null });

    await eliminarCatalogoAdmin(3);

    expect(apiCliente.delete).toHaveBeenCalledWith('/api/v1/admin/catalogos/3/', expect.anything());
  });

  it('lista items de un catalogo', async () => {
    const items = [{ id: 5, codigo: 'medico', nombre: 'Médico' }];
    vi.mocked(apiCliente.get).mockResolvedValue({
      data: { count: 1, next: null, previous: null, results: items },
    });

    const resultado = await listarItemsCatalogoAdmin(1);

    expect(resultado).toEqual(items);
    expect(apiCliente.get).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/1/items/',
      expect.objectContaining({ withCredentials: true })
    );
  });

  it('crea un item', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: { id: 6 } });

    await crearItemCatalogoAdmin(1, { codigo: 'medico', nombre: 'Médico' });

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/1/items/',
      expect.objectContaining({ codigo: 'medico' }),
      expect.anything()
    );
  });

  it('actualiza un item', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: { id: 6 } });

    await actualizarItemCatalogoAdmin(6, { nombre: 'Actualizado' });

    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/items/6/',
      { nombre: 'Actualizado' },
      expect.anything()
    );
  });

  it('elimina un item', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({ data: null });

    await eliminarItemCatalogoAdmin(6);

    expect(apiCliente.delete).toHaveBeenCalledWith(
      '/api/v1/admin/catalogos/items/6/',
      expect.anything()
    );
  });
});
