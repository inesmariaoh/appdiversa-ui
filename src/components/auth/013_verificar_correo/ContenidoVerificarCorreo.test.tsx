import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContenidoVerificarCorreo } from './ContenidoVerificarCorreo';
import { verificarCorreo } from '@/services/authServicio';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/services/authServicio', () => ({
  verificarCorreo: vi.fn(),
}));

import { useSearchParams } from 'next/navigation';

describe('ContenidoVerificarCorreo', () => {
  beforeEach(() => {
    vi.mocked(verificarCorreo).mockReset();
    pushMock.mockReset();
  });

  it('muestra enlace invalido cuando faltan uid y token', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
    render(<ContenidoVerificarCorreo />);
    expect(screen.getByRole('alert')).toHaveTextContent(/no es válido/i);
    expect(verificarCorreo).not.toHaveBeenCalled();
  });

  it('verifica correctamente y ofrece ir a login', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('uid=u1&token=t1') as never
    );
    vi.mocked(verificarCorreo).mockResolvedValue({
      detalle: 'Tu correo fue verificado.',
    });
    render(<ContenidoVerificarCorreo />);

    await waitFor(() => {
      expect(screen.getByText(/tu correo fue verificado/i)).toBeInTheDocument();
    });
    expect(verificarCorreo).toHaveBeenCalledWith('u1', 't1');
  });

  it('muestra error cuando el token es invalido', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('uid=u1&token=malo') as never
    );
    vi.mocked(verificarCorreo).mockRejectedValue(new Error('fallo'));
    render(<ContenidoVerificarCorreo />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
