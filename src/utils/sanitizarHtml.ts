/**
 * Sanitiza HTML proveniente del backend antes de renderizarlo.
 */

import DOMPurify from 'isomorphic-dompurify';

export function sanitizarHtml(contenido: string): string {
  return DOMPurify.sanitize(contenido, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

export function contieneHtml(contenido: string): boolean {
  return /<[a-z][\s\S]*>/i.test(contenido);
}
