import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioSolicitarRestaurarPassword } from './FormularioSolicitarRestaurarPassword';
import { solicitarRestaurarPassword } from '@/services/authServicio';

vi.mock('@/services/authServicio', () => ({
  solicitarRestaurarPassword: vi.fn(),
}));

describe('FormularioSolicitarRestaurarPassword', () => {
  beforeEach(() => {
    vi.mocked(solicitarRestaurarPassword).mockReset();
  });

  it('renderiza formulario con campo email', () => {
    render(<FormularioSolicitarRestaurarPassword />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver a inicio de sesión/i })).toHaveAttribute(
      'href',
      '/auth/login'
    );
  });

  it('valida email obligatorio', async () => {
    const usuario = userEvent.setup();
    render(<FormularioSolicitarRestaurarPassword />);
    await usuario.click(screen.getByRole('button', { name: /enviar instrucciones/i }));
    expect(await screen.findByText(/correo es obligatorio/i)).toBeInTheDocument();
    expect(solicitarRestaurarPassword).not.toHaveBeenCalled();
  });

  it('valida email invalido', async () => {
    const usuario = userEvent.setup();
    render(<FormularioSolicitarRestaurarPassword />);
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'correo-invalido');
    await usuario.click(screen.getByRole('button', { name: /enviar instrucciones/i }));
    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument();
  });

  it('muestra mensaje de exito del backend', async () => {
    vi.mocked(solicitarRestaurarPassword).mockResolvedValue({
      detalle: 'Si el correo esta registrado, recibiras instrucciones.',
    });
    const usuario = userEvent.setup();
    render(<FormularioSolicitarRestaurarPassword />);
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'usuario@correo.com');
    await usuario.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/si el correo esta registrado, recibiras instrucciones/i)
      ).toBeInTheDocument();
    });
    expect(solicitarRestaurarPassword).toHaveBeenCalledWith({
      email: 'usuario@correo.com',
    });
  });
});
