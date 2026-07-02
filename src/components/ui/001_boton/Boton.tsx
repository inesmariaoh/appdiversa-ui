'use client';

/**
 * Componente de boton accesible y reutilizable.
 * Variantes: primario (fondo color-primario), secundario (fondo gris), contorno, fantasma.
 * Soporta: icono izquierda/derecha, estado cargando, deshabilitado.
 * WCAG 2.1 AAA: tamano minimo 44px, foco visible, aria correcto.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type VarianteBoton = 'primario' | 'secundario' | 'contorno' | 'fantasma' | 'acento';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variante?: VarianteBoton;
  readonly cargando?: boolean;
  readonly iconoIzquierda?: ReactNode;
  readonly iconoDerecha?: ReactNode;
  readonly ancho?: 'auto' | 'completo';
  readonly children: ReactNode;
}

const ESTILOS_VARIANTE: Record<VarianteBoton, React.CSSProperties> = {
  primario: {
    backgroundColor: 'var(--color-primario)',
    color: 'var(--color-texto-invertido)',
    border: 'none',
  },
  secundario: {
    backgroundColor: 'var(--color-fondo-pagina)',
    color: 'var(--color-texto-primario)',
    border: '1px solid var(--color-borde)',
  },
  contorno: {
    backgroundColor: 'transparent',
    color: 'var(--color-primario)',
    border: '1.5px solid var(--color-primario)',
  },
  fantasma: {
    backgroundColor: 'transparent',
    color: 'var(--color-primario)',
    border: 'none',
  },
  acento: {
    backgroundColor: 'var(--color-acento)',
    color: 'var(--color-texto-invertido)',
    border: 'none',
  },
};

export function Boton({
  variante = 'primario',
  cargando = false,
  iconoIzquierda,
  iconoDerecha,
  ancho = 'auto',
  disabled,
  children,
  className = '',
  style,
  ...props
}: BotonProps) {
  const estaDeshabilitado = disabled ?? cargando;

  return (
    <button
      {...props}
      disabled={estaDeshabilitado}
      aria-disabled={estaDeshabilitado}
      aria-busy={cargando}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ${ancho === 'completo' ? 'w-full' : ''} ${className}`}
      style={{
        ...ESTILOS_VARIANTE[variante],
        minHeight: 'var(--tamano-control-min)',
        paddingInline: '1.25rem',
        paddingBlock: '0.625rem',
        opacity: estaDeshabilitado ? 0.5 : 1,
        cursor: estaDeshabilitado ? 'not-allowed' : 'pointer',
        fontSize: '0.9375rem',
        ...style,
      }}
    >
      {cargando && <IconoCargando aria-hidden={true} />}
      {!cargando && iconoIzquierda}
      <span>{children}</span>
      {!cargando && iconoDerecha}
    </button>
  );
}

function IconoCargando({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden={ariaHidden}
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
    </svg>
  );
}

export function IconoChevronDerecha({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden={ariaHidden}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function IconoChevronIzquierda({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden={ariaHidden}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
