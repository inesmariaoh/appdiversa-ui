'use client';

/**
 * Editor de secciones con CRUD y reordenamiento.
 */

import { useState } from 'react';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import type { SeccionFormulario } from '@/types/formulario';
import type { SeccionAdminEntrada } from '@/types/admin';
import {
  actualizarSeccionAdmin,
  crearSeccionAdmin,
  eliminarSeccionAdmin,
  reordenarSeccionesAdmin,
} from '@/services/formulariosAdminServicio';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { extraerDetalleError } from '@/utils/erroresApi';

interface EditorSeccionesProps {
  readonly idFormulario: number;
  readonly secciones: SeccionFormulario[];
  readonly onActualizado: () => void;
}

export function EditorSecciones({
  idFormulario,
  secciones,
  onActualizado,
}: EditorSeccionesProps) {
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<SeccionAdminEntrada>({
    codigo: '',
    titulo: '',
    descripcion: '',
    texto_ayuda: '',
    orden: secciones.length + 1,
  });

  function reiniciarFormulario() {
    setFormulario({
      codigo: '',
      titulo: '',
      descripcion: '',
      texto_ayuda: '',
      orden: secciones.length + 1,
    });
    setEditando(null);
  }

  async function guardar() {
    setError(null);
    try {
      if (editando) {
        await actualizarSeccionAdmin(idFormulario, editando, formulario);
      } else {
        await crearSeccionAdmin(idFormulario, formulario);
      }
      reiniciarFormulario();
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function eliminar(codigo: string) {
    setError(null);
    try {
      await eliminarSeccionAdmin(idFormulario, codigo);
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function mover(codigo: string, direccion: 'arriba' | 'abajo') {
    const ordenados = [...secciones].sort((a, b) => a.orden - b.orden);
    const indice = ordenados.findIndex((s) => s.codigo === codigo);
    if (indice < 0) return;
    const nuevoIndice = direccion === 'arriba' ? indice - 1 : indice + 1;
    if (nuevoIndice < 0 || nuevoIndice >= ordenados.length) return;
    const copia = [...ordenados];
    [copia[indice], copia[nuevoIndice]] = [copia[nuevoIndice], copia[indice]];
    await reordenarSeccionesAdmin(idFormulario, {
      codigos: copia.map((s) => s.codigo),
    });
    onActualizado();
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
        Secciones
      </h2>

      {error && (
        <p role="alert" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 max-w-xl">
        <CampoTexto
          etiqueta="Código"
          value={formulario.codigo}
          onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
          disabled={Boolean(editando)}
        />
        <CampoTexto
          etiqueta="Título"
          value={formulario.titulo}
          onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
        />
        <CampoTextarea
          etiqueta="Descripción"
          value={formulario.descripcion ?? ''}
          onChange={(valor) => setFormulario({ ...formulario, descripcion: valor })}
        />
        <CampoTextarea
          etiqueta="Texto ayuda"
          value={formulario.texto_ayuda ?? ''}
          onChange={(valor) => setFormulario({ ...formulario, texto_ayuda: valor })}
        />
        <CampoTexto
          etiqueta="Orden"
          type="number"
          value={String(formulario.orden)}
          onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })}
        />
        <div className="flex gap-2">
          <Boton type="button" onClick={() => ejecutarSinEspera(guardar())}>
            {editando ? 'Actualizar sección' : 'Crear sección'}
          </Boton>
          {editando && (
            <Boton type="button" variante="secundario" onClick={reiniciarFormulario}>
              Cancelar
            </Boton>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-2" role="list">
        {[...secciones]
          .sort((a, b) => a.orden - b.orden)
          .map((seccion) => (
            <li
              key={seccion.codigo}
              className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border"
              style={{ borderColor: 'var(--color-borde)' }}
            >
              <div>
                <strong>{seccion.titulo}</strong>
                <span className="ml-2 text-xs" style={{ color: 'var(--color-texto-muted)' }}>
                  ({seccion.codigo}) — orden {seccion.orden}
                </span>
              </div>
              <div className="flex gap-2">
                <BotonMini onClick={() => mover(seccion.codigo, 'arriba')} etiqueta="Subir" />
                <BotonMini onClick={() => mover(seccion.codigo, 'abajo')} etiqueta="Bajar" />
                <BotonMini
                  onClick={() => {
                    setEditando(seccion.codigo);
                    setFormulario({
                      codigo: seccion.codigo,
                      titulo: seccion.titulo,
                      descripcion: seccion.descripcion,
                      texto_ayuda: seccion.texto_ayuda,
                      orden: seccion.orden,
                    });
                  }}
                  etiqueta="Editar"
                />
                <BotonMini onClick={() => ejecutarSinEspera(eliminar(seccion.codigo))} etiqueta="Eliminar" />
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

function CampoTextarea({
  etiqueta,
  value,
  onChange,
}: {
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  const id = `textarea-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-texto-primario)' }}>
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-4 py-3 text-sm"
        style={{
          border: '1.5px solid var(--color-borde-fuerte)',
          backgroundColor: 'var(--color-fondo-tarjeta)',
        }}
      />
    </div>
  );
}

function BotonMini({ onClick, etiqueta }: { onClick: () => void; etiqueta: string }) {
  return (
    <button
      type="button"
      className="text-xs px-2 py-1 rounded border"
      style={{ borderColor: 'var(--color-borde)' }}
      onClick={onClick}
    >
      {etiqueta}
    </button>
  );
}
