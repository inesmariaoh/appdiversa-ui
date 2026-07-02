/**
 * Aplica tokens visuales dinamicos de la interfaz en el documento.
 */

import type { ConfiguracionInterfaz } from '@/types/interfaz';

const PROPIEDADES_COLOR: Array<{
  campo: keyof Pick<
    ConfiguracionInterfaz,
    'color_primario' | 'color_secundario' | 'color_acento' | 'color_fondo_pagina' | 'color_fondo_tarjeta' | 'color_error'
  >;
  variable: string;
}> = [
  { campo: 'color_primario', variable: '--color-primario' },
  { campo: 'color_secundario', variable: '--color-secundario' },
  { campo: 'color_acento', variable: '--color-acento' },
  { campo: 'color_fondo_pagina', variable: '--color-fondo-pagina' },
  { campo: 'color_fondo_tarjeta', variable: '--color-fondo-tarjeta' },
  { campo: 'color_error', variable: '--color-error' },
];

export function aplicarTokensInterfaz(
  configuracion: Pick<
    ConfiguracionInterfaz,
    | 'color_primario'
    | 'color_secundario'
    | 'color_acento'
    | 'color_fondo_pagina'
    | 'color_fondo_tarjeta'
    | 'color_error'
  >
): Record<string, string> {
  const estilos: Record<string, string> = {};

  for (const { campo, variable } of PROPIEDADES_COLOR) {
    const valor = configuracion[campo]?.trim();
    if (valor) {
      estilos[variable] = valor;
    }
  }

  return estilos;
}

export function formularioEstaVigente(
  fechaInicio: string | null,
  fechaFin: string | null,
  referencia: Date = new Date()
): boolean {
  if (fechaInicio && new Date(fechaInicio) > referencia) return false;
  if (fechaFin && new Date(fechaFin) < referencia) return false;
  return true;
}
