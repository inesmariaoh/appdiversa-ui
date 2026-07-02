import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioBaseAdmin } from './FormularioBaseAdmin';

describe('FormularioBaseAdmin', () => {
  it('renderiza campos obligatorios para crear formulario', () => {
    render(<FormularioBaseAdmin onEnviar={vi.fn()} etiquetaBoton="Crear formulario" />);
    expect(screen.getByLabelText(/codigo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear formulario' })).toBeInTheDocument();
  });

  it('valida codigo obligatorio con zod', async () => {
    const usuario = userEvent.setup();
    render(<FormularioBaseAdmin onEnviar={vi.fn()} etiquetaBoton="Crear formulario" />);
    await usuario.type(screen.getByLabelText(/nombre/i), 'Formulario prueba');
    await usuario.click(screen.getByRole('button', { name: 'Crear formulario' }));
    expect(await screen.findByText(/codigo es obligatorio/i)).toBeInTheDocument();
  });

  it('envia datos validos al callback', async () => {
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<FormularioBaseAdmin onEnviar={onEnviar} etiquetaBoton="Crear formulario" />);
    await usuario.type(screen.getByLabelText(/codigo/i), 'F-TEST');
    await usuario.type(screen.getByLabelText(/nombre/i), 'Formulario prueba');
    await usuario.click(screen.getByRole('button', { name: 'Crear formulario' }));

    await waitFor(() => {
      expect(onEnviar).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: 'F-TEST', nombre: 'Formulario prueba' })
      );
    });
  });
});
