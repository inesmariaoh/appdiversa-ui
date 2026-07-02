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
import {
  debeMostrarseComoGrupoGeografico,
  esSubpreguntaGeograficaEnGrupo,
  obtenerCamposGrupoGeografico,
} from '@/utils/preguntasCatalogoAgrupadas';
import { contenidoTextoFormulario, tituloTextoFormulario } from '@/utils/textosFormulario';
import { validarRespuestaPregunta, valorInicialPorTipo } from '@/utils/validacionPregunta';

const TIPO_PREGUNTA_RADIO = 'radio';

interface ResultadoValidacionGrupo {
  readonly errores: Record<string, string>;
  readonly mensajeNoElegible: string | null;
  readonly valido: boolean;
}

/**
 * Determina si un campo del grupo permite habilitar el boton continuar.
 */
function campoPermiteContinuar(pregunta: Pregunta, valor: unknown): boolean {
  const errorBasico = validarRespuestaPregunta(
    pregunta,
    valor,
    pregunta.es_obligatoria,
  );
  if (errorBasico) {
    return false;
  }
  const resultado = evaluarPreguntaFiltro(pregunta, valor);
  if (esResultadoNoCumplido(resultado) && resultado.bloqueaContinuacion) {
    return pregunta.tipo_pregunta === TIPO_PREGUNTA_RADIO;
  }
  return true;
}

/**
 * Valida todos los campos de un paso, que puede agrupar preguntas geograficas.
 */
function validarCamposDelPaso(
  preguntas: Pregunta[],
  respuestas: Record<string, unknown>,
): ResultadoValidacionGrupo {
  const errores: Record<string, string> = {};
  let mensajeNoElegible: string | null = null;

  for (const pregunta of preguntas) {
    const valor = respuestas[pregunta.codigo];
    const errorBasico = validarRespuestaPregunta(
      pregunta,
      valor,
      pregunta.es_obligatoria,
    );
    if (errorBasico) {
      errores[pregunta.codigo] = errorBasico;
      continue;
    }
    const resultado = evaluarPreguntaFiltro(pregunta, valor);
    if (!esResultadoNoCumplido(resultado)) {
      continue;
    }
    if (pregunta.tipo_pregunta === TIPO_PREGUNTA_RADIO && resultado.bloqueaContinuacion) {
      mensajeNoElegible = resultado.mensaje;
    } else {
      errores[pregunta.codigo] = resultado.mensaje;
    }
  }

  return {
    errores,
    mensajeNoElegible,
    valido: Object.keys(errores).length === 0 && mensajeNoElegible === null,
  };
}

/**
 * Elimina del mapa de errores las claves de las preguntas indicadas.
 */
function limpiarErroresDelPaso(
  errores: Record<string, string>,
  preguntas: Pregunta[],
): Record<string, string> {
  const siguientes = { ...errores };
  for (const pregunta of preguntas) {
    delete siguientes[pregunta.codigo];
  }
  return siguientes;
}

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

  const preguntasNavegacion = useMemo(
    () =>
      preguntasFiltro.filter(
        (pregunta) => !esSubpreguntaGeograficaEnGrupo(pregunta, preguntasFiltro),
      ),
    [preguntasFiltro],
  );

  const preguntaActual = preguntasNavegacion[indiceActual];
  const esUltima = indiceActual >= preguntasNavegacion.length - 1;

  const preguntasPasoActual = useMemo(() => {
    if (!preguntaActual) {
      return [];
    }
    if (debeMostrarseComoGrupoGeografico(preguntaActual, preguntasFiltro)) {
      return obtenerCamposGrupoGeografico(preguntaActual, preguntasFiltro);
    }
    return [preguntaActual];
  }, [preguntaActual, preguntasFiltro]);

  const esGrupoGeograficoActual = useMemo(
    () =>
      preguntaActual
        ? debeMostrarseComoGrupoGeografico(preguntaActual, preguntasFiltro)
        : false,
    [preguntaActual, preguntasFiltro],
  );

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
    return preguntasPasoActual.every((pregunta) =>
      campoPermiteContinuar(pregunta, respuestas[pregunta.codigo]),
    );
  }, [preguntaActual, preguntasPasoActual, respuestas]);

  const validarPreguntaActual = useCallback((): boolean => {
    if (!preguntaActual) {
      return true;
    }
    const resultado = validarCamposDelPaso(preguntasPasoActual, respuestas);
    if (resultado.mensajeNoElegible) {
      setMensajeNoElegible(resultado.mensajeNoElegible);
      setMostrarModalNoElegible(true);
      return false;
    }
    if (!resultado.valido) {
      setErrores((previos) => ({ ...previos, ...resultado.errores }));
      return false;
    }
    setErrores((previos) => limpiarErroresDelPaso(previos, preguntasPasoActual));
    return true;
  }, [preguntaActual, preguntasPasoActual, respuestas]);

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
    preguntasPasoActual,
    esGrupoGeograficoActual,
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
    totalPreguntas: preguntasNavegacion.length,
  };
}
