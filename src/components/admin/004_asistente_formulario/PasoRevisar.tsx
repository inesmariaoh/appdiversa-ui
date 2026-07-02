'use client';

/**
 * Paso final del asistente: resumen de completitud, vista previa y publicacion.
 */

import { useState } from 'react';
import type { FormularioAdminDetalle } from '@/types/admin';
import type { FormularioEstructura } from '@/types/formulario';
import { Boton } from '@/components/ui/001_boton';
import { useConfirmacion } from '@/components/ui/006_proveedores_ui';
import { VistaPreviaFormulario } from '@/components/admin/010_vista_previa';
import { useAuthStore } from '@/store/authStore';
import { PERMISO_FORMULARIOS_PUBLICAR } from '@/types/auth';
import { publicarFormularioAdmin } from '@/services/formulariosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { AvisoPaso } from './AvisoPaso';

const ESTADO_BORRADOR = 'borrador';

interface PasoRevisarProps {
  readonly idFormulario: number;
  readonly detalle: FormularioAdminDetalle;
  readonly estructura: FormularioEstructura;
  readonly onPublicado: () => void;
}

export function PasoRevisar({ idFormulario, detalle, estructura, onPublicado }: PasoRevisarProps) {
  const { confirmar } = useConfirmacion();
  const puedePublicar = useAuthStore((s) => s.tienePermiso(PERMISO_FORMULARIOS_PUBLICAR));
  const [error, setError] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);

  const totalPreguntas = estructura.secciones.reduce(
    (acumulado, seccion) => acumulado + seccion.preguntas.length,
    0,
  );
  const listoParaPublicar = estructura.secciones.length > 0 && totalPreguntas > 0;

  async function publicar() {
    const aceptado = await confirmar({
      titulo: 'Publicar formulario',
      mensaje: 'Una vez publicado quedara disponible para los encuestados. Deseas continuar?',
      etiquetaConfirmar: 'Publicar',
      etiquetaCancelar: 'Cancelar',
    });
    if (!aceptado) return;
    setError(null);
    setPublicando(true);
    try {
      await publicarFormularioAdmin(idFormulario);
      onPublicado();
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ResumenFormulario
        estado={detalle.estado}
        totalSecciones={estructura.secciones.length}
        totalPreguntas={totalPreguntas}
      />

      {!listoParaPublicar && (
        <AvisoPaso mensaje="Necesitas al menos una seccion y una pregunta antes de publicar." />
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      {puedePublicar && detalle.estado === ESTADO_BORRADOR && (
        <Boton
          type="button"
          cargando={publicando}
          disabled={!listoParaPublicar || publicando}
          onClick={() => ejecutarSinEspera(publicar())}
        >
          Publicar formulario
        </Boton>
      )}

      <div>
        <h3 className="mb-3 text-lg font-bold" style={{ color: 'var(--color-texto-primario)' }}>
          Vista previa
        </h3>
        <VistaPreviaFormulario uuidFormulario={detalle.uuid} estructura={estructura} />
      </div>
    </div>
  );
}

function ResumenFormulario({
  estado,
  totalSecciones,
  totalPreguntas,
}: {
  readonly estado: string;
  readonly totalSecciones: number;
  readonly totalPreguntas: number;
}) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <TarjetaResumen etiqueta="Estado" valor={estado} />
      <TarjetaResumen etiqueta="Secciones" valor={String(totalSecciones)} />
      <TarjetaResumen etiqueta="Preguntas" valor={String(totalPreguntas)} />
    </dl>
  );
}

function TarjetaResumen({ etiqueta, valor }: { readonly etiqueta: string; readonly valor: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-borde)' }}>
      <dt className="text-xs uppercase" style={{ color: 'var(--color-texto-muted)' }}>
        {etiqueta}
      </dt>
      <dd className="mt-1 text-lg font-bold capitalize" style={{ color: 'var(--color-texto-primario)' }}>
        {valor}
      </dd>
    </div>
  );
}
