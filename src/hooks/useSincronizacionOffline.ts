'use client';

/**
 * Sincroniza la cola offline mediante POST /sincronizacion/ al reconectar.
 */

import { useCallback } from 'react';
import { sincronizarBatch } from '@/services/sincronizacionServicio';
import { evaluarReglasSesion } from '@/services/reglasServicio';
import { useSesionStore } from '@/store/sesionStore';
import { useReglasStore } from '@/store/reglasStore';
import { useOfflineStore } from '@/store/offlineStore';
import {
  eliminarOperacionCola,
  marcarOperacionEstado,
  obtenerOperacionesPendientes,
  reactivarOperacionesReintentables,
  registrarErrorSincronizacion,
} from '@/storage/colaSincronizacion';
import { calcularProximoReintento } from '@/utils/backoffSincronizacion';
import { extraerDetalleError } from '@/utils/erroresApi';

const VERSION_APP = '0.1.0';

async function marcarOperacionFallida(
  operacion: { uuid_local: string; numero_reintentos?: number },
  detalle: string
): Promise<void> {
  const nuevosReintentos = (operacion.numero_reintentos ?? 0) + 1;
  await marcarOperacionEstado(operacion.uuid_local, 'error', {
    numero_reintentos: nuevosReintentos,
    proximo_reintento: calcularProximoReintento(nuevosReintentos, Date.now()),
  });
  await registrarErrorSincronizacion(operacion.uuid_local, detalle);
}

export function useSincronizacionOffline() {
  const establecerSincronizando = useOfflineStore((s) => s.establecerSincronizando);
  const establecerUltimoResultado = useOfflineStore(
    (s) => s.establecerUltimoResultado
  );
  const establecerOperacionesPendientes = useOfflineStore(
    (s) => s.establecerOperacionesPendientes
  );
  const establecerResultadoReglas = useReglasStore((s) => s.establecerResultado);

  const sincronizarPendientes = useCallback(async (): Promise<boolean> => {
    const { uuidSesion, tokenCliente } = useSesionStore.getState();
    if (!uuidSesion || !tokenCliente) return false;

    await reactivarOperacionesReintentables(uuidSesion, Date.now());

    const pendientes = await obtenerOperacionesPendientes(uuidSesion);
    if (pendientes.length === 0) {
      establecerOperacionesPendientes(0);
      return true;
    }

    establecerSincronizando(true);
    try {
      const credenciales = { uuidSesion, tokenCliente };
      const resultado = await sincronizarBatch(
        {
          uuid_sesion: uuidSesion,
          token_cliente: tokenCliente,
          dispositivo: navigator.userAgent.slice(0, 150),
          version_app: VERSION_APP,
          operaciones: pendientes.map(({ uuid_local, codigo_pregunta, valor, version_cliente, fecha_cliente, checksum }) => ({
            uuid_local,
            codigo_pregunta,
            valor,
            version_cliente,
            fecha_cliente,
            checksum,
          })),
        },
        credenciales
      );

      establecerUltimoResultado(resultado);

      const uuidsFallidos = new Set([
        ...resultado.errores.map((item) => item.uuid_local),
        ...resultado.conflictos.map((item) => item.uuid_local),
      ]);

      for (const operacion of pendientes) {
        if (uuidsFallidos.has(operacion.uuid_local)) {
          const detalle =
            resultado.errores.find((e) => e.uuid_local === operacion.uuid_local)
              ?.mensaje ??
            resultado.conflictos.find((c) => c.uuid_local === operacion.uuid_local)
              ?.mensaje ??
            'Error de sincronizacion';
          await marcarOperacionFallida(operacion, detalle);
        } else {
          await eliminarOperacionCola(operacion.uuid_local);
        }
      }

      try {
        const reglas = await evaluarReglasSesion(credenciales);
        establecerResultadoReglas(reglas);
      } catch {
        // La evaluacion de reglas no bloquea la sincronizacion.
      }

      const restantes = await obtenerOperacionesPendientes(uuidSesion);
      establecerOperacionesPendientes(restantes.length);
      return uuidsFallidos.size === 0;
    } catch (err) {
      await registrarErrorSincronizacion(
        pendientes[0]?.uuid_local ?? 'desconocido',
        extraerDetalleError(err)
      );
      return false;
    } finally {
      establecerSincronizando(false);
    }
  }, [
    establecerOperacionesPendientes,
    establecerResultadoReglas,
    establecerSincronizando,
    establecerUltimoResultado,
  ]);

  return { sincronizarPendientes };
}
