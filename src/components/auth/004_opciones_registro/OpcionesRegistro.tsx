/**
 * Lista de opciones de registro: botones con icono + texto.
 * Los textos y rutas vienen del componente padre (desde API/config).
 * WCAG 2.1 AAA: role list, links accesibles, iconos aria-hidden.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export interface OpcionRegistro {
  id: string;
  etiqueta: string;
  href: string;
  icono: ReactNode;
}

interface OpcionesRegistroProps {
  readonly opciones: OpcionRegistro[];
}

export function OpcionesRegistro({ opciones }: OpcionesRegistroProps) {
  return (
    <ul className="flex flex-col gap-3 w-full" role="list">
      {opciones.map((opcion) => (
        <li key={opcion.id}>
          <Link
            href={opcion.href}
            className="flex items-center justify-center gap-3 w-full rounded-xl text-sm font-semibold transition-colors"
            style={{
              height: '48px',
              border: '1.5px solid var(--color-primario)',
              color: 'var(--color-primario)',
              minHeight: 'var(--tamano-control-min)',
              textDecoration: 'none',
            }}
            aria-label={opcion.etiqueta}
          >
            <span aria-hidden="true" className="flex items-center justify-center w-5 h-5">
              {opcion.icono}
            </span>
            <span>{opcion.etiqueta}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* Iconos reutilizables para las opciones de registro */

export function IconoCorreo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

export function IconoUsuario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function IconoCelular() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
