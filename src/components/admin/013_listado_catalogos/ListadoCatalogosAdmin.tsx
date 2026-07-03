'use client';

/**
 * Listado y gestion administrativa de catalogos parametrizables.
 */

import { useCallback, useEffect, useState } from 'react';
import { Boton } from '@/components/ui/001_boton';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import type { CatalogoAdmin, CatalogoAdminEntrada } from '@/types/catalogo';
import {
  actualizarCatalogoAdmin,
  crearCatalogoAdmin,
  eliminarCatalogoAdmin,
  listarCatalogosAdmin,
} from '@/services/catalogosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { PanelItemsCatalogo } from './PanelItemsCatalogo';

const FORMULARIO_VACIO: CatalogoAdminEntrada = {
  codigo: '',
  nombre: '',
  descripcion: '',
  tipo_catalogo: 'general',
  esta_activo: true,
  orden: 1,
};

export function ListadoCatalogosAdmin() {
  const [catalogos, setCatalogos] = useState<CatalogoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<CatalogoAdminEntrada>(FORMULARIO_VACIO);
  const [seleccionado, setSeleccionado] = useState<CatalogoAdmin | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setCatalogos(await listarCatalogosAdmin());
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    ejecutarSinEspera(cargar());
  }, [cargar]);

  function reiniciar() {
    setFormulario(FORMULARIO_VACIO);
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  async function guardar() {
    setError(null);
    try {
      if (editandoId) {
        await actualizarCatalogoAdmin(editandoId, formulario);
      } else {
        await crearCatalogoAdmin(formulario);
      }
      reiniciar();
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function eliminar(catalogo: CatalogoAdmin) {
    setError(null);
    try {
      await eliminarCatalogoAdmin(catalogo.id);
      if (seleccionado?.id === catalogo.id) setSeleccionado(null);
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  function iniciarEdicion(catalogo: CatalogoAdmin) {
    setEditandoId(catalogo.id);
    setMostrarFormulario(true);
    setFormulario({
      codigo: catalogo.codigo,
      nombre: catalogo.nombre,
      descripcion: catalogo.descripcion,
      tipo_catalogo: catalogo.tipo_catalogo,
      esta_activo: catalogo.esta_activo,
      orden: catalogo.orden,
    });
  }

  if (cargando) {
    return (
      <output aria-live="polite" className="block">
        Cargando catálogos...
      </output>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
          Catálogos
        </h1>
        <Boton type="button" onClick={() => setMostrarFormulario(true)}>
          Crear catálogo
        </Boton>
      </div>

      {error && (
        <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      {mostrarFormulario && (
        <div
          className="mb-8 p-4 rounded-xl border max-w-xl flex flex-col gap-3"
          style={{ borderColor: 'var(--color-borde)' }}
        >
          <CampoTexto
            etiqueta="Código"
            value={formulario.codigo}
            disabled={Boolean(editandoId)}
            onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
          />
          <CampoTexto
            etiqueta="Nombre"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
          />
          <CampoTexto
            etiqueta="Tipo de catálogo"
            value={formulario.tipo_catalogo}
            onChange={(e) => setFormulario({ ...formulario, tipo_catalogo: e.target.value })}
          />
          <CampoTexto
            etiqueta="Descripción"
            value={formulario.descripcion ?? ''}
            onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formulario.esta_activo ?? true}
              onChange={(e) => setFormulario({ ...formulario, esta_activo: e.target.checked })}
            />
            <span>Activo</span>
          </label>
          <div className="flex gap-2">
            <Boton type="button" onClick={() => ejecutarSinEspera(guardar())}>
              {editandoId ? 'Actualizar' : 'Crear'}
            </Boton>
            <Boton type="button" variante="secundario" onClick={reiniciar}>
              Cancelar
            </Boton>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-borde)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--color-fondo-pagina)' }}>
            <tr>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {catalogos.map((catalogo) => (
              <tr key={catalogo.id} className="border-t" style={{ borderColor: 'var(--color-borde)' }}>
                <td className="p-3">{catalogo.codigo}</td>
                <td className="p-3">{catalogo.nombre}</td>
                <td className="p-3">{catalogo.tipo_catalogo}</td>
                <td className="p-3">{catalogo.total_items}</td>
                <td className="p-3">{catalogo.esta_activo ? 'Activo' : 'Inactivo'}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button type="button" className="text-xs underline" onClick={() => setSeleccionado(catalogo)}>
                      Items
                    </button>
                    <button type="button" className="text-xs underline" onClick={() => iniciarEdicion(catalogo)}>
                      Editar
                    </button>
                    {!catalogo.es_sistema && (
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => ejecutarSinEspera(eliminar(catalogo))}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {seleccionado && (
        <PanelItemsCatalogo catalogo={seleccionado} onCerrar={() => setSeleccionado(null)} />
      )}
    </div>
  );
}
