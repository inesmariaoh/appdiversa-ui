'use client';

/**
 * Panel de gestion de items para un catalogo seleccionado.
 */

import { useCallback, useEffect, useState } from 'react';
import { Boton } from '@/components/ui/001_boton';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import type {
  CatalogoAdmin,
  ItemCatalogoAdmin,
  ItemCatalogoAdminEntrada,
} from '@/types/catalogo';
import {
  actualizarItemCatalogoAdmin,
  crearItemCatalogoAdmin,
  eliminarItemCatalogoAdmin,
  listarItemsCatalogoAdmin,
} from '@/services/catalogosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const FORMULARIO_VACIO: ItemCatalogoAdminEntrada = {
  codigo: '',
  nombre: '',
  descripcion: '',
  valor: '',
  orden: 1,
  esta_activo: true,
};

interface PropsPanelItems {
  readonly catalogo: CatalogoAdmin;
  readonly onCerrar: () => void;
}

export function PanelItemsCatalogo({ catalogo, onCerrar }: PropsPanelItems) {
  const [items, setItems] = useState<ItemCatalogoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<ItemCatalogoAdminEntrada>(FORMULARIO_VACIO);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setItems(await listarItemsCatalogoAdmin(catalogo.id));
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }, [catalogo.id]);

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
        await actualizarItemCatalogoAdmin(editandoId, formulario);
      } else {
        await crearItemCatalogoAdmin(catalogo.id, formulario);
      }
      reiniciar();
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function eliminar(item: ItemCatalogoAdmin) {
    setError(null);
    try {
      await eliminarItemCatalogoAdmin(item.id);
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  function iniciarEdicion(item: ItemCatalogoAdmin) {
    setEditandoId(item.id);
    setMostrarFormulario(true);
    setFormulario({
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      valor: item.valor,
      codigo_externo: item.codigo_externo,
      orden: item.orden,
      esta_activo: item.esta_activo,
    });
  }

  return (
    <section className="mt-8 p-4 rounded-xl border" style={{ borderColor: 'var(--color-borde)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-texto-primario)' }}>
          Items de {catalogo.nombre}
        </h2>
        <div className="flex gap-2">
          <Boton type="button" onClick={() => setMostrarFormulario(true)}>
            Crear item
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cerrar
          </Boton>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      {mostrarFormulario && (
        <div
          className="mb-6 p-4 rounded-xl border max-w-xl flex flex-col gap-3"
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
            etiqueta="Valor"
            value={formulario.valor ?? ''}
            onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
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

      {cargando ? (
        <output aria-live="polite" className="block">
          Cargando items...
        </output>
      ) : (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-borde)' }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--color-fondo-pagina)' }}>
              <tr>
                <th className="text-left p-3">Código</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Valor</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--color-borde)' }}>
                  <td className="p-3">{item.codigo}</td>
                  <td className="p-3">{item.nombre}</td>
                  <td className="p-3">{item.valor}</td>
                  <td className="p-3">{item.esta_activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" className="text-xs underline" onClick={() => iniciarEdicion(item)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => ejecutarSinEspera(eliminar(item))}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
