import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioLogin } from './FormularioLogin';

const replaceMock = vi.fn();
const iniciarSesionMock = vi.fn();
const limpiarErrorMock = vi.fn();
const esAdministradorMock = vi.fn(() => false);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/store/authStore', () => {
  const useAuthStore = (selector: (state: unknown) => unknown) =>
    selector({
      iniciarSesion: iniciarSesionMock,
      cargando: false,
      limpiarError: limpiarErrorMock,
    });
  useAuthStore.getState = () => ({ esAdministrador: esAdministradorMock });
  return { useAuthStore };
});

vi.mock('@/store/sesionStore', () => ({
  useSesionStore: {
    getState: () => ({ uuidSesion: null, tokenCliente: null }),
  },
}));

vi.mock('@/services/sesionesServicio', () => ({
  vincularUsuarioSesion: vi.fn(),
}));

async function iniciarSesionValida(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(
    screen.getByLabelText(/correo electrónico o número de celular/i),
    'usuario@correo.com',
  );
  await usuario.type(screen.getByLabelText(/^contraseña$/i), 'Secreta123');
  await usuario.click(screen.getByRole('button', { name: /inicia sesión/i }));
}

describe('FormularioLogin', () => {
  beforeEach(() => {
    iniciarSesionMock.mockReset();
    limpiarErrorMock.mockReset();
    replaceMock.mockReset();
    esAdministradorMock.mockReset();
    esAdministradorMock.mockReturnValue(false);
  });

  it('muestra textos principales con ortografia correcta', () => {
    render(<FormularioLogin />);

    expect(
      screen.getByRole('form', { name: /formulario de inicio de sesión/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico o número de celular/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /¿olvidaste tu contraseña\?/i })).toHaveAttribute(
      'href',
      '/auth/solicitar-restaurar-password',
    );
    expect(screen.getByRole('button', { name: /inicia sesión/i })).toBeInTheDocument();
  });

  it('valida contraseña obligatoria con mensaje Zod', async () => {
    const usuario = userEvent.setup();
    render(<FormularioLogin />);

    await usuario.type(screen.getByLabelText(/correo electrónico o número de celular/i), 'usuario');
    await usuario.click(screen.getByRole('button', { name: /inicia sesión/i }));

    expect(await screen.findByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(iniciarSesionMock).not.toHaveBeenCalled();
  });

  it('redirige al historial de respuestas cuando el usuario no es administrador', async () => {
    const usuario = userEvent.setup();
    esAdministradorMock.mockReturnValue(false);
    render(<FormularioLogin />);

    await iniciarSesionValida(usuario);

    expect(replaceMock).toHaveBeenCalledWith('/mis-respuestas');
  });

  it('redirige al historial de respuestas tambien cuando el usuario es administrador', async () => {
    const usuario = userEvent.setup();
    esAdministradorMock.mockReturnValue(true);
    render(<FormularioLogin />);

    await iniciarSesionValida(usuario);

    expect(replaceMock).toHaveBeenCalledWith('/mis-respuestas');
  });
});
