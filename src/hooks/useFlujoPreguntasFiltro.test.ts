import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlujoPreguntasFiltro } from '@/hooks/useFlujoPreguntasFiltro';
import type { FormularioEstructura, Pregunta } from '@/types/formulario';

function crearPregunta(
  codigo: string,
  extras: Partial<Pregunta> = {},
): Pregunta {
  return {
    codigo,
    texto: codigo,
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'texto_corto',
    es_obligatoria: true,
    es_pregunta_filtro: true,
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
    ...extras,
  };
}

const estructuraMinima: FormularioEstructura = {
  uuid: '00000000-0000-4000-8000-000000000001',
  codigo: 'E2E',
  nombre: 'Encuesta E2E',
  descripcion: '',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  textos: [],
  secciones: [],
};

describe('useFlujoPreguntasFiltro', () => {
  it('deshabilita continuar cuando la edad no cumple el filtro', () => {
    const preguntas = [
      crearPregunta('P1', {
        tipo_pregunta: 'fecha',
        tipo_validacion_filtro: 'rango_edad',
        valor_minimo: '18',
        valor_maximo: '109',
        mensaje_error: 'Debes tener 18 años o más para participar.',
      }),
    ];

    const { result } = renderHook(() =>
      useFlujoPreguntasFiltro({ preguntasFiltro: preguntas, estructura: estructuraMinima }),
    );

    act(() => {
      result.current.actualizarRespuesta('P1', {
        anio: '2012',
        mes: '9',
        dia: '23',
      });
    });

    expect(result.current.puedeContinuarActual).toBe(false);
  });

  it('muestra modal de no elegibilidad al responder No en radio filtro', () => {
    const preguntas = [
      crearPregunta('P2', {
        tipo_pregunta: 'radio',
        tipo_validacion_filtro: 'opcion_exacta',
        valor_filtro_esperado: { valor: 'si' },
        mensaje_no_cumple: 'No cumples condiciones.',
        opciones: [
          { codigo: 'SI', etiqueta: 'Sí', valor: 'si', orden: 1 },
          { codigo: 'NO', etiqueta: 'No', valor: 'no', orden: 2 },
        ],
        fuente_opciones: 'estatica',
      }),
    ];

    const { result } = renderHook(() =>
      useFlujoPreguntasFiltro({ preguntasFiltro: preguntas, estructura: estructuraMinima }),
    );

    act(() => {
      result.current.actualizarRespuesta('P2', 'no');
    });

    let valido = false;
    act(() => {
      valido = result.current.validarPreguntaActual();
    });

    expect(valido).toBe(false);
    expect(result.current.mostrarModalNoElegible).toBe(true);
    expect(result.current.textosNoElegible.cuerpo).toContain(
      'Gracias por tu interés',
    );
    expect(result.current.textosNoElegible.cuerpo).toContain('No cumples condiciones.');
  });

  it('pasa a verificacion exitosa cuando todas las preguntas filtro cumplen', () => {
    const preguntas = [
      crearPregunta('P1', {
        tipo_pregunta: 'fecha',
        tipo_validacion_filtro: 'rango_edad',
        valor_minimo: '18',
        valor_maximo: '109',
      }),
      crearPregunta('P2', {
        orden: 2,
        tipo_pregunta: 'radio',
        tipo_validacion_filtro: 'opcion_exacta',
        valor_filtro_esperado: { valor: 'si' },
        opciones: [
          { codigo: 'SI', etiqueta: 'Sí', valor: 'si', orden: 1 },
          { codigo: 'NO', etiqueta: 'No', valor: 'no', orden: 2 },
        ],
        fuente_opciones: 'estatica',
      }),
    ];

    const { result } = renderHook(() =>
      useFlujoPreguntasFiltro({ preguntasFiltro: preguntas, estructura: estructuraMinima }),
    );

    act(() => {
      result.current.actualizarRespuesta('P1', {
        anio: '1990',
        mes: '5',
        dia: '10',
      });
    });
    act(() => {
      result.current.continuarFlujo();
    });
    act(() => {
      result.current.actualizarRespuesta('P2', 'si');
    });
    act(() => {
      result.current.continuarFlujo();
    });

    expect(result.current.fase).toBe('verificacion_exitosa');
    expect(result.current.textosVerificacion.titulo).toBe('¡Verificado con éxito!');
  });
});
