'use client';

/**
 * Editor de preguntas con campos segun tipo_pregunta.
 */

import { useState } from 'react';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import type { Pregunta, SeccionFormulario, TipoPregunta } from '@/types/formulario';
import type { PreguntaAdminEntrada } from '@/types/admin';
import {
  actualizarPreguntaAdmin,
  crearPreguntaAdmin,
  duplicarPreguntaAdmin,
  eliminarPreguntaAdmin,
  reordenarPreguntasAdmin,
} from '@/services/formulariosAdminServicio';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { extraerDetalleError } from '@/utils/erroresApi';
import { validarTooltipAdmin } from '@/utils/tooltipFormulario';

const TIPOS_PREGUNTA: TipoPregunta[] = [
  'texto_corto', 'texto_largo', 'numero', 'fecha', 'hora', 'fecha_hora',
  'radio', 'checkbox', 'select', 'select_multiple', 'autocomplete', 'likert',
  'matriz', 'archivo', 'firma', 'geolocalizacion', 'audio', 'video',
];

interface EditorPreguntasProps {
  readonly idFormulario: number;
  readonly secciones: SeccionFormulario[];
  readonly onActualizado: () => void;
}

function preguntaVacia(seccionCodigo: string, orden: number): PreguntaAdminEntrada {
  return {
    codigo: '',
    texto: '',
    descripcion: '',
    tooltip: '',
    tiene_tooltip: false,
    tipo_pregunta: 'texto_corto',
    es_obligatoria: false,
    es_pregunta_filtro: false,
    permite_otro: false,
    permite_observacion: false,
    orden,
    seccion_codigo: seccionCodigo,
  };
}

