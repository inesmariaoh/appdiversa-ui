/**
 * Convierte HTML en texto plano legible para lectura por voz.
 * No depende del DOM, por lo que funciona en servidor y cliente.
 */

const ENTIDADES_HTML: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&aacute;': 'á',
  '&eacute;': 'é',
  '&iacute;': 'í',
  '&oacute;': 'ó',
  '&uacute;': 'ú',
  '&ntilde;': 'ñ',
};

export function htmlATextoPlano(html: string): string {
  const sinBloques = html.replace(/<\/(p|div|li|br|h[1-6])>/gi, '$&. ');
  const sinEtiquetas = sinBloques.replace(/<[^>]+>/g, ' ');
  const conEntidades = sinEtiquetas.replace(
    /&[a-z0-9#]+;/gi,
    (entidad) => ENTIDADES_HTML[entidad.toLowerCase()] ?? ' ',
  );
  return conEntidades
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\.(\s*\.)+/g, '.')
    .trim();
}
