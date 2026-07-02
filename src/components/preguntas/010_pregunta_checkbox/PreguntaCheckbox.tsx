'use client';

/**
 * Pregunta de tipo checkbox — diseno card (Figma parte06).
 * Cada opcion es una tarjeta de ancho completo con borde redondeado.
 * Marcada: borde primario + fondo tenue + checkmark visible.
 */

import { useId } from 'react';
import { Skeleton } from '@/components/ui/004_skeleton';
import { useOpcionesPregunta } from '@/hooks/useOpcionesPregunta';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { SeccionCampoTextoOtro } from '../021_campo_texto_otro/SeccionCampoTextoOtro';
import { IconoTooltipOpcion } from '../022_icono_tooltip_opcion/IconoTooltipOpcion';
import {
  calcularSeleccionMultiple,
  debeLimpiarObservacion,
  opcionBloqueadaPorExclusion,
  opcionRequiereCampoTexto,
} from '@/utils/interaccionOpciones';
import { opcionMuestraTooltip, textoAyudaPregunta } from '@/utils/tooltipFormulario';
import type { PropsPregunta } from '../types';

function normalizarValores(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map(String);
  if (typeof valor === 'string' && valor) return [valor];
  return [];
}

export function PreguntaCheckbox({
  pregunta,
  valor,
  onCambio,
  observacion = '',
  onCambioObservacion,
  deshabilitada = false,
  obligatoria,
  error,
  idPrefijo,
  respuestasFormulario = {},
}: PropsPregunta) {
  const uid = useId();
  const id = idPrefijo ?? uid;
  const idError = error ? `${id}-error` : undefined;
  const seleccionados = normalizarValores(valor);
  const { opciones, cargando, error: errorCatalogo } = useOpcionesPregunta(
    pregunta,
    respuestasFormulario
  );
  const errorMostrar = error ?? errorCatalogo ?? undefined;

  function alternar(valorOpcion: string, marcado: boolean) {
    const opcion = opciones.find((item) => item.valor === valorOpcion);
    const siguiente = calcularSeleccionMultiple(
      seleccionados,
      valorOpcion,
      marcado,
      opciones,
    );
    onCambio(siguiente);

    if (onCambioObservacion && debeLimpiarObservacion(seleccionados, siguiente, opciones)) {
      onCambioObservacion('');
      return;
    }

    if (
      !marcado &&
      onCambioObservacion &&
      opcion &&
      opcionRequiereCampoTexto(opcion)
    ) {
      onCambioObservacion('');
    }
  }

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada} aria-describedby={idError}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={textoAyudaPregunta(pregunta)}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />

      {cargando ? (
        <Skeleton className="h-40 w-full" etiqueta="Cargando opciones" />
      ) : (
        <div className="flex flex-col gap-3">
          {opciones.map((opcion) => {
            const idOpcion = `${id}-${opcion.codigo}`;
            const marcado = seleccionados.includes(opcion.valor);
            const opcionDeshabilitada = opcionBloqueadaPorExclusion(
              opcion,
              seleccionados,
              opciones,
              deshabilitada,
            );

            return (
              <label
                key={opcion.codigo}
                htmlFor={idOpcion}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-colors"
                style={{
                  border: `1.5px solid ${marcado ? 'var(--color-primario)' : 'var(--color-borde)'}`,
                  backgroundColor: marcado
                    ? 'color-mix(in srgb, var(--color-primario) 6%, transparent)'
                    : 'var(--color-fondo-tarjeta)',
                  color: 'var(--color-texto-primario)',
                  cursor: opcionDeshabilitada ? 'not-allowed' : 'pointer',
                  opacity: opcionDeshabilitada ? 0.55 : 1,
                }}
              >
                <input
                  id={idOpcion}
                  type="checkbox"
                  checked={marcado}
                  disabled={opcionDeshabilitada}
                  onChange={(e) => alternar(opcion.valor, e.target.checked)}
                  className="sr-only"
                />

                <span
                  aria-hidden="true"
                  className="flex-shrink-0 rounded-md flex items-center justify-center"
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${marcado ? 'var(--color-primario)' : 'var(--color-borde-fuerte)'}`,
                    backgroundColor: marcado ? 'var(--color-primario)' : 'transparent',
                  }}
                >
                  {marcado && (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L4.5 7.5L11 1"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                <span className="flex-1">{opcion.etiqueta}</span>
                {opcionMuestraTooltip(opcion) && opcion.tooltip && (
                  <IconoTooltipOpcion
                    etiqueta={opcion.etiqueta}
                    tooltip={opcion.tooltip}
                  />
                )}
              </label>
            );
          })}
        </div>
      )}

      <SeccionCampoTextoOtro
        pregunta={pregunta}
        valor={valor}
        opciones={opciones}
        observacion={observacion}
        onCambioObservacion={onCambioObservacion}
        deshabilitada={deshabilitada}
        idPrefijo={id}
      />

      {errorMostrar && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {errorMostrar}
        </p>
      )}
    </fieldset>
  );
}
