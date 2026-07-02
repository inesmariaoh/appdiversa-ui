import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RenderizadorPregunta } from './RenderizadorPregunta';
import type { Pregunta } from '@/types/formulario';

function crearPreguntaBase(
  parcial: Partial<Pregunta> & Pick<Pregunta, 'codigo' | 'tipo_pregunta' | 'texto'>
): Pregunta {
  return {
    descripcion: '',
    tooltip: '',
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
    fuente_opciones: '',
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    ...parcial,
  };
}

describe('RenderizadorPregunta', () => {
  it('renderiza PreguntaFecha para tipo fecha', () => {
    const pregunta = crearPreguntaBase({
      codigo: 'P1',
      tipo_pregunta: 'fecha',
      texto: 'Fecha de nacimiento',
    });

    render(
      <RenderizadorPregunta
        pregunta={pregunta}
        valor={{ anio: '', mes: '', dia: '' }}
        onCambio={() => undefined}
      />
    );

    expect(screen.getByText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^año$/i)).toBeInTheDocument();
  });

  it('renderiza PreguntaTextoCorto para tipo texto_corto', () => {
    const pregunta = crearPreguntaBase({
      codigo: 'P2',
      tipo_pregunta: 'texto_corto',
      texto: 'Nombre',
    });

    render(
      <RenderizadorPregunta
        pregunta={pregunta}
        valor=""
        onCambio={() => undefined}
      />
    );

    expect(screen.getByText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renderiza PreguntaTextoLargo para tipo texto_largo', () => {
    const pregunta = crearPreguntaBase({
      codigo: 'P2B',
      tipo_pregunta: 'texto_largo',
      texto: 'Comentario',
    });

    render(
      <RenderizadorPregunta
        pregunta={pregunta}
        valor=""
        onCambio={() => undefined}
      />
    );

    expect(screen.getByText(/comentario/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renderiza PreguntaLikert con radiogroup', () => {
    const pregunta = crearPreguntaBase({
      codigo: 'P3',
      tipo_pregunta: 'likert',
      texto: 'Escala',
      opciones: [
        { codigo: 'O1', etiqueta: 'Bajo', valor: '1', orden: 1 },
        { codigo: 'O2', etiqueta: 'Alto', valor: '5', orden: 2 },
      ],
    });

    render(
      <RenderizadorPregunta
        pregunta={pregunta}
        valor=""
        onCambio={() => undefined}
      />
    );

    expect(screen.getByRole('radiogroup', { name: /escala/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/bajo/i)).toBeInTheDocument();
  });

  it('renderiza PreguntaNumero para tipo numero', () => {
    const pregunta = crearPreguntaBase({
      codigo: 'P4',
      tipo_pregunta: 'numero',
      texto: 'Edad',
    });

    render(
      <RenderizadorPregunta
        pregunta={pregunta}
        valor=""
        onCambio={() => undefined}
      />
    );

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renderiza placeholder para tipo desconocido', () => {
    const pregunta = crearPreguntaBase({
      codigo: 'P5',
      tipo_pregunta: 'texto_corto',
      texto: 'X',
    });
    const preguntaInvalida = {
      ...pregunta,
      tipo_pregunta: 'tipo_inexistente' as Pregunta['tipo_pregunta'],
    };

    render(
      <RenderizadorPregunta
        pregunta={preguntaInvalida}
        valor=""
        onCambio={() => undefined}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(/no esta disponible/i);
  });
});
