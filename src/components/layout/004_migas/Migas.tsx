/**
 * Componente de migas de pan (breadcrumb).
 * WCAG: usa <nav aria-label="Ruta de navegacion"> y <ol> semantico.
 * El ultimo elemento es aria-current="page".
 */

import Link from 'next/link';

export interface Miga {
  etiqueta: string;
  href?: string;
}

interface MigasProps {
  readonly items: Miga[];
}

export function Migas({ items }: MigasProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className="mb-1">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {items.map((item, indice) => {
          const esUltimo = indice === items.length - 1;
          return (
            <li key={`${item.etiqueta}-${indice}`} className="flex items-center gap-1">
              {indice > 0 && (
                <span
                  aria-hidden="true"
                  style={{ color: 'var(--color-texto-muted)' }}
                >
                  ›
                </span>
              )}
              {item.href && !esUltimo ? (
                <Link
                  href={item.href}
                  className="hover:underline transition-colors"
                  style={{ color: 'var(--color-texto-secundario)' }}
                >
                  {item.etiqueta}
                </Link>
              ) : (
                <span
                  aria-current={esUltimo ? 'page' : undefined}
                  style={{
                    color: esUltimo
                      ? 'var(--color-texto-muted)'
                      : 'var(--color-texto-secundario)',
                    fontWeight: esUltimo ? 400 : undefined,
                  }}
                >
                  {item.etiqueta}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
