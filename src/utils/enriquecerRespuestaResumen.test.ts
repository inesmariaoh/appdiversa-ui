import { describe, expect, it } from 'vitest';
import {
  enriquecerRespuestaResumen,
  normalizarEtiquetaLegible,
} from './enriquecerRespuestaResumen';
import type { Pregunta } from '@/types/formulario';
import type { ResumenRespuesta } from '@/types/sesion';

function crearPregunta(parcial: Partial<Pregunta> & Pick<Pregunta, 'codigo'>): Pregunta {
  return {
    texto: 'Pregunta',
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
    ...parcial,
  };
}

function crearRespuesta(parcial: Partial<ResumenRespuesta>): ResumenRespuesta {
  return {
    seccion_codigo: 'S1',
    seccion_titulo: 'Seccion',
    pregunta_codigo: 'P1',
    pregunta_texto: 'Pregunta',
    tipo_pregunta: 'radio',
    valor: null,
    valor_legible: '',
    observacion: '',
    ...parcial,
  };
}

describe('enriquecerRespuestaResumen', () => {
  it('normaliza si/no en etiquetas legibles', () => {
    expect(normalizarEtiquetaLegible('si')).toBe('Sí');
    expect(normalizarEtiquetaLegible('no informa')).toBe('No informa');
  });

  it('resuelve nombre de departamento desde catalogo', () => {
    const pregunta = crearPregunta({
      codigo: 'P_DEPTO',
      usa_catalogo: true,
      es_pregunta_geografica: true,
      catalogo_asociado: { codigo: 'departamentos' },
    });
    const item = crearRespuesta({
      pregunta_codigo: 'P_DEPTO',
      tipo_pregunta: 'select',
      valor: '23',
    });

    const presentacion = enriquecerRespuestaResumen(item, {
      indicePreguntas: new Map([[pregunta.codigo, pregunta]]),
      catalogos: new Map([
        [
          'departamentos',
          [
            {
              codigo: '23',
              codigo_catalogo: 'departamentos',
              nombre: 'Córdoba',
              descripcion: '',
              valor: '23',
              codigo_padre: null,
              codigo_externo: '23',
              metadatos: null,
              orden: 1,
              esta_activo: true,
            },
          ],
        ],
      ]),
      respuestasPorCodigo: new Map([[item.pregunta_codigo, item]]),
    });

    expect(presentacion.textoSimple).toBe('Córdoba');
  });

  it('resuelve matriz con etiquetas de filas y columnas', () => {
    const pregunta = crearPregunta({
      codigo: 'P_MATRIZ',
      tipo_pregunta: 'matriz',
      filas_matriz: [
        { codigo: 'ROW1-P14', etiqueta: 'Entorno laboral', orden: 1 },
        { codigo: 'ROW2-P14', etiqueta: 'Entorno educativo', orden: 2 },
      ],
      columnas_matriz: [
        { codigo: 'COL1-P14', etiqueta: 'Sí', orden: 1 },
        { codigo: 'COL2-P14', etiqueta: 'No', orden: 2 },
      ],
    });
    const item = crearRespuesta({
      pregunta_codigo: 'P_MATRIZ',
      tipo_pregunta: 'matriz',
      valor: {
        'ROW1-P14': 'COL1-P14',
        'ROW2-P14': 'COL2-P14',
      },
    });

    const presentacion = enriquecerRespuestaResumen(item, {
      indicePreguntas: new Map([[pregunta.codigo, pregunta]]),
      catalogos: new Map(),
      respuestasPorCodigo: new Map([[item.pregunta_codigo, item]]),
    });

    expect(presentacion.filasMatriz).toEqual([
      { etiqueta: 'Entorno laboral', respuesta: 'Sí' },
      { etiqueta: 'Entorno educativo', respuesta: 'No' },
    ]);
  });
});
