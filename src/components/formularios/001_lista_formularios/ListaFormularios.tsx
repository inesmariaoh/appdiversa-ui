/**
 * Componente que renderiza el listado de formularios disponibles.
 * Consume los datos desde la prop; el padre es responsable de la llamada a API.
 */

import type { FormularioDisponible } from '@/types/formulario';
import { TarjetaFormulario } from '../002_tarjeta_formulario/TarjetaFormulario';

interface ListaFormulariosProps {
  readonly formularios: FormularioDisponible[];
  readonly tituloSeccion?: string;
  readonly descripcionSeccion?: string;
}

export function ListaFormularios({
  formularios,
  tituloSeccion,
  descripcionSeccion,
}: Readonly<ListaFormulariosProps>) {
  return (
    <section id="encuestas" aria-labelledby={tituloSeccion ? 'titulo-encuestas' : undefined}>
      {(tituloSeccion || descripcionSeccion) && (
        <div className="mb-6">
          {tituloSeccion && (
            <h1
              id="titulo-encuestas"
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-texto-primario)' }}
            >
              {tituloSeccion}
            </h1>
          )}
          {descripcionSeccion && (
            <p
              className="text-base"
              style={{ color: 'var(--color-texto-secundario)' }}
            >
              {descripcionSeccion}
            </p>
          )}
        </div>
      )}

      {formularios.length === 0 ? (
        <output
          className="text-base block"
          style={{ color: 'var(--color-texto-muted)' }}
        >
          No hay encuestas disponibles en este momento.
        </output>
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
          style={{ gap: 'var(--espacio-lg)' }}
          aria-label="Lista de encuestas"
        >
          {formularios.map((formulario) => (
            <li key={formulario.uuid} className="flex min-h-0">
              <TarjetaFormulario formulario={formulario} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
