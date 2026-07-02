'use client';
/**
 * Dropdown de perfil de usuario autenticado en el encabezado.
 * Diseno: Perfil Dropdown.png (parte04).
 * WCAG 2.1 AAA: aria-haspopup, aria-expanded, role="menu/menuitem", Escape cierra.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface ItemMenu {
  etiqueta: string;
  href?: string;
}

interface MenuPerfilProps {
  readonly urlTerminos?: string;
}

export function MenuPerfil({ urlTerminos = '/terminos-condiciones' }: MenuPerfilProps) {
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);

  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  const identificador = usuario?.email || usuario?.username || 'Usuario';

  const cerrarMenu = useCallback(() => {
    setAbierto(false);
    botonRef.current?.focus();
  }, []);

  const handleCerrarSesion = useCallback(() => {
    cerrarMenu();
    ejecutarSinEspera(cerrarSesion());
  }, [cerrarMenu, cerrarSesion]);

  // Escape cierra el menu
  useEffect(() => {
    if (!abierto) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrarMenu();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [abierto, cerrarMenu]);

  // Click fuera cierra el menu
  useEffect(() => {
    if (!abierto) return;
    function handleClickFuera(e: MouseEvent) {
      const target = e.target;
      if (
        menuRef.current &&
        (!(target instanceof Node) || !menuRef.current.contains(target))
      ) {
        cerrarMenu();
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto, cerrarMenu]);

  const items: ItemMenu[] = [
    { etiqueta: 'Encuestas', href: '/encuestas' },
    { etiqueta: 'Historial de respuestas', href: '/mis-respuestas' },
    { etiqueta: 'Tus datos', href: '/perfil' },
    { etiqueta: 'Términos y condiciones', href: urlTerminos },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        ref={botonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Menú de perfil — ${identificador}`}
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          border: '1.5px solid var(--color-borde)',
          color: 'var(--color-texto-primario)',
          backgroundColor: 'var(--color-fondo-tarjeta)',
          minHeight: 'var(--tamano-control-min)',
        }}
      >
        <span className="flex flex-col items-start leading-tight">
          <span className="text-xs" style={{ color: 'var(--color-texto-muted)' }}>
            ¡Bienvenido!
          </span>
          <span className="font-medium max-w-[160px] truncate">{identificador}</span>
        </span>
        <IconoChevron
          className="shrink-0 transition-transform duration-200"
          style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      {abierto && (
        <div
          role="menu"
          aria-label="Opciones de perfil"
          className="absolute right-0 mt-1 min-w-[220px] rounded-xl py-1 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--color-fondo-tarjeta)',
            border: '1px solid var(--color-borde)',
          }}
        >
          {items.map((item) => (
              <Link
                key={item.etiqueta}
                href={item.href ?? '#'}
                role="menuitem"
                onClick={cerrarMenu}
                className="flex items-center px-4 py-2.5 text-sm transition-colors"
                style={{ color: 'var(--color-texto-primario)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'color-mix(in srgb, var(--color-primario) 8%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.etiqueta}
              </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
            style={{ color: 'var(--color-error, #dc2626)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'color-mix(in srgb, var(--color-primario) 8%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span>Cerrar sesión</span>
            <IconoSalir aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

interface IconoChevronProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function IconoChevron({
  className,
  style,
}: IconoChevronProps) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconoSalir() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l3-3-3-3M13 8H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
