'use client';

/**
 * Menu lateral administrativo responsive con hamburguesa en pantallas pequenas.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useAuthStore } from '@/store/authStore';
import {
  PERMISO_FORMULARIOS_VER,
} from '@/types/auth';

interface ItemMenu {
  etiqueta: string;
  href: string;
  deshabilitado?: boolean;
  futuro?: boolean;
}

const ITEMS_MENU: ItemMenu[] = [
  { etiqueta: 'Formularios', href: '/admin/formularios' },
  {
    etiqueta: 'Usuarios',
    href: '/admin/usuarios',
  },
  { etiqueta: 'Catálogos', href: '/admin/catalogos' },
  { etiqueta: 'Configuración', href: '/admin/configuracion' },
  { etiqueta: 'Analítica', href: '/admin/analitica', futuro: true, deshabilitado: true },
];

export function MenuLateralAdmin() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  const esAdministrador = useAuthStore((s) => s.esAdministrador);
  const autenticado = useAuthStore((s) => s.autenticado);

  useFocusTrap(drawerRef, abierto);

  useEffect(() => {
    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false);
    }
    if (abierto) {
      document.addEventListener('keydown', cerrarConEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
      document.body.style.overflow = '';
    };
  }, [abierto]);

  const itemsVisibles = ITEMS_MENU.filter((item) => {
    if (
      item.href === '/admin/usuarios' ||
      item.href === '/admin/catalogos' ||
      item.href === '/admin/configuracion'
    ) {
      return esAdministrador();
    }
    if (item.href === '/admin/formularios') {
      return tienePermiso(PERMISO_FORMULARIOS_VER) || autenticado;
    }
    return true;
  });

  const contenidoMenu = (
    <ul className="flex flex-col gap-1" role="list">
      {itemsVisibles.map((item) => {
        const activo = pathname.startsWith(item.href);
        const clases = item.deshabilitado
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : '';

        return (
          <li key={item.href}>
            {item.deshabilitado ? (
              <span
                className={`block px-4 py-3 rounded-lg text-sm ${clases}`}
                style={{ color: 'var(--color-texto-muted)' }}
              >
                {item.etiqueta}
                {item.futuro && (
                  <span className="ml-2 text-xs">(próximamente)</span>
                )}
              </span>
            ) : (
              <Link
                href={item.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${clases}`}
                style={{
                  backgroundColor: activo
                    ? 'color-mix(in srgb, var(--color-primario) 12%, transparent)'
                    : 'transparent',
                  color: activo
                    ? 'var(--color-primario)'
                    : 'var(--color-texto-primario)',
                  minHeight: 'var(--tamano-control-min)',
                }}
                aria-current={activo ? 'page' : undefined}
                onClick={() => setAbierto(false)}
              >
                {item.etiqueta}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <button
        type="button"
        className="lg:hidden flex items-center justify-center rounded-lg border mb-4"
        style={{
          minWidth: 'var(--tamano-control-min)',
          minHeight: 'var(--tamano-control-min)',
          borderColor: 'var(--color-borde)',
          color: 'var(--color-texto-primario)',
        }}
        aria-label="Abrir menú administrativo"
        aria-expanded={abierto}
        aria-controls="menu-admin-drawer"
        onClick={() => setAbierto(true)}
      >
        <IconoMenu />
      </button>

      <aside
        className="hidden lg:block w-56 shrink-0"
        aria-label="Menú administrativo"
      >
        <nav>{contenidoMenu}</nav>
      </aside>

      {abierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-hidden="true"
            onClick={() => setAbierto(false)}
          />
          <aside
            ref={drawerRef}
            id="menu-admin-drawer"
            className="fixed top-0 left-0 z-50 h-full w-72 p-4 shadow-xl lg:hidden"
            style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
            aria-label="Menú administrativo"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--color-texto-primario)' }}
              >
                Panel administrativo
              </h2>
              <button
                type="button"
                aria-label="Cerrar menú administrativo"
                onClick={() => setAbierto(false)}
                className="rounded-lg p-2"
                style={{ minWidth: 'var(--tamano-control-min)', minHeight: 'var(--tamano-control-min)' }}
              >
                <IconoCerrar />
              </button>
            </div>
            <nav>{contenidoMenu}</nav>
          </aside>
        </>
      )}
    </>
  );
}

function IconoMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
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
