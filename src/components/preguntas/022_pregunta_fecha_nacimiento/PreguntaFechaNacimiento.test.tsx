import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreguntaFechaNacimiento } from '@/components/preguntas/022_pregunta_fecha_nacimiento';
import type { Pregunta } from '@/types/formulario';

function crearPreguntaFecha(): Pregunta {
  return {
    codigo: 'P-FEC',
    texto: '¿Cuál es su fecha de nacimiento?',
    descripcion: 'Seleccione año, mes y día.',
    tooltip: '',
    tipo_pregunta: 'fecha',
    es_obligatoria: true,
    es_pregunta_filtro: true,
    tipo_validacion_filtro: 'rango_edad',
    valor_minimo: '18',
    valor_maximo: '109',
    mensaje_error:
      'Debes tener 18 años o más para participar. Revisa tu fecha o vuelve a la lista de encuestas.',
    permite_otro: false,
    permite_observacion: false,
    orden: 1,
    longitud_minima: null,
    longitud_maxima: null,
    expresion_regular: '',
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
  };
}

describe('PreguntaFechaNacimiento', () => {
  it('muestra mensaje de error cuando la edad no cumple el rango', () => {
    render(
      <PreguntaFechaNacimiento
        pregunta={crearPreguntaFecha()}
        valor={{ anio: '2012', mes: '9', dia: '23' }}
        onCambio={() => undefined}
      />,
    );

    expect(
      screen.getByText('Debes tener 18 años o más para participar', {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});
