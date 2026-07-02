'use client';

/**
 * Sincroniza formularios obtenidos por SSR con el store de cliente.
 */

import { useEffect } from 'react';
import type { FormularioDisponible } from '@/types/formulario';
import { useFormulariosStore } from '@/store/formulariosStore';

interface SincronizarFormulariosStoreProps {
  readonly formularios: FormularioDisponible[];
}

export function SincronizarFormulariosStore({
  formularios,
}: SincronizarFormulariosStoreProps) {
  const establecerDisponibles = useFormulariosStore((s) => s.establecerDisponibles);

  useEffect(() => {
    establecerDisponibles(formularios);
  }, [formularios, establecerDisponibles]);

  return null;
}
