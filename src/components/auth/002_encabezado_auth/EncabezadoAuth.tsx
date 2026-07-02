/**
 * Encabezado de pantallas de autenticacion: titulo + subtitulo.
 * Ambos textos provienen del llamador (desde API). Ningun texto quemado.
 */

interface EncabezadoAuthProps {
  readonly titulo: string;
  readonly subtitulo?: string;
}

export function EncabezadoAuth({ titulo, subtitulo }: EncabezadoAuthProps) {
  return (
    <div className="text-center mb-6">
      <h1
        className="text-2xl font-bold leading-tight"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        {titulo}
      </h1>
      {subtitulo && (
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--color-texto-secundario)' }}
        >
          {subtitulo}
        </p>
      )}
    </div>
  );
}
