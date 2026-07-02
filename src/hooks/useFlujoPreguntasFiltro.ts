'use client';

/**
 * Hook para gestionar el flujo de preguntas filtro/preliminares.
 */

import { useCallback, useMemo, useState } from 'react';
import type { FormularioEstructura, Pregunta } from '@/types/formulario';
import type {
  FaseFlujoFiltro,
  TextosModalNoElegible,
  TextosModalVerificacion,
} from '@/types/filtros';
import {
  construirCuerpoModalNoElegible,
  evaluarPreguntaFiltro,
  esResultadoNoCumplido,
  resolverValidacionFiltro,
  TITULO_MODAL_NO_ELEGIBLE_PREDETERMINADO,
  todasFiltrosCumplen,
} from '@/utils/filtrosFormulario';
import { contenidoTextoFormulario, tituloTextoFormulario } from '@/utils/textosFormulario';
import { validarRespuestaPregunta } from '@/utils/validacionPregunta';
import { valorInicialPorTipo } from '@/utils/validacionPregunta';

interface UseFlujoPreguntasFiltroOpciones {
  readonly preguntasFiltro: Pregunta[];
  readonly estructura: FormularioEstructura;
}

export function useFlujoPreguntasFiltro({
  preguntasFiltro,
  estructura,
}: UseFlujoPreguntasFiltroOpciones) {
  const [fase, setFase] = useState<FaseFlujoFiltro>('preguntas');
  const [indiceActual, setIndiceActual] = useState(0);
  const [mostrarModalNoElegible, setMostrarModalNoElegible] = useState(false);
  const [mensajeNoElegible, setMensajeNoElegible] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(
      preguntasFiltro.map((pregunta) => [
        pregunta.codigo,
        valorInicialPorTipo(pregunta.tipo_pregunta),
      ]),
    ),
  );
  const [errores, setErrores] = useState<Record<string, string>>({});

  const preguntaActual = preguntasFiltro[indiceActual];
  const esUltima = indiceActual >= preguntasFiltro.length - 1;

  const textosNoElegible: TextosModalNoElegible = useMemo(
    () => ({
      titulo: tituloTextoFormulario(
        estructura,
        'no_cumple_condiciones',
        TITULO_MODAL_NO_ELEGIBLE_PREDETERMINADO,
      ),
      cuerpo: construirCuerpoModalNoElegible(estructura, mensajeNoElegible),
      botonPrimario: 'Ver otras encuestas',
      botonSecundario: 'Volver',
    }),
    [estructura, mensajeNoElegible],
  );

  const textosVerificacion: TextosModalVerificacion = useMemo(
    () => ({
      titulo: tituloTextoFormulario(
        estructura,
        'verificacion_exitosa',
        '¡Verificado con éxito!',
      ),
      cuerpo: contenidoTextoFormulario(
        estructura,
        'verificacion_exitosa',
        'Cumples con todos los requisitos para participar.',
      ),
      botonAceptar: 'Aceptar y comenzar encuesta',
    }),
    [estructura],
  );

  const actualizarRespuesta = useCallback((codigo: string, valor: unknown) => {
    setRespuestas((previas) => ({ ...previas, [codigo]: valor }));
    setErrores((previos) => {
      const siguientes = { ...previos };
      delete siguientes[codigo];
      return siguientes;
    });
  }, []);

  const puedeContinuarActual = useMemo(() => {
    if (!preguntaActual) {
      return false;
    }
    const valor = respuestas[preguntaActual.codigo];
    const errorBasico = validarRespuestaPregunta(
      preguntaActual,
      valor,
      preguntaActual.es_obligatoria,
    );
    if (errorBasico) {
      return false;
    }
    const resultadoFiltro = evaluarPreguntaFiltro(preguntaActual, valor);
    if (esResultadoNoCumplido(resultadoFiltro) && resultadoFiltro.bloqueaContinuacion) {
      if (preguntaActual.tipo_pregunta === 'radio') {
        return true;
      }
      return false;
    }
    return true;
  }, [preguntaActual, respuestas]);

  const validarPreguntaActual = useCallback((): boolean => {
    if (!preguntaActual) {
      return true;
    }
    const valor = respuestas[preguntaActual.codigo];
    const errorBasico = validarRespuestaPregunta(
      preguntaActual,
      valor,
      preguntaActual.es_obligatoria,
    );
    if (errorBasico) {
      setErrores((previos) => ({
        ...previos,
        [preguntaActual.codigo]: errorBasico,
      }));
      return false;
    }

    const resultadoFiltro = evaluarPreguntaFiltro(preguntaActual, valor);
    if (esResultadoNoCumplido(resultadoFiltro)) {
      if (
        preguntaActual.tipo_pregunta === 'radio' &&
        resultadoFiltro.bloqueaContinuacion
      ) {
        setMensajeNoElegible(resultadoFiltro.mensaje);
        setMostrarModalNoElegible(true);
        return false;
      }
      setErrores((previos) => ({
        ...previos,
        [preguntaActual.codigo]: resultadoFiltro.mensaje,
      }));
      return false;
    }

    setErrores((previos) => {
      const siguientes = { ...previos };
      delete siguientes[preguntaActual.codigo];
      return siguientes;
    });
    return true;
  }, [preguntaActual, respuestas]);

  const continuarFlujo = useCallback(() => {
    if (esUltima) {
      if (!todasFiltrosCumplen(preguntasFiltro, respuestas)) {
        const incumplido = preguntasFiltro
          .map((pregunta) =>
            evaluarPreguntaFiltro(pregunta, respuestas[pregunta.codigo]),
          )
          .find(esResultadoNoCumplido);

        if (incumplido && esResultadoNoCumplido(incumplido)) {
          const preguntaIncumplida = preguntasFiltro.find(
            (pregunta) => pregunta.codigo === incumplido.codigoPregunta,
          );
          if (
            preguntaIncumplida?.tipo_pregunta === 'radio' &&
            incumplido.bloqueaContinuacion
          ) {
            setMensajeNoElegible(incumplido.mensaje);
            setMostrarModalNoElegible(true);
            return;
          }
          setErrores((previos) => ({
            ...previos,
            [incumplido.codigoPregunta]: incumplido.mensaje,
          }));
        }
        return;
      }
      setFase('verificacion_exitosa');
      return;
    }
    setIndiceActual((indice) => indice + 1);
  }, [esUltima, preguntasFiltro, respuestas]);

  const retroceder = useCallback(() => {
    setErrores({});
    if (indiceActual > 0) {
      setIndiceActual((indice) => indice - 1);
      return;
    }
    setFase('preguntas');
  }, [indiceActual]);

  const cerrarModalNoElegible = useCallback(() => {
    setMostrarModalNoElegible(false);
  }, []);

  const esPreguntaFechaNacimiento = useCallback((pregunta: Pregunta): boolean => {
    const validacion = resolverValidacionFiltro(pregunta);
    return (
      pregunta.tipo_pregunta === 'fecha' &&
      validacion?.tipo_validacion === 'rango_edad'
    );
  }, []);

  return {
    fase,
    indiceActual,
    preguntaActual,
    esUltima,
    respuestas,
    errores,
    puedeContinuarActual,
    mostrarModalNoElegible,
    textosNoElegible,
    textosVerificacion,
    actualizarRespuesta,
    validarPreguntaActual,
    continuarFlujo,
    retroceder,
    cerrarModalNoElegible,
    esPreguntaFechaNacimiento,
    totalPreguntas: preguntasFiltro.length,
  };
}
