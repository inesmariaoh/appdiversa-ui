'use client';

/**
 * Detecta estado de conexion con navigator.onLine y heartbeat al backend.
 */

import { useEffect } from 'react';
import { verificarSaludApi } from '@/services/saludServicio';
import { useOfflineStore } from '@/store/offlineStore';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const INTERVALO_HEARTBEAT_MS = 30_000;

export function useConectividad(): boolean {
  const enLinea = useOfflineStore((s) => s.enLinea);
  const establecerEnLinea = useOfflineStore((s) => s.establecerEnLinea);

  useEffect(() => {
    async function verificarConexion() {
      if (!navigator.onLine) {
        establecerEnLinea(false);
        return;
      }
      const salud = await verificarSaludApi();
      establecerEnLinea(salud);
    }

    ejecutarSinEspera(verificarConexion());

    const onCambioRed = () => ejecutarSinEspera(verificarConexion());
    window.addEventListener('online', onCambioRed);
    window.addEventListener('offline', onCambioRed);

    const intervalo = setInterval(() => ejecutarSinEspera(verificarConexion()), INTERVALO_HEARTBEAT_MS);

    return () => {
      window.removeEventListener('online', onCambioRed);
      window.removeEventListener('offline', onCambioRed);
      clearInterval(intervalo);
    };
  }, [establecerEnLinea]);

  return enLinea;
}
