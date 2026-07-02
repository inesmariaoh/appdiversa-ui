'use client';

/**
 * Pregunta de tipo matriz — diseno row-based (Figma parte06 / Fila.png).
 * Cada fila: etiqueta (izquierda) + selector de columna como card (derecha).
 * Movil: etiqueta arriba, opciones pueden envolverse.
 * Escritorio: etiqueta izquierda, opciones en una sola fila horizontal.
 */

import { useId } from 'react';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import type { PropsPregunta } from '../types';

export type ValorMatriz = Record<string, string>;

function normalizarMatriz(valor: unknown): ValorMatriz {
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
    return valor as ValorMatriz;
  }
  return {};
}

export function PreguntaMatriz({
  pregunta,
  valor,
  onCambio,
  deshabilitada = false,
  obligatoria,
  error,
  idPrefijo,
}: PropsPregunta) {
  const uid = useId();
  const id = idPrefijo ?? uid;
  const idError = error ? `${id}-error` : undefined;
  const matriz = normalizarMatriz(valor);
  const filas = [...pregunta.filas_matriz].sort((a, b) => a.orden - b.orden);
  const columnas = [...pregunta.columnas_matriz].sort((a, b) => a.orden - b.orden);

  function actualizarFila(codigoFila: string, valorColumna: string) {
    onCambio({ ...matriz, [codigoFila]: valorColumna });
  }

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada} aria-describedby={idError}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />

      <div className="flex flex-col gap-3">
        {filas.map((fila) => {
          const valorFila = matriz[fila.codigo] ?? '';
          const nombreGrupo = `${id}-${fila.codigo}`;

          return (
            <div
              key={fila.codigo}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl px-4 py-3"
              style={{
                border: '1px solid var(--color-borde)',
                backgroundColor: 'var(--color-fondo-tarjeta)',
              }}
            >
              {/* Etiqueta de la fila */}
              <span
                className="sm:max-w-[42%] sm:flex-shrink-0 text-sm font-semibold"
                style={{ color: 'var(--color-texto-primario)' }}
              >
                {fila.etiqueta}
              </span>

              {/* Opciones de columna en una sola fila en escritorio */}
              <div
                className="sm:flex-1 sm:min-w-0 flex flex-wrap gap-2 sm:flex-nowrap"
                role="radiogroup"
                aria-label={`${fila.etiqueta}: seleccione una opción`}
              >
                {columnas.map((col) => {
                  const idOpcion = `${nombreGrupo}-${col.codigo}`;
                  const seleccionada = valorFila === col.codigo;

                  return (
                    <label
                      key={col.codigo}
                      htmlFor={idOpcion}
                      className="flex flex-1 sm:basis-0 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-2 rounded-lg cursor-pointer text-sm whitespace-nowrap min-w-0 transition-colors"
                      style={{
                        border: `1.5px solid ${seleccionada ? 'var(--color-primario)' : 'var(--color-borde)'}`,
                        backgroundColor: seleccionada
                          ? 'color-mix(in srgb, var(--color-primario) 6%, transparent)'
                          : 'transparent',
                        color: 'var(--color-texto-primario)',
                      }}
                    >
                      <input
                        id={idOpcion}
                        type="radio"
                        name={nombreGrupo}
                        value={col.codigo}
                        checked={seleccionada}
                        disabled={deshabilitada}
                        aria-label={`${fila.etiqueta}: ${col.etiqueta}`}
                        onChange={() => actualizarFila(fila.codigo, col.codigo)}
                        className="sr-only"
                      />

                      {/* Indicador radio mini */}
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 rounded-full flex items-center justify-center"
                        style={{
                          width: '16px',
                          height: '16px',
                          border: `2px solid ${seleccionada ? 'var(--color-primario)' : 'var(--color-borde-fuerte)'}`,
                          backgroundColor: seleccionada ? 'var(--color-primario)' : 'transparent',
                        }}
                      >
                        {seleccionada && (
                          <span
                            className="rounded-full"
                            style={{ width: '6px', height: '6px', backgroundColor: '#ffffff' }}
                          />
                        )}
                      </span>

                      <span>{col.etiqueta}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
