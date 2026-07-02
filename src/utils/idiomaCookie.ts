/**
 * Constantes y utilidades para persistir el idioma en cookie.
 */

export const NOMBRE_COOKIE_IDIOMA = 'appdiversa_idioma';
export const NOMBRE_COOKIE_ACCESIBILIDAD = 'appdiversa_incluir_accesibilidad';

export function establecerCookieIdioma(idioma: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${NOMBRE_COOKIE_IDIOMA}=${encodeURIComponent(idioma)};path=/;max-age=31536000;SameSite=Lax`;
}

export function leerCookieIdioma(): string | null {
  if (typeof document === 'undefined') return null;
  const coincidencia = document.cookie
    .split(';')
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${NOMBRE_COOKIE_IDIOMA}=`));
  if (!coincidencia) return null;
  const valor = coincidencia.slice(NOMBRE_COOKIE_IDIOMA.length + 1);
  return decodeURIComponent(valor);
}

export function establecerCookieAccesibilidad(incluir: boolean): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${NOMBRE_COOKIE_ACCESIBILIDAD}=${incluir ? '1' : '0'};path=/;max-age=31536000;SameSite=Lax`;
}

export function leerCookieAccesibilidad(): boolean {
  if (typeof document === 'undefined') return false;
  const coincidencia = document.cookie
    .split(';')
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${NOMBRE_COOKIE_ACCESIBILIDAD}=`));
  return coincidencia?.endsWith('=1') ?? false;
}
