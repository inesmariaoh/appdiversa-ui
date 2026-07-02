'use client';

/**
 * Indicador de conexion a red segun estado del offlineStore.
 */

import { useOfflineStore } from '@/store/offlineStore';

export function IndicadorConexion() {
  const enLinea = useOfflineStore((estado) => estado.enLinea);

  return (
    <output
      className="text-xs font-medium px-2 py-1 rounded"
      style={{
        backgroundColor: enLinea
          ? 'var(--color-acento)'
          : 'var(--color-secundario)',
        color: 'var(--color-fondo-tarjeta)',
      }}
      aria-live="polite"
    >
      {enLinea ? 'En línea' : 'Sin conexión'}
    </output>
  );
}