export function EditorPreguntas({
  idFormulario,
  secciones,
  onActualizado,
}: EditorPreguntasProps) {
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<PreguntaAdminEntrada>(
    preguntaVacia(secciones[0]?.codigo ?? '', 1)
  );

  const todasPreguntas = secciones.flatMap((s) =>
    s.preguntas.map((p) => ({ ...p, seccion_codigo: s.codigo }))
  );

  async function guardar() {
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
        await actualizarPreguntaAdmin(idFormulario, editando, formulario);
      } else {
        await crearPreguntaAdmin(idFormulario, formulario);
      }
      setEditando(null);
      setFormulario(preguntaVacia(formulario.seccion_codigo, todasPreguntas.length + 1));
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function eliminar(codigo: string) {
    try {
      await eliminarPreguntaAdmin(idFormulario, codigo);
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function duplicar(codigo: string) {
    try {
      await duplicarPreguntaAdmin(idFormulario, codigo);
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function mover(codigo: string, direccion: 'arriba' | 'abajo') {
    const ordenadas = [...todasPreguntas].sort((a, b) => a.orden - b.orden);
    const indice = ordenadas.findIndex((p) => p.codigo === codigo);
    const nuevoIndice = direccion === 'arriba' ? indice - 1 : indice + 1;
    if (indice < 0 || nuevoIndice < 0 || nuevoIndice >= ordenadas.length) return;
    const copia = [...ordenadas];
    [copia[indice], copia[nuevoIndice]] = [copia[nuevoIndice], copia[indice]];
    await reordenarPreguntasAdmin(idFormulario, { codigos: copia.map((p) => p.codigo) });
    onActualizado();
  }

  const esTipoNumerico = ['numero', 'fecha', 'hora', 'fecha_hora'].includes(formulario.tipo_pregunta);
  const esTipoTexto = ['texto_corto', 'texto_largo'].includes(formulario.tipo_pregunta);
  const esTipoOpciones = ['radio', 'checkbox', 'select', 'select_multiple', 'autocomplete', 'likert'].includes(
    formulario.tipo_pregunta
  );
  const esTipoCatalogo = ['select', 'select_multiple', 'autocomplete'].includes(formulario.tipo_pregunta);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
        Preguntas
      </h2>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}

      <div className="grid gap-3 max-w-2xl">
        <CampoTexto etiqueta="Código" value={formulario.codigo} disabled={Boolean(editando)}
          onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })} />
        <CampoTexto etiqueta="Texto" value={formulario.texto}
          onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })} />
        <CampoTexto etiqueta="Descripción" value={formulario.descripcion ?? ''}
          onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} />
        <CheckboxCampo etiqueta="Tiene tooltip" checked={formulario.tiene_tooltip ?? false}
          onChange={(v) => setFormulario({
            ...formulario,
            tiene_tooltip: v,
            tooltip: v ? formulario.tooltip : '',
          })} />
        {formulario.tiene_tooltip && (
          <CampoTexto etiqueta="Texto del tooltip" value={formulario.tooltip ?? ''}
            onChange={(e) => setFormulario({ ...formulario, tooltip: e.target.value })} />
        )}

        <SelectCampo
          etiqueta="Sección"
          valor={formulario.seccion_codigo}
          opciones={secciones.map((s) => ({ valor: s.codigo, etiqueta: s.titulo }))}
          onChange={(v) => setFormulario({ ...formulario, seccion_codigo: v })}
        />
        <SelectCampo
          etiqueta="Tipo pregunta"
          valor={formulario.tipo_pregunta}
          opciones={TIPOS_PREGUNTA.map((t) => ({ valor: t, etiqueta: t }))}
          onChange={(v) => setFormulario({ ...formulario, tipo_pregunta: v as TipoPregunta })}
        />

        <CheckboxCampo etiqueta="Es obligatoria" checked={formulario.es_obligatoria ?? false}
          onChange={(v) => setFormulario({ ...formulario, es_obligatoria: v })} />
        <CheckboxCampo etiqueta="Es pregunta filtro" checked={formulario.es_pregunta_filtro ?? false}
          onChange={(v) => setFormulario({ ...formulario, es_pregunta_filtro: v })} />
        <CheckboxCampo etiqueta="Permite otro" checked={formulario.permite_otro ?? false}
          onChange={(v) => setFormulario({ ...formulario, permite_otro: v })} />
        <CheckboxCampo etiqueta="Permite observacion" checked={formulario.permite_observacion ?? false}
          onChange={(v) => setFormulario({ ...formulario, permite_observacion: v })} />

        {esTipoTexto && (
          <>
            <CampoTexto etiqueta="Longitud mínima" type="number"
              value={String(formulario.longitud_minima ?? '')}
              onChange={(e) => setFormulario({ ...formulario, longitud_minima: Number(e.target.value) || null })} />
            <CampoTexto etiqueta="Longitud máxima" type="number"
              value={String(formulario.longitud_maxima ?? '')}
              onChange={(e) => setFormulario({ ...formulario, longitud_maxima: Number(e.target.value) || null })} />
            <CampoTexto etiqueta="Expresión regular" value={formulario.expresion_regular ?? ''}
              onChange={(e) => setFormulario({ ...formulario, expresion_regular: e.target.value })} />
            <CampoTexto etiqueta="Mensaje error" value={formulario.mensaje_error ?? ''}
              onChange={(e) => setFormulario({ ...formulario, mensaje_error: e.target.value })} />
          </>
        )}

        {esTipoNumerico && (
          <>
            <CampoTexto etiqueta="Valor mínimo" value={formulario.valor_minimo ?? ''}
              onChange={(e) => setFormulario({ ...formulario, valor_minimo: e.target.value })} />
            <CampoTexto etiqueta="Valor máximo" value={formulario.valor_maximo ?? ''}
              onChange={(e) => setFormulario({ ...formulario, valor_maximo: e.target.value })} />
          </>
        )}

        {esTipoOpciones && (
          <CheckboxCampo etiqueta="Usa catálogo" checked={formulario.usa_catalogo ?? false}
            onChange={(v) => setFormulario({ ...formulario, usa_catalogo: v })} />
        )}

        {esTipoCatalogo && formulario.usa_catalogo && (
          <>
            <CampoTexto etiqueta="Catálogo asociado" value={formulario.catalogo_asociado ?? ''}
              onChange={(e) => setFormulario({ ...formulario, catalogo_asociado: e.target.value })} />
            <CampoTexto etiqueta="Pregunta padre catálogo" value={formulario.pregunta_padre_catalogo ?? ''}
              onChange={(e) => setFormulario({ ...formulario, pregunta_padre_catalogo: e.target.value })} />
            <CheckboxCampo etiqueta="Permite búsqueda catálogo" checked={formulario.permite_busqueda_catalogo ?? false}
              onChange={(v) => setFormulario({ ...formulario, permite_busqueda_catalogo: v })} />
            <CampoTexto etiqueta="Límite ítems catálogo" type="number"
              value={String(formulario.limite_items_catalogo ?? '')}
              onChange={(e) => setFormulario({ ...formulario, limite_items_catalogo: Number(e.target.value) || null })} />
          </>
        )}

        <CampoTexto etiqueta="Orden" type="number" value={String(formulario.orden)}
          onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })} />

        <Boton type="button" onClick={() => ejecutarSinEspera(guardar())}>
          {editando ? 'Actualizar pregunta' : 'Crear pregunta'}
        </Boton>
      </div>

      <ListaPreguntas
        preguntas={todasPreguntas}
        onEditar={(p) => {
          setEditando(p.codigo);
          setFormulario({
            codigo: p.codigo,
            texto: p.texto,
            descripcion: p.descripcion,
            tooltip: p.tooltip,
            tiene_tooltip: p.tiene_tooltip ?? Boolean(p.tooltip?.trim()),
            tipo_pregunta: p.tipo_pregunta,
            es_obligatoria: p.es_obligatoria,
            es_pregunta_filtro: p.es_pregunta_filtro,
            permite_otro: p.permite_otro,
            permite_observacion: p.permite_observacion,
            orden: p.orden,
            seccion_codigo: (p as Pregunta & { seccion_codigo: string }).seccion_codigo,
            longitud_minima: p.longitud_minima,
            longitud_maxima: p.longitud_maxima,
            valor_minimo: p.valor_minimo,
            valor_maximo: p.valor_maximo,
            expresion_regular: p.expresion_regular,
            mensaje_error: p.mensaje_error,
            usa_catalogo: p.usa_catalogo,
            catalogo_asociado: p.catalogo_asociado?.codigo ?? null,
            pregunta_padre_catalogo: p.pregunta_padre_catalogo?.codigo ?? null,
            permite_busqueda_catalogo: p.permite_busqueda_catalogo,
            limite_items_catalogo: p.limite_items_catalogo,
          });
        }}
        onEliminar={(c) => ejecutarSinEspera(eliminar(c))}
        onDuplicar={(c) => ejecutarSinEspera(duplicar(c))}
        onMover={(c, d) => ejecutarSinEspera(mover(c, d))}
      />
    </div>
  );
}

