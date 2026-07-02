'use client';

/**
 * Aviso discreto cuando no hay conexion; la sincronizacion es automatica.
 */

import { useOfflineStore } from '@/store/offlineStore';

const MENSAJE_SIN_CONEXION =
  'No hay conexión a internet. Sus respuestas se guardaron en este dispositivo y se enviarán automáticamente cuando se restablezca la conexión.';

export function AvisoConexionOffline() {
  const enLinea = useOfflineStore((estado) => estado.enLinea);
  const finalizacionPendiente = useOfflineStore(
    (estado) => estado.finalizacionPendiente,
  );

  if (enLinea && !finalizacionPendiente) {
    return null;
  }

  const mensaje = finalizacionPendiente && enLinea
    ? 'Enviando su formulario...'
    : MENSAJE_SIN_CONEXION;

  return (
    <div
      className="rounded-lg p-3 text-sm"
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: 'var(--color-fondo-pagina)',
        color: 'var(--color-texto-secundario)',
      }}
    >
      <p>{mensaje}</p>
    </div>
  );
}
