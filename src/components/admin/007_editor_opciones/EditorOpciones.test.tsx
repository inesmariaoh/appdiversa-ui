import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorOpciones } from './EditorOpciones';
import type { Pregunta } from '@/types/formulario';

vi.mock('@/services/formulariosAdminServicio', () => ({
  crearOpcionAdmin: vi.fn(),
  actualizarOpcionAdmin: vi.fn(),
  eliminarOpcionAdmin: vi.fn(),
  reordenarOpcionesAdmin: vi.fn(),
}));

import { crearOpcionAdmin } from '@/services/formulariosAdminServicio';

function preguntaRadio(): Pregunta {
  return {
    codigo: 'P-RADIO',
    texto: 'Seleccione opcion',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'radio',
    es_obligatoria: false,
    es_pregunta_filtro: false,
    permite_otro: false,
    permite_observacion: false,
    orden: 1,
    longitud_minima: null,
    longitud_maxima: null,
    valor_minimo: null,
    valor_maximo: null,
    expresion_regular: '',
    mensaje_error: '',
    usa_catalogo: false,
    catalogo_asociado: null,
    pregunta_padre_catalogo: null,
    es_pregunta_geografica: false,
    preguntas_dependientes_geograficas: [],
    permite_busqueda_catalogo: false,
    limite_items_catalogo: null,
    fuente_opciones: 'estatica',
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
  };
}

describe('EditorOpciones', () => {
  beforeEach(() => {
    vi.mocked(crearOpcionAdmin).mockReset();
  });

  it('muestra mensaje si no hay preguntas con opciones', () => {
    render(<EditorOpciones idFormulario={1} preguntas={[]} onActualizado={vi.fn()} />);
    expect(screen.getByText(/no hay preguntas con opciones/i)).toBeInTheDocument();
  });

  it('crea opcion para pregunta tipo radio', async () => {
    vi.mocked(crearOpcionAdmin).mockResolvedValue({} as never);
    const usuario = userEvent.setup();
    render(
      <EditorOpciones idFormulario={1} preguntas={[preguntaRadio()]} onActualizado={vi.fn()} />
    );

    await usuario.type(screen.getByLabelText(/codigo/i), 'OP-1');
    await usuario.type(screen.getByLabelText(/etiqueta/i), 'Opcion A');
    await usuario.type(screen.getByLabelText(/^valor$/i), 'A');
    await usuario.click(screen.getByRole('button', { name: 'Crear opcion' }));

    await waitFor(() => {
      expect(crearOpcionAdmin).toHaveBeenCalledWith(
        1,
        'P-RADIO',
        expect.objectContaining({ codigo: 'OP-1', etiqueta: 'Opcion A', valor: 'A' })
      );
    });
  });
});
