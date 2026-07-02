'use client';

/**
 * Pregunta de tipo likert (escala horizontal de opciones).
 */

import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { SeccionCampoTextoOtro } from '../021_campo_texto_otro/SeccionCampoTextoOtro';
import { useOpcionesPregunta } from '@/hooks/useOpcionesPregunta';
import { opcionRequiereCampoTexto } from '@/utils/interaccionOpciones';
import type { PropsPregunta } from '../types';

export function PreguntaLikert({
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
  const id = idPrefijo ?? pregunta.codigo;
  const idError = error ? `${id}-error` : undefined;
  const valorSeleccionado = typeof valor === 'string' ? valor : '';
  const { opciones, cargando } = useOpcionesPregunta(pregunta, respuestasFormulario);
  const opcionesOrdenadas = [...opciones].sort((a, b) => a.orden - b.orden);

  function seleccionarOpcion(valorOpcion: string) {
    onCambio(valorOpcion);
    const opcion = opcionesOrdenadas.find((item) => item.valor === valorOpcion);
    if (
      onCambioObservacion &&
      valorSeleccionado &&
      valorSeleccionado !== valorOpcion
    ) {
      const opcionAnterior = opcionesOrdenadas.find(
        (item) => item.valor === valorSeleccionado,
      );
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
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada} aria-describedby={idError}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <div
        className="flex flex-wrap gap-4 justify-between"
        role="radiogroup"
        aria-label={pregunta.texto}
      >
        {opcionesOrdenadas.map((opcion) => {
          const idOpcion = `${id}-${opcion.codigo}`;
          return (
            <label
              key={opcion.codigo}
              htmlFor={idOpcion}
              className="flex flex-col items-center gap-2 text-center text-xs cursor-pointer min-w-[64px]"
              style={{ color: 'var(--color-texto-primario)' }}
            >
              <input
                id={idOpcion}
                type="radio"
                name={id}
                value={opcion.valor}
                checked={valorSeleccionado === opcion.valor}
                disabled={deshabilitada}
                onChange={() => seleccionarOpcion(opcion.valor)}
                style={{ minWidth: '20px', minHeight: '20px' }}
              />
              <span>{opcion.etiqueta}</span>
            </label>
          );
        })}
      </div>
      <SeccionCampoTextoOtro
        pregunta={pregunta}
        valor={valor}
        opciones={opcionesOrdenadas}
        observacion={observacion}
        onCambioObservacion={onCambioObservacion}
        deshabilitada={deshabilitada}
        idPrefijo={id}
      />
      {cargando && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-texto-secundario)' }}>
          Cargando opciones...
        </p>
      )}
      {error && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
