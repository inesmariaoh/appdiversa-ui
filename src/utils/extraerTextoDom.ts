'use client';

/**
 * Extrae el texto legible de un elemento del DOM para lectura por voz.
 * Se usa en el cliente al momento de pulsar "Escuchar", de modo que lee el
 * contenido realmente renderizado (dinamico) sin quemar textos.
 *
 * Excluye controles y elementos decorativos:
 *  - marcados con [data-no-leer] (p. ej. el propio boton de escuchar)
 *  - ocultos con aria-hidden="true"
 *  - script, style e iconos svg
 *
 * Inserta separadores entre bloques para que la sintesis haga pausas naturales.
 */

const SELECTOR_EXCLUIR = '[data-no-leer], [aria-hidden="true"], script, style, svg';
const SELECTOR_BLOQUES =
  'p, div, li, section, article, header, footer, label, h1, h2, h3, h4, h5, h6, br, tr';

export function extraerTextoLegible(raiz: HTMLElement): string {
  const clon = raiz.cloneNode(true) as HTMLElement;

  clon.querySelectorAll(SELECTOR_EXCLUIR).forEach((elemento) => elemento.remove());

  clon.querySelectorAll(SELECTOR_BLOQUES).forEach((bloque) => {
    bloque.appendChild(document.createTextNode('. '));
  });

  const texto = clon.textContent ?? '';
  return texto
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\.(\s*\.)+/g, '.')
    .trim();
}
