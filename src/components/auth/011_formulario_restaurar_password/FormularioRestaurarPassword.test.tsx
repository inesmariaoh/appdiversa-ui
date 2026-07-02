import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioRestaurarPassword } from './FormularioRestaurarPassword';
import { restaurarPassword } from '@/services/authServicio';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/services/authServicio', () => ({
  restaurarPassword: vi.fn(),
}));

import { useSearchParams } from 'next/navigation';

describe('FormularioRestaurarPassword', () => {
  beforeEach(() => {
    vi.mocked(restaurarPassword).mockReset();
    pushMock.mockReset();
  });

  it('muestra error si faltan uid y token', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
    render(<FormularioRestaurarPassword />);
    expect(screen.getByRole('alert')).toHaveTextContent(/enlace de restauración no es válido/i);
  });

  it('valida contrasenas obligatorias y coincidencia', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('uid=u1&token=t1') as never
    );
    const usuario = userEvent.setup();
    render(<FormularioRestaurarPassword />);

    await usuario.click(screen.getByRole('button', { name: /restaurar contraseña/i }));
    expect(await screen.findByText(/contraseña es obligatoria/i)).toBeInTheDocument();

    await usuario.type(screen.getByLabelText(/nueva contraseña/i), '12345678');
    await usuario.type(screen.getByLabelText(/confirmar contraseña/i), '87654321');
    await usuario.click(screen.getByRole('button', { name: /restaurar contraseña/i }));
    expect(await screen.findByText(/contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('muestra exito y enlace a login', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('uid=u1&token=t1') as never
    );
    vi.mocked(restaurarPassword).mockResolvedValue({
      detalle: 'Contrasena restaurada correctamente.',
    });
    const usuario = userEvent.setup();
    render(<FormularioRestaurarPassword />);

    await usuario.type(screen.getByLabelText(/nueva contraseña/i), 'nueva1234');
    await usuario.type(screen.getByLabelText(/confirmar contraseña/i), 'nueva1234');
    await usuario.click(screen.getByRole('button', { name: /restaurar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/contrasena restaurada correctamente/i)).toBeInTheDocument();
    });

    await usuario.click(screen.getByRole('button', { name: /ir a inicio de sesión/i }));
    expect(pushMock).toHaveBeenCalledWith('/auth/login');
  });
});
