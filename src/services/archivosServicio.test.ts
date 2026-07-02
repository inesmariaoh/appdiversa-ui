import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  subirArchivo,
  subirArchivoMultipart,
  obtenerArchivo,
  descargarArchivo,
} from './archivosServicio';

vi.mock('./api', () => ({
  apiCliente: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('archivosServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.post).mockReset();
    vi.mocked(apiCliente.get).mockReset();
  });

  it('sube archivo multipart con sesion', async () => {
    const archivo = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    vi.mocked(apiCliente.post).mockResolvedValue({ data: { uuid: 'arch-1' } });

    const resultado = await subirArchivoMultipart(
      {
        archivo,
        tipo_archivo: 'documento',
        origen: 'formulario',
        uuid_sesion: 's1',
        token_cliente: 't1',
        descripcion: 'Adjunto',
        es_publico: false,
        metadatos: { pagina: 1 },
      },
      { uuidSesion: 's1', tokenCliente: 't1' }
    );

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/archivos/',
      expect.any(FormData),
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(resultado).toEqual({ uuid: 'arch-1' });
  });

  it('sube archivo json legacy', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: { uuid: 'arch-2' } });

    await subirArchivo(
      {
        archivo: 'base64data',
        tipo_archivo: 'documento',
        origen: 'formulario',
      },
      { uuidSesion: 's1', tokenCliente: 't1' }
    );

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/archivos/',
      {
        archivo: 'base64data',
        tipo_archivo: 'documento',
        origen: 'formulario',
      },
      expect.any(Object)
    );
  });

  it('obtiene metadatos y descarga blob', async () => {
    vi.mocked(apiCliente.get)
      .mockResolvedValueOnce({ data: { uuid: 'arch-1', nombre_original: 'a.pdf' } })
      .mockResolvedValueOnce({ data: new Blob(['bytes']) });

    const meta = await obtenerArchivo('arch-1');
    const blob = await descargarArchivo('arch-1');

    expect(meta.nombre_original).toBe('a.pdf');
    expect(blob).toBeInstanceOf(Blob);
  });
});
