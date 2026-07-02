/**
 * Utilidades para agrupar preguntas geograficas parametrizables en una sola pantalla.
 */

import type { Pregunta } from '@/types/formulario';
import type { ResultadoReglas } from '@/types/reglas';
import { listarPreguntasVisibles } from './motorReglasUi';

const TIPOS_CATALOGO_GEOGRAFICO = new Set(['geografico', 'jerarquico']);

export function esTipoUbicacionGeograficaCompuesta(pregunta: Pregunta): boolean {
  return pregunta.tipo_pregunta === 'ubicacion_geografica';
}

export function esCatalogoGeografico(pregunta: Pregunta): boolean {
  const tipoCatalogo = pregunta.catalogo_asociado?.tipo_catalogo;
  return Boolean(tipoCatalogo && TIPOS_CATALOGO_GEOGRAFICO.has(tipoCatalogo));
}

export function esPreguntaGeografica(
  pregunta: Pregunta,
  preguntas: Pregunta[] = [],
): boolean {
  if (esTipoUbicacionGeograficaCompuesta(pregunta)) {
    return true;
  }
  if (pregunta.es_pregunta_geografica === true) {
    return true;
  }
  if (pregunta.es_pregunta_geografica === false) {
    return false;
  }
  if (esCatalogoGeografico(pregunta)) {
    return true;
  }
  const codigoPadre = pregunta.pregunta_padre_catalogo?.codigo;
  if (!codigoPadre) {
    return false;
  }
  const padre = preguntas.find((item) => item.codigo === codigoPadre);
  return padre ? esPreguntaGeografica(padre, preguntas) : false;
}

export function esSubpreguntaGeograficaEnGrupo(
  pregunta: Pregunta,
  preguntas: Pregunta[] = [],
): boolean {
  return (
    esPreguntaGeografica(pregunta, preguntas) &&
    pregunta.pregunta_padre_catalogo !== null
  );
}

export function obtenerDescendientesGeograficos(
  preguntaRaiz: Pregunta,
  preguntas: Pregunta[],
): Pregunta[] {
  const descendientes: Pregunta[] = [];
  const cola = [preguntaRaiz.codigo];

  while (cola.length > 0) {
    const codigoPadre = cola.shift();
    if (!codigoPadre) {
      continue;
    }
    const hijos = preguntas
      .filter(
        (pregunta) =>
          esPreguntaGeografica(pregunta, preguntas) &&
          pregunta.pregunta_padre_catalogo?.codigo === codigoPadre,
      )
      .sort((a, b) => a.orden - b.orden);

    for (const hijo of hijos) {
      descendientes.push(hijo);
      cola.push(hijo.codigo);
    }
  }

  return descendientes;
}

export function obtenerCamposGrupoGeografico(
  preguntaRaiz: Pregunta,
  preguntas: Pregunta[],
): Pregunta[] {
  return [preguntaRaiz, ...obtenerDescendientesGeograficos(preguntaRaiz, preguntas)];
}

export function debeMostrarseComoGrupoGeografico(
  pregunta: Pregunta,
  preguntas: Pregunta[],
): boolean {
  if (esTipoUbicacionGeograficaCompuesta(pregunta)) {
    return false;
  }
  if (!esPreguntaGeografica(pregunta, preguntas)) {
    return false;
  }
  return obtenerDescendientesGeograficos(pregunta, preguntas).length > 0;
}

export function listarPreguntasNavegacion(
  secciones: Parameters<typeof listarPreguntasVisibles>[0],
  resultado: ResultadoReglas,
): Pregunta[] {
  const visibles = listarPreguntasVisibles(secciones, resultado);
  return visibles.filter(
    (pregunta) => !esSubpreguntaGeograficaEnGrupo(pregunta, visibles),
  );
}

export function obtenerPreguntaPadreInmediata(
  pregunta: Pregunta,
  preguntas: Pregunta[],
): Pregunta | undefined {
  const codigoPadre = pregunta.pregunta_padre_catalogo?.codigo;
  if (!codigoPadre) {
    return undefined;
  }
  return preguntas.find((item) => item.codigo === codigoPadre);
}

export function obtenerEtiquetaCampoCatalogo(pregunta: Pregunta): string {
  if (pregunta.tooltip.trim()) {
    return pregunta.tooltip;
  }
  if (pregunta.catalogo_asociado?.nombre?.trim()) {
    return pregunta.catalogo_asociado.nombre;
  }
  return pregunta.texto;
}

export function obtenerPlaceholderCampoCatalogo(
  pregunta: Pregunta,
  preguntas: Pregunta[],
  bloqueadoPorDependencia: boolean,
  esCampoPadreGrupo = false,
): string {
  if (bloqueadoPorDependencia) {
    const padre = obtenerPreguntaPadreInmediata(pregunta, preguntas);
    const etiquetaPadre = padre
      ? obtenerEtiquetaCampoCatalogo(padre)
      : 'el nivel anterior';
    return `Primero seleccione ${etiquetaPadre.toLowerCase()}`;
  }
  if (esCampoPadreGrupo) {
    return `Seleccione ${obtenerEtiquetaCampoCatalogo(pregunta).toLowerCase()}`;
  }
  if (pregunta.descripcion.trim()) {
    return pregunta.descripcion;
  }
  return `Seleccione ${obtenerEtiquetaCampoCatalogo(pregunta).toLowerCase()}`;
}

/** @deprecated Usar esSubpreguntaGeograficaEnGrupo */
export function esSubpreguntaCatalogoDependiente(pregunta: Pregunta): boolean {
  return esSubpreguntaGeograficaEnGrupo(pregunta);
}

/** @deprecated Usar obtenerDescendientesGeograficos */
export function obtenerSubpreguntasCatalogo(
  preguntaPadre: Pregunta,
  preguntas: Pregunta[],
): Pregunta[] {
  return obtenerDescendientesGeograficos(preguntaPadre, preguntas);
}

/** @deprecated Usar debeMostrarseComoGrupoGeografico */
export function tieneSubpreguntasCatalogo(
  pregunta: Pregunta,
  preguntas: Pregunta[],
): boolean {
  return debeMostrarseComoGrupoGeografico(pregunta, preguntas);
}

/** @deprecated Usar obtenerCamposGrupoGeografico */
export function obtenerCamposGrupoCatalogo(
  preguntaPadre: Pregunta,
  subpreguntas: Pregunta[],
): Pregunta[] {
  return [preguntaPadre, ...subpreguntas];
}
