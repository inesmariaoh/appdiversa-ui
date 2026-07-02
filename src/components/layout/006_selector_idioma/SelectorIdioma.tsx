'use client';

/**
 * Selector de idioma para parametros de API publicos.
 */

import { useIdioma } from '@/hooks/useIdioma';

const IDIOMAS = [
  { codigo: 'es', etiqueta: 'Español' },
  { codigo: 'en', etiqueta: 'English' },
];

export function SelectorIdioma() {
  const { idioma, incluirAccesibilidad, establecerIdioma, alternarAccesibilidad } =
    useIdioma();

  return (
    <div
      className="flex flex-wrap items-center gap-4 text-sm"
      style={{ color: 'var(--color-texto-secundario)' }}
    >
      <label className="flex items-center gap-2">
        <span className="sr-only">Idioma de la interfaz</span>
        <span aria-hidden="true">Idioma</span>
        <select
          value={idioma}
          onChange={(e) => establecerIdioma(e.target.value)}
          className="rounded-md px-2 py-1 text-sm"
          style={{
            border: '1px solid var(--color-borde-fuerte)',
            backgroundColor: 'var(--color-fondo-tarjeta)',
            color: 'var(--color-texto-primario)',
          }}
        >
          {IDIOMAS.map((item) => (
            <option key={item.codigo} value={item.codigo}>
              {item.etiqueta}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={incluirAccesibilidad}
          onChange={alternarAccesibilidad}
        />
        <span>Incluir contenido accesible</span>
      </label>
    </div>
  );
}
