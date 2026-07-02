'use client';

/**
 * Pregunta de tipo autocomplete con busqueda en catalogo.
 */

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/004_skeleton';
import { useOpcionesPregunta } from '@/hooks/useOpcionesPregunta';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { estilosCampoTexto } from '../estilosCampo';
import {
  obtenerEtiquetaCampoCatalogo,
  obtenerPlaceholderCampoCatalogo,
} from '@/utils/preguntasCatalogoAgrupadas';
import type { PropsPregunta } from '../types';

export function PreguntaAutocomplete({
  pregunta,
  valor,
  onCambio,
  deshabilitada = false,
  obligatoria,
  error,
  idPrefijo,
  respuestasFormulario = {},
  modoSubcampo = false,
  bloqueadoPorDependencia = false,
  preguntasFormulario = [],
}: PropsPregunta) {
  const id = idPrefijo ?? pregunta.codigo;
  const listId = `${id}-opciones`;
  const idError = error ? `${id}-error` : undefined;
  const valorTexto = typeof valor === 'string' ? valor : '';
  const [busqueda, setBusqueda] = useState(valorTexto);
  const [debounced, setDebounced] = useState(valorTexto);
  const etiquetaCampo = modoSubcampo
    ? obtenerEtiquetaCampoCatalogo(pregunta)
    : pregunta.texto;
  const placeholderCampo = modoSubcampo
    ? obtenerPlaceholderCampoCatalogo(
        pregunta,
        preguntasFormulario,
        bloqueadoPorDependencia,
      )
    : undefined;

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const { opciones, cargando, error: errorCatalogo } = useOpcionesPregunta(
    pregunta,
    respuestasFormulario,
    pregunta.permite_busqueda_catalogo ? debounced : undefined
  );
  const errorMostrar = error ?? errorCatalogo ?? undefined;

  if (modoSubcampo) {
    return (
      <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
        <label
          htmlFor={id}
          className="text-sm font-medium block mb-1"
          style={{ color: 'var(--color-texto-secundario)' }}
        >
          {etiquetaCampo}
          {(obligatoria ?? pregunta.es_obligatoria) && (
            <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>
              {' '}
              *
            </span>
          )}
        </label>
        {cargando ? (
          <Skeleton className="h-12 w-full" etiqueta="Buscando opciones" />
        ) : (
          <>
            <input
              id={id}
              type="text"
              list={listId}
              value={valorTexto}
              placeholder={placeholderCampo}
              required={obligatoria ?? pregunta.es_obligatoria}
              disabled={deshabilitada}
              aria-invalid={errorMostrar ? 'true' : undefined}
              aria-describedby={idError}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={estilosCampoTexto(errorMostrar, deshabilitada)}
              onChange={(e) => {
                setBusqueda(e.target.value);
                onCambio(e.target.value);
              }}
            />
            <datalist id={listId}>
              {opciones.map((opcion) => (
                <option key={opcion.codigo} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </datalist>
          </>
        )}
        {errorMostrar && (
          <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
            {errorMostrar}
          </p>
        )}
      </fieldset>
    );
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
        <Skeleton className="h-12 w-full" etiqueta="Buscando opciones" />
      ) : (
        <>
          <input
            id={id}
            type="text"
            list={listId}
            value={valorTexto}
            required={obligatoria ?? pregunta.es_obligatoria}
            disabled={deshabilitada}
            aria-invalid={errorMostrar ? 'true' : undefined}
            aria-describedby={idError}
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={estilosCampoTexto(errorMostrar, deshabilitada)}
            onChange={(e) => {
              setBusqueda(e.target.value);
              onCambio(e.target.value);
            }}
          />
          <datalist id={listId}>
            {opciones.map((opcion) => (
              <option key={opcion.codigo} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </datalist>
        </>
      )}
      {errorMostrar && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {errorMostrar}
        </p>
      )}
    </fieldset>
  );
}
