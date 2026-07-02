'use client';

/**
 * Pagina de cierre de sesion Django.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export default function PaginaSalir() {
  const router = useRouter();
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  useEffect(() => {
    ejecutarSinEspera(
      cerrarSesion().then(() => {
        router.replace('/');
      }),
    );
  }, [cerrarSesion, router]);

  return (
    <ContenedorPagina etiquetaAria="Cerrar sesión">
      <p role="status" style={{ color: 'var(--color-texto-secundario)' }}>
        Cerrando sesión...
      </p>
    </ContenedorPagina>
  );
}
