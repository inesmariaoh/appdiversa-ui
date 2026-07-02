/**
 * Encabezado accesible compartido para componentes de pregunta.
 */

interface EncabezadoPreguntaProps {
  readonly orden: number;
  readonly texto: string;
  readonly ayuda?: string | null;
  readonly obligatoria?: boolean;
  readonly idAyuda?: string;
}

export function EncabezadoPregunta({
  orden,
  texto,
  ayuda,
  obligatoria = false,
  idAyuda,
}: EncabezadoPreguntaProps) {
  return (
    <legend className="w-full mb-4">
      <span
        className="text-2xl font-bold leading-snug"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        {orden}. {texto}
        {obligatoria && (
          <span className="solo-lector-pantalla"> (obligatoria)</span>
        )}
      </span>
      {ayuda && (
        <p
          id={idAyuda}
          className="text-sm mt-1"
          style={{ color: 'var(--color-texto-secundario)' }}
        >
          {ayuda}
        </p>
      )}
    </legend>
  );
}
