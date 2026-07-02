'use client';

/**
 * Store de cache de catalogos en memoria.
 */

import { create } from 'zustand';
import type { Catalogo, ItemCatalogo } from '@/types/catalogo';

interface CatalogosStore {
  catalogos: Catalogo[];
  itemsPorCatalogo: Record<string, ItemCatalogo[]>;
  establecerCatalogos: (catalogos: Catalogo[]) => void;
  establecerItems: (codigoCatalogo: string, items: ItemCatalogo[]) => void;
  fusionarItems: (codigoCatalogo: string, items: ItemCatalogo[]) => void;
  obtenerItems: (codigoCatalogo: string) => ItemCatalogo[];
  limpiar: () => void;
}

function fusionarItemsCatalogo(
  actuales: ItemCatalogo[],
  nuevos: ItemCatalogo[],
): ItemCatalogo[] {
  const mapa = new Map(actuales.map((item) => [item.codigo, item]));
  nuevos.forEach((item) => {
    mapa.set(item.codigo, item);
  });
  return Array.from(mapa.values());
}

export const useCatalogosStore = create<CatalogosStore>((set, get) => ({
  catalogos: [],
  itemsPorCatalogo: {},

  establecerCatalogos: (catalogos) => set({ catalogos }),

  establecerItems: (codigoCatalogo, items) =>
    set((estado) => ({
      itemsPorCatalogo: {
        ...estado.itemsPorCatalogo,
        [codigoCatalogo]: items,
      },
    })),

  fusionarItems: (codigoCatalogo, items) =>
    set((estado) => ({
      itemsPorCatalogo: {
        ...estado.itemsPorCatalogo,
        [codigoCatalogo]: fusionarItemsCatalogo(
          estado.itemsPorCatalogo[codigoCatalogo] ?? [],
          items,
        ),
      },
    })),

  obtenerItems: (codigoCatalogo) =>
    get().itemsPorCatalogo[codigoCatalogo] ?? [],

  limpiar: () => set({ catalogos: [], itemsPorCatalogo: {} }),
}));
