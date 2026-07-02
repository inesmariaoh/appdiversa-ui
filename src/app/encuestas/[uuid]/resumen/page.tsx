/**
 * Pagina de resumen post-finalizacion de una encuesta.
 */

import type { Metadata } from 'next';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { ResumenSesion } from '@/components/formularios/006_resumen_sesion';
import { obtenerEstructuraConCache } from '@/services/formulariosServicio';
import { obtenerParametrosIdiomaServidor } from '@/utils/obtenerIdiomaServidor';
import { tituloTextoFormulario } from '@/utils/textosFormulario';

interface PaginaResumenProps {
  readonly params: Promise<{ uuid: string }>;
}

export async function generateMetadata({
  params,
}: PaginaResumenProps): Promise<Metadata> {
  const { uuid } = await params;
  const parametros = await obtenerParametrosIdiomaServidor();
  try {
    const estructura = await obtenerEstructuraConCache(uuid, parametros);
    return { title: `Resumen respuestas — ${estructura.nombre}` };
  } catch {
    return { title: 'Resumen de respuestas' };
  }
}

export default async function PaginaResumen({ params }: PaginaResumenProps) {
  const { uuid } = await params;
  const parametros = await obtenerParametrosIdiomaServidor();
  const estructura = await obtenerEstructuraConCache(uuid, parametros);

  const tituloResumen =
    tituloTextoFormulario(
      estructura,
      'resumen_respuestas',
      `Resumen respuestas - ${estructura.nombre}`,
    ) || `Resumen respuestas - ${estructura.nombre}`;

  const migas = [
    { etiqueta: 'Inicio', href: '/' },
    { etiqueta: estructura.nombre, href: `/encuestas/${uuid}` },
    { etiqueta: 'Resumen' },
  ];

  return (
    <ContenedorPagina etiquetaAria={`Resumen: ${estructura.nombre}`}>
      <div className="max-w-[865px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Migas items={migas} />
        <h1
          className="text-2xl sm:text-3xl font-bold mt-2 mb-8"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {tituloResumen}
        </h1>
        <ResumenSesion
          uuidFormulario={uuid}
          secciones={estructura.secciones}
          textos={{
            textoEnviarCopia: tituloTextoFormulario(
              estructura,
              'envio_correo',
              'Enviar copia a mi correo',
            ),
          }}
        />
      </div>
    </ContenedorPagina>
  );
}
