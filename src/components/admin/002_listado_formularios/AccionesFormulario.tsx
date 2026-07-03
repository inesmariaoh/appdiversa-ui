'use client';

/**
 * Acciones de una fila del listado: una accion principal para abrir el asistente
 * y un menu compacto con las acciones secundarias.
 */

interface AccionesFormularioProps {
  readonly puedeEditar: boolean;
  readonly puedePublicar: boolean;
  readonly onAbrir: () => void;
  readonly onVer: () => void;
  readonly onDuplicar: () => void;
  readonly onPublicar: () => void;
  readonly onCerrar: () => void;
  readonly onEliminar: () => void;
}

export function AccionesFormulario({
  puedeEditar,
  puedePublicar,
  onAbrir,
  onVer,
  onDuplicar,
  onPublicar,
  onCerrar,
  onEliminar,
}: AccionesFormularioProps) {
  if (!puedeEditar && !puedePublicar) {
    return <BotonPrimario etiqueta="Ver" onClick={onVer} />;
  }

  return (
    <div className="flex items-center gap-2">
      {puedeEditar && <BotonPrimario etiqueta="Abrir" onClick={onAbrir} />}
      <MenuAcciones>
        {puedeEditar && <OpcionMenu etiqueta="Duplicar" onClick={onDuplicar} />}
        {puedePublicar && <OpcionMenu etiqueta="Publicar" onClick={onPublicar} />}
        {puedeEditar && <OpcionMenu etiqueta="Cerrar" onClick={onCerrar} />}
        {puedeEditar && <OpcionMenu etiqueta="Eliminar" onClick={onEliminar} peligro />}
      </MenuAcciones>
    </div>
  );
}

function BotonPrimario({ etiqueta, onClick }: { readonly etiqueta: string; readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium"
      style={{
        backgroundColor: 'var(--color-primario)',
        color: 'var(--color-texto-invertido)',
        minHeight: 'var(--tamano-control-min)',
        minWidth: '5.5rem',
      }}
    >
      {etiqueta}
    </button>
  );
}

function MenuAcciones({ children }: { readonly children: React.ReactNode }) {
  return (
    <details className="relative">
      <summary
        aria-label="Mas acciones"
        className="flex cursor-pointer list-none items-center justify-center rounded-lg border px-2"
        style={{
          borderColor: 'var(--color-borde)',
          color: 'var(--color-texto-primario)',
          minWidth: 'var(--tamano-control-min)',
          minHeight: 'var(--tamano-control-min)',
        }}
      >
        <IconoPuntos />
      </summary>
      <div
        className="absolute right-0 z-10 mt-1 flex min-w-[9rem] flex-col rounded-lg border py-1 shadow-lg"
        style={{
          borderColor: 'var(--color-borde)',
          backgroundColor: 'var(--color-fondo-tarjeta)',
        }}
      >
        {children}
      </div>
    </details>
  );
}

function OpcionMenu({
  etiqueta,
  onClick,
  peligro = false,
}: {
  readonly etiqueta: string;
  readonly onClick: () => void;
  readonly peligro?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 text-left text-sm"
      style={{ color: peligro ? 'var(--color-error)' : 'var(--color-texto-primario)' }}
    >
      {etiqueta}
    </button>
  );
}

function IconoPuntos() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}
