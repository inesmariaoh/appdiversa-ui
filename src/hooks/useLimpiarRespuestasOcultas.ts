'use client';

/**
 * Limpia respuestas locales cuando una pregunta queda oculta por reglas.
 */

import { useEffect, useRef } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import type { SeccionFormulario } from '@/types/formulario';
import type { ResultadoReglas } from '@/types/reglas';
import { preguntaVisibleSegunReglas } from '@/utils/motorReglasUi';
import { valorInicialPorTipo } from '@/utils/validacionPregunta';
import { useRespuestasStore } from '@/store/respuestasStore';
import { eliminarRespuestasLocalesPorPregunta } from '@/storage/respuestasLocal';
import { useSesionStore } from '@/store/sesionStore';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export function useLimpiarRespuestasOcultas(
  secciones: SeccionFormulario[],
  resultadoReglas: ResultadoReglas,
  setValue: UseFormSetValue<Record<string, unknown>>,
  deshabilitado = false,
): void {
  const visibilidadAnterior = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (deshabilitado) {
      return;
    }

    const preguntas = secciones.flatMap((seccion) => seccion.preguntas);
    const { uuidSesion } = useSesionStore.getState();
    const eliminarRespuesta = useRespuestasStore.getState().eliminarRespuesta;

    for (const pregunta of preguntas) {
      const visible = preguntaVisibleSegunReglas(pregunta, resultadoReglas);
      const visibleAnterior = visibilidadAnterior.current.get(pregunta.codigo);

      if (visibleAnterior !== false || visible) {
        visibilidadAnterior.current.set(pregunta.codigo, visible);
        continue;
      }

      if (pregunta.limpiar_respuesta_al_ocultar === false) {
        visibilidadAnterior.current.set(pregunta.codigo, visible);
        continue;
      }

      const respuesta = useRespuestasStore.getState().obtenerRespuesta(pregunta.codigo);
      if (!respuesta) {
        visibilidadAnterior.current.set(pregunta.codigo, visible);
        continue;
      }

      setValue(
        pregunta.codigo,
        valorInicialPorTipo(pregunta.tipo_pregunta),
        { shouldDirty: true },
      );
      eliminarRespuesta(pregunta.codigo);

      if (uuidSesion) {
        ejecutarSinEspera(
          eliminarRespuestasLocalesPorPregunta(uuidSesion, pregunta.codigo),
        );
      }

      visibilidadAnterior.current.set(pregunta.codigo, visible);
    }
  }, [secciones, resultadoReglas, setValue, deshabilitado]);
}
