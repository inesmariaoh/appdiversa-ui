'use client';

/**
 * Boton reutilizable que lee en voz alta el texto recibido usando la
 * Web Speech API (texto a voz). No renderiza nada si el navegador no soporta
 * la sintesis de voz, para no ofrecer una accion sin efecto.
 */

import { useLectorVoz } from '@/hooks/useLectorVoz';

interface BotonEscucharProps {
  readonly texto?: string;
  /**
   * Alternativa a `texto`: funcion que calcula el texto al pulsar el boton.
   * Util para leer contenido dinamico del DOM (p. ej. una card o un modal).
   */
  readonly obtenerTexto?: () => string;
  readonly idioma?: string;
  readonly etiqueta?: string;
  readonly etiquetaDetener?: string;
  readonly className?: string;
}

export function BotonEscuchar({
  texto,
  obtenerTexto,
  idioma,
  etiqueta = 'Escuchar',
  etiquetaDetener = 'Detener lectura',
  className = 'boton-escuchar',
}: BotonEscucharProps) {
  const { soportado, hablando, leer, detener } = useLectorVoz();

  if (!soportado) {
    return null;
  }

  const etiquetaActual = hablando ? etiquetaDetener : etiqueta;

  function manejarClic() {
    if (hablando) {
      detener();
      return;
    }
    const contenido = (obtenerTexto ? obtenerTexto() : texto) ?? '';
    leer(contenido, { idioma });
  }

  return (
    <button
      type="button"
      data-no-leer
      className={className}
      onClick={manejarClic}
      aria-pressed={hablando}
      aria-label={etiquetaActual}
      title={etiquetaActual}
    >
      <span className="boton-escuchar-icono" aria-hidden="true">
        <IconoAltavoz activo={hablando} />
      </span>
      <span className="boton-escuchar-texto">{etiquetaActual}</span>
    </button>
  );
}

function IconoAltavoz({ activo }: { readonly activo: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" />
      {activo ? (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      ) : (
        <path d="M16 9l6 6M22 9l-6 6" />
      )}
    </svg>
  );
}
