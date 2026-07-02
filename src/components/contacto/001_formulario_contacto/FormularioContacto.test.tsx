import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioContacto } from './FormularioContacto';
import { enviarMensajeContacto } from '@/services/contactoServicio';

vi.mock('@/services/contactoServicio', () => ({
  enviarMensajeContacto: vi.fn(),
}));

const toastMock = vi.fn();

vi.mock('@/components/ui/006_proveedores_ui', () => ({
  useToast: () => ({ toast: toastMock }),
}));

describe('FormularioContacto', () => {
  beforeEach(() => {
    vi.mocked(enviarMensajeContacto).mockReset();
    toastMock.mockReset();
  });

  it('renderiza campos del formulario', () => {
    render(<FormularioContacto titulo="Contacto" descripcion="Escribenos" />);
    expect(screen.getByRole('heading', { name: 'Contacto' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^asunto$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mensaje$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  it('valida campos obligatorios con Zod', async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto />);
    await usuario.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(await screen.findByText(/nombre es obligatorio/i)).toBeInTheDocument();
    expect(enviarMensajeContacto).not.toHaveBeenCalled();
  });

  it('valida longitud minima del mensaje', async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto />);
    await usuario.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'ana@correo.com');
    await usuario.type(screen.getByLabelText(/^asunto$/i), 'Consulta');
    await usuario.type(screen.getByLabelText(/^mensaje$/i), 'corto');
    await usuario.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(await screen.findByText(/al menos 10 caracteres/i)).toBeInTheDocument();
  });

  it('muestra toast de exito con detalle del backend', async () => {
    vi.mocked(enviarMensajeContacto).mockResolvedValue({
      detalle: 'Tu mensaje fue enviado correctamente.',
    });
    const usuario = userEvent.setup();
    render(<FormularioContacto />);

    await usuario.type(screen.getByLabelText(/^nombre$/i), 'Ana Perez');
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'ana@correo.com');
    await usuario.type(screen.getByLabelText(/^asunto$/i), 'Consulta');
    await usuario.type(
      screen.getByLabelText(/^mensaje$/i),
      'Necesito ayuda con el diligenciamiento.'
    );
    await usuario.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    await waitFor(() => {
      expect(enviarMensajeContacto).toHaveBeenCalledWith({
        nombre: 'Ana Perez',
        correo: 'ana@correo.com',
        asunto: 'Consulta',
        mensaje: 'Necesito ayuda con el diligenciamiento.',
      });
    });
    expect(toastMock).toHaveBeenCalledWith(
      'Tu mensaje fue enviado correctamente.',
      'exito'
    );
  });

  it('muestra toast de error funcional', async () => {
    vi.mocked(enviarMensajeContacto).mockRejectedValue(new Error('Servicio no disponible'));
    const usuario = userEvent.setup();
    render(<FormularioContacto />);

    await usuario.type(screen.getByLabelText(/^nombre$/i), 'Ana Perez');
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'ana@correo.com');
    await usuario.type(screen.getByLabelText(/^asunto$/i), 'Consulta');
    await usuario.type(
      screen.getByLabelText(/^mensaje$/i),
      'Mensaje de prueba para contacto.'
    );
    await usuario.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });
});
