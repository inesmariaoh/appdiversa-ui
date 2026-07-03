import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import * as servicio from './interfazAdminServicio';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const CONFIG = { withCredentials: true };
const RUTA = '/api/v1/interfaz/admin/accesibilidad/';

describe('interfazAdminServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(apiCliente.patch).mockReset();
  });

  it('obtenerAccesibilidadAdmin consulta la ruta con credenciales', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: {} });
    await servicio.obtenerAccesibilidadAdmin();
    expect(apiCliente.get).toHaveBeenCalledWith(RUTA, CONFIG);
  });

  it('actualizarAccesibilidadAdmin envia las banderas via patch', async () => {
    const entrada = { fuente_dislexia_habilitada: true };
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: entrada });
    await servicio.actualizarAccesibilidadAdmin(entrada);
    expect(apiCliente.patch).toHaveBeenCalledWith(RUTA, entrada, CONFIG);
  });
});
