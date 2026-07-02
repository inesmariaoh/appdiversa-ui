import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import { enviarMensajeContacto } from './contactoServicio';

vi.mock('./api', () => ({
  apiCliente: {
    post: vi.fn(),
  },
}));

describe('contactoServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.post).mockReset();
  });

  it('envia mensaje de contacto al endpoint publico', async () => {
    const detalle = { detalle: 'Tu mensaje fue enviado correctamente.' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: detalle });

    const payload = {
      nombre: 'Ana Perez',
      correo: 'ana@correo.com',
      asunto: 'Consulta general',
      mensaje: 'Necesito ayuda con una encuesta.',
    };

    const resultado = await enviarMensajeContacto(payload);

    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/contacto/', payload);
    expect(resultado).toEqual(detalle);
  });

  it('propaga error funcional del backend', async () => {
    vi.mocked(apiCliente.post).mockRejectedValue(new Error('Error de red'));

    await expect(
      enviarMensajeContacto({
        nombre: 'Ana',
        correo: 'ana@correo.com',
        asunto: 'Asunto',
        mensaje: 'Mensaje de prueba largo',
      })
    ).rejects.toThrow('Error de red');
  });
});
