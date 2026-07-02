import { describe, it, expect, beforeEach } from 'vitest';
import { aplicarTemaDocumento } from './aplicarTemaDocumento';
import { CONFIGURACION_FALLBACK } from '@/services/interfazServicio';

describe('aplicarTemaDocumento', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('style');
    document.title = '';
  });

  it('aplica tokens, titulo, descripcion y favicon al documento', () => {
    aplicarTemaDocumento({
      ...CONFIGURACION_FALLBACK,
      meta_titulo_seo: 'Titulo SEO',
      meta_descripcion_seo: 'Descripcion SEO',
      favicon: '/favicon.ico',
    });

    expect(document.title).toBe('Titulo SEO');
    expect(document.documentElement.style.getPropertyValue('--color-primario')).toBe(
      CONFIGURACION_FALLBACK.color_primario
    );

    const descripcion = document.querySelector('meta[name="description"]');
    expect(descripcion?.getAttribute('content')).toBe('Descripcion SEO');

    const favicon = document.querySelector('link[rel="icon"]');
    expect(favicon?.getAttribute('href')).toBe('/favicon.ico');
  });
});
