import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorPreguntas } from './EditorPreguntas';
import type { SeccionFormulario } from '@/types/formulario';

vi.mock('@/services/formulariosAdminServicio', () => ({
  crearPreguntaAdmin: vi.fn(),
  actualizarPreguntaAdmin: vi.fn(),
  eliminarPreguntaAdmin: vi.fn(),
  duplicarPreguntaAdmin: vi.fn(),
  reordenarPreguntasAdmin: vi.fn(),
}));

import { crearPreguntaAdmin } from '@/services/formulariosAdminServicio';

const secciones: SeccionFormulario[] = [
  {
    codigo: 'SEC-01',
    titulo: 'Seccion uno',
    descripcion: '',
    texto_ayuda: '',
    orden: 1,
    preguntas: [],
  },
];

describe('EditorPreguntas', () => {
  beforeEach(() => {
    vi.mocked(crearPreguntaAdmin).mockReset();
  });

  it('renderiza formulario de pregunta', () => {
    render(
      <EditorPreguntas idFormulario={1} secciones={secciones} onActualizado={vi.fn()} />
    );
    expect(screen.getByText('Preguntas')).toBeInTheDocument();
    expect(screen.getByLabelText(/codigo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear pregunta' })).toBeInTheDocument();
  });

  it('crea pregunta llamando al servicio admin', async () => {
    vi.mocked(crearPreguntaAdmin).mockResolvedValue({} as never);
    const onActualizado = vi.fn();
    const usuario = userEvent.setup();

    render(
      <EditorPreguntas idFormulario={1} secciones={secciones} onActualizado={onActualizado} />
    );

    await usuario.type(screen.getByLabelText(/codigo/i), 'P-01');
    await usuario.type(screen.getByLabelText(/^texto$/i), 'Pregunta demo');
    await usuario.click(screen.getByRole('button', { name: 'Crear pregunta' }));

    await waitFor(() => {
      expect(crearPreguntaAdmin).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ codigo: 'P-01', texto: 'Pregunta demo', seccion_codigo: 'SEC-01' })
      );
    });
    expect(onActualizado).toHaveBeenCalled();
  });
});
