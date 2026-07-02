'use client';

/**
 * Contenido de terminos y condiciones renderizado desde configuracion de interfaz.
 */

import Link from 'next/link';
import type { TextosTerminosInterfaz } from '@/types/interfaz';

interface ContenidoTerminosProps {
  readonly textos: TextosTerminosInterfaz;
  readonly idDescripcion?: string;
  readonly mostrarEnlacePublico?: boolean;
  readonly urlPaginaTerminos?: string;
  readonly className?: string;
  readonly centrarEnlaces?: boolean;
  /** Centra el contenido completo: parrafos, enlaces y correo. */
  readonly centrado?: boolean;
}

export function ContenidoTerminos({
  textos,
  idDescripcion,
  mostrarEnlacePublico = false,
  urlPaginaTerminos = '/terminos-condiciones',
  className = '',
  centrarEnlaces = false,
  centrado = false,
}: ContenidoTerminosProps) {
  const urlLey = textos.url_ley ?? undefined;
  const urlPolitica = textos.url_politica_datos ?? undefined;
  const claseEnlace = centrado || centrarEnlaces ? 'text-center' : undefined;
  const claseContenedor = ['text-sm leading-relaxed space-y-4']
    .concat(centrado ? ['text-center'] : [])
    .concat(className ? [className] : [])
    .join(' ');

  return (
    <div
      id={idDescripcion}
      className={claseContenedor}
      style={{ color: 'var(--color-texto-secundario)' }}
    >
      {textos.contenido ? (
        <p className="whitespace-pre-wrap">{textos.contenido}</p>
      ) : (
        <>
          {textos.parrafo_1 && <p>{textos.parrafo_1}</p>}
          {textos.parrafo_2 && <p>{textos.parrafo_2}</p>}
          {textos.parrafo_3 && <p>{textos.parrafo_3}</p>}
        </>
      )}

      {urlLey && (
        <p className={claseEnlace}>
          <a
            href={urlLey}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
            style={{ color: 'var(--color-primario)' }}
          >
            {textos.texto_enlace_ley ?? 'Consultar Ley 1581 de 2012'}
          </a>
        </p>
      )}

      {urlPolitica && (
        <p className={claseEnlace}>
          <a
            href={urlPolitica}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
            style={{ color: 'var(--color-primario)' }}
          >
            {textos.texto_enlace_politica_datos ??
              'Política de Protección de Datos Personales'}
          </a>
        </p>
      )}

      {textos.email_soporte && (
        <p>
          Para consultas o inquietudes, escríbenos a{' '}
          <a
            href={`mailto:${textos.email_soporte}`}
            className="font-semibold"
            style={{ color: 'var(--color-primario)' }}
          >
            {textos.email_soporte}
          </a>{'.'}
        </p>
      )}

      {mostrarEnlacePublico && (
        <p className={claseEnlace}>
          <Link
            href={urlPaginaTerminos}
            className="font-semibold underline"
            style={{ color: 'var(--color-primario)' }}
          >
            {textos.enlace_terminos ?? 'Términos y condiciones'}
          </Link>
        </p>
      )}
    </div>
  );
}
