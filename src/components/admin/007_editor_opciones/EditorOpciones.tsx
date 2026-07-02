'use client';

/**
 * Editor de opciones de respuesta para preguntas de seleccion.
 */

import { useState } from 'react';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import type { Pregunta, TipoPregunta } from '@/types/formulario';
import type { OpcionAdminEntrada } from '@/types/admin';
import {
  actualizarOpcionAdmin,
  crearOpcionAdmin,
  eliminarOpcionAdmin,
  reordenarOpcionesAdmin,
} from '@/services/formulariosAdminServicio';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { extraerDetalleError } from '@/utils/erroresApi';
import { validarTooltipAdmin } from '@/utils/tooltipFormulario';

const TIPOS_CON_OPCIONES: TipoPregunta[] = [
  'radio', 'checkbox', 'select', 'select_multiple', 'autocomplete', 'likert',
];

interface EditorOpcionesProps {
  readonly idFormulario: number;
  readonly preguntas: Pregunta[];
  readonly onActualizado: () => void;
}

export function EditorOpciones({ idFormulario, preguntas, onActualizado }: EditorOpcionesProps) {
  const preguntasConOpciones = preguntas.filter((p) => TIPOS_CON_OPCIONES.includes(p.tipo_pregunta));
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(preguntasConOpciones[0]?.codigo ?? '');
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<OpcionAdminEntrada>({
    codigo: '', etiqueta: '', valor: '', tooltip: '', tiene_tooltip: false, orden: 1,
  });

  const pregunta = preguntasConOpciones.find((p) => p.codigo === preguntaSeleccionada);
  const opciones = pregunta?.opciones ?? [];

  async function guardar() {
    if (!preguntaSeleccionada) return;
    setError(null);
    const errorTooltip = validarTooltipAdmin(
      formulario.tiene_tooltip ?? false,
      formulario.tooltip,
    );
    if (errorTooltip) {
      setError(errorTooltip);
      return;
    }
    try {
      if (editando) {
        await actualizarOpcionAdmin(idFormulario, editando, formulario);
      } else {
        await crearOpcionAdmin(idFormulario, preguntaSeleccionada, formulario);
      }
      setEditando(null);
      setFormulario({
        codigo: '', etiqueta: '', valor: '', tooltip: '', tiene_tooltip: false,
        orden: opciones.length + 1,
      });
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function eliminar(codigo: string) {
    try {
      await eliminarOpcionAdmin(idFormulario, codigo);
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function mover(codigo: string, direccion: 'arriba' | 'abajo') {
    if (!preguntaSeleccionada) return;
    const ordenadas = [...opciones].sort((a, b) => a.orden - b.orden);
    const indice = ordenadas.findIndex((o) => o.codigo === codigo);
    const nuevoIndice = direccion === 'arriba' ? indice - 1 : indice + 1;
    if (indice < 0 || nuevoIndice < 0 || nuevoIndice >= ordenadas.length) return;
    const copia = [...ordenadas];
    [copia[indice], copia[nuevoIndice]] = [copia[nuevoIndice], copia[indice]];
    await reordenarOpcionesAdmin(idFormulario, preguntaSeleccionada, {
      codigos: copia.map((o) => o.codigo),
    });
    onActualizado();
  }

  if (preguntasConOpciones.length === 0) {
    return <p style={{ color: 'var(--color-texto-muted)' }}>No hay preguntas con opciones.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>Opciones</h2>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}

      <select
        value={preguntaSeleccionada}
        onChange={(e) => setPreguntaSeleccionada(e.target.value)}
        className="rounded-lg px-4 h-12 border max-w-md"
        style={{ borderColor: 'var(--color-borde-fuerte)' }}
        aria-label="Seleccionar pregunta"
      >
        {preguntasConOpciones.map((p) => (
          <option key={p.codigo} value={p.codigo}>{p.texto} ({p.codigo})</option>
        ))}
      </select>

      <div className="grid gap-3 max-w-xl">
        <CampoTexto etiqueta="Código" value={formulario.codigo} disabled={Boolean(editando)}
          onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })} />
        <CampoTexto etiqueta="Etiqueta" value={formulario.etiqueta}
          onChange={(e) => setFormulario({ ...formulario, etiqueta: e.target.value })} />
        <CampoTexto etiqueta="Valor" value={formulario.valor}
          onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={formulario.tiene_tooltip ?? false}
            onChange={(e) => setFormulario({
              ...formulario,
              tiene_tooltip: e.target.checked,
              tooltip: e.target.checked ? formulario.tooltip : '',
            })} />
          Tiene tooltip
        </label>
        {formulario.tiene_tooltip && (
          <CampoTexto etiqueta="Texto del tooltip" value={formulario.tooltip ?? ''}
            onChange={(e) => setFormulario({ ...formulario, tooltip: e.target.value })} />
        )}
        <CampoTexto etiqueta="Orden" type="number" value={String(formulario.orden)}
          onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={formulario.es_excluyente ?? false}
            onChange={(e) => setFormulario({ ...formulario, es_excluyente: e.target.checked })} />
          Es excluyente
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={formulario.activa_otro ?? false}
            onChange={(e) => setFormulario({ ...formulario, activa_otro: e.target.checked })} />
          Activa otro
        </label>
        <Boton type="button" onClick={() => ejecutarSinEspera(guardar())}>
          {editando ? 'Actualizar opción' : 'Crear opción'}
        </Boton>
      </div>

      <ul className="flex flex-col gap-2" role="list">
        {[...opciones].sort((a, b) => a.orden - b.orden).map((o) => (
          <li key={o.codigo} className="flex justify-between gap-2 p-3 rounded-lg border"
            style={{ borderColor: 'var(--color-borde)' }}>
            <span>{o.etiqueta} ({o.codigo}) = {o.valor}</span>
            <div className="flex gap-2">
              <BotonMini onClick={() => ejecutarSinEspera(mover(o.codigo, 'arriba'))} etiqueta="Subir" />
              <BotonMini onClick={() => ejecutarSinEspera(mover(o.codigo, 'abajo'))} etiqueta="Bajar" />
              <BotonMini onClick={() => {
                setEditando(o.codigo);
                setFormulario({
                  codigo: o.codigo, etiqueta: o.etiqueta, valor: o.valor,
                  tooltip: o.tooltip ?? '',
                  tiene_tooltip: o.tiene_tooltip ?? Boolean(o.tooltip?.trim()),
                  orden: o.orden,
                  es_excluyente: o.es_excluyente, activa_otro: o.activa_otro,
                });
              }} etiqueta="Editar" />
              <BotonMini onClick={() => ejecutarSinEspera(eliminar(o.codigo))} etiqueta="Eliminar" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BotonMini({ onClick, etiqueta }: { onClick: () => void; etiqueta: string }) {
  return (
    <button type="button" className="text-xs px-2 py-1 rounded border"
      style={{ borderColor: 'var(--color-borde)' }} onClick={onClick}>{etiqueta}</button>
  );
}
