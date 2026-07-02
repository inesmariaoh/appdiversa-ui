'use client';

/**
 * Pregunta de tipo select_multiple con catalogo dinamico.
 */

import { Skeleton } from '@/components/ui/004_skeleton';
import { useOpcionesPregunta } from '@/hooks/useOpcionesPregunta';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { SeccionCampoTextoOtro } from '../021_campo_texto_otro/SeccionCampoTextoOtro';
import { estilosCampoTexto } from '../estilosCampo';
import {
  debeLimpiarObservacion,
  hayOpcionExcluyenteSeleccionada,
  opcionEsExcluyente,
} from '@/utils/interaccionOpciones';
import type { PropsPregunta } from '../types';
import type { OpcionRespuesta } from '@/types/formulario';

function normalizarValores(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.map(String) : [];
}

function normalizarSeleccionMultiple(
  valoresNuevos: string[],
  seleccionadosPrevios: string[],
  opciones: OpcionRespuesta[],
): string[] {
  const agregados = valoresNuevos.filter((valor) => !seleccionadosPrevios.includes(valor));

  for (const valorAgregado of agregados) {
    const opcion = opciones.find((item) => item.valor === valorAgregado);
    if (opcion && opcionEsExcluyente(opcion)) {
      return [valorAgregado];
    }
  }

  if (
    hayOpcionExcluyenteSeleccionada(seleccionadosPrevios, opciones) &&
    agregados.length > 0
  ) {
    return seleccionadosPrevios;
  }

  return valoresNuevos;
}

export function PreguntaSelectMultiple({
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
  const seleccionados = normalizarValores(valor);
  const { opciones, cargando, error: errorCatalogo } = useOpcionesPregunta(
    pregunta,
    respuestasFormulario
  );
  const errorMostrar = error ?? errorCatalogo ?? undefined;
  const excluyenteActivo = hayOpcionExcluyenteSeleccionada(seleccionados, opciones);

  function manejarCambio(valores: string[]) {
    const valoresNormalizados = normalizarSeleccionMultiple(
      valores,
      seleccionados,
      opciones,
    );
    onCambio(valoresNormalizados);

    if (
      onCambioObservacion &&
      debeLimpiarObservacion(seleccionados, valoresNormalizados, opciones)
    ) {
      onCambioObservacion('');
    }
  }

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      {cargando ? (
        <Skeleton className="h-28 w-full" etiqueta="Cargando opciones" />
      ) : (
        <select
          id={id}
          multiple
          required={obligatoria ?? pregunta.es_obligatoria}
          disabled={deshabilitada}
          aria-invalid={errorMostrar ? 'true' : undefined}
          aria-describedby={idError}
          value={seleccionados}
          className="w-full rounded-lg px-3 py-2.5 text-sm min-h-[120px]"
          style={estilosCampoTexto(errorMostrar, deshabilitada)}
          onChange={(e) => {
            const valores = Array.from(e.target.selectedOptions).map((o) => o.value);
            manejarCambio(valores);
          }}
        >
          {opciones.map((opcion) => (
            <option
              key={opcion.codigo}
              value={opcion.valor}
              disabled={
                excluyenteActivo &&
                !opcionEsExcluyente(opcion) &&
                !seleccionados.includes(opcion.valor)
              }
            >
              {opcion.etiqueta}
            </option>
          ))}
        </select>
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
