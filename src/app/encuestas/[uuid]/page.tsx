/**
 * Pagina de preguntas de verificacion de una encuesta.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { AvisoEncuestaProximamente } from '@/components/formularios/012_aviso_encuesta_proximamente';
import { PanelVerificacion } from './PanelVerificacion';
import {
  obtenerEstructuraConCache,
  obtenerFormularioDisponiblePorUuid,
} from '@/services/formulariosServicio';
import { obtenerParametrosIdiomaServidor } from '@/utils/obtenerIdiomaServidor';
import {
  formularioTienePreguntasFiltro,
  obtenerTituloSeccionFiltro,
} from '@/utils/estructuraFormularioFiltros';
import { obtenerPreguntasFiltroDesdeEstructura } from '@/utils/filtrosFormulario';

interface PaginaEncuestaProps {
  readonly params: Promise<{ uuid: string }>;
}

export async function generateMetadata({
  params,
}: PaginaEncuestaProps): Promise<Metadata> {
  const { uuid } = await params;
  const parametros = await obtenerParametrosIdiomaServidor();
  try {
    const estructura = await obtenerEstructuraConCache(uuid, parametros);
    return { title: estructura.nombre };
  } catch {
    return { title: 'Encuesta' };
  }
}

export default async function PaginaEncuesta({ params }: PaginaEncuestaProps) {
  const { uuid } = await params;
  const parametros = await obtenerParametrosIdiomaServidor();
  const formularioDisponible = await obtenerFormularioDisponiblePorUuid(uuid, parametros);

  if (formularioDisponible && !formularioDisponible.puede_iniciar) {
    const migasBloqueo = [
      { etiqueta: 'Inicio', href: '/' },
      { etiqueta: formularioDisponible.nombre },
    ];

    return (
      <ContenedorPagina etiquetaAria={`Encuesta: ${formularioDisponible.nombre}`}>
        <div className="max-w-2xl mx-auto">
          <Migas items={migasBloqueo} />
          <AvisoEncuestaProximamente formulario={formularioDisponible} />
        </div>
      </ContenedorPagina>
    );
  }

  const estructura = await obtenerEstructuraConCache(uuid, parametros);
  const preguntasFiltro = obtenerPreguntasFiltroDesdeEstructura(estructura.secciones);

  if (!formularioTienePreguntasFiltro(estructura)) {
    redirect(`/encuestas/${uuid}/responder`);
  }

  const migas = [
    { etiqueta: 'Inicio', href: '/' },
    { etiqueta: estructura.nombre },
  ];

  return (
    <ContenedorPagina etiquetaAria={`Encuesta: ${estructura.nombre}`}>
      <div className="max-w-2xl mx-auto">
        <Migas items={migas} />

        <h1
          className="text-3xl font-bold mt-1 mb-6"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {obtenerTituloSeccionFiltro(estructura.secciones)}
        </h1>

        <PanelVerificacion
          uuid={uuid}
          estructura={estructura}
          preguntasFiltro={preguntasFiltro}
        />
      </div>
    </ContenedorPagina>
  );
}
