import { describe, it, expect } from 'vitest';
import { htmlATextoPlano } from './textoPlano';

describe('htmlATextoPlano', () => {
  it('elimina etiquetas y conserva el texto', () => {
    const html = '<p>Autorizo el <strong>tratamiento</strong> de datos.</p>';
    expect(htmlATextoPlano(html)).toBe('Autorizo el tratamiento de datos.');
  });

  it('separa bloques con punto', () => {
    const html = '<p>Primer parrafo</p><p>Segundo parrafo</p>';
    expect(htmlATextoPlano(html)).toBe('Primer parrafo. Segundo parrafo.');
  });

  it('decodifica entidades comunes', () => {
    const html = '<p>Informaci&oacute;n &amp; datos</p>';
    expect(htmlATextoPlano(html)).toBe('Información & datos.');
  });

  it('colapsa espacios en blanco', () => {
    const html = '<div>  Texto   con    espacios  </div>';
    expect(htmlATextoPlano(html)).toBe('Texto con espacios.');
  });
});
