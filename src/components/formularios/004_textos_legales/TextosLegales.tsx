'use client';

/**
 * Muestra textos legales y de consentimiento provenientes del formulario.
 */

import type { FormularioEstructura, TipoTextoFormulario } from '@/types/formulario';
import { ContenidoHtml } from '@/components/ui/005_contenido_html';
import { buscarTextoFormulario } from '@/utils/textosFormulario';
import { contieneHtml } from '@/utils/sanitizarHtml';

interface TextosLegalesProps {
  readonly estructura: FormularioEstructura;
  readonly tipos?: TipoTextoFormulario[];
}

const TIPOS_LEGALES: TipoTextoFormulario[] = [
  'terminos',
  'consentimiento',
  'consentimiento_datos',
  'autorizacion_datos',
];

export function TextosLegales({
  estructura,
  tipos = TIPOS_LEGALES,
}: TextosLegalesProps) {
  const textos = tipos
    .map((tipo) => buscarTextoFormulario(estructura, tipo))
    .filter((texto) => texto?.contenido?.trim());

  if (textos.length === 0) return null;

  return (
    <section
      className="flex flex-col gap-4 mb-6"
      aria-label="Textos legales y de consentimiento"
    >
      {textos.map((texto) => (
        <article
          key={texto!.tipo}
          className="rounded-lg p-4 text-sm"
          style={{
            backgroundColor: 'var(--color-fondo-pagina)',
            color: 'var(--color-texto-secundario)',
          }}
        >
          {texto!.titulo && (
            <h2
              className="font-semibold mb-2 text-base"
              style={{ color: 'var(--color-texto-primario)' }}
            >
              {texto!.titulo}
            </h2>
          )}
          {contieneHtml(texto!.contenido) ? (
            <ContenidoHtml contenido={texto!.contenido} />
          ) : (
            <p className="whitespace-pre-wrap">{texto!.contenido}</p>
          )}
        </article>
      ))}
    </section>
  );
}
