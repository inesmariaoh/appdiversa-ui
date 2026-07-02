'use client';

/**
 * Restaura respuestas previas de la sesion desde el backend.
 */

import { useEffect, useRef } from 'react';
import type { UseFormReset } from 'react-hook-form';
import type { Pregunta } from '@/types/formulario';
import { obtenerRespuestasSesion } from '@/services/sesionesServicio';
import { useSesionStore } from '@/store/sesionStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { mapaValoresDesdeRespuestasServidor, mapaObservacionesDesdeRespuestasServidor } from '@/utils/respuestaDesdeServidor';
import { construirValoresIniciales } from '@/utils/validacionPregunta';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface UseRestaurarRespuestasOpciones {
  listo: boolean;
  preguntas: Pregunta[];
  reset: UseFormReset<Record<string, unknown>>;
}

export function useRestaurarRespuestas({
  listo,
  preguntas,
  reset,
}: UseRestaurarRespuestasOpciones): void {
  const restaurado = useRef(false);

  useEffect(() => {
    if (!listo || restaurado.current || preguntas.length === 0) return;

    let cancelado = false;

    async function restaurar() {
      const { uuidSesion, tokenCliente } = useSesionStore.getState();
      if (!uuidSesion || !tokenCliente) return;

      try {
        const salida = await obtenerRespuestasSesion({ uuidSesion, tokenCliente });
        if (cancelado || salida.respuestas.length === 0) return;

        const mapa = mapaValoresDesdeRespuestasServidor(preguntas, salida.respuestas);
        const mapaObservaciones = mapaObservacionesDesdeRespuestasServidor(salida.respuestas);
        if (Object.keys(mapa).length === 0) return;

        const base = construirValoresIniciales(preguntas);
        reset({ ...base, ...mapa });

        const establecerRespuesta = useRespuestasStore.getState().establecerRespuesta;
        for (const respuesta of salida.respuestas) {
          if (mapa[respuesta.codigo_pregunta] === undefined) continue;
          establecerRespuesta(respuesta.codigo_pregunta, {
            valor: mapa[respuesta.codigo_pregunta],
            observacion: mapaObservaciones[respuesta.codigo_pregunta] ?? '',
            versionCliente: respuesta.version_respuesta,
            origenRespuesta: respuesta.origen_respuesta,
            fechaCliente: respuesta.fecha_respuesta_cliente ?? new Date().toISOString(),
          });
        }

        restaurado.current = true;
      } catch {
        // Una sesion nueva puede no tener respuestas previas.
      }
    }

    ejecutarSinEspera(restaurar());

    return () => {
      cancelado = true;
    };
  }, [listo, preguntas, reset]);
}
