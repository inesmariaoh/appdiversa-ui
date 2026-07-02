import { describe, it, expect } from 'vitest';
import {
  calcularEdad,
  evaluarPreguntaFiltro,
  obtenerPreguntasFiltro,
  validarOpcionExacta,
  validarRangoEdad,
} from './filtrosFormulario';
import type { Pregunta } from '@/types/formulario';

function crearPreguntaBase(
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

describe('filtrosFormulario', () => {
  const fechaReferencia = new Date(2026, 6, 1);

  it('calcula edad con fecha valida', () => {
    expect(calcularEdad(new Date(2000, 0, 1), fechaReferencia)).toBe(26);
  });

  it('rechaza edad menor de 18', () => {
    const pregunta = crearPreguntaBase('P-FEC', {
      tipo_pregunta: 'fecha',
      tipo_validacion_filtro: 'rango_edad',
      valor_minimo: '18',
      valor_maximo: '109',
      mensaje_error: 'Debes tener 18 años o más para participar.',
    });
    const resultado = evaluarPreguntaFiltro(
      pregunta,
      { anio: '2012', mes: '9', dia: '23' },
      fechaReferencia,
    );
    expect(resultado.estado).toBe('no_cumplido');
  });

  it('rechaza edad mayor de 109', () => {
    const fecha = new Date(1900, 0, 1);
    expect(validarRangoEdad(fecha, 18, 109, fechaReferencia)).toBe(false);
  });

  it('acepta edad dentro del rango', () => {
    const pregunta = crearPreguntaBase('P-FEC', {
      tipo_pregunta: 'fecha',
      tipo_validacion_filtro: 'rango_edad',
      valor_minimo: '18',
      valor_maximo: '109',
    });
    const resultado = evaluarPreguntaFiltro(
      pregunta,
      { anio: '1990', mes: '5', dia: '10' },
      fechaReferencia,
    );
    expect(resultado.estado).toBe('cumplido');
  });

  it('valida opcion exacta si y no', () => {
    expect(validarOpcionExacta('si', 'si')).toBe(true);
    expect(validarOpcionExacta('no', 'si')).toBe(false);
  });

  it('lista solo preguntas marcadas como filtro', () => {
    const preguntas = [
      crearPreguntaBase('F1', { es_pregunta_filtro: true, orden: 1 }),
      crearPreguntaBase('M1', { es_pregunta_filtro: false, orden: 2 }),
      crearPreguntaBase('F2', { es_pregunta_filtro: true, orden: 2 }),
    ];
    expect(obtenerPreguntasFiltro(preguntas).map((p) => p.codigo)).toEqual([
      'F1',
      'F2',
    ]);
  });
});
