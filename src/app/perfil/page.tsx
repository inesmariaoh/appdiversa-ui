/**
 * Pagina de perfil del usuario autenticado.
 */

import Link from 'next/link';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';
import { ContenidoPerfil } from './ContenidoPerfil';

const MIGAS = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Tus datos' },
];

export default async function PaginaPerfil() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);
  const subtitulo =
    configuracion.descripcion_aplicativo ||
    configuracion.texto_descripcion_seccion_encuestas ||
    null;
  const urlPoliticaDatos =
    configuracion.flujo_formulario?.terminos.url_politica_datos ?? null;

  return (
    <ContenedorPagina etiquetaAria="Perfil de usuario">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Migas items={MIGAS} />
        <h1
          className="text-2xl font-bold mt-2"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          Perfil de usuario
        </h1>
        {subtitulo && (
          <p className="text-sm mt-2 mb-8" style={{ color: 'var(--color-texto-secundario)' }}>
            {urlPoliticaDatos ? (
              <Link
                href={urlPoliticaDatos}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-primario)' }}
              >
                {subtitulo}
              </Link>
            ) : (
              subtitulo
            )}
          </p>
        )}
        {!subtitulo && <div className="mb-8" />}
        <ContenidoPerfil />
      </div>
    </ContenedorPagina>
  );
}
