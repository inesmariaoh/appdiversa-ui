'use client';

/**
 * Pregunta de tipo select con opciones del backend o catalogo dinamico.
 */

import { Selector } from '@/components/ui/002_selector';
import { Skeleton } from '@/components/ui/004_skeleton';
import { useOpcionesPregunta } from '@/hooks/useOpcionesPregunta';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { SeccionCampoTextoOtro } from '../021_campo_texto_otro/SeccionCampoTextoOtro';
import {
  obtenerEtiquetaCampoCatalogo,
  obtenerPlaceholderCampoCatalogo,
} from '@/utils/preguntasCatalogoAgrupadas';
import { opcionRequiereCampoTexto } from '@/utils/interaccionOpciones';
import type { PropsPregunta } from '../types';

export function PreguntaSelect({
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
  modoSubcampo = false,
  bloqueadoPorDependencia = false,
  esCampoPadreGrupo = false,
  preguntasFormulario = [],
}: PropsPregunta) {
  const id = idPrefijo ?? pregunta.codigo;
  const valorSeleccionado = typeof valor === 'string' ? valor : '';
  const { opciones, cargando, error: errorCatalogo } = useOpcionesPregunta(
    pregunta,
    respuestasFormulario
  );
  const opcionesSelector = opciones
    .sort((a, b) => a.orden - b.orden)
    .map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }));
  const etiquetaCampo = modoSubcampo
    ? obtenerEtiquetaCampoCatalogo(pregunta)
    : 'Opción';
  const placeholderCampo = modoSubcampo
    ? obtenerPlaceholderCampoCatalogo(
        pregunta,
        preguntasFormulario,
        bloqueadoPorDependencia,
        esCampoPadreGrupo,
      )
    : 'Seleccione...';

  function manejarCambio(valorNuevo: string) {
    if (onCambioObservacion && valorSeleccionado && valorSeleccionado !== valorNuevo) {
      const opcionAnterior = opciones.find((item) => item.valor === valorSeleccionado);
      const opcionNueva = opciones.find((item) => item.valor === valorNuevo);
      if (
        opcionAnterior &&
        opcionRequiereCampoTexto(opcionAnterior) &&
        !(opcionNueva && opcionRequiereCampoTexto(opcionNueva))
      ) {
        onCambioObservacion('');
      }
    }
    onCambio(valorNuevo);
  }

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
      {!modoSubcampo && (
        <EncabezadoPregunta
          orden={pregunta.orden}
          texto={pregunta.texto}
          ayuda={pregunta.tooltip || pregunta.descripcion || null}
          obligatoria={obligatoria ?? pregunta.es_obligatoria}
        />
      )}
      {cargando ? (
        <Skeleton className="h-12 w-full" etiqueta="Cargando opciones" />
      ) : (
        <Selector
          id={id}
          etiqueta={etiquetaCampo}
          placeholder={placeholderCampo}
          opciones={opcionesSelector}
          value={valorSeleccionado}
          required={obligatoria ?? pregunta.es_obligatoria}
          disabled={deshabilitada}
          error={error ?? errorCatalogo ?? undefined}
          onChange={(e) => manejarCambio(e.target.value)}
        />
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
    </fieldset>
  );
}
