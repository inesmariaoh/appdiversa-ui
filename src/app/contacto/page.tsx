/**
 * Pagina de contacto con envio de mensaje al backend.
 * Titulo y descripcion provienen de la configuracion de interfaz.
 */

import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { FormularioContacto } from '@/components/contacto/001_formulario_contacto';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';
import { migasDesdeInicio } from '@/utils/migasNavegacion';

export default async function PaginaContacto() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);

  const tituloContacto = configuracion.texto_contacto || '¿Cómo podemos ayudarte?';
  const descripcion =
    configuracion.descripcion_aplicativo ||
    configuracion.texto_descripcion_seccion_encuestas ||
    undefined;

  return (
    <ContenedorPagina etiquetaAria="Contacto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Migas items={migasDesdeInicio([{ etiqueta: tituloContacto }])} />
      </div>
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <FormularioContacto titulo={tituloContacto} descripcion={descripcion} />
        </VentanaAuth>
      </div>
    </ContenedorPagina>
  );
}
