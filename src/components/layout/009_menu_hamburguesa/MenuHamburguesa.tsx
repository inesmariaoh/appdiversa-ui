'use client';

/**
 * Drawer de navegacion global accesible para pantallas medianas y pequenas.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useAuthStore } from '@/store/authStore';
import {
  GRUPO_ADMINISTRADOR_GENERAL,
  PERMISO_FORMULARIOS_VER,
} from '@/types/auth';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface EnlaceMenu {
  etiqueta: string;
  href: string;
  visible?: boolean;
}

interface MenuHamburguesaProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly textoContacto: string;
  readonly urlContacto: string;
}

export function MenuHamburguesa({
  abierto,
  onCerrar,
  textoContacto,
  urlContacto,
}: MenuHamburguesaProps) {
  const drawerRef = useRef<HTMLDialogElement>(null);
  const autenticado = useAuthStore((s) => s.autenticado);
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  const tieneRol = useAuthStore((s) => s.tieneRol);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  useFocusTrap(drawerRef, abierto);

  useEffect(() => {
    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar();
    }
    if (abierto) {
      document.addEventListener('keydown', cerrarConEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const mostrarAdmin =
    autenticado &&
    (tienePermiso(PERMISO_FORMULARIOS_VER) || tieneRol(GRUPO_ADMINISTRADOR_GENERAL));

  const enlaces: EnlaceMenu[] = [
    { etiqueta: 'Inicio', href: '/' },
    { etiqueta: 'Encuestas', href: '/encuestas' },
    { etiqueta: textoContacto, href: urlContacto },
    { etiqueta: 'Registro', href: '/auth/registro', visible: !autenticado },
    { etiqueta: 'Perfil', href: '/perfil', visible: autenticado },
    {
      etiqueta: autenticado ? 'Cerrar sesión' : 'Iniciar sesión',
      href: autenticado ? '/auth/salir' : '/auth/login',
    },
    {
      etiqueta: 'Panel administrativo',
      href: '/admin/formularios',
      visible: mostrarAdmin,
    },
  ].filter((item) => item.visible !== false);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        aria-hidden="true"
        onClick={onCerrar}
      />
      <dialog
        ref={drawerRef}
        id="menu-global-drawer"
        open
        className="fixed top-0 left-0 z-50 h-full w-72 border-0 m-0 p-4 shadow-xl md:hidden"
        style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
        aria-label="Menú de navegación"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-texto-primario)' }}>
            Menú
          </h2>
          <button
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={onCerrar}
            className="rounded-lg p-2"
            style={{ minWidth: 'var(--tamano-control-min)', minHeight: 'var(--tamano-control-min)' }}
          >
            <IconoCerrar />
          </button>
        </div>
        <nav aria-label="Enlaces principales">
          <ul className="flex flex-col gap-1">
            {enlaces.map((enlace) => (
              <li key={enlace.href + enlace.etiqueta}>
                {enlace.etiqueta === 'Cerrar sesión' ? (
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium"
                    style={{
                      color: 'var(--color-texto-primario)',
                      minHeight: 'var(--tamano-control-min)',
                    }}
                    onClick={() => {
                      onCerrar();
                      ejecutarSinEspera(cerrarSesion().then(() => {
                        globalThis.location.href = '/';
                      }));
                    }}
                  >
                    {enlace.etiqueta}
                  </button>
                ) : (
                  <Link
                    href={enlace.href}
                    className="block px-4 py-3 rounded-lg text-sm font-medium"
                    style={{
                      color: 'var(--color-texto-primario)',
                      minHeight: 'var(--tamano-control-min)',
                    }}
                    onClick={onCerrar}
                  >
                    {enlace.etiqueta}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}

function IconoCerrar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
