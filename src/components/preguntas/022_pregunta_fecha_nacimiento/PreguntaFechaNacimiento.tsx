'use client';

/**
 * Pregunta de fecha de nacimiento con validacion de rango de edad para filtros.
 */

import { useMemo } from 'react';
import {
  PreguntaFecha,
  type ValorFecha,
} from '@/components/preguntas/001_pregunta_fecha';
import { LectorPregunta } from '@/components/accesibilidad/003_lector_voz';
import type { Pregunta } from '@/types/formulario';
import {
  evaluarPreguntaFiltro,
  esResultadoNoCumplido,
  resolverValidacionFiltro,
} from '@/utils/filtrosFormulario';

interface PreguntaFechaNacimientoProps {
  readonly pregunta: Pregunta;
  readonly valor: unknown;
  readonly onCambio: (valor: ValorFecha) => void;
  readonly deshabilitada?: boolean;
  readonly obligatoria?: boolean;
  readonly errorExterno?: string;
  readonly numeroVisual?: number;
}

function normalizarValorFecha(valor: unknown): ValorFecha {
  if (valor && typeof valor === 'object' && 'anio' in (valor as ValorFecha)) {
    return valor as ValorFecha;
  }
  return { anio: '', mes: '', dia: '' };
}

export function PreguntaFechaNacimiento({
  pregunta,
  valor,
  onCambio,
  deshabilitada = false,
  obligatoria = false,
  errorExterno,
  numeroVisual,
}: PreguntaFechaNacimientoProps) {
  const valorFecha = normalizarValorFecha(valor);
  const ordenVisual = numeroVisual ?? pregunta.orden;

  const errorFiltro = useMemo(() => {
    if (!valorFecha.anio || !valorFecha.mes || !valorFecha.dia) {
      return undefined;
    }
    const validacion = resolverValidacionFiltro(pregunta);
    if (!validacion) {
      return undefined;
    }
    const resultado = evaluarPreguntaFiltro(pregunta, valorFecha);
    if (esResultadoNoCumplido(resultado)) {
      return resultado.mensaje;
    }
    return undefined;
  }, [pregunta, valorFecha]);

  const errorMostrado = errorExterno ?? errorFiltro;

  return (
    <div className="flex flex-col gap-2">
      <LectorPregunta pregunta={pregunta} />
      <PreguntaFecha
        idPregunta={pregunta.codigo}
        texto={pregunta.texto}
        ayuda={pregunta.descripcion || pregunta.tooltip || null}
        orden={ordenVisual}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
        deshabilitada={deshabilitada}
        valor={valorFecha}
        onChange={onCambio}
        error={errorMostrado}
        errorAgrupado
      />
      {errorFiltro && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm -mt-2"
          style={{ color: 'var(--color-error)' }}
        >
          <span aria-hidden="true">⚠</span>
          <span>{errorFiltro}</span>
        </p>
      )}
    </div>
  );
}
