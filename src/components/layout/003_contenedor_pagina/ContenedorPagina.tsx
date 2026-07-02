/**
 * Contenedor principal de pagina.
 * Garantiza un unico elemento <main> por pagina con el ancho maximo correcto.
 * WCAG: un solo main por pagina.
 */

interface ContenedorPaginaProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly etiquetaAria?: string;
}

export function ContenedorPagina({
  children,
  className = '',
  etiquetaAria,
}: ContenedorPaginaProps) {
  return (
    <main
      id="contenido-principal"
      className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      aria-label={etiquetaAria}
    >
      {children}
    </main>
  );
}
