import { describe, it, expect } from 'vitest';
import { sanitizarHtml, contieneHtml } from '@/utils/sanitizarHtml';

describe('sanitizarHtml', () => {
  it('elimina scripts maliciosos', () => {
    const resultado = sanitizarHtml('<p>Hola</p><script>alert(1)</script>');
    expect(resultado).not.toContain('<script');
    expect(resultado).toContain('Hola');
  });

  it('detecta contenido html', () => {
    expect(contieneHtml('<p>Hola</p>')).toBe(true);
    expect(contieneHtml('Texto plano')).toBe(false);
  });
});
