/**
 * Pie de formulario de auth: texto + enlace de cambio de modo.
 * Ejemplo: "¿Ya tienes cuenta? [Inicia Sesion]"
 * Ambos textos vienen del llamador — ningun texto quemado.
 */

import Link from 'next/link';

interface EnlaceCambioModoProps {
  readonly texto: string;
  readonly etiquetaEnlace: string;
  readonly href: string;
}

export function EnlaceCambioModo({ texto, etiquetaEnlace, href }: EnlaceCambioModoProps) {
  return (
    <p
      className="text-center text-sm mt-6"
      style={{ color: 'var(--color-texto-secundario)' }}
    >
      {texto}{' '}
      <Link
        href={href}
        className="font-semibold"
        style={{ color: 'var(--color-primario)' }}
      >
        {etiquetaEnlace}
      </Link>
    </p>
  );
}
