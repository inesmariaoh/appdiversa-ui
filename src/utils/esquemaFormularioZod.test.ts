import { describe, expect, it } from 'vitest';
import { construirEsquemaPregunta, construirEsquemaFormulario } from './esquemaFormularioZod';
import type { Pregunta } from '@/types/formulario';

function crearPreguntaTexto(obligatoria: boolean): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Nombre',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'texto_corto',
    es_obligatoria: obligatoria,
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
  };
}

describe('construirEsquemaPregunta', () => {
  it('rechaza valor vacio cuando es obligatoria', () => {
    const esquema = construirEsquemaPregunta(crearPreguntaTexto(true), true);
    const resultado = esquema.safeParse('');
    expect(resultado.success).toBe(false);
  });

  it('acepta valor cuando es opcional', () => {
    const esquema = construirEsquemaPregunta(crearPreguntaTexto(false), false);
    const resultado = esquema.safeParse('');
    expect(resultado.success).toBe(true);
  });
});

describe('construirEsquemaFormulario', () => {
  it('valida multiples preguntas en un objeto', () => {
    const preguntas = [crearPreguntaTexto(true), { ...crearPreguntaTexto(false), codigo: 'P2' }];
    const esquema = construirEsquemaFormulario(preguntas, (_, base) => base);
    const resultado = esquema.safeParse({ P1: '', P2: 'ok' });
    expect(resultado.success).toBe(false);
  });
});
