/**
 * Pagina de diligenciamiento del formulario (post-verificacion).
 */

import type { Metadata } from 'next';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { AvisoEncuestaProximamente } from '@/components/formularios/012_aviso_encuesta_proximamente';
import { EncuestaResponderCliente } from './EncuestaResponderCliente';
import {
  obtenerEstructuraConCache,
  obtenerFormularioDisponiblePorUuid,
} from '@/services/formulariosServicio';
import { obtenerParametrosIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

interface PaginaResponderProps {
  readonly params: Promise<{ uuid: string }>;
}

export async function generateMetadata({
  params,
}: PaginaResponderProps): Promise<Metadata> {
  const { uuid } = await params;
  const parametros = await obtenerParametrosIdiomaServidor();
  try {
    const estructura = await obtenerEstructuraConCache(uuid, parametros);
    return { title: `${estructura.nombre} — Responder` };
  } catch {
    return { title: 'Responder encuesta' };
  }
}

export default async function PaginaResponder({ params }: PaginaResponderProps) {
  const { uuid } = await params;
  const parametros = await obtenerParametrosIdiomaServidor();
  const formularioDisponible = await obtenerFormularioDisponiblePorUuid(uuid, parametros);

  if (formularioDisponible && !formularioDisponible.puede_iniciar) {
    const migasBloqueo = [
      { etiqueta: 'Inicio', href: '/' },
      { etiqueta: formularioDisponible.nombre, href: `/encuestas/${uuid}` },
      { etiqueta: 'Responder' },
    ];

    return (
      <ContenedorPagina etiquetaAria={`Responder: ${formularioDisponible.nombre}`}>
        <div className="max-w-2xl mx-auto">
          <Migas items={migasBloqueo} />
          <AvisoEncuestaProximamente formulario={formularioDisponible} />
        </div>
      </ContenedorPagina>
    );
  }

  const estructura = await obtenerEstructuraConCache(uuid, parametros);

  const migas = [
    { etiqueta: 'Inicio', href: '/' },
    { etiqueta: estructura.nombre, href: `/encuestas/${uuid}` },
    { etiqueta: 'Responder' },
  ];

  return (
    <ContenedorPagina etiquetaAria={`Responder: ${estructura.nombre}`}>
      <div className="max-w-2xl mx-auto">
        <Migas items={migas} />
        <h1
          className="text-3xl font-bold mt-1 mb-6"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {estructura.nombre}
        </h1>
        {estructura.introduccion && (
          <p
            className="mb-6 text-base"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            {estructura.introduccion}
          </p>
        )}
        <EncuestaResponderCliente
          uuidFormulario={uuid}
          estructura={estructura}
          permiteOffline={formularioDisponible?.permite_offline ?? true}
        />
      </div>
    </ContenedorPagina>
  );
}
