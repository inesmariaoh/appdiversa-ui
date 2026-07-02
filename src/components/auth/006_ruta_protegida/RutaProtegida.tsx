'use client';

/**
 * Guard de ruta que exige autenticacion Django.
 * Redirige a /auth/login si el usuario no ha iniciado sesion.
 */

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface RutaProtegidaProps {
  readonly children: ReactNode;
  readonly rutaLogin?: string;
}

export function RutaProtegida({
  children,
  rutaLogin = '/auth/login',
}: RutaProtegidaProps) {
  const router = useRouter();
  const autenticado = useAuthStore((s) => s.autenticado);
  const cargando = useAuthStore((s) => s.cargando);
  const inicializado = useAuthStore((s) => s.inicializado);
  const cargarPerfil = useAuthStore((s) => s.cargarPerfil);

  useEffect(() => {
    if (!inicializado) {
      ejecutarSinEspera(cargarPerfil());
    }
  }, [cargarPerfil, inicializado]);

  useEffect(() => {
    if (inicializado && !cargando && !autenticado) {
      router.replace(rutaLogin);
    }
  }, [autenticado, cargando, inicializado, router, rutaLogin]);

  if (!inicializado || cargando) {
    return <SkeletonFormulario />;
  }

  if (!autenticado) {
    return null;
  }

  return children;
}
