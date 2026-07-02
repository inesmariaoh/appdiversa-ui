import { describe, it, expect } from 'vitest';
import {
  listarPreguntasVisibles,
  preguntaVisibleSegunReglas,
  preguntaHabilitadaSegunReglas,
  preguntaObligatoriaSegunReglas,
  buscarIndicePregunta,
  buscarIndiceSeccion,
  ordenarPreguntasFlujoVisual,
  calcularNumeracionVisual,
  preguntaConNumeroVisual,
} from './motorReglasUi';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';
import type { Pregunta, SeccionFormulario } from '@/types/formulario';

function crearPreguntaBase(
  codigo: string,
  orden: number,
  extras: Partial<Pregunta> = {},
): Pregunta {
  return {
    codigo,
    texto: codigo,
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'texto_corto',
    es_obligatoria: false,
    es_pregunta_filtro: false,
    permite_otro: false,
    permite_observacion: false,
    orden,
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
    visible_por_defecto: true,
    limpiar_respuesta_al_ocultar: true,
    ...extras,
  };
}

const secciones: SeccionFormulario[] = [
  {
    codigo: 'S1',
    titulo: 'Seccion',
    descripcion: '',
    texto_ayuda: '',
    orden: 1,
    preguntas: [
      crearPreguntaBase('P1', 1),
      crearPreguntaBase('P2', 2),
    ],
  },
];

describe('motorReglasUi', () => {
  it('filtra preguntas ocultas por reglas', () => {
    const visibles = listarPreguntasVisibles(secciones, {
      ...RESULTADO_REGLAS_VACIO,
      preguntas_ocultas: ['P2'],
    });
    expect(visibles).toHaveLength(1);
    expect(visibles[0]?.codigo).toBe('P1');
  });

  it('oculta preguntas con visible_por_defecto false sin regla mostrar', () => {
    const seccionDependiente: SeccionFormulario[] = [
      {
        ...secciones[0],
        preguntas: [
          crearPreguntaBase('P7', 1),
          crearPreguntaBase('P7-ANT', 2, {
            tipo_pregunta: 'ubicacion_geografica',
            visible_por_defecto: false,
            pregunta_origen_flujo_codigo: 'P7',
          }),
          crearPreguntaBase('P8', 3),
        ],
      },
    ];

    const sinReglas = listarPreguntasVisibles(seccionDependiente, RESULTADO_REGLAS_VACIO);
    expect(sinReglas.map((item) => item.codigo)).toEqual(['P7', 'P8']);

    const conRegla = listarPreguntasVisibles(seccionDependiente, {
      ...RESULTADO_REGLAS_VACIO,
      preguntas_visibles: ['P7-ANT'],
    });
    expect(conRegla.map((item) => item.codigo)).toEqual(['P7', 'P7-ANT', 'P8']);
  });

  it('inserta dependiente despues de pregunta origen en flujo visual', () => {
    const preguntas = [
      crearPreguntaBase('P7', 1),
      crearPreguntaBase('P8', 3),
      crearPreguntaBase('P7-ANT', 2, {
        pregunta_origen_flujo_codigo: 'P7',
      }),
    ];
    const mapa = new Map([['P7-ANT', 'P7']]);
    const ordenadas = ordenarPreguntasFlujoVisual(preguntas, mapa);
    expect(ordenadas.map((item) => item.codigo)).toEqual(['P7', 'P7-ANT', 'P8']);
  });

  it('calcula numeracion visual consecutiva', () => {
    const preguntas = [
      crearPreguntaBase('P7', 1),
      crearPreguntaBase('P7-ANT', 75),
      crearPreguntaBase('P8', 3),
    ];
    const numeracion = calcularNumeracionVisual(preguntas);
    expect(numeracion.get('P7')).toBe(1);
    expect(numeracion.get('P7-ANT')).toBe(2);
    expect(numeracion.get('P8')).toBe(3);
  });

  it('sobrescribe orden tecnico con numero visual', () => {
    const pregunta = crearPreguntaBase('P7-ANT', 75);
    const visual = preguntaConNumeroVisual(pregunta, 8);
    expect(visual.orden).toBe(8);
    expect(visual.codigo).toBe('P7-ANT');
  });

  it('evalua visibilidad, habilitacion y obligatoriedad', () => {
    const reglas = {
      ...RESULTADO_REGLAS_VACIO,
      preguntas_ocultas: ['P2'],
      preguntas_visibles: ['P3'],
      preguntas_deshabilitadas: ['P4'],
      preguntas_habilitadas: ['P5'],
      preguntas_obligatorias: ['P6'],
      preguntas_opcionales: ['P7'],
    };

    expect(
      preguntaVisibleSegunReglas(crearPreguntaBase('P2', 1), reglas),
    ).toBe(false);
    expect(
      preguntaVisibleSegunReglas(crearPreguntaBase('P3', 1), reglas),
    ).toBe(true);
    expect(preguntaHabilitadaSegunReglas('P4', reglas)).toBe(false);
    expect(preguntaHabilitadaSegunReglas('P5', reglas)).toBe(true);
    expect(preguntaObligatoriaSegunReglas('P6', false, reglas)).toBe(true);
    expect(preguntaObligatoriaSegunReglas('P7', true, reglas)).toBe(false);
    expect(preguntaObligatoriaSegunReglas('P8', true, reglas)).toBe(true);
  });

  it('busca indices de pregunta y seccion', () => {
    expect(buscarIndicePregunta(secciones[0].preguntas, 'P2')).toBe(1);
    expect(buscarIndicePregunta(secciones[0].preguntas, 'PX')).toBe(-1);
    expect(buscarIndiceSeccion(secciones, 'S1')).toBe(0);
    expect(buscarIndiceSeccion(secciones, 'SX')).toBe(-1);
  });
});
