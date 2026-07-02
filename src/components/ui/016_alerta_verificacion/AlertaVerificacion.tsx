/**
 * Banner de verificacion exitosa — Figma parte06 / Wrapper.png.
 * Muestra: icono check (acento) + titulo + descripcion opcionales.
 * Uso: previo al consentimiento o al inicio de la seccion principal.
 * Texto viene desde props (API); no hay hardcoding.
 */

interface AlertaVerificacionProps {
  readonly titulo?: string;
  readonly descripcion?: string;
}

export function AlertaVerificacion({
  titulo = 'Verificado con éxito',
  descripcion,
}: AlertaVerificacionProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-acento) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-acento) 30%, transparent)',
      }}
    >
      <IconoVerificado />

      <div>
        <p
          className="text-base font-bold"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {titulo}
        </p>
        {descripcion && (
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            {descripcion}
          </p>
        )}
      </div>
    </div>
  );
}

function IconoVerificado() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0 mt-0.5"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="var(--color-acento, #00B4A0)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M7 12L10.5 15.5L17 9"
        stroke="var(--color-acento, #00B4A0)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
