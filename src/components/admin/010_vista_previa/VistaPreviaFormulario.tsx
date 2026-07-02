'use client';

/**
 * Vista previa del formulario usando PanelFormulario en modo preview.
 */

import Image from 'next/image';
import type { FormularioEstructura } from '@/types/formulario';
import { PanelFormulario } from '@/components/formularios/003_panel_formulario';

interface VistaPreviaFormularioProps {
  readonly uuidFormulario: string;
  readonly estructura: FormularioEstructura;
}

export function VistaPreviaFormulario({
  uuidFormulario,
  estructura,
}: VistaPreviaFormularioProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="p-4 rounded-lg text-sm"
        role="status"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-acento) 15%, transparent)',
          color: 'var(--color-texto-primario)',
        }}
      >
        Vista previa: las respuestas no se guardan ni se envian al servidor.
      </div>

      {estructura.imagen_portada && (
        <Image
          src={estructura.imagen_portada}
          alt="Portada del formulario"
          width={1200}
          height={192}
          unoptimized
          className="w-full max-h-48 object-cover rounded-xl h-auto"
        />
      )}

      <PanelFormulario
        uuidFormulario={uuidFormulario}
        estructura={estructura}
        modoPreview
      />
    </div>
  );
}
