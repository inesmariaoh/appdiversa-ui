/**
 * Calculo de reintentos con retroceso exponencial para la cola de sincronizacion.
 */

export const MAX_REINTENTOS_SINCRONIZACION = 5;

const RETRASO_BASE_MS = 5000;
const FACTOR_CRECIMIENTO = 2;
const RETRASO_MAXIMO_MS = 5 * 60 * 1000;

export function calcularRetrasoBackoff(numeroReintentos: number): number {
  const exponente = Math.max(0, numeroReintentos - 1);
  const retraso = RETRASO_BASE_MS * FACTOR_CRECIMIENTO ** exponente;
  return Math.min(retraso, RETRASO_MAXIMO_MS);
}

export function calcularProximoReintento(
  numeroReintentos: number,
  ahoraMs: number
): string {
  return new Date(ahoraMs + calcularRetrasoBackoff(numeroReintentos)).toISOString();
}

export function puedeReintentar(numeroReintentos: number): boolean {
  return numeroReintentos < MAX_REINTENTOS_SINCRONIZACION;
}

export function operacionListaParaReintento(
  proximoReintento: string | undefined,
  ahoraMs: number
): boolean {
  if (!proximoReintento) return true;
  return new Date(proximoReintento).getTime() <= ahoraMs;
}
