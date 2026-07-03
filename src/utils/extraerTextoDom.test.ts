import { describe, it, expect } from 'vitest';
import { extraerTextoLegible } from './extraerTextoDom';

function crearElemento(html: string): HTMLElement {
  const contenedor = document.createElement('div');
  contenedor.innerHTML = html;
  return contenedor;
}

describe('extraerTextoLegible', () => {
  it('lee el texto de titulos y parrafos separados por punto', () => {
    const elemento = crearElemento('<h2>Titulo</h2><p>Cuerpo del texto</p>');
    expect(extraerTextoLegible(elemento)).toBe('Titulo. Cuerpo del texto.');
  });

  it('excluye elementos marcados con data-no-leer', () => {
    const elemento = crearElemento(
      '<p>Contenido legible</p><button data-no-leer>Escuchar</button>',
    );
    const texto = extraerTextoLegible(elemento);
    expect(texto).toContain('Contenido legible');
    expect(texto).not.toContain('Escuchar');
  });

  it('excluye elementos ocultos con aria-hidden e iconos svg', () => {
    const elemento = crearElemento(
      '<p>Visible</p><span aria-hidden="true">Oculto</span><svg><path /></svg>',
    );
    const texto = extraerTextoLegible(elemento);
    expect(texto).toBe('Visible.');
  });

  it('devuelve cadena vacia cuando no hay texto', () => {
    const elemento = crearElemento('<button data-no-leer>X</button>');
    expect(extraerTextoLegible(elemento)).toBe('');
  });
});
