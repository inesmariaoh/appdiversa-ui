import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioEnviarCopia } from './FormularioEnviarCopia';
import { enviarCopiaRespuestas } from '@/services/sesionesServicio';

const toastMock = vi.fn();

vi.mock('@/services/sesionesServicio', () => ({
  enviarCopiaRespuestas: vi.fn(),
}));

vi.mock('@/components/ui/006_proveedores_ui', () => ({
  useToast: () => ({ toast: toastMock }),
}));

describe('FormularioEnviarCopia', () => {
  beforeEach(() => {
    vi.mocked(enviarCopiaRespuestas).mockReset();
    toastMock.mockReset();
  });

  it('renderiza formulario cuando hay sesion y token', () => {
    render(<FormularioEnviarCopia uuidSesion="s1" tokenCliente="t1" />);
    expect(screen.getByText(/enviar copia de mis respuestas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it('valida email obligatorio', async () => {
    const usuario = userEvent.setup();
    render(<FormularioEnviarCopia uuidSesion="s1" tokenCliente="t1" />);
    await usuario.click(screen.getByRole('button', { name: /enviar copia/i }));
    expect(await screen.findByText(/correo es obligatorio/i)).toBeInTheDocument();
  });

  it('llama servicio y muestra toast de exito', async () => {
    vi.mocked(enviarCopiaRespuestas).mockResolvedValue({
      detalle: 'La copia de respuestas fue enviada al correo indicado.',
    });
    const usuario = userEvent.setup();
    render(<FormularioEnviarCopia uuidSesion="s1" tokenCliente="t1" />);
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'usuario@correo.com');
    await usuario.click(screen.getByRole('button', { name: /enviar copia/i }));

    await waitFor(() => {
      expect(enviarCopiaRespuestas).toHaveBeenCalledWith(
        's1',
        't1',
        'usuario@correo.com'
      );
    });
    expect(toastMock).toHaveBeenCalledWith(
      'La copia de respuestas fue enviada al correo indicado.',
      'exito'
    );
  });

  it('muestra toast de error funcional', async () => {
    vi.mocked(enviarCopiaRespuestas).mockRejectedValue(new Error('fallo'));
    const usuario = userEvent.setup();
    render(<FormularioEnviarCopia uuidSesion="s1" tokenCliente="t1" />);
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'usuario@correo.com');
    await usuario.click(screen.getByRole('button', { name: /enviar copia/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });
});
