import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioRegistroCorreo } from './FormularioRegistroCorreo';
import { registrarCorreo } from '@/services/authServicio';
import { ErrorApi } from '@/utils/erroresApi';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/services/authServicio', () => ({
  registrarCorreo: vi.fn(),
}));

const registrarCorreoMock = vi.mocked(registrarCorreo);

const CORREO_VALIDO = 'usuario@correo.com';
const CONTRASENA_VALIDA = 'Secreta123';

async function diligenciarFormulario(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText(/correo electrónico/i), CORREO_VALIDO);
  await usuario.type(screen.getByLabelText(/^contraseña$/i), CONTRASENA_VALIDA);
  await usuario.click(screen.getByRole('button', { name: /crear cuenta y continuar/i }));
}

describe('FormularioRegistroCorreo', () => {
  beforeEach(() => {
    pushMock.mockReset();
    registrarCorreoMock.mockReset();
  });

  it('muestra etiquetas y mensajes Zod con ortografia correcta', async () => {
    const usuario = userEvent.setup();
    render(<FormularioRegistroCorreo urlTerminos="/terminos-condiciones" />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toHaveAttribute(
      'href',
      '/terminos-condiciones',
    );

    await usuario.click(screen.getByRole('button', { name: /crear cuenta y continuar/i }));
    expect(await screen.findByText(/correo es obligatorio/i)).toBeInTheDocument();
  });

  it('valida reglas de contraseña con mensajes en español correcto', async () => {
    const usuario = userEvent.setup();
    render(<FormularioRegistroCorreo urlTerminos="/terminos-condiciones" />);

    await usuario.type(screen.getByLabelText(/correo electrónico/i), CORREO_VALIDO);
    await usuario.type(screen.getByLabelText(/^contraseña$/i), 'corta1');
    await usuario.click(screen.getByRole('button', { name: /crear cuenta y continuar/i }));

    expect(await screen.findByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
  });

  it('redirige al inicio de sesión cuando el registro es exitoso', async () => {
    const usuario = userEvent.setup();
    registrarCorreoMock.mockResolvedValue({ detalle: 'Usuario registrado correctamente.' });
    render(<FormularioRegistroCorreo urlTerminos="/terminos-condiciones" />);

    await diligenciarFormulario(usuario);

    expect(registrarCorreoMock).toHaveBeenCalledWith({
      correo: CORREO_VALIDO,
      contrasena: CONTRASENA_VALIDA,
    });
    expect(pushMock).toHaveBeenCalledWith('/auth/login?registro=exitoso');
  });

  it('muestra el mensaje del backend cuando el registro falla', async () => {
    const usuario = userEvent.setup();
    registrarCorreoMock.mockRejectedValue(
      new ErrorApi('El correo electrónico ya está registrado.', 400),
    );
    render(<FormularioRegistroCorreo urlTerminos="/terminos-condiciones" />);

    await diligenciarFormulario(usuario);

    expect(
      await screen.findByText(/el correo electrónico ya está registrado/i),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
