'use client';

/**
 * Listado y gestion administrativa de usuarios.
 */

import { useCallback, useEffect, useState } from 'react';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { CampoContrasena } from '@/components/ui/009_campo_contrasena';
import { Boton } from '@/components/ui/001_boton';
import type { GrupoAdmin, UsuarioAdminResumen } from '@/types/admin';
import {
  activarUsuarioAdmin,
  crearUsuarioAdmin,
  desactivarUsuarioAdmin,
  listarGruposAdmin,
  listarUsuariosAdmin,
  actualizarUsuarioAdmin,
} from '@/services/usuariosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export function ListadoUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<UsuarioAdminResumen[]>([]);
  const [grupos, setGrupos] = useState<GrupoAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState({
    username: '',
    email: '',
    nombre_completo: '',
    password: '',
    grupos: [] as string[],
    esta_activo: true,
  });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, listaGrupos] = await Promise.all([
        listarUsuariosAdmin(),
        listarGruposAdmin(),
      ]);
      setUsuarios(lista);
      setGrupos(listaGrupos);
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

  function reiniciarFormulario() {
    setFormulario({
      username: '',
      email: '',
      nombre_completo: '',
      password: '',
      grupos: [],
      esta_activo: true,
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  async function guardar() {
    setError(null);
    try {
      if (editandoId) {
        await actualizarUsuarioAdmin(editandoId, {
          email: formulario.email,
          nombre_completo: formulario.nombre_completo,
          grupos: formulario.grupos,
          esta_activo: formulario.esta_activo,
          ...(formulario.password ? { password: formulario.password } : {}),
        });
      } else {
        await crearUsuarioAdmin(formulario);
      }
      reiniciarFormulario();
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function toggleActivo(usuario: UsuarioAdminResumen) {
    try {
      if (usuario.esta_activo) {
        await desactivarUsuarioAdmin(usuario.id);
      } else {
        await activarUsuarioAdmin(usuario.id);
      }
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  if (cargando) {
    return (
      <output aria-live="polite" className="block">
        Cargando usuarios...
      </output>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
          Usuarios
        </h1>
        <Boton type="button" onClick={() => setMostrarFormulario(true)}>
          Crear usuario
        </Boton>
      </div>

      {error && <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>}

      {mostrarFormulario && (
        <div className="mb-8 p-4 rounded-xl border max-w-xl flex flex-col gap-3"
          style={{ borderColor: 'var(--color-borde)' }}>
          <CampoTexto etiqueta="Usuario" value={formulario.username} disabled={Boolean(editandoId)}
            onChange={(e) => setFormulario({ ...formulario, username: e.target.value })} />
          <CampoTexto etiqueta="Email" type="email" value={formulario.email}
            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })} />
          <CampoTexto etiqueta="Nombre completo" value={formulario.nombre_completo}
            onChange={(e) => setFormulario({ ...formulario, nombre_completo: e.target.value })} />
          <CampoContrasena
            etiqueta={editandoId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            value={formulario.password}
            onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
          />
          <fieldset>
            <legend className="text-sm font-medium mb-2">Grupos</legend>
            {grupos.map((g) => (
              <label key={g.codigo} className="flex items-center gap-2 text-sm mb-1">
                <input
                  type="checkbox"
                  checked={formulario.grupos.includes(g.codigo)}
                  onChange={(e) => {
                    const nuevos = e.target.checked
                      ? [...formulario.grupos, g.codigo]
                      : formulario.grupos.filter((c) => c !== g.codigo);
                    setFormulario({ ...formulario, grupos: nuevos });
                  }}
                />
                {g.nombre}
              </label>
            ))}
          </fieldset>
          <div className="flex gap-2">
            <Boton type="button" onClick={() => ejecutarSinEspera(guardar())}>
              {editandoId ? 'Actualizar' : 'Crear'}
            </Boton>
            <Boton type="button" variante="secundario" onClick={reiniciarFormulario}>
              Cancelar
            </Boton>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-borde)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--color-fondo-pagina)' }}>
            <tr>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Grupos</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: 'var(--color-borde)' }}>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.nombre_completo}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.esta_activo ? 'Activo' : 'Inactivo'}</td>
                <td className="p-3">{u.grupos.join(', ')}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button type="button" className="text-xs underline" onClick={() => {
                      setEditandoId(u.id);
                      setMostrarFormulario(true);
                      setFormulario({
                        username: u.username,
                        email: u.email,
                        nombre_completo: u.nombre_completo,
                        password: '',
                        grupos: u.grupos,
                        esta_activo: u.esta_activo,
                      });
                    }}>Editar</button>
                    <button type="button" className="text-xs underline" onClick={() => ejecutarSinEspera(toggleActivo(u))}>
                      {u.esta_activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
