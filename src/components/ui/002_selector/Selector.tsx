'use client';

/**
 * Componente selector (dropdown) accesible.
 * Basado en el diseno Figma: borde gris, redondeado, chevron, borde primario al foco.
 * Usa <select> nativo para maxima accesibilidad (lectores de pantalla, teclado).
 * WCAG 2.1 AAA: label vinculado, aria-required, aria-invalid, aria-describedby.
 */

import type { SelectHTMLAttributes } from 'react';

interface OpcionSelector {
  valor: string;
  etiqueta: string;
}

interface SelectorProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  readonly id: string;
  readonly etiqueta: string;
  readonly opciones: OpcionSelector[];
  readonly placeholder?: string;
  readonly error?: string;
  readonly idDescripcion?: string;
  readonly mostrarTextoError?: boolean;
}

export function Selector({
  id,
  etiqueta,
  opciones,
  placeholder,
  error,
  idDescripcion,
  mostrarTextoError = true,
  required,
  disabled,
  className = '',
  style,
  ...props
}: SelectorProps) {
  const idError = error ? `${id}-error` : undefined;
  const describedBy = [idDescripcion, idError].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        {etiqueta}
        {required && (
          <span aria-hidden="true" style={{ color: 'var(--color-error)', marginLeft: '2px' }}>
            *
          </span>
        )}
      </label>

      <div className="relative">
        <select
          {...props}
          id={id}
          required={required}
          disabled={disabled}
          aria-required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className="w-full appearance-none rounded-lg pr-10 pl-3 py-2.5 text-sm transition-colors"
          style={{
            border: error
              ? '1.5px solid var(--color-error)'
              : '1.5px solid var(--color-borde-fuerte)',
            backgroundColor: disabled
              ? 'var(--color-deshabilitado-fondo)'
              : 'var(--color-fondo-tarjeta)',
            color: 'var(--color-texto-primario)',
            minHeight: 'var(--tamano-control-min)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primario)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,36,132,0.15)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'var(--color-error)'
              : 'var(--color-borde-fuerte)';
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>

        {/* Icono chevron */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--color-texto-muted)' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {error && mostrarTextoError && (
        <p
          id={idError}
          role="alert"
          className="text-xs mt-0.5"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export type { OpcionSelector };
