'use client';

/**
 * Resumen de estado de sincronizacion offline con reintento manual.
 */

import { Boton } from '@/components/ui/001_boton';
import { useSincronizacionOffline } from '@/hooks/useSincronizacionOffline';
import { useOfflineStore } from '@/store/offlineStore';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export function EstadoSincronizacion() {
  const operacionesPendientes = useOfflineStore(
    (estado) => estado.operacionesPendientes
  );
  const sincronizando = useOfflineStore((estado) => estado.sincronizando);
  const enLinea = useOfflineStore((estado) => estado.enLinea);
  const ultimoResultado = useOfflineStore((estado) => estado.ultimoResultado);
  const { sincronizarPendientes } = useSincronizacionOffline();

  const errores = ultimoResultado?.errores.length ?? 0;
  const conflictos = ultimoResultado?.conflictos.length ?? 0;
  const pendienteSync = operacionesPendientes > 0;

  return (
    <div
      className="text-sm rounded-lg p-3 flex flex-col gap-2"
      style={{
        backgroundColor: 'var(--color-fondo-pagina)',
        color: 'var(--color-texto-secundario)',
      }}
      role="status"
      aria-live="polite"
    >
      <p>
        {pendienteSync ? 'Pendiente de sincronizar' : 'Sincronizado'}:{' '}
        {operacionesPendientes} operación(es)
        {sincronizando ? ' (sincronizando...)' : ''}
      </p>
      {conflictos > 0 && (
        <p style={{ color: 'var(--color-error)' }}>
          Conflictos en último lote: {conflictos}
        </p>
      )}
      {errores > 0 && (
        <p style={{ color: 'var(--color-error)' }}>
          Errores en último lote: {errores}
        </p>
      )}
      {enLinea && pendienteSync && !sincronizando && (
        <Boton
          type="button"
          variante="fantasma"
          ancho="auto"
          onClick={() => ejecutarSinEspera(sincronizarPendientes())}
        >
          Reintentar sincronización
        </Boton>
      )}
    </div>
  );
}
