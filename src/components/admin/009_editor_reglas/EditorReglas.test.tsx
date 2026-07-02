import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorReglas } from './EditorReglas';

vi.mock('@/services/formulariosAdminServicio', () => ({
  listarReglasAdmin: vi.fn(),
  crearReglaAdmin: vi.fn(),
  actualizarReglaAdmin: vi.fn(),
  eliminarReglaAdmin: vi.fn(),
}));

import { listarReglasAdmin, crearReglaAdmin } from '@/services/formulariosAdminServicio';

describe('EditorReglas', () => {
  beforeEach(() => {
    vi.mocked(listarReglasAdmin).mockReset();
    vi.mocked(crearReglaAdmin).mockReset();
    vi.mocked(listarReglasAdmin).mockResolvedValue([]);
  });

  it('renderiza editor de reglas', async () => {
    render(
      <EditorReglas idFormulario={1} codigosPreguntas={['P1']} codigosSecciones={['SEC-1']} />
    );
    expect(screen.getByText('Reglas')).toBeInTheDocument();
    await waitFor(() => {
      expect(listarReglasAdmin).toHaveBeenCalledWith(1);
    });
  });

  it('crea regla con valor esperado simple', async () => {
    vi.mocked(crearReglaAdmin).mockResolvedValue({ id: 1 } as never);
    const usuario = userEvent.setup();

    render(
      <EditorReglas idFormulario={1} codigosPreguntas={['P1']} codigosSecciones={['SEC-1']} />
    );

    await waitFor(() => {
      expect(listarReglasAdmin).toHaveBeenCalled();
    });

    await usuario.selectOptions(screen.getByLabelText(/pregunta origen/i), 'P1');
    await usuario.type(screen.getByLabelText(/valor esperado/i), 'si');
    await usuario.click(screen.getByRole('button', { name: 'Crear regla' }));

    await waitFor(() => {
      expect(crearReglaAdmin).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          pregunta_origen: 'P1',
          operador: 'equals',
          valor_esperado: 'si',
        })
      );
    });
  });
});
