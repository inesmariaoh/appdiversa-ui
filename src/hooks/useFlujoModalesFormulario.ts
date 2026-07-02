'use client';

/**
 * Centraliza estado y acciones del flujo generico de modales de formulario.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppTheme } from '@/components/layout/007_app_theme';
import { useAuthStore } from '@/store/authStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { useSesionStore } from '@/store/sesionStore';
import {
  guardarAceptacionTerminos,
  obtenerAceptacionTerminos,
} from '@/storage/aceptacionesTerminos';
import { limpiarProgresoLocalSesion } from '@/storage/limpiarProgresoSesion';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';
import { resolverDestinoPostAuth } from '@/utils/destinoPostAuth';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import type { FlujoFormularioInterfaz } from '@/types/interfaz';

export type ModalFormularioActivo = 'terminos' | 'salir' | 'sesion' | 'guardado' | null;

export type IntencionFlujoModal = 'guardar_progreso' | 'salir' | 'finalizar';

interface OpcionesFlujoModales {
  readonly uuidFormulario: string;
  readonly rutaActual: string;
  readonly destinoPostAuth?: string;
  readonly deshabilitado?: boolean;
}

function construirUrlAuth(
  base: string,
  rutaActual: string,
  uuidFormulario: string,
  uuidSesion: string | null,
  tokenCliente: string | null,
  intencion: IntencionFlujoModal,
  destinoPostAuth?: string,
): string {
  const destino = resolverDestinoPostAuth(rutaActual, destinoPostAuth);
  const params = new URLSearchParams({
    destino,
    uuid_formulario: uuidFormulario,
    intencion,
  });
  if (uuidSesion) {
    params.set('uuid_sesion', uuidSesion);
  }
  if (tokenCliente) {
    params.set('token_cliente', tokenCliente);
  }
  return `${base}?${params.toString()}`;
}

export function useFlujoModalesFormulario({
  uuidFormulario,
  rutaActual,
  destinoPostAuth,
  deshabilitado = false,
}: OpcionesFlujoModales) {
  const router = useRouter();
  const { configuracion } = useAppTheme();
  const autenticado = useAuthStore((s) => s.autenticado);

  const textos: FlujoFormularioInterfaz =
    configuracion.flujo_formulario ?? FLUJO_FORMULARIO_FALLBACK;

  const [modalActivo, setModalActivo] = useState<ModalFormularioActivo>(null);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [verificandoTerminos, setVerificandoTerminos] = useState(false);
  const [destinoSalida, setDestinoSalida] = useState<string>('/');
  const [terminosSoloLectura, setTerminosSoloLectura] = useState(false);

  const uuidSesion = useSesionStore((s) => s.uuidSesion);
  const tokenCliente = useSesionStore((s) => s.tokenCliente);
  const debeVerificarTerminos = !deshabilitado && Boolean(uuidSesion);

  const urlLogin = useMemo(
    () =>
      construirUrlAuth(
        '/auth/login',
        rutaActual,
        uuidFormulario,
        uuidSesion,
        tokenCliente,
        'guardar_progreso',
        destinoPostAuth,
      ),
    [destinoPostAuth, rutaActual, uuidFormulario, uuidSesion, tokenCliente]
  );

  const urlRegistro = useMemo(
    () =>
      construirUrlAuth(
        '/auth/registro',
        rutaActual,
        uuidFormulario,
        uuidSesion,
        tokenCliente,
        'guardar_progreso',
        destinoPostAuth,
      ),
    [destinoPostAuth, rutaActual, uuidFormulario, uuidSesion, tokenCliente]
  );

  const tieneProgresoNoGuardado = useCallback((): boolean => {
    const respuestas = useRespuestasStore.getState().respuestas;
    const tieneRespuestas = Object.keys(respuestas).length > 0;
    const pendientes = useOfflineStore.getState().operacionesPendientes > 0;
    return tieneRespuestas || pendientes;
  }, []);

  useEffect(() => {
    if (!debeVerificarTerminos || !uuidSesion) {
      return;
    }

    let cancelado = false;
    const sesionActual = uuidSesion;

    async function verificarTerminos() {
      setVerificandoTerminos(true);
      try {
        const aceptacion = await obtenerAceptacionTerminos(
          sesionActual,
          uuidFormulario
        );
        if (cancelado) return;
        if (aceptacion) {
          setTerminosAceptados(true);
          setModalActivo(null);
        } else {
          setTerminosAceptados(false);
          setTerminosSoloLectura(false);
          setModalActivo('terminos');
        }
      } finally {
        if (!cancelado) setVerificandoTerminos(false);
      }
    }

    ejecutarSinEspera(verificarTerminos());

    return () => {
      cancelado = true;
    };
  }, [debeVerificarTerminos, uuidFormulario, uuidSesion]);

  const cerrarModal = useCallback(() => {
    setModalActivo(null);
    setTerminosSoloLectura(false);
  }, []);

  const abrirTerminos = useCallback(() => {
    setTerminosSoloLectura(true);
    setModalActivo('terminos');
  }, []);

  const aceptarTerminos = useCallback(async () => {
    const sesion = useSesionStore.getState().uuidSesion;
    if (!sesion) return;

    await guardarAceptacionTerminos({
      uuid_sesion: sesion,
      uuid_formulario: uuidFormulario,
      version_texto_terminos: textos.terminos.titulo,
    });
    setTerminosAceptados(true);
    setTerminosSoloLectura(false);
    setModalActivo(null);
  }, [textos.terminos.titulo, uuidFormulario]);

  const solicitarSalida = useCallback(
    (destino: string) => {
      if (!tieneProgresoNoGuardado()) {
        router.push(destino);
        return;
      }
      setDestinoSalida(destino);
      setModalActivo('salir');
    },
    [router, tieneProgresoNoGuardado]
  );

  const volverDesdeSalida = useCallback(() => {
    setModalActivo(null);
  }, []);

  const confirmarSalidaSinGuardar = useCallback(async () => {
    const sesion = useSesionStore.getState().uuidSesion;
    if (sesion) {
      await limpiarProgresoLocalSesion(sesion);
      useSesionStore.getState().limpiar();
    }
    setModalActivo(null);
    router.push(destinoSalida);
  }, [destinoSalida, router]);

  const abrirSesionRegistro = useCallback(() => {
    setModalActivo('sesion');
  }, []);

  const mostrarEncuestaGuardada = useCallback(() => {
    setModalActivo('guardado');
  }, []);

  const confirmarSeguirViendo = useCallback(() => {
    setModalActivo(null);
  }, []);

  const ofrecerGuardarProgreso = useCallback(() => {
    if (autenticado) {
      mostrarEncuestaGuardada();
      return;
    }
    abrirSesionRegistro();
  }, [autenticado, abrirSesionRegistro, mostrarEncuestaGuardada]);

  const irAOtrasEncuestas = useCallback(() => {
    setModalActivo(null);
    router.push('/encuestas');
  }, [router]);

  return {
    textos,
    modalActivo,
    terminosAceptados: deshabilitado || terminosAceptados,
    verificandoTerminos: debeVerificarTerminos && verificandoTerminos,
    terminosSoloLectura,
    destinoSalida,
    urlLogin,
    urlRegistro,
    cerrarModal,
    abrirTerminos,
    aceptarTerminos,
    solicitarSalida,
    volverDesdeSalida,
    confirmarSalidaSinGuardar,
    abrirSesionRegistro,
    mostrarEncuestaGuardada,
    confirmarSeguirViendo,
    ofrecerGuardarProgreso,
    irAOtrasEncuestas,
    tieneProgresoNoGuardado,
  };
}

export type FlujoModalesFormularioValor = ReturnType<typeof useFlujoModalesFormulario>;
