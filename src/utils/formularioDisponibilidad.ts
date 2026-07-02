/**
 * Normaliza campos de disponibilidad de formularios publicos con fallback local.
 */

import type {
  EstadoDisponibilidadFormulario,
  FormularioDisponible,
} from '@/types/formulario';
import { formularioEstaVigente } from '@/utils/tokensInterfaz';

export type FormularioDisponibleEntrada = Omit<
  FormularioDisponible,
  'estado_disponibilidad' | 'puede_iniciar' | 'etiqueta_estado'
> & {
  estado_disponibilidad?: EstadoDisponibilidadFormulario;
  puede_iniciar?: boolean;
  etiqueta_estado?: string;
};

function resolverEstadoFallback(
  fechaInicio: string | null,
  fechaFin: string | null,
  referencia: Date
): Pick<
  FormularioDisponible,
  'estado_disponibilidad' | 'puede_iniciar' | 'etiqueta_estado'
> {
  const vigente = formularioEstaVigente(fechaInicio, fechaFin, referencia);
  const esFuturo = Boolean(fechaInicio && new Date(fechaInicio) > referencia);

  if (vigente) {
    return {
      estado_disponibilidad: 'disponible',
      puede_iniciar: true,
      etiqueta_estado: 'Disponible',
    };
  }

  if (esFuturo) {
    return {
      estado_disponibilidad: 'proximamente',
      puede_iniciar: false,
      etiqueta_estado: 'Próximamente',
    };
  }

  return {
    estado_disponibilidad: 'proximamente',
    puede_iniciar: false,
    etiqueta_estado: 'Próximamente',
  };
}

function resolverEtiquetaEstado(
  formulario: FormularioDisponibleEntrada,
  estado: EstadoDisponibilidadFormulario
): string {
  if (formulario.etiqueta_estado?.trim()) {
    return formulario.etiqueta_estado.trim();
  }

  if (estado === 'proximamente') {
    return 'Próximamente';
  }

  return formulario.permite_offline ? 'Disponible offline' : 'Disponible';
}

export function normalizarFormularioDisponible(
  formulario: FormularioDisponibleEntrada,
  referencia: Date = new Date()
): FormularioDisponible {
  const fallback = resolverEstadoFallback(
    formulario.fecha_inicio,
    formulario.fecha_fin,
    referencia
  );

  const estado_disponibilidad =
    formulario.estado_disponibilidad ?? fallback.estado_disponibilidad;
  const puede_iniciar = formulario.puede_iniciar ?? fallback.puede_iniciar;

  return {
    ...formulario,
    estado_disponibilidad,
    puede_iniciar,
    etiqueta_estado: resolverEtiquetaEstado(formulario, estado_disponibilidad),
  };
}

export function normalizarFormulariosDisponibles(
  formularios: FormularioDisponibleEntrada[],
  referencia: Date = new Date()
): FormularioDisponible[] {
  return formularios.map((formulario) =>
    normalizarFormularioDisponible(formulario, referencia)
  );
}
