import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioRegistroCorreo } from './FormularioRegistroCorreo';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('FormularioRegistroCorreo', () => {
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

    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'usuario@correo.com');
    await usuario.type(screen.getByLabelText(/^contraseña$/i), 'corta1');
    await usuario.click(screen.getByRole('button', { name: /crear cuenta y continuar/i }));

    expect(await screen.findByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
  });
});
