import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas, type Miga } from '@/components/layout/004_migas';
import {
  ContenedorListaFormularios,
  SincronizarFormulariosStore,
} from '@/components/formularios/001_lista_formularios';
import { obtenerFormulariosDisponibles } from '@/services/formulariosServicio';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerParametrosIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

interface PaginaListadoEncuestasProps {
  readonly migas: Miga[];
  readonly etiquetaAria?: string;
}

export async function PaginaListadoEncuestas({
  migas,
  etiquetaAria = 'Listado de encuestas disponibles',
}: PaginaListadoEncuestasProps) {
  const parametros = await obtenerParametrosIdiomaServidor();
  const [formularios, configuracion] = await Promise.allSettled([
    obtenerFormulariosDisponibles(parametros),
    obtenerConfiguracionInterfaz(parametros.idioma),
  ]);

  const listaFormularios =
    formularios.status === 'fulfilled' ? formularios.value : [];

  const config =
    configuracion.status === 'fulfilled' ? configuracion.value : null;

  const tituloSeccion =
    config?.texto_titulo_seccion_encuestas?.trim() || undefined;
  const descripcionSeccion =
    config?.texto_descripcion_seccion_encuestas?.trim() ||
    config?.descripcion_aplicativo ||
    undefined;

  return (
    <ContenedorPagina etiquetaAria={etiquetaAria}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Migas items={migas} />
      </div>
      <SincronizarFormulariosStore formularios={listaFormularios} />
      <ContenedorListaFormularios
        formulariosIniciales={listaFormularios}
        tituloSeccion={tituloSeccion}
        descripcionSeccion={descripcionSeccion}
        idioma={parametros.idioma}
      />
    </ContenedorPagina>
  );
}
