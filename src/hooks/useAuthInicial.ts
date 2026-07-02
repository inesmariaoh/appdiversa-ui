'use client';

/**
 * Carga el perfil de autenticacion al montar la aplicacion en cliente.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export function useAuthInicial() {
  const cargarPerfil = useAuthStore((s) => s.cargarPerfil);
  const inicializado = useAuthStore((s) => s.inicializado);
  const autenticado = useAuthStore((s) => s.autenticado);
  const cargando = useAuthStore((s) => s.cargando);
  const usuario = useAuthStore((s) => s.usuario);
  const grupos = useAuthStore((s) => s.grupos);
  const permisos = useAuthStore((s) => s.permisos);

  useEffect(() => {
    if (!inicializado) {
      ejecutarSinEspera(cargarPerfil());
    }
  }, [cargarPerfil, inicializado]);

  return { autenticado, cargando, inicializado, usuario, grupos, permisos };
}
