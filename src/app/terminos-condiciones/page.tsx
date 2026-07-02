/**
 * Pagina completa de Terminos y Condiciones de Uso de AppDiversa.
 * El texto proviene de la configuracion de interfaz.
 */

import Link from 'next/link';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { ContenidoTerminos } from '@/components/formularios/010_contenido_terminos';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

const MIGAS = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Términos y Condiciones' },
];

export default async function PaginaTerminosCondiciones() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);
  const textos = configuracion.flujo_formulario!.terminos;

  return (
    <ContenedorPagina etiquetaAria="Términos y Condiciones de uso de AppDiversa">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Migas items={MIGAS} />

        <h1
          className="text-2xl font-bold uppercase mt-4 mb-8"
          style={{ color: 'var(--color-primario)' }}
        >
          {textos.titulo}
        </h1>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--color-fondo-tarjeta)',
            border: '1px solid var(--color-borde)',
          }}
        >
          <ContenidoTerminos textos={textos} />
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: 'var(--color-primario)',
              color: '#ffffff',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </ContenedorPagina>
  );
}
