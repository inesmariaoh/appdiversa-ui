/**
 * Utilidades para separar preguntas filtro del flujo principal.
 */

import type { FormularioEstructura, SeccionFormulario } from '@/types/formulario';
import { obtenerPreguntasFiltroDesdeEstructura } from './filtrosFormulario';

export function construirEstructuraSinFiltros(
  estructura: FormularioEstructura,
): FormularioEstructura {
  const secciones = estructura.secciones
    .map((seccion) => ({
      ...seccion,
      preguntas: seccion.preguntas.filter((pregunta) => !pregunta.es_pregunta_filtro),
    }))
    .filter((seccion) => seccion.preguntas.length > 0);

  return {
    ...estructura,
    secciones,
  };
}

export function formularioTienePreguntasFiltro(
  estructura: FormularioEstructura,
): boolean {
  return obtenerPreguntasFiltroDesdeEstructura(estructura.secciones).length > 0;
}

export function obtenerTituloSeccionFiltro(
  secciones: SeccionFormulario[],
): string {
  const seccionConFiltro = secciones.find((seccion) =>
    seccion.preguntas.some((pregunta) => pregunta.es_pregunta_filtro),
  );
  return seccionConFiltro?.titulo ?? 'Preguntas de verificación';
}
