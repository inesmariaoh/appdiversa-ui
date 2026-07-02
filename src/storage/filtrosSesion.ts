/**
 * Persistencia local del estado de filtros preliminares completados.
 */

const PREFIJO_CLAVE = 'filtros_completados_';

export function marcarFiltrosCompletados(uuidFormulario: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(`${PREFIJO_CLAVE}${uuidFormulario}`, '1');
}

export function filtrosCompletados(uuidFormulario: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(`${PREFIJO_CLAVE}${uuidFormulario}`) === '1';
}

export function limpiarFiltrosCompletados(uuidFormulario: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(`${PREFIJO_CLAVE}${uuidFormulario}`);
}
