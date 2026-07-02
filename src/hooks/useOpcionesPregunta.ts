'use client';

/**
 * Carga opciones de pregunta desde catalogo o opciones estaticas del backend.
 */

import { useEffect, useState } from 'react';
import type { Pregunta, OpcionRespuesta } from '@/types/formulario';
import type { ItemCatalogo } from '@/types/catalogo';
import { obtenerItemsCatalogo } from '@/services/catalogosServicio';
import {
  guardarCatalogoEnCache,
  obtenerCatalogoDesdeCache,
} from '@/storage/catalogosCache';
import { useIdiomaStore } from '@/store/idiomaStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useCatalogosStore } from '@/store/catalogosStore';
import { extraerCodigoCatalogo } from '@/utils/extraerCodigoCatalogo';
import { itemsCatalogoAopciones } from '@/utils/itemsCatalogoAopciones';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface UseOpcionesPreguntaResultado {
  opciones: OpcionRespuesta[];
  cargando: boolean;
  error: string | null;
}

interface ParametrosCargaOpciones {
  codigo: string;
  codigoPreguntaPadre?: string;
  valorPadre?: string;
  busqueda?: string;
  limiteItems?: number | null;
  idioma: string;
  incluirAccesibilidad: boolean;
  enLinea: boolean;
  opcionesFallback: OpcionRespuesta[];
}

function filtrarItemsPorCodigoPadre(
  items: ItemCatalogo[],
  codigoPadre?: string,
): ItemCatalogo[] {
  if (!codigoPadre) {
    return items;
  }
  return items.filter((item) => item.codigo_padre === codigoPadre);
}

function obtenerOpcionesDesdeMemoria(
  codigo: string,
  valorPadre?: string,
): OpcionRespuesta[] | null {
  const itemsMemoria = useCatalogosStore.getState().obtenerItems(codigo);
  const itemsFiltrados = filtrarItemsPorCodigoPadre(itemsMemoria, valorPadre);
  if (itemsFiltrados.length === 0) return null;
  return itemsCatalogoAopciones(itemsFiltrados);
}

async function obtenerItemsCatalogoLocal(
  codigo: string,
  valorPadre: string | undefined,
  enLinea: boolean,
  parametrosApi: Parameters<typeof obtenerItemsCatalogo>[1],
): Promise<ItemCatalogo[]> {
  if (!enLinea) {
    const cache = await obtenerCatalogoDesdeCache(codigo);
    if (cache) {
      return filtrarItemsPorCodigoPadre(cache, valorPadre);
    }
  }

  const items = await obtenerItemsCatalogo(codigo, parametrosApi);
  if (enLinea) {
    if (valorPadre) {
      useCatalogosStore.getState().fusionarItems(codigo, items);
    } else {
      useCatalogosStore.getState().establecerItems(codigo, items);
    }
    ejecutarSinEspera(
      guardarCatalogoEnCache(codigo, useCatalogosStore.getState().obtenerItems(codigo)),
    );
  }
  return items;
}

async function resolverOpcionesCatalogo(
  parametros: ParametrosCargaOpciones,
): Promise<{ opciones: OpcionRespuesta[]; error: string | null }> {
  const {
    codigo,
    codigoPreguntaPadre,
    valorPadre,
    busqueda,
    limiteItems,
    idioma,
    incluirAccesibilidad,
    enLinea,
    opcionesFallback,
  } = parametros;

  if (codigoPreguntaPadre && !valorPadre) {
    return { opciones: [], error: null };
  }

  if (!busqueda?.trim()) {
    const desdeMemoria = obtenerOpcionesDesdeMemoria(codigo, valorPadre);
    if (desdeMemoria) {
      return { opciones: desdeMemoria, error: null };
    }
  }

  try {
    const items = await obtenerItemsCatalogoLocal(codigo, valorPadre, enLinea, {
      codigo_padre: valorPadre,
      solo_activos: true,
      busqueda: busqueda?.trim() || undefined,
      limite: limiteItems ?? undefined,
      idioma,
      incluir_accesibilidad: incluirAccesibilidad,
    });
    return { opciones: itemsCatalogoAopciones(items), error: null };
  } catch {
    const cache = await obtenerCatalogoDesdeCache(codigo);
    const cacheFiltrado = cache ? filtrarItemsPorCodigoPadre(cache, valorPadre) : null;
    if (cacheFiltrado && cacheFiltrado.length > 0) {
      return { opciones: itemsCatalogoAopciones(cacheFiltrado), error: null };
    }
    return {
      opciones: opcionesFallback,
      error: 'No fue posible cargar el catálogo.',
    };
  }
}

function valorRespuestaCatalogoPadre(valor: unknown): string | undefined {
  if (valor === null || valor === undefined) {
    return undefined;
  }
  if (typeof valor === 'string') {
    return valor;
  }
  if (typeof valor === 'number' || typeof valor === 'boolean' || typeof valor === 'bigint') {
    return String(valor);
  }
  return undefined;
}

export function useOpcionesPregunta(
  pregunta: Pregunta,
  respuestas: Record<string, unknown>,
  busqueda?: string
): UseOpcionesPreguntaResultado {
  const idioma = useIdiomaStore((s) => s.idioma);
  const incluirAccesibilidad = useIdiomaStore((s) => s.incluirAccesibilidad);
  const enLinea = useOfflineStore((s) => s.enLinea);
  const usaCatalogo = pregunta.usa_catalogo;
  const codigoCatalogo = usaCatalogo
    ? extraerCodigoCatalogo(pregunta.catalogo_asociado)
    : null;

  const [opcionesCatalogo, setOpcionesCatalogo] = useState<OpcionRespuesta[]>(
    pregunta.opciones
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codigoPreguntaPadre = pregunta.pregunta_padre_catalogo?.codigo;
  const valorPadre = codigoPreguntaPadre
    ? valorRespuestaCatalogoPadre(respuestas[codigoPreguntaPadre])
    : undefined;

  useEffect(() => {
    if (!usaCatalogo || !codigoCatalogo) return;

    const codigo = codigoCatalogo;
    let cancelado = false;

    async function cargarOpciones() {
      setCargando(true);
      setError(null);

      const resultado = await resolverOpcionesCatalogo({
        codigo,
        codigoPreguntaPadre,
        valorPadre,
        busqueda,
        limiteItems: pregunta.limite_items_catalogo,
        idioma,
        incluirAccesibilidad,
        enLinea,
        opcionesFallback: pregunta.opciones,
      });

      if (!cancelado) {
        setOpcionesCatalogo(resultado.opciones);
        setError(resultado.error);
        setCargando(false);
      }
    }

    ejecutarSinEspera(cargarOpciones());

    return () => {
      cancelado = true;
    };
  }, [
    usaCatalogo,
    codigoCatalogo,
    codigoPreguntaPadre,
    valorPadre,
    pregunta.limite_items_catalogo,
    pregunta.opciones,
    busqueda,
    idioma,
    incluirAccesibilidad,
    enLinea,
  ]);

  const opciones = usaCatalogo && codigoCatalogo ? opcionesCatalogo : pregunta.opciones;

  return { opciones, cargando: usaCatalogo ? cargando : false, error };
}
