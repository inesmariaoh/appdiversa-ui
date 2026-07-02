'use client';

/**
 * Listado administrativo de formularios con acciones CRUD.
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
      const lista = await listarFormulariosAdmin();
      setFormularios(lista);
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    ejecutarSinEspera((async () => {
      await cargar();
      if (cancelado) return;
    })());
    return () => {
      cancelado = true;
    };
  }, [cargar]);

  async function ejecutarAccion(
    accion: () => Promise<unknown>,
    mensajeConfirmacion?: string
  ) {
    if (mensajeConfirmacion) {
      const aceptado = await confirmar({
        titulo: 'Confirmar acción',
        mensaje: mensajeConfirmacion,
        etiquetaConfirmar: 'Confirmar',
        etiquetaCancelar: 'Cancelar',
      });
      if (!aceptado) return;
    }
    try {
      await accion();
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  if (cargando) {
    return <p role="status">Cargando formularios...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          Formularios
        </h1>
        {puedeEditar && (
          <Link href="/admin/formularios/nuevo">
            <Boton>Crear formulario</Boton>
          </Link>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-borde)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--color-fondo-pagina)' }}>
            <tr>
              <th className="text-left p-3 font-semibold">Codigo</th>
              <th className="text-left p-3 font-semibold">Nombre</th>
              <th className="text-left p-3 font-semibold">Estado</th>
              <th className="text-left p-3 font-semibold">Tipo</th>
              <th className="text-left p-3 font-semibold">Inicio</th>
              <th className="text-left p-3 font-semibold">Fin</th>
              <th className="text-left p-3 font-semibold">Version</th>
              <th className="text-left p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formularios.map((formulario) => (
              <tr
                key={formulario.id}
                className="border-t"
                style={{ borderColor: 'var(--color-borde)' }}
              >
                <td className="p-3">{formulario.codigo}</td>
                <td className="p-3">{formulario.nombre}</td>
                <td className="p-3">
                  <EstadoBadge estado={formulario.estado} />
                </td>
                <td className="p-3">{formulario.tipo_formulario}</td>
                <td className="p-3">{formulario.fecha_inicio ?? '—'}</td>
                <td className="p-3">{formulario.fecha_fin ?? '—'}</td>
                <td className="p-3">{formulario.version_publicada ?? '—'}</td>
                <td className="p-3">
                  <AccionesFormulario
                    formulario={formulario}
                    puedeEditar={puedeEditar}
                    puedePublicar={puedePublicar}
                    onEditar={() => router.push(`/admin/formularios/${formulario.id}/editor`)}
                    onEstructura={() => router.push(`/admin/formularios/${formulario.id}`)}
                    onDuplicar={() =>
                      ejecutarSinEspera(
                        ejecutarAccion(
                          () => duplicarFormularioAdmin(formulario.id),
                          '¿Desea duplicar este formulario?'
                        )
                      )
                    }
                    onPublicar={() =>
                      ejecutarSinEspera(
                        ejecutarAccion(
                          () => publicarFormularioAdmin(formulario.id),
                          '¿Desea publicar este formulario?'
                        )
                      )
                    }
                    onCerrar={() =>
                      ejecutarSinEspera(
                        ejecutarAccion(
                          () => cerrarFormularioAdmin(formulario.id),
                          '¿Desea cerrar este formulario?'
                        )
                      )
                    }
                    onEliminar={() =>
                      ejecutarSinEspera(
                        ejecutarAccion(
                          () => eliminarFormularioAdmin(formulario.id),
                          '¿Desea eliminar lógicamente este formulario?'
                        )
                      )
                    }
                  />
                </td>
              </tr>
            ))}
            {formularios.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center" style={{ color: 'var(--color-texto-muted)' }}>
                  No hay formularios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className="inline-block px-2 py-1 rounded-full text-xs font-medium capitalize"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-primario) 10%, transparent)',
        color: 'var(--color-primario)',
      }}
    >
      {estado}
    </span>
  );
}

interface AccionesFormularioProps {
  readonly formulario: FormularioAdminResumen;
  readonly puedeEditar: boolean;
  readonly puedePublicar: boolean;
  readonly onEditar: () => void;
  readonly onEstructura: () => void;
  readonly onDuplicar: () => void;
  readonly onPublicar: () => void;
  readonly onCerrar: () => void;
  readonly onEliminar: () => void;
}

function AccionesFormulario({
  puedeEditar,
  puedePublicar,
  onEditar,
  onEstructura,
  onDuplicar,
  onPublicar,
  onCerrar,
  onEliminar,
}: AccionesFormularioProps) {
  if (!puedeEditar && !puedePublicar) {
    return (
      <button type="button" className="text-sm underline" onClick={onEstructura}>
        Ver
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {puedeEditar && (
        <>
          <BotonAccion onClick={onEditar} etiqueta="Editar" />
          <BotonAccion onClick={onDuplicar} etiqueta="Duplicar" />
          <BotonAccion onClick={onEstructura} etiqueta="Estructura" />
          <BotonAccion onClick={onCerrar} etiqueta="Cerrar" />
          <BotonAccion onClick={onEliminar} etiqueta="Eliminar" />
        </>
      )}
      {puedePublicar && <BotonAccion onClick={onPublicar} etiqueta="Publicar" />}
    </div>
  );
}

function BotonAccion({ onClick, etiqueta }: { onClick: () => void; etiqueta: string }) {
  return (
    <button
      type="button"
      className="text-xs px-2 py-1 rounded border"
      style={{ borderColor: 'var(--color-borde)', color: 'var(--color-primario)' }}
      onClick={onClick}
    >
      {etiqueta}
    </button>
  );
}
