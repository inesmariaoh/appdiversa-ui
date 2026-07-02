'use client';

/**
 * Campo de texto accesible con etiqueta y mensaje de error.
 * WCAG 2.1 AAA: label vinculado, aria-invalid, aria-describedby, foco visible.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly etiqueta: string;
  readonly error?: string;
  readonly ayuda?: string;
}

export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(
  function CampoTexto({ etiqueta, error, ayuda, id, className, ...rest }, ref) {
    const idCampo = id ?? `campo-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`;
    const idError = error ? `${idCampo}-error` : undefined;
    const idAyuda = ayuda ? `${idCampo}-ayuda` : undefined;
    const describedBy = [idError, idAyuda].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor={idCampo}
          className="text-sm font-medium"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {etiqueta}
        </label>

        <input
          ref={ref}
          id={idCampo}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={['w-full rounded-lg px-4 text-sm transition-colors', className]
            .filter(Boolean)
            .join(' ')}
          style={{
            height: '48px',
            border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-borde-fuerte)'}`,
            backgroundColor: 'var(--color-fondo-tarjeta)',
            color: 'var(--color-texto-primario)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primario)';
            e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primario) 20%, transparent)';
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-borde-fuerte)';
            e.currentTarget.style.boxShadow = 'none';
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {ayuda && !error && (
          <p id={idAyuda} className="text-xs" style={{ color: 'var(--color-texto-muted)' }}>
            {ayuda}
          </p>
        )}

        {error && (
          <p
            id={idError}
            role="alert"
            className="text-xs font-medium"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
