'use client';

/**
 * Protege el acceso al formulario principal verificando filtros completados.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PanelFormulario } from '@/components/formularios/003_panel_formulario';
import type { FormularioEstructura } from '@/types/formulario';
import {
  construirEstructuraSinFiltros,
  formularioTienePreguntasFiltro,
} from '@/utils/estructuraFormularioFiltros';
import { filtrosCompletados } from '@/storage/filtrosSesion';

interface EncuestaResponderClienteProps {
  readonly uuidFormulario: string;
  readonly estructura: FormularioEstructura;
}

export function EncuestaResponderCliente({
  uuidFormulario,
  estructura,
}: EncuestaResponderClienteProps) {
  const router = useRouter();
  const requiereFiltros = formularioTienePreguntasFiltro(estructura);
  const estructuraPrincipal = construirEstructuraSinFiltros(estructura);

  useEffect(() => {
    if (requiereFiltros && !filtrosCompletados(uuidFormulario)) {
      router.replace(`/encuestas/${uuidFormulario}`);
    }
  }, [requiereFiltros, router, uuidFormulario]);

  if (requiereFiltros && !filtrosCompletados(uuidFormulario)) {
    return null;
  }

  return (
    <PanelFormulario
      uuidFormulario={uuidFormulario}
      estructura={estructuraPrincipal}
      consentimientoPreaceptado={requiereFiltros}
    />
  );
}
