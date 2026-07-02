'use client';

/**
 * Sincroniza respuestas y finaliza el formulario de forma automatica al reconectar.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  finalizarSesion,
  obtenerResumenSesion,
  validarFinalizacion,
} from '@/services/sesionesServicio';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';
import { contarOperacionesPendientes } from '@/storage/colaSincronizacion';
import { useSincronizacionOffline } from '@/hooks/useSincronizacionOffline';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const INTERVALO_REINTENTO_MS = 30000;

interface OpcionesSincronizacionAutomatica {
  listo: boolean;
  uuidFormulario: string;
  alFinalizarOffline?: (mensaje: string) => void;
}

export function useSincronizacionAutomatica({
  listo,
  uuidFormulario,
  alFinalizarOffline,
}: OpcionesSincronizacionAutomatica) {
  const router = useRouter();
  const enLinea = useOfflineStore((estado) => estado.enLinea);
  const finalizacionPendiente = useOfflineStore(
    (estado) => estado.finalizacionPendiente,
  );
  const establecerOperacionesPendientes = useOfflineStore(
    (estado) => estado.establecerOperacionesPendientes,
  );
  const establecerFinalizacionPendiente = useOfflineStore(
    (estado) => estado.establecerFinalizacionPendiente,
  );
  const { sincronizarPendientes } = useSincronizacionOffline();
  const procesandoEnvio = useRef(false);
  const sincronizandoEnCurso = useRef(false);
  const enLineaAnterior = useRef(enLinea);
  const sincronizacionInicialHecha = useRef(false);

  const actualizarConteoPendientes = useCallback(async () => {
    const { uuidSesion } = useSesionStore.getState();
    if (!uuidSesion) {
      return;
    }
    const total = await contarOperacionesPendientes(uuidSesion);
    establecerOperacionesPendientes(total);
  }, [establecerOperacionesPendientes]);

  const enviarFormularioPendiente = useCallback(async () => {
    if (procesandoEnvio.current) {
      return;
    }

    const estado = useOfflineStore.getState();
    if (!estado.enLinea || !estado.finalizacionPendiente) {
      return;
    }

    const destino = estado.uuidFormularioFinalizacion ?? uuidFormulario;
    const { uuidSesion, tokenCliente } = useSesionStore.getState();
    if (!uuidSesion || !tokenCliente) {
      return;
    }

    procesandoEnvio.current = true;
    try {
      const sincronizado = await sincronizarPendientes();
      if (!sincronizado) {
        return;
      }

      const credenciales = { uuidSesion, tokenCliente };
      const validacion = await validarFinalizacion(credenciales);
      if (!validacion.es_valido) {
        return;
      }

      const resultado = await finalizarSesion(credenciales);
      await obtenerResumenSesion(credenciales);
      establecerFinalizacionPendiente(false);
      alFinalizarOffline?.(
        resultado.mensaje ||
          'Su formulario fue enviado correctamente.',
      );
      router.push(`/encuestas/${destino}/resumen`);
    } finally {
      procesandoEnvio.current = false;
    }
  }, [
    alFinalizarOffline,
    establecerFinalizacionPendiente,
    router,
    sincronizarPendientes,
    uuidFormulario,
  ]);

  const sincronizarEnSegundoPlano = useCallback(async () => {
    const estado = useOfflineStore.getState();
    if (!estado.enLinea || estado.sincronizando || sincronizandoEnCurso.current) {
      return;
    }

    sincronizandoEnCurso.current = true;
    try {
      await sincronizarPendientes();
      await actualizarConteoPendientes();
      if (useOfflineStore.getState().finalizacionPendiente) {
        await enviarFormularioPendiente();
      }
    } finally {
      sincronizandoEnCurso.current = false;
    }
  }, [
    actualizarConteoPendientes,
    enviarFormularioPendiente,
    sincronizarPendientes,
  ]);

  useEffect(() => {
    if (!listo) {
      return;
    }
    ejecutarSinEspera(actualizarConteoPendientes());
  }, [actualizarConteoPendientes, listo]);

  useEffect(() => {
    if (!listo) {
      return;
    }

    const intervalo = setInterval(() => {
      if (useOfflineStore.getState().enLinea) {
        ejecutarSinEspera(sincronizarEnSegundoPlano());
      }
    }, INTERVALO_REINTENTO_MS);

    return () => clearInterval(intervalo);
  }, [listo, sincronizarEnSegundoPlano]);

  useEffect(() => {
    const reconectado = !enLineaAnterior.current && enLinea;
    enLineaAnterior.current = enLinea;

    if (!listo || !enLinea) {
      return;
    }

    const debeSincronizar =
      !sincronizacionInicialHecha.current ||
      reconectado ||
      finalizacionPendiente;

    if (!debeSincronizar) {
      return;
    }

    sincronizacionInicialHecha.current = true;
    ejecutarSinEspera(sincronizarEnSegundoPlano());
  }, [
    enLinea,
    finalizacionPendiente,
    listo,
    sincronizarEnSegundoPlano,
  ]);

  return { sincronizarEnSegundoPlano };
};
