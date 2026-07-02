'use client';

/**
 * Pregunta de tipo radio — diseno card (Figma parte06).
 * Cada opcion es una tarjeta de ancho completo con borde redondeado.
 * Seleccionada: borde primario + fondo tenue + icono radio relleno.
 * Tooltip por opcion: icono (i) circular a la derecha del texto.
 */

import { useId } from 'react';
import { Skeleton } from '@/components/ui/004_skeleton';
import { useOpcionesPregunta } from '@/hooks/useOpcionesPregunta';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { SeccionCampoTextoOtro } from '../021_campo_texto_otro/SeccionCampoTextoOtro';
import { IconoTooltipOpcion } from '../022_icono_tooltip_opcion/IconoTooltipOpcion';
import { opcionRequiereCampoTexto } from '@/utils/interaccionOpciones';
import { opcionMuestraTooltip, textoAyudaPregunta } from '@/utils/tooltipFormulario';
import type { PropsPregunta } from '../types';

export function PreguntaRadio({
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
  const valorSeleccionado = typeof valor === 'string' ? valor : '';
  const { opciones, cargando, error: errorCatalogo } = useOpcionesPregunta(
    pregunta,
    respuestasFormulario
  );
  const errorMostrar = error ?? errorCatalogo ?? undefined;

  function seleccionarOpcion(valorOpcion: string) {
    onCambio(valorOpcion);
    const opcion = opciones.find((item) => item.valor === valorOpcion);
    if (
      onCambioObservacion &&
      valorSeleccionado &&
      valorSeleccionado !== valorOpcion
    ) {
      const opcionAnterior = opciones.find((item) => item.valor === valorSeleccionado);
      if (
        opcionAnterior &&
        opcionRequiereCampoTexto(opcionAnterior) &&
        !(opcion && opcionRequiereCampoTexto(opcion))
      ) {
        onCambioObservacion('');
      }
    }
  }

  return (
    <fieldset
      className="border-0 p-0 m-0 w-full"
      disabled={deshabilitada}
      aria-describedby={idError}
    >
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={textoAyudaPregunta(pregunta)}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />

      {cargando ? (
        <Skeleton className="h-40 w-full" etiqueta="Cargando opciones" />
      ) : (
        <div className="flex flex-col gap-3" role="radiogroup" aria-label={pregunta.texto}>
          {opciones.map((opcion) => {
            const idOpcion = `${id}-${opcion.codigo}`;
            const seleccionada = valorSeleccionado === opcion.valor;

            return (
              <label
                key={opcion.codigo}
                htmlFor={idOpcion}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl cursor-pointer text-sm transition-colors"
                style={{
                  border: `1.5px solid ${seleccionada ? 'var(--color-primario)' : 'var(--color-borde)'}`,
                  backgroundColor: seleccionada
                    ? 'color-mix(in srgb, var(--color-primario) 6%, transparent)'
                    : 'var(--color-fondo-tarjeta)',
                  color: 'var(--color-texto-primario)',
                }}
              >
                {/* Input nativo oculto — accesible via label */}
                <input
                  id={idOpcion}
                  type="radio"
                  name={id}
                  value={opcion.valor}
                  checked={seleccionada}
                  disabled={deshabilitada}
                  required={obligatoria ?? pregunta.es_obligatoria}
                  onChange={() => seleccionarOpcion(opcion.valor)}
                  className="sr-only"
                />

                {/* Indicador radio personalizado */}
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${seleccionada ? 'var(--color-primario)' : 'var(--color-borde-fuerte)'}`,
                    backgroundColor: seleccionada ? 'var(--color-primario)' : 'transparent',
                  }}
                >
                  {seleccionada && (
                    <span
                      className="rounded-full"
                      style={{ width: '8px', height: '8px', backgroundColor: '#ffffff' }}
                    />
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
