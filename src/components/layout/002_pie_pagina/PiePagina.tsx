/**
 * Componente de pie de pagina de AppDiversa UI.
 * Muestra el texto de copyright centrado. El texto viene desde la configuracion de interfaz.
 */

interface PiePaginaProps {
  readonly textoPie: string;
}

export function PiePagina({ textoPie }: PiePaginaProps) {
  return (
    <footer
      className="w-full mt-auto"
      style={{
        backgroundColor: 'var(--color-fondo-pie)',
        borderTop: '1px solid var(--color-borde)',
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 text-center">
        <p
          className="text-sm"
          style={{ color: 'var(--color-texto-muted)' }}
        >
          {textoPie}
        </p>
      </div>
    </footer>
  );
}
