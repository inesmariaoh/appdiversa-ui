import { describe, it, expect } from 'vitest';
import {
  respuestaPermiteContinuar,
  validarRespuestaPregunta,
  valorInicialPorTipo,
  construirValoresIniciales,
} from './validacionPregunta';
import type { Pregunta } from '@/types/formulario';

function crearPregunta(parcial: Partial<Pregunta> & Pick<Pregunta, 'codigo' | 'tipo_pregunta'>): Pregunta {
  return {
    texto: 'Pregunta',
    descripcion: '',
    tooltip: '',
    es_obligatoria: true,
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

describe('validacionPregunta', () => {
  it('exige valor cuando es obligatoria', () => {
    const pregunta = crearPregunta({ codigo: 'P1', tipo_pregunta: 'texto_corto' });
    expect(validarRespuestaPregunta(pregunta, '', true)).toMatch(/obligatorio/i);
    expect(respuestaPermiteContinuar(pregunta, '', true)).toBe(false);
    expect(respuestaPermiteContinuar(pregunta, 'Ana', true)).toBe(true);
  });

  it('permite continuar en preguntas opcionales sin respuesta', () => {
    const pregunta = crearPregunta({
      codigo: 'P1',
      tipo_pregunta: 'radio',
      es_obligatoria: false,
    });
    expect(respuestaPermiteContinuar(pregunta, '', false)).toBe(true);
  });

  it('acepta texto valido', () => {
    const pregunta = crearPregunta({ codigo: 'P1', tipo_pregunta: 'texto_corto' });
    expect(validarRespuestaPregunta(pregunta, 'Ana', true)).toBeNull();
  });

  it('valida numero obligatorio', () => {
    const pregunta = crearPregunta({ codigo: 'P2', tipo_pregunta: 'numero' });
    expect(validarRespuestaPregunta(pregunta, '', true)).toMatch(/obligatorio/i);
    expect(validarRespuestaPregunta(pregunta, '25', true)).toBeNull();
  });

  it('valida checkbox con al menos una opcion', () => {
    const pregunta = crearPregunta({ codigo: 'P3', tipo_pregunta: 'checkbox' });
    expect(validarRespuestaPregunta(pregunta, [], true)).toMatch(/al menos una/i);
    expect(validarRespuestaPregunta(pregunta, ['A'], true)).toBeNull();
  });

  it('valida matriz completa', () => {
    const pregunta = crearPregunta({
      codigo: 'P4',
      tipo_pregunta: 'matriz',
      filas_matriz: [
        { codigo: 'F1', etiqueta: 'Fila 1', orden: 1 },
        { codigo: 'F2', etiqueta: 'Fila 2', orden: 2 },
      ],
    });
    expect(validarRespuestaPregunta(pregunta, { F1: 'C1' }, true)).toMatch(/matriz/i);
    expect(
      validarRespuestaPregunta(pregunta, { F1: 'C1', F2: 'C2' }, true)
    ).toBeNull();
  });

  it('define valores iniciales por tipo', () => {
    expect(valorInicialPorTipo('fecha')).toEqual({ anio: '', mes: '', dia: '' });
    expect(valorInicialPorTipo('checkbox')).toEqual([]);
    expect(valorInicialPorTipo('matriz')).toEqual({});
    expect(valorInicialPorTipo('texto_corto')).toBe('');
  });

  it('construye valores iniciales para varias preguntas', () => {
    const preguntas = [
      crearPregunta({ codigo: 'A', tipo_pregunta: 'texto_corto' }),
      crearPregunta({ codigo: 'B', tipo_pregunta: 'checkbox' }),
    ];
    expect(construirValoresIniciales(preguntas)).toEqual({
      A: '',
      B: [],
    });
  });

  it('permite opcional sin validar', () => {
    const pregunta = crearPregunta({ codigo: 'P0', tipo_pregunta: 'texto_corto' });
    expect(validarRespuestaPregunta(pregunta, '', false)).toBeNull();
  });

  it('valida longitud, regex y numero con limites', () => {
    const texto = crearPregunta({
      codigo: 'T1',
      tipo_pregunta: 'texto_corto',
      longitud_minima: 3,
      longitud_maxima: 5,
      expresion_regular: '^[A-Z]+$',
      mensaje_error: '',
    });
    expect(validarRespuestaPregunta(texto, 'AB', true)).toMatch(/Mínimo/i);
    expect(validarRespuestaPregunta(texto, 'ABCDEF', true)).toMatch(/Máximo/i);
    expect(validarRespuestaPregunta(texto, 'abc', true)).toMatch(/formato/i);
    expect(validarRespuestaPregunta(texto, 'ABC', true)).toBeNull();

    const numero = crearPregunta({
      codigo: 'N1',
      tipo_pregunta: 'numero',
      valor_minimo: '10',
      valor_maximo: '20',
      mensaje_error: '',
    });
    expect(validarRespuestaPregunta(numero, 'abc', true)).toMatch(/número válido/i);
    expect(validarRespuestaPregunta(numero, '5', true)).toMatch(/mínimo/i);
    expect(validarRespuestaPregunta(numero, '25', true)).toMatch(/máximo/i);
  });

  it('valida fecha, hora, select, archivo, firma y geolocalizacion', () => {
    const fecha = crearPregunta({ codigo: 'F1', tipo_pregunta: 'fecha' });
    expect(
      validarRespuestaPregunta(fecha, { anio: '2026', mes: '', dia: '01' }, true)
    ).toMatch(/obligatorio/i);
    expect(
      validarRespuestaPregunta(fecha, { anio: '2026', mes: '06', dia: '01' }, true)
    ).toBeNull();

    const hora = crearPregunta({ codigo: 'H1', tipo_pregunta: 'hora' });
    expect(validarRespuestaPregunta(hora, '', true)).toMatch(/obligatorio/i);
    expect(validarRespuestaPregunta(hora, '10:30', true)).toBeNull();

    const select = crearPregunta({ codigo: 'S1', tipo_pregunta: 'select' });
    expect(validarRespuestaPregunta(select, '', true)).toMatch(/obligatorio/i);
    expect(validarRespuestaPregunta(select, 'A', true)).toBeNull();

    const archivo = crearPregunta({ codigo: 'A1', tipo_pregunta: 'archivo' });
    expect(validarRespuestaPregunta(archivo, {}, true)).toMatch(/obligatorio/i);
    expect(validarRespuestaPregunta(archivo, { uuid: 'x' }, true)).toBeNull();

    const firma = crearPregunta({ codigo: 'FI1', tipo_pregunta: 'firma' });
    expect(validarRespuestaPregunta(firma, '', true)).toMatch(/obligatorio/i);
    expect(validarRespuestaPregunta(firma, 'data:image/png;base64,abc', true)).toBeNull();

    const geo = crearPregunta({ codigo: 'G1', tipo_pregunta: 'geolocalizacion' });
    expect(validarRespuestaPregunta(geo, {}, true)).toMatch(/obligatorio/i);
    expect(
      validarRespuestaPregunta(geo, { latitud: 1, longitud: 2 }, true)
    ).toBeNull();
  });
});