function ListaPreguntas({
  preguntas,
  onEditar,
  onEliminar,
  onDuplicar,
  onMover,
}: {
  preguntas: (Pregunta & { seccion_codigo?: string })[];
  onEditar: (p: Pregunta) => void;
  onEliminar: (codigo: string) => void;
  onDuplicar: (codigo: string) => void;
  onMover: (codigo: string, dir: 'arriba' | 'abajo') => void;
}) {
  return (
    <ul className="flex flex-col gap-2" role="list">
      {[...preguntas].sort((a, b) => a.orden - b.orden).map((p) => (
        <li key={p.codigo} className="flex flex-wrap justify-between gap-2 p-3 rounded-lg border"
          style={{ borderColor: 'var(--color-borde)' }}>
          <span><strong>{p.texto}</strong> ({p.codigo}) — {p.tipo_pregunta}</span>
          <div className="flex gap-2">
            <BotonMini onClick={() => onMover(p.codigo, 'arriba')} etiqueta="Subir" />
            <BotonMini onClick={() => onMover(p.codigo, 'abajo')} etiqueta="Bajar" />
            <BotonMini onClick={() => onEditar(p)} etiqueta="Editar" />
            <BotonMini onClick={() => onDuplicar(p.codigo)} etiqueta="Duplicar" />
            <BotonMini onClick={() => onEliminar(p.codigo)} etiqueta="Eliminar" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SelectCampo({
  etiqueta, valor, opciones, onChange,
}: {
  etiqueta: string;
  valor: string;
  opciones: { valor: string; etiqueta: string }[];
  onChange: (v: string) => void;
}) {
  const id = `select-${etiqueta.replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">{etiqueta}</label>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-4 h-12 border" style={{ borderColor: 'var(--color-borde-fuerte)' }}>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
      </select>
    </div>
  );
}

function CheckboxCampo({
  etiqueta, checked, onChange,
}: { etiqueta: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {etiqueta}
    </label>
  );
}

function BotonMini({ onClick, etiqueta }: { onClick: () => void; etiqueta: string }) {
  return (
    <button type="button" className="text-xs px-2 py-1 rounded border"
      style={{ borderColor: 'var(--color-borde)' }} onClick={onClick}>{etiqueta}</button>
  );
}
