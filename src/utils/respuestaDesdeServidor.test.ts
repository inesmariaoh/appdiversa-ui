import { describe, expect, it } from 'vitest';
import {
  valorDesdeRespuestaServidor,
  mapaValoresDesdeRespuestasServidor,
} from './respuestaDesdeServidor';
import type { Pregunta } from '@/types/formulario';
import type { Respuesta } from '@/types/respuesta';

function crearPregunta(tipo: Pregunta['tipo_pregunta']): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Pregunta',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: tipo,
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
  };
}

function crearRespuesta(parcial: Partial<Respuesta>): Respuesta {
  return {
    codigo_pregunta: 'P1',
    tipo_pregunta: 'texto_corto',
    valor_numero: null,
    valor_texto: '',
    valor_json: null,
    valor_booleano: null,
    valor_fecha: null,
    valor_hora: null,
    valor_fecha_hora: null,
    origen_respuesta: 'web',
    version_respuesta: 1,
    fecha_respuesta_cliente: null,
    fecha_respuesta_servidor: '2026-01-01T00:00:00Z',
    ...parcial,
  };
}

describe('valorDesdeRespuestaServidor', () => {
  it('mapea texto corto desde valor_texto', () => {
    const valor = valorDesdeRespuestaServidor(
      crearPregunta('texto_corto'),
      crearRespuesta({ valor_texto: 'Ana' })
    );
    expect(valor).toBe('Ana');
  });

  it('prioriza valor_json cuando existe', () => {
    const valor = valorDesdeRespuestaServidor(
      crearPregunta('matriz'),
      crearRespuesta({ valor_json: { F1: 'C1' } })
    );
    expect(valor).toEqual({ F1: 'C1' });
  });

  it('mapea tipos especificos desde campos del backend', () => {
    expect(
      valorDesdeRespuestaServidor(
        crearPregunta('numero'),
        crearRespuesta({ valor_numero: '42', valor_texto: '42' })
      )
    ).toBe('42');

    expect(
      valorDesdeRespuestaServidor(
        crearPregunta('checkbox'),
        crearRespuesta({ valor_texto: 'A,B' })
      )
    ).toEqual(['A', 'B']);

    expect(
      valorDesdeRespuestaServidor(
        crearPregunta('fecha'),
        crearRespuesta({ valor_fecha: '2026-06-01' })
      )
    ).toEqual({ anio: '2026', mes: '06', dia: '01' });

    expect(
      valorDesdeRespuestaServidor(
        crearPregunta('hora'),
        crearRespuesta({ valor_hora: '10:30:00' })
      )
    ).toBe('10:30:00');

    expect(
      valorDesdeRespuestaServidor(
        crearPregunta('fecha_hora'),
        crearRespuesta({ valor_fecha_hora: '2026-06-01T10:30:00' })
      )
    ).toBe('2026-06-01T10:30:00');

    expect(
      valorDesdeRespuestaServidor(
        crearPregunta('radio'),
        crearRespuesta({ valor_booleano: true, valor_texto: 'si' })
      )
    ).toBe(true);
  });

  it('construye mapa ignorando respuestas sin pregunta', () => {
    const preguntas = [crearPregunta('texto_corto')];
    const respuestas = [
      crearRespuesta({ codigo_pregunta: 'P1', valor_texto: 'Ana' }),
      crearRespuesta({ codigo_pregunta: 'P99', valor_texto: 'X' }),
    ];

    expect(mapaValoresDesdeRespuestasServidor(preguntas, respuestas)).toEqual({
      P1: 'Ana',
    });
  });
});
