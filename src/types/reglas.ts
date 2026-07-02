/**
 * Tipos del motor de reglas segun openapi_export.json.
 */

export type AccionRegla =
  | 'mostrar'
  | 'ocultar'
  | 'habilitar'
  | 'deshabilitar'
  | 'hacer_obligatoria'
  | 'hacer_opcional'
  | 'saltar_a_pregunta'
  | 'saltar_a_seccion'
  | 'finalizar_formulario'
  | 'no_aplica_formulario';

export type OperadorRegla =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'gt'
  | 'lt'
  | 'in';

export interface ResultadoReglas {
  preguntas_ocultas: string[];
  preguntas_visibles: string[];
  preguntas_deshabilitadas: string[];
  preguntas_habilitadas: string[];
  preguntas_obligatorias: string[];
  preguntas_opcionales: string[];
  saltar_a_pregunta: string | null;
  saltar_a_seccion: string | null;
  finalizar_formulario: boolean;
  no_aplica_formulario: boolean;
  mensajes: string[];
}

export const RESULTADO_REGLAS_VACIO: ResultadoReglas = {
  preguntas_ocultas: [],
  preguntas_visibles: [],
  preguntas_deshabilitadas: [],
  preguntas_habilitadas: [],
  preguntas_obligatorias: [],
  preguntas_opcionales: [],
  saltar_a_pregunta: null,
  saltar_a_seccion: null,
  finalizar_formulario: false,
  no_aplica_formulario: false,
  mensajes: [],
};
