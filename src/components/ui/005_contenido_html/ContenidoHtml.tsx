'use client';

/**
 * Renderiza HTML sanitizado proveniente del backend.
 */

import { sanitizarHtml } from '@/utils/sanitizarHtml';

interface ContenidoHtmlProps {
  readonly contenido: string;
  readonly className?: string;
}

export function ContenidoHtml({ contenido, className = '' }: ContenidoHtmlProps) {
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`.trim()}
      style={{ color: 'var(--color-texto-secundario)' }}
      dangerouslySetInnerHTML={{ __html: sanitizarHtml(contenido) }}
    />
  );
}
