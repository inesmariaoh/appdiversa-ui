import { describe, expect, it } from 'vitest';
import type { OpcionRespuesta, Pregunta } from '@/types/formulario';
import { ACCION_MOSTRAR_CAMPO_TEXTO } from './interaccionOpciones';
import {
  debeMostrarCampoTextoOtro,
  opcionActivaCampoOtro,
} from './opcionCampoOtro';

function crearPreguntaBase(parcial: Partial<Pregunta> = {}): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Pregunta',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'checkbox',
    es_obligatoria: true,
    es_pregunta_filtro: false,
    permite_otro: true,
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
    fuente_opciones: 'opciones_fijas',
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    ...parcial,
  };
}

function crearOpcion(parcial: Partial<OpcionRespuesta> = {}): OpcionRespuesta {
  return {
    codigo: 'OP1',
    etiqueta: 'Opcion',
    valor: 'opcion',
    orden: 1,
    ...parcial,
  };
}

describe('opcionCampoOtro', () => {
  it('confia en activa_otro resuelto por el backend', () => {
    const pregunta = crearPreguntaBase();
    const opcion = crearOpcion({
      valor: 'otros_motivos',
      activa_otro: true,
      acciones_ui: [ACCION_MOSTRAR_CAMPO_TEXTO],
    });

    expect(opcionActivaCampoOtro(pregunta, opcion)).toBe(true);
    expect(debeMostrarCampoTextoOtro(pregunta, ['otros_motivos'], [opcion])).toBe(true);
  });

  it('no activa campo otro sin metadatos del backend', () => {
    const pregunta = crearPreguntaBase();
    const opcion = crearOpcion({
      etiqueta: 'Identidad cultural',
      valor: 'identidad',
      activa_otro: false,
    });

    expect(opcionActivaCampoOtro(pregunta, opcion)).toBe(false);
  });
});
