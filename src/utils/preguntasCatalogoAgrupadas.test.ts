import { describe, it, expect } from 'vitest';
import type { Pregunta } from '@/types/formulario';
import {
  debeMostrarseComoGrupoGeografico,
  esPreguntaGeografica,
  esSubpreguntaGeograficaEnGrupo,
  listarPreguntasNavegacion,
  obtenerCamposGrupoGeografico,
  obtenerEtiquetaCampoCatalogo,
  obtenerPlaceholderCampoCatalogo,
} from './preguntasCatalogoAgrupadas';
import type { ResultadoReglas } from '@/types/reglas';

function crearPregunta(parcial: Partial<Pregunta>): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Pregunta',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'select',
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
    usa_catalogo: true,
    catalogo_asociado: { codigo: 'departamentos', tipo_catalogo: 'geografico' },
    pregunta_padre_catalogo: null,
    es_pregunta_geografica: false,
    preguntas_dependientes_geograficas: [],
    permite_busqueda_catalogo: false,
    limite_items_catalogo: null,
    fuente_opciones: 'catalogo',
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    ...parcial,
  };
}

const resultadoVacio: ResultadoReglas = {
  preguntas_ocultas: [],
  preguntas_visibles: [],
  preguntas_deshabilitadas: [],
  preguntas_habilitadas: [],
  preguntas_obligatorias: [],
  preguntas_opcionales: [],
  mensajes: [],
  saltar_a_pregunta: null,
  saltar_a_seccion: null,
  finalizar_formulario: false,
  no_aplica_formulario: false,
};

describe('preguntasCatalogoAgrupadas', () => {
  const preguntaPadre = crearPregunta({
    codigo: 'P3',
    texto: '¿Lugar de residencia?',
    descripcion: 'Seleccione una opción en cada lista.',
    tooltip: 'Departamento',
    orden: 3,
    es_pregunta_geografica: true,
    catalogo_asociado: {
      codigo: 'departamentos',
      tipo_catalogo: 'jerarquico',
    },
  });
  const preguntaMunicipio = crearPregunta({
    codigo: 'P3-MUN',
    texto: 'Ciudad o Municipio',
    descripcion: 'Seleccione ciudad',
    tooltip: 'Ciudad o Municipio',
    orden: 4,
    es_pregunta_geografica: true,
    catalogo_asociado: {
      codigo: 'municipios',
      tipo_catalogo: 'jerarquico',
    },
    pregunta_padre_catalogo: { codigo: 'P3' },
  });
  const preguntaOcupacion = crearPregunta({
    codigo: 'P_OCUP',
    orden: 5,
    es_pregunta_geografica: false,
    usa_catalogo: true,
    catalogo_asociado: { codigo: 'ocupaciones', tipo_catalogo: 'general' },
    pregunta_padre_catalogo: { codigo: 'P3' },
  });
  const preguntaSimple = crearPregunta({
    codigo: 'P2',
    orden: 2,
    usa_catalogo: false,
    catalogo_asociado: null,
    tipo_pregunta: 'radio',
  });
  const preguntas = [preguntaSimple, preguntaPadre, preguntaMunicipio, preguntaOcupacion];

  it('identifica preguntas geograficas desde backend o tipo de catalogo', () => {
    expect(esPreguntaGeografica(preguntaPadre, preguntas)).toBe(true);
    expect(esPreguntaGeografica(preguntaMunicipio, preguntas)).toBe(true);
    expect(esPreguntaGeografica(preguntaOcupacion, preguntas)).toBe(false);
  });

  it('agrupa solo subpreguntas geograficas', () => {
    expect(esSubpreguntaGeograficaEnGrupo(preguntaMunicipio, preguntas)).toBe(true);
    expect(esSubpreguntaGeograficaEnGrupo(preguntaOcupacion, preguntas)).toBe(false);
  });

  it('obtiene descendientes geograficos en cadena', () => {
    const pais = crearPregunta({
      codigo: 'P_PAIS',
      orden: 1,
      es_pregunta_geografica: true,
      catalogo_asociado: { codigo: 'paises', tipo_catalogo: 'geografico' },
    });
    const departamento = crearPregunta({
      codigo: 'P_DEP',
      orden: 2,
      es_pregunta_geografica: true,
      pregunta_padre_catalogo: { codigo: 'P_PAIS' },
      catalogo_asociado: { codigo: 'departamentos', tipo_catalogo: 'jerarquico' },
    });
    const municipio = crearPregunta({
      codigo: 'P_MUN',
      orden: 3,
      es_pregunta_geografica: true,
      pregunta_padre_catalogo: { codigo: 'P_DEP' },
      catalogo_asociado: { codigo: 'municipios', tipo_catalogo: 'jerarquico' },
    });
    const cadena = [pais, departamento, municipio];

    expect(obtenerCamposGrupoGeografico(pais, cadena).map((item) => item.codigo)).toEqual([
      'P_PAIS',
      'P_DEP',
      'P_MUN',
    ]);
  });

  it('excluye subpreguntas geograficas de la navegacion', () => {
    const navegacion = listarPreguntasNavegacion(
      [{ codigo: 'S1', titulo: 'S1', descripcion: '', texto_ayuda: '', orden: 1, preguntas }],
      resultadoVacio,
    );
    expect(navegacion.map((item) => item.codigo)).toEqual(['P2', 'P3', 'P_OCUP']);
  });

  it('detecta grupo geografico solo cuando hay descendientes geograficos', () => {
    expect(debeMostrarseComoGrupoGeografico(preguntaPadre, preguntas)).toBe(true);
    expect(debeMostrarseComoGrupoGeografico(preguntaSimple, preguntas)).toBe(false);
  });

  it('resuelve etiquetas y placeholders parametrizables', () => {
    expect(obtenerEtiquetaCampoCatalogo(preguntaPadre)).toBe('Departamento');
    expect(
      obtenerPlaceholderCampoCatalogo(preguntaPadre, preguntas, false, true),
    ).toBe('Seleccione departamento');
    expect(
      obtenerPlaceholderCampoCatalogo(preguntaMunicipio, preguntas, true),
    ).toBe('Primero seleccione departamento');
    expect(
      obtenerPlaceholderCampoCatalogo(preguntaMunicipio, preguntas, false),
    ).toBe('Seleccione ciudad');
  });
});
