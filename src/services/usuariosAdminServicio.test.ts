import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import * as servicio from './usuariosAdminServicio';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const CONFIG = { withCredentials: true };

describe('usuariosAdminServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(apiCliente.post).mockReset();
    vi.mocked(apiCliente.patch).mockReset();
  });

  it('listarUsuariosAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: [] });
    await servicio.listarUsuariosAdmin();
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/usuarios/', CONFIG);
  });

  it('obtenerUsuarioAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: { id: 1 } });
    await servicio.obtenerUsuarioAdmin(1);
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/usuarios/1/', CONFIG);
  });

  it('crearUsuarioAdmin', async () => {
    const entrada = { username: 'u', email: 'e@t.com', nombre_completo: 'N' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: entrada });
    await servicio.crearUsuarioAdmin(entrada);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/usuarios/', entrada, CONFIG);
  });

  it('actualizarUsuarioAdmin', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: {} });
    await servicio.actualizarUsuarioAdmin(2, { email: 'n@t.com' });
    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/usuarios/2/',
      { email: 'n@t.com' },
      CONFIG
    );
  });

  it('activarUsuarioAdmin', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await servicio.activarUsuarioAdmin(3);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/usuarios/3/activar/', {}, CONFIG);
  });

  it('desactivarUsuarioAdmin', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await servicio.desactivarUsuarioAdmin(4);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/usuarios/4/desactivar/', {}, CONFIG);
  });

  it('listarGruposAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: [] });
    await servicio.listarGruposAdmin();
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/grupos/', CONFIG);
  });
});
