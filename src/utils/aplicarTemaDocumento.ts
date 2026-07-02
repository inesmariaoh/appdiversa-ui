/**
 * Aplica configuracion visual del backend al documento del navegador.
 */

import type { ConfiguracionInterfaz } from '@/types/interfaz';
import { aplicarTokensInterfaz } from './tokensInterfaz';

function actualizarMeta(nombre: string, contenido: string): void {
  let elemento = document.querySelector(`meta[name="${nombre}"]`);
  if (!elemento) {
    elemento = document.createElement('meta');
    elemento.setAttribute('name', nombre);
    document.head.appendChild(elemento);
  }
  elemento.setAttribute('content', contenido);
}

function actualizarFavicon(url: string | null): void {
  if (!url) return;
  let enlace = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!enlace) {
    enlace = document.createElement('link');
    enlace.rel = 'icon';
    document.head.appendChild(enlace);
  }
  enlace.href = url;
}

export function aplicarTemaDocumento(configuracion: ConfiguracionInterfaz): void {
  if (typeof document === 'undefined') return;

  const estilos = aplicarTokensInterfaz(configuracion);
  const raiz = document.documentElement;

  for (const [variable, valor] of Object.entries(estilos)) {
    raiz.style.setProperty(variable, valor);
  }

  const titulo = configuracion.meta_titulo_seo ?? configuracion.nombre_aplicativo;
  if (titulo) {
    document.title = titulo;
  }

  const descripcion =
    configuracion.meta_descripcion_seo ?? configuracion.descripcion_aplicativo;
  if (descripcion) {
    actualizarMeta('description', descripcion);
  }

  if (configuracion.color_primario) {
    actualizarMeta('theme-color', configuracion.color_primario);
  }

  actualizarFavicon(configuracion.favicon);
}
