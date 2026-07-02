/**
 * Ejecuta una promesa sin bloquear el hilo principal y absorbe rechazos silenciosos.
 */
export function ejecutarSinEspera(promesa: Promise<unknown>): void {
  Promise.resolve(promesa).catch(() => undefined);
}
