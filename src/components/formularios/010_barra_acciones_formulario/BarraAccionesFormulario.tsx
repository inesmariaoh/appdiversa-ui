'use client';

/**
 * Barra de acciones inferior del formulario — Figma parte06 / Wrapper(5).png.
 *
 * Acciones:
 *   1. "Guardar"          — boton primario, llama onGuardar
 *   2. "Ver otras encuestas" — boton contorno, navega a urlOtrasEncuestas
 *   3. "Enviar copia a mi correo" — boton fantasma/link, llama onEnviarCopia
 *      (deshabilitado si el usuario es anonimo o no hay sesion activa)
 *
 * Todos los textos de botones vienen de props para que puedan ser configurables desde API.
 */

import Link from 'next/link';
import { Boton } from '@/components/ui/001_boton';

interface BarraAccionesFormularioProps {
  readonly onGuardar: () => void;
  readonly guardando?: boolean;
  readonly urlOtrasEncuestas?: string;
  readonly onEnviarCopia?: () => void;
  readonly enviandoCopia?: boolean;
  /** Deshabilitar "Enviar copia" si el usuario no tiene sesion. */
  readonly puedeCopia?: boolean;
  /** Textos configurables desde API */
  readonly textoGuardar?: string;
  readonly textoVerOtras?: string;
  readonly textoEnviarCopia?: string;
}

export function BarraAccionesFormulario({
  onGuardar,
  guardando = false,
  urlOtrasEncuestas = '/',
  onEnviarCopia,
  enviandoCopia = false,
  puedeCopia = false,
  textoGuardar = 'Guardar',
  textoVerOtras = 'Ver otras encuestas',
  textoEnviarCopia = 'Enviar copia a mi correo',
}: BarraAccionesFormularioProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 pt-4"
      style={{ borderTop: '1px solid var(--color-borde)' }}
    >
      {/* Guardar — primario */}
      <Boton
        type="button"
        variante="primario"
        ancho="auto"
        cargando={guardando}
        onClick={onGuardar}
        aria-label={guardando ? 'Guardando respuestas...' : textoGuardar}
        className="shrink-0 whitespace-nowrap px-6"
        style={{
          paddingInline: '1.5rem',
          paddingBlock: '0.75rem',
          minWidth: '7.5rem',
        }}
      >
        {textoGuardar}
      </Boton>

      {/* Ver otras encuestas — contorno */}
      <Link
        href={urlOtrasEncuestas}
        className="shrink-0 whitespace-nowrap inline-flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--color-texto-primario)',
          borderColor: 'var(--color-borde-fuerte)',
          minHeight: 'var(--tamano-control-min, 44px)',
          paddingInline: '1.5rem',
          paddingBlock: '0.75rem',
        }}
      >
        {textoVerOtras}
      </Link>

      {/* Enviar copia — fantasma/link (deshabilitado si no puede) */}
      {onEnviarCopia && (
        <button
          type="button"
          onClick={puedeCopia ? onEnviarCopia : undefined}
          disabled={!puedeCopia || enviandoCopia}
          aria-label={obtenerAriaLabelEnviarCopia(
            puedeCopia,
            enviandoCopia,
            textoEnviarCopia
          )}
          className="shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium inline-flex items-center gap-2"
          style={{
            color: puedeCopia ? 'var(--color-primario)' : 'var(--color-texto-deshabilitado, #9ca3af)',
            background: 'none',
            border: 'none',
            cursor: puedeCopia ? 'pointer' : 'not-allowed',
            minHeight: '44px',
          }}
        >
          {enviandoCopia && <IconoSpinner />}
          {textoEnviarCopia}
        </button>
      )}
    </div>
  );
}

function obtenerAriaLabelEnviarCopia(
  puedeCopia: boolean,
  enviandoCopia: boolean,
  textoEnviarCopia: string
): string {
  if (!puedeCopia) {
    return 'Debes iniciar sesión para enviar una copia';
  }
  if (enviandoCopia) {
    return 'Enviando copia...';
  }
  return textoEnviarCopia;
}

function IconoSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
