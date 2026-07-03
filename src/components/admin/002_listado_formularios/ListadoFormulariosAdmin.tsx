'use client';

/**
 * Listado administrativo de formularios con una accion principal para abrir el
 * asistente guiado y un menu compacto para las acciones secundarias.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/001_boton';
import { useConfirmacion } from '@/components/ui/006_proveedores_ui';
import type { FormularioAdminResumen } from '@/types/admin';
import {
  cerrarFormularioAdmin,
  duplicarFormularioAdmin,
  eliminarFormularioAdmin,
  listarFormulariosAdmin,
  publicarFormularioAdmin,
} from '@/services/formulariosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { PERMISO_FORMULARIOS_EDITAR, PERMISO_FORMULARIOS_PUBLICAR } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { EstadoBadge } from './EstadoBadge';
import { AccionesFormulario } from './AccionesFormulario';

export function ListadoFormulariosAdmin() {
  const router = useRouter();
  const { confirmar } = useConfirmacion();
  const puedeEditar = useAuthStore((s) => s.tienePermiso(PERMISO_FORMULARIOS_EDITAR));
  const puedePublicar = useAuthStore((s) => s.tienePermiso(PERMISO_FORMULARIOS_PUBLICAR));
  const [formularios, setFormularios] = useState<FormularioAdminResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setFormularios(await listarFormulariosAdmin());
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    ejecutarSinEspera((async () => {
      await cargar();
    })());
  }, [cargar]);

  const ejecutarAccion = useCallback(
    async (accion: () => Promise<unknown>, mensajeConfirmacion: string) => {
      const aceptado = await confirmar({
        titulo: 'Confirmar accion',
        mensaje: mensajeConfirmacion,
        etiquetaConfirmar: 'Confirmar',
        etiquetaCancelar: 'Cancelar',
      });
      if (!aceptado) return;
      try {
        await accion();
        await cargar();
      } catch (err) {
        setError(extraerDetalleError(err));
      }
    },
    [confirmar, cargar],
  );

  if (cargando) {
    return <p role="status">Cargando formularios...</p>;
  }

  return (
    <div>
      <Encabezado puedeEditar={puedeEditar} />

      {error && (
        <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-borde)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--color-fondo-pagina)' }}>
            <tr>
              <th className="p-3 text-left font-semibold">Código</th>
              <th className="p-3 text-left font-semibold">Nombre</th>
              <th className="p-3 text-left font-semibold">Estado</th>
              <th className="p-3 text-left font-semibold">Tipo</th>
              <th className="p-3 text-left font-semibold">Vigencia</th>
              <th className="p-3 text-left font-semibold">Versión</th>
              <th className="p-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formularios.map((formulario) => (
              <FilaFormulario
                key={formulario.id}
                formulario={formulario}
                puedeEditar={puedeEditar}
                puedePublicar={puedePublicar}
                onAbrir={() => router.push(`/admin/formularios/${formulario.id}/editor`)}
                onVer={() => router.push(`/admin/formularios/${formulario.id}`)}
                onDuplicar={() =>
                  ejecutarSinEspera(
                    ejecutarAccion(
                      () => duplicarFormularioAdmin(formulario.id),
                      'Desea duplicar este formulario?',
                    ),
                  )
                }
                onPublicar={() =>
                  ejecutarSinEspera(
                    ejecutarAccion(
                      () => publicarFormularioAdmin(formulario.id),
                      'Desea publicar este formulario?',
                    ),
                  )
                }
                onCerrar={() =>
                  ejecutarSinEspera(
                    ejecutarAccion(
                      () => cerrarFormularioAdmin(formulario.id),
                      'Desea cerrar este formulario?',
                    ),
                  )
                }
                onEliminar={() =>
                  ejecutarSinEspera(
                    ejecutarAccion(
                      () => eliminarFormularioAdmin(formulario.id),
                      'Desea eliminar logicamente este formulario?',
                    ),
                  )
                }
              />
            ))}
            {formularios.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center" style={{ color: 'var(--color-texto-muted)' }}>
                  Aun no hay formularios. Crea el primero para empezar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Encabezado({ puedeEditar }: { readonly puedeEditar: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
          Formularios
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-texto-muted)' }}>
          Crea y gestiona tus encuestas paso a paso desde un unico asistente.
        </p>
      </div>
      {puedeEditar && (
        <Link href="/admin/formularios/nuevo">
          <Boton>Crear formulario</Boton>
        </Link>
      )}
    </div>
  );
}

interface FilaFormularioProps {
  readonly formulario: FormularioAdminResumen;
  readonly puedeEditar: boolean;
  readonly puedePublicar: boolean;
  readonly onAbrir: () => void;
  readonly onVer: () => void;
  readonly onDuplicar: () => void;
  readonly onPublicar: () => void;
  readonly onCerrar: () => void;
  readonly onEliminar: () => void;
}

function FilaFormulario({ formulario, ...acciones }: FilaFormularioProps) {
  return (
    <tr className="border-t align-middle" style={{ borderColor: 'var(--color-borde)' }}>
      <td className="p-3">{formulario.codigo}</td>
      <td className="p-3 font-medium">{formulario.nombre}</td>
      <td className="p-3">
        <EstadoBadge estado={formulario.estado} />
      </td>
      <td className="p-3 capitalize">{formulario.tipo_formulario}</td>
      <td className="p-3">{formatearVigencia(formulario.fecha_inicio, formulario.fecha_fin)}</td>
      <td className="p-3">{formulario.version_publicada ?? '—'}</td>
      <td className="p-3">
        <AccionesFormulario {...acciones} />
      </td>
    </tr>
  );
}

function formatearVigencia(inicio: string | null, fin: string | null): string {
  if (!inicio && !fin) return '—';
  return `${inicio ?? '—'} a ${fin ?? '—'}`;
}
