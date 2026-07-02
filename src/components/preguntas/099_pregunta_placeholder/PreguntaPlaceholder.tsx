/**
 * Placeholder accesible para tipos de pregunta aun no implementados.
 */

import type { PropsPregunta } from '../types';

export function PreguntaPlaceholder({ pregunta, idPrefijo }: PropsPregunta) {
  const idMensaje = `${idPrefijo ?? pregunta.codigo}-placeholder`;

  return (
    <div
      role="status"
      aria-live="polite"
      id={idMensaje}
      className="rounded-lg p-4"
      style={{
        backgroundColor: 'var(--color-fondo-pagina)',
        color: 'var(--color-texto-secundario)',
      }}
    >
      <p className="text-sm">
        El tipo de pregunta &quot;{pregunta.tipo_pregunta}&quot; aun no esta
        disponible en esta version.
      </p>
    </div>
  );
}
