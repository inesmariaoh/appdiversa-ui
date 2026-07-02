'use client';
/**
 * Modal base accesible — elemento dialog nativo con backdrop.
 * WCAG 2.1 AAA: dialog semantico, aria-labelledby,
 * focus trap, Escape cierra, foco vuelve al elemento disparador.
 */

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModalProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly titulo: string;
  readonly descripcion?: string;
  readonly children: ReactNode;
  /** Ancho maximo del dialogo. Por defecto 'md' = max-w-md */
  readonly tamano?: 'sm' | 'md' | 'lg' | 'xl';
  /** Mostrar boton X en la esquina superior. Default: true */
  readonly mostrarBotonCerrar?: boolean;
  /** Alineacion horizontal del titulo y contenido. Default: 'left' */
  readonly alineacion?: 'left' | 'center';
}

const TAMANOS: Record<NonNullable<ModalProps['tamano']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl lg:max-w-4xl',
};

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  tamano = 'md',
  mostrarBotonCerrar = true,
  alineacion = 'left',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const centrado = alineacion === 'center';
  const idTitulo = useId();
  const idDescripcion = useId();

  useFocusTrap(dialogRef, abierto);

  // Escape cierra
  useEffect(() => {
    if (!abierto) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [abierto, onCerrar]);

  // Bloquear scroll del body mientras el modal esta abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.48)' }}
      aria-hidden="false"
    >
      {/* Capa de cierre al hacer clic en el backdrop */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onCerrar}
      />

      {/* Dialogo */}
      <dialog
        ref={dialogRef}
        open
        aria-labelledby={idTitulo}
        aria-describedby={descripcion ? idDescripcion : undefined}
        className={`relative w-full ${TAMANOS[tamano]} max-h-[70dvh] sm:max-h-[90dvh] flex flex-col rounded-2xl border-0 p-5 sm:p-8 shadow-2xl m-0`}
        style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
      >
        {/* Boton cerrar (X) */}
        {mostrarBotonCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar diálogo"
            className="absolute top-4 right-4 flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '36px',
              height: '36px',
              color: 'var(--color-texto-secundario)',
            }}
          >
            <IconoCerrar />
          </button>
        )}

        {/* Titulo (accesible via aria-labelledby) */}
        <h2
          id={idTitulo}
          className={`shrink-0 font-bold mb-4 ${centrado ? 'text-center px-8' : 'pr-8'} ${tamano === 'xl' ? 'text-2xl leading-snug' : 'text-xl'}`}
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {titulo}
        </h2>

        {descripcion && (
          <p id={idDescripcion} className="sr-only">
            {descripcion}
          </p>
        )}

        <div className="min-h-0 flex-1 flex flex-col overflow-y-auto">
          {children}
        </div>
      </dialog>
    </div>
  );
}

function IconoCerrar() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="15" y1="5" x2="5" y2="15" />
      <line x1="5" y1="5" x2="15" y2="15" />
    </svg>
  );
}
