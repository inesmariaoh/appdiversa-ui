/**
 * Convierte items de catalogo al formato de opciones de pregunta.
 */

import type { ItemCatalogo } from '@/types/catalogo';
import type { OpcionRespuesta } from '@/types/formulario';

export function itemsCatalogoAopciones(items: ItemCatalogo[]): OpcionRespuesta[] {
  return [...items]
    .sort((a, b) => a.orden - b.orden)
    .map((item) => ({
      codigo: item.codigo,
      etiqueta: item.nombre,
      valor: item.valor || item.codigo,
      orden: item.orden,
    }));
}
