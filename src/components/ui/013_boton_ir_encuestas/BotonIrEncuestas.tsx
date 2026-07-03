'use client';

/**
 * Boton reutilizable que redirige a la seccion de encuestas.
 * Se usa en las paginas del usuario autenticado (historial y perfil).
 */

import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/001_boton';

interface BotonIrEncuestasProps {
  readonly etiqueta?: string;
}

export function BotonIrEncuestas({ etiqueta = 'Redirigir a Encuestas' }: BotonIrEncuestasProps) {
  const router = useRouter();

  return (
    <div className="flex justify-center mt-8">
      <Boton type="button" variante="primario" onClick={() => router.push('/encuestas')}>
        {etiqueta}
      </Boton>
    </div>
  );
}
