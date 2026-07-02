/**
 * Utilidades compartidas para construir migas de pan desde el inicio de encuestas.
 */

import type { Miga } from '@/components/layout/004_migas';

export const MIGA_INICIO: Miga = { etiqueta: 'Inicio', href: '/' };

/** Construye una ruta de migas que comienza en Inicio (listado de encuestas). */
export function migasDesdeInicio(tramo: readonly Miga[]): Miga[] {
  return [MIGA_INICIO, ...tramo];
}

interface TramoMigaAuth {
  readonly prefijo: string;
  readonly tramo: readonly Miga[];
}

const TRAMOS_AUTH: readonly TramoMigaAuth[] = [
  {
    prefijo: '/auth/registro/correo',
    tramo: [
      { etiqueta: 'Registro', href: '/auth/registro' },
      { etiqueta: 'Registro con correo electrónico' },
    ],
  },
  {
    prefijo: '/auth/solicitar-restaurar-password',
    tramo: [
      { etiqueta: 'Iniciar sesión', href: '/auth/login' },
      { etiqueta: 'Restaurar contraseña' },
    ],
  },
  {
    prefijo: '/auth/restaurar-password',
    tramo: [
      { etiqueta: 'Iniciar sesión', href: '/auth/login' },
      { etiqueta: 'Nueva contraseña' },
    ],
  },
  { prefijo: '/auth/login', tramo: [{ etiqueta: 'Iniciar sesión' }] },
  { prefijo: '/auth/registro', tramo: [{ etiqueta: 'Registro' }] },
  { prefijo: '/perfil', tramo: [{ etiqueta: 'Tus datos' }] },
  { prefijo: '/auth/perfil', tramo: [{ etiqueta: 'Tus datos' }] },
  { prefijo: '/auth/salir', tramo: [{ etiqueta: 'Cerrar sesión' }] },
];

/** Resuelve las migas para rutas bajo /auth segun la ruta actual. */
export function resolverMigasAuth(ruta: string): Miga[] {
  const coincidencia = TRAMOS_AUTH.find((item) => ruta.startsWith(item.prefijo));
  if (coincidencia) {
    return migasDesdeInicio(coincidencia.tramo);
  }
  return migasDesdeInicio([{ etiqueta: 'Cuenta' }]);
}
