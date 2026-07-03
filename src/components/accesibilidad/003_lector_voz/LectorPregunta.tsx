'use client';

/**
 * Boton de lectura por voz asociado a una pregunta. Solo se muestra cuando la
 * bandera de accesibilidad "lectura por voz" esta habilitada en la
 * configuracion de interfaz, de modo que se activa o desactiva sin desplegar.
 */

import { useInterfazStore } from '@/store/interfazStore';
import type { OpcionRespuesta, Pregunta } from '@/types/formulario';
import { opcionMuestraTooltip } from '@/utils/tooltipFormulario';
import { BotonEscuchar } from './BotonEscuchar';

interface LectorPreguntaProps {
  readonly pregunta: Pregunta;
  /**
   * Campos adicionales del mismo paso (p. ej. municipio dentro del grupo
   * geografico de departamento). Se leen despues de la pregunta raiz.
   */
  readonly campos?: readonly Pregunta[];
}

const ETIQUETA_OPCIONES = 'Opciones';
const ETIQUETA_FILAS = 'Filas';
const ETIQUETA_COLUMNAS = 'Columnas';

interface ElementoEtiquetado {
  readonly etiqueta?: string;
}

function unirEtiquetas(elementos: readonly ElementoEtiquetado[]): string {
  return elementos
    .map((elemento) => elemento.etiqueta?.trim())
    .filter((etiqueta): etiqueta is string => Boolean(etiqueta))
    .join(', ');
}

function describirOpcion(opcion: OpcionRespuesta): string | null {
  const etiqueta = opcion.etiqueta?.trim();
  if (!etiqueta) {
    return null;
  }
  if (opcionMuestraTooltip(opcion)) {
    return `${etiqueta} (${opcion.tooltip?.trim()})`;
  }
  return etiqueta;
}

function describirOpciones(pregunta: Pregunta): string | null {
  const descripciones = (pregunta.opciones ?? [])
    .map(describirOpcion)
    .filter((descripcion): descripcion is string => Boolean(descripcion));
  return descripciones.length
    ? `${ETIQUETA_OPCIONES}: ${descripciones.join(', ')}`
    : null;
}

function describirMatriz(pregunta: Pregunta): string[] {
  const partes: string[] = [];
  const filas = unirEtiquetas(pregunta.filas_matriz ?? []);
  const columnas = unirEtiquetas(pregunta.columnas_matriz ?? []);
  if (filas) {
    partes.push(`${ETIQUETA_FILAS}: ${filas}`);
  }
  if (columnas) {
    partes.push(`${ETIQUETA_COLUMNAS}: ${columnas}`);
  }
  return partes;
}

function describirCampoAdicional(pregunta: Pregunta): string | null {
  const partes: string[] = [];
  const texto = pregunta.texto?.trim();
  if (texto) {
    partes.push(texto);
  }
  const ayuda = pregunta.tooltip?.trim() || pregunta.descripcion?.trim();
  if (ayuda) {
    partes.push(ayuda);
  }
  const opciones = describirOpciones(pregunta);
  if (opciones) {
    partes.push(opciones);
  }
  return partes.length ? partes.join('. ') : null;
}

function construirTextoLectura(
  pregunta: Pregunta,
  campos?: readonly Pregunta[],
): string {
  const partes = [`${pregunta.orden}. ${pregunta.texto}`];
  const ayuda = pregunta.tooltip || pregunta.descripcion;
  if (ayuda) {
    partes.push(ayuda);
  }
  const opciones = describirOpciones(pregunta);
  if (opciones) {
    partes.push(opciones);
  }
  partes.push(...describirMatriz(pregunta));
  for (const campo of campos ?? []) {
    if (campo.codigo === pregunta.codigo) {
      continue;
    }
    const descripcion = describirCampoAdicional(campo);
    if (descripcion) {
      partes.push(descripcion);
    }
  }
  return partes.join('. ');
}

export function LectorPregunta({ pregunta, campos }: LectorPreguntaProps) {
  const habilitado = useInterfazStore(
    (estado) => estado.configuracion?.accesibilidad?.lectura_voz_habilitada ?? false
  );

  if (!habilitado) {
    return null;
  }

  return (
    <div className="mb-2">
      <BotonEscuchar texto={construirTextoLectura(pregunta, campos)} />
    </div>
  );
}
