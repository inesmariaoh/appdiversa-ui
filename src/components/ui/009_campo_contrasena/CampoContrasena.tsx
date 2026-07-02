'use client';

/**
 * Campo de contraseña con boton de mostrar/ocultar.
 * WCAG 2.1 AAA: label vinculado, aria-invalid, aria-describedby,
 * boton con aria-label dinamico, autocomplete correcto.
 */

import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface CampoContrasenaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly etiqueta: string;
  readonly error?: string;
  readonly ayuda?: string;
}

export const CampoContrasena = forwardRef<HTMLInputElement, CampoContrasenaProps>(
  function CampoContrasena({ etiqueta, error, ayuda, id, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    const idCampo = id ?? `campo-contrasena-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`;
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

        <div className="relative w-full">
          <input
            ref={ref}
            id={idCampo}
            type={visible ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            autoComplete={rest.autoComplete ?? 'current-password'}
            className="w-full rounded-lg px-4 pr-12 text-sm transition-colors"
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

          {/* Boton mostrar / ocultar contraseña */}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded"
            style={{
              color: 'var(--color-texto-muted)',
              minWidth: '32px',
              minHeight: '32px',
            }}
          >
            {visible ? <IconoOcultar /> : <IconoMostrar />}
          </button>
        </div>

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

function IconoMostrar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconoOcultar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
