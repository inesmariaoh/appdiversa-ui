'use client';

/**
 * Enriquece las respuestas del resumen con nombres legibles desde catalogos y estructura.
 */

import { useEffect, useState } from 'react';
import type { SeccionFormulario } from '@/types/formulario';
import type { ItemCatalogo } from '@/types/catalogo';
import type { ResumenFormularioSesion } from '@/types/sesion';
import { obtenerItemsCatalogo } from '@/services/catalogosServicio';
import { obtenerCatalogoDesdeCache, guardarCatalogoEnCache } from '@/storage/catalogosCache';
import { useIdiomaStore } from '@/store/idiomaStore';
import { useOfflineStore } from '@/store/offlineStore';
import {
  catalogosRequeridosParaResumen,
  enriquecerRespuestaResumen,
  type ItemResumenPresentacion,
} from '@/utils/enriquecerRespuestaResumen';
import { indicePreguntasDesdeSecciones } from '@/utils/indicePreguntasFormulario';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface ParametrosCatalogoResumen {
  codigoPadre?: string;
}

async function cargarItemsCatalogoResumen(
  codigoCatalogo: string,
  parametros: ParametrosCatalogoResumen,
  idioma: string,
  enLinea: boolean,
): Promise<ItemCatalogo[]> {
  const cache = await obtenerCatalogoDesdeCache(codigoCatalogo);
  if (cache?.length) {
    if (parametros.codigoPadre) {
      return cache.filter((item) => item.codigo_padre === parametros.codigoPadre);
    }
    return cache;
  }

  if (!enLinea) {
    return [];
  }

  const items = await obtenerItemsCatalogo(codigoCatalogo, {
    codigo_padre: parametros.codigoPadre,
    solo_activos: true,
    idioma,
  });

  if (items.length === 0 && parametros.codigoPadre) {
    const itemsSinFiltro = await obtenerItemsCatalogo(codigoCatalogo, {
      solo_activos: true,
      idioma,
    });
    if (itemsSinFiltro.length > 0) {
      ejecutarSinEspera(guardarCatalogoEnCache(codigoCatalogo, itemsSinFiltro));
      return itemsSinFiltro;
    }
  }

  if (!parametros.codigoPadre) {
    ejecutarSinEspera(guardarCatalogoEnCache(codigoCatalogo, items));
  }

  return items;
}

export function useResumenEnriquecido(
  resumen: ResumenFormularioSesion | null,
  secciones: SeccionFormulario[],
) {
  const idioma = useIdiomaStore((estado) => estado.idioma);
  const enLinea = useOfflineStore((estado) => estado.enLinea);
  const [items, setItems] = useState<ItemResumenPresentacion[]>([]);
  const [cargandoEnriquecimiento, setCargandoEnriquecimiento] = useState(false);

  useEffect(() => {
    if (!resumen) {
      setItems([]);
      setCargandoEnriquecimiento(false);
      return;
    }

    const resumenActual = resumen;
    let cancelado = false;
    setCargandoEnriquecimiento(true);

    async function enriquecer() {
      const indicePreguntas = indicePreguntasDesdeSecciones(secciones);
      const catalogosRequeridos = catalogosRequeridosParaResumen(
        resumenActual.respuestas,
        indicePreguntas,
      );
      const catalogos = new Map<string, ItemCatalogo[]>();

      for (const [codigoCatalogo, parametros] of catalogosRequeridos.entries()) {
        const itemsCatalogo = await cargarItemsCatalogoResumen(
          codigoCatalogo,
          parametros,
          idioma,
          enLinea,
        );
        const existentes = catalogos.get(codigoCatalogo) ?? [];
        const fusionados = [...existentes];
        for (const item of itemsCatalogo) {
          if (!fusionados.some((existente) => existente.codigo === item.codigo)) {
            fusionados.push(item);
          }
        }
        catalogos.set(codigoCatalogo, fusionados);
      }

      const respuestasPorCodigo = new Map(
        resumenActual.respuestas.map((respuesta) => [respuesta.pregunta_codigo, respuesta]),
      );

      const presentacion = resumenActual.respuestas.map((respuesta) =>
        enriquecerRespuestaResumen(respuesta, {
          indicePreguntas,
          catalogos,
          respuestasPorCodigo,
        }),
      );

      if (!cancelado) {
        setItems(presentacion);
        setCargandoEnriquecimiento(false);
      }
    }

    ejecutarSinEspera(enriquecer());

    return () => {
      cancelado = true;
    };
  }, [enLinea, idioma, resumen, secciones]);

  return { items, cargandoEnriquecimiento };
}
