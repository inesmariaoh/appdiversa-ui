import { describe, expect, it } from 'vitest';
import type {
  ComportamientoInteraccion,
  OpcionRespuesta,
  Pregunta,
} from '@/types/formulario';
import {
  ACCION_EXCLUIR_OTRAS_OPCIONES,
  ACCION_MOSTRAR_CAMPO_TEXTO,
  calcularSeleccionMultiple,
  debeMostrarCampoTextoOtro,
  faltaTextoOtroObligatorio,
  hayOpcionExcluyenteSeleccionada,
  opcionBloqueadaPorExclusion,
  opcionEsExcluyente,
  opcionRequiereCampoTexto,
  preguntaExigeTextoOtro,
} from './interaccionOpciones';

function crearOpcion(parcial: Partial<OpcionRespuesta> = {}): OpcionRespuesta {
  return {
    codigo: 'OP1',
    etiqueta: 'Opcion',
    valor: 'opcion',
    orden: 1,
    ...parcial,
  };
}

function crearPreguntaConOtro(
  campoTextoOtro: ComportamientoInteraccion['campo_texto_otro'],
): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Pregunta',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'radio',
    es_obligatoria: true,
    es_pregunta_filtro: false,
    permite_otro: true,
    permite_observacion: true,
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
    opciones: [
      crearOpcion({ valor: 'a', codigo: 'A' }),
      crearOpcion({
        valor: 'otros',
        codigo: 'OTRO',
        activa_otro: true,
        acciones_ui: [ACCION_MOSTRAR_CAMPO_TEXTO],
      }),
    ],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    comportamiento_interaccion: {
      tipo_seleccion: 'unica',
      campo_texto_otro: campoTextoOtro,
    },
  };
}

describe('interaccionOpciones', () => {
  it('usa acciones_ui del backend para campo otro', () => {
    const opcion = crearOpcion({
      acciones_ui: [ACCION_MOSTRAR_CAMPO_TEXTO],
      activa_otro: false,
    });
    expect(opcionRequiereCampoTexto(opcion)).toBe(true);
  });

  it('usa acciones_ui del backend para opcion excluyente', () => {
    const opcion = crearOpcion({
      valor: 'no_he_sentido',
      acciones_ui: [ACCION_EXCLUIR_OTRAS_OPCIONES],
    });
    expect(opcionEsExcluyente(opcion)).toBe(true);
  });

  it('al seleccionar excluyente deja solo esa opcion', () => {
    const opciones = [
      crearOpcion({ valor: 'a', codigo: 'A' }),
      crearOpcion({
        valor: 'no_he_sentido',
        codigo: 'NO',
        acciones_ui: [ACCION_EXCLUIR_OTRAS_OPCIONES],
        es_excluyente: true,
      }),
    ];
    const resultado = calcularSeleccionMultiple(
      ['a'],
      'no_he_sentido',
      true,
      opciones,
    );
    expect(resultado).toEqual(['no_he_sentido']);
  });

  it('bloquea otras opciones cuando hay excluyente activa', () => {
    const opciones = [
      crearOpcion({ valor: 'a', codigo: 'A' }),
      crearOpcion({
        valor: 'no_he_sentido',
        codigo: 'NO',
        es_excluyente: true,
      }),
    ];
    expect(hayOpcionExcluyenteSeleccionada(['no_he_sentido'], opciones)).toBe(true);
    expect(opcionBloqueadaPorExclusion(opciones[0], ['no_he_sentido'], opciones)).toBe(
      true,
    );
  });

  it('muestra campo otro solo con opcion activa seleccionada', () => {
    const opciones = [
      crearOpcion({
        valor: 'otros',
        activa_otro: true,
        acciones_ui: [ACCION_MOSTRAR_CAMPO_TEXTO],
      }),
    ];
    expect(debeMostrarCampoTextoOtro(['otros'], opciones)).toBe(true);
    expect(debeMostrarCampoTextoOtro(['otra'], opciones)).toBe(false);
  });

  it('reconoce el modo obligatorio del campo otro', () => {
    expect(
      preguntaExigeTextoOtro({
        tipo_seleccion: 'unica',
        campo_texto_otro: 'obligatorio',
      }),
    ).toBe(true);
    expect(
      preguntaExigeTextoOtro({
        tipo_seleccion: 'unica',
        campo_texto_otro: 'opcional',
      }),
    ).toBe(false);
    expect(preguntaExigeTextoOtro()).toBe(false);
  });

  it('exige texto cuando otro es obligatorio y esta seleccionado sin texto', () => {
    const pregunta = crearPreguntaConOtro('obligatorio');
    expect(faltaTextoOtroObligatorio(pregunta, 'otros', '')).toBe(true);
    expect(faltaTextoOtroObligatorio(pregunta, 'otros', '   ')).toBe(true);
  });

  it('no exige texto cuando la observacion tiene contenido', () => {
    const pregunta = crearPreguntaConOtro('obligatorio');
    expect(faltaTextoOtroObligatorio(pregunta, 'otros', 'Detalle')).toBe(false);
  });

  it('no exige texto cuando la opcion otro no esta seleccionada', () => {
    const pregunta = crearPreguntaConOtro('obligatorio');
    expect(faltaTextoOtroObligatorio(pregunta, 'a', '')).toBe(false);
  });

  it('no exige texto cuando el modo no es obligatorio', () => {
    const preguntaOpcional = crearPreguntaConOtro('opcional');
    expect(faltaTextoOtroObligatorio(preguntaOpcional, 'otros', '')).toBe(false);
    const preguntaNinguno = crearPreguntaConOtro('ninguno');
    expect(faltaTextoOtroObligatorio(preguntaNinguno, 'otros', '')).toBe(false);
  });
});
