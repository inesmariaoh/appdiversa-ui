/**
 * Modulos de analitica y Power BI (esqueleto sin implementacion funcional).
 */

export const MODULO_ANALYTICS = {
  dashboard: '/analytics/dashboard',
  visorBi: '/analytics/visor-bi',
  reportes: '/analytics/reportes',
} as const;

export function moduloAnalyticsDisponible(): boolean {
  return false;
}
