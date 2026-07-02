'use client';

/**
 * Editor de reglas con ayuda para construir valor_esperado.
 */

import { useCallback, useEffect, useState } from 'react';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import type { ReglaAdminEntrada } from '@/types/admin';
import type { AccionRegla, OperadorRegla } from '@/types/reglas';
import {
  ACCIONES_REGLA,
  OPERADORES_REGLA,
  construirValorEsperado,
  valorEsperadoAString,
} from '@/utils/editorReglasAdmin';
import {
  actualizarReglaAdmin,
  crearReglaAdmin,
  eliminarReglaAdmin,
  listarReglasAdmin,
} from '@/services/formulariosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface EditorReglasProps {
  readonly idFormulario: number;
  readonly codigosPreguntas: string[];
  readonly codigosSecciones: string[];
}

function reglaVacia(): ReglaAdminEntrada & { valorSimple: string; valoresLista: string } {
  return {
    pregunta_origen: '',
    operador: 'equals',
    valor_esperado: '',
    accion: 'mostrar',
    pregunta_destino: null,
    seccion_destino: null,
    mensaje: '',
    esta_activa: true,
    valorSimple: '',
    valoresLista: '',
  };
}

export function EditorReglas({
  idFormulario,
  codigosPreguntas,
  codigosSecciones,
}: EditorReglasProps) {
  const [reglas, setReglas] = useState<ReglaAdminEntrada[]>([]);
  const [formulario, setFormulario] = useState(reglaVacia());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const lista = await listarReglasAdmin(idFormulario);
      setReglas(lista);
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }, [idFormulario]);

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

  async function guardar() {
    setError(null);
    const valorEsperado = construirValorEsperado(
      formulario.operador,
      formulario.valorSimple,
      formulario.valoresLista
    );
    const payload: ReglaAdminEntrada = {
      pregunta_origen: formulario.pregunta_origen,
      operador: formulario.operador,
      valor_esperado: valorEsperado,
      accion: formulario.accion,
      pregunta_destino: formulario.pregunta_destino,
      seccion_destino: formulario.seccion_destino,
      mensaje: formulario.mensaje,
      esta_activa: formulario.esta_activa,
    };
    try {
      if (editandoId) {
        await actualizarReglaAdmin(idFormulario, editandoId, payload);
      } else {
        await crearReglaAdmin(idFormulario, payload);
      }
      setFormulario(reglaVacia());
      setEditandoId(null);
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  async function eliminar(idRegla: number) {
    try {
      await eliminarReglaAdmin(idFormulario, idRegla);
      await cargar();
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }

  const usaLista = formulario.operador === 'in';
  const usaNumero = formulario.operador === 'gt' || formulario.operador === 'lt';

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>Reglas</h2>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}

      <div className="grid gap-3 max-w-2xl">
        <SelectCampo
          etiqueta="Pregunta origen"
          valor={formulario.pregunta_origen}
          opciones={codigosPreguntas}
          onChange={(v) => setFormulario({ ...formulario, pregunta_origen: v })}
        />
        <SelectCampoOperador
          valor={formulario.operador}
          onChange={(v) => setFormulario({ ...formulario, operador: v })}
        />
        {usaLista ? (
          <CampoTexto
            etiqueta="Valores (separados por coma)"
            value={formulario.valoresLista}
            onChange={(e) => setFormulario({ ...formulario, valoresLista: e.target.value })}
            ayuda="Ejemplo: valor1, valor2, valor3"
          />
        ) : (
          <CampoTexto
            etiqueta={usaNumero ? 'Valor numerico' : 'Valor esperado'}
            type={usaNumero ? 'number' : 'text'}
            value={formulario.valorSimple}
            onChange={(e) => setFormulario({ ...formulario, valorSimple: e.target.value })}
          />
        )}
        <SelectCampoAccion
          valor={formulario.accion}
          onChange={(v) => setFormulario({ ...formulario, accion: v })}
        />
        <SelectCampo
          etiqueta="Pregunta destino (opcional)"
          valor={formulario.pregunta_destino ?? ''}
          opciones={['', ...codigosPreguntas]}
          onChange={(v) => setFormulario({ ...formulario, pregunta_destino: v || null })}
        />
        <SelectCampo
          etiqueta="Sección destino (opcional)"
          valor={formulario.seccion_destino ?? ''}
          opciones={['', ...codigosSecciones]}
          onChange={(v) => setFormulario({ ...formulario, seccion_destino: v || null })}
        />
        <CampoTexto
          etiqueta="Mensaje"
          value={formulario.mensaje ?? ''}
          onChange={(e) => setFormulario({ ...formulario, mensaje: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formulario.esta_activa ?? true}
            onChange={(e) => setFormulario({ ...formulario, esta_activa: e.target.checked })}
          />
          <span>Regla activa</span>
        </label>
        <Boton type="button" onClick={() => ejecutarSinEspera(guardar())}>
          {editandoId ? 'Actualizar regla' : 'Crear regla'}
        </Boton>
      </div>

      <ul className="flex flex-col gap-2">
        {reglas.map((regla) => (
          <li key={regla.id} className="p-3 rounded-lg border flex justify-between gap-2"
            style={{ borderColor: 'var(--color-borde)' }}>
            <span>
              {regla.pregunta_origen} {regla.operador} → {regla.accion}
              {!regla.esta_activa && ' (inactiva)'}
            </span>
            <div className="flex gap-2">
              <button type="button" className="text-xs underline" onClick={() => {
                const { simple, lista } = valorEsperadoAString(regla.valor_esperado);
                setEditandoId(regla.id ?? null);
                setFormulario({
                  ...reglaVacia(),
                  ...regla,
                  valorSimple: simple,
                  valoresLista: lista,
                });
              }}>Editar</button>
              <button type="button" className="text-xs underline" onClick={() => regla.id && ejecutarSinEspera(eliminar(regla.id))}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SelectCampoProps {
  readonly etiqueta: string;
  readonly valor: string;
  readonly opciones: string[];
  readonly onChange: (v: string) => void;
}

function SelectCampo({
  etiqueta, valor, opciones, onChange,
}: SelectCampoProps) {
  const id = `select-${etiqueta.replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">{etiqueta}</label>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-4 h-12 border" style={{ borderColor: 'var(--color-borde-fuerte)' }}>
        {opciones.map((o) => <option key={o || 'vacio'} value={o}>{o || '—'}</option>)}
      </select>
    </div>
  );
}

interface SelectCampoOperadorProps {
  readonly valor: OperadorRegla;
  readonly onChange: (v: OperadorRegla) => void;
}

function SelectCampoOperador({
  valor, onChange,
}: SelectCampoOperadorProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="operador-regla" className="text-sm font-medium">Operador</label>
      <select id="operador-regla" value={valor} onChange={(e) => onChange(e.target.value as OperadorRegla)}
        className="rounded-lg px-4 h-12 border" style={{ borderColor: 'var(--color-borde-fuerte)' }}>
        {OPERADORES_REGLA.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
      </select>
    </div>
  );
}

interface SelectCampoAccionProps {
  readonly valor: AccionRegla;
  readonly onChange: (v: AccionRegla) => void;
}

function SelectCampoAccion({
  valor, onChange,
}: SelectCampoAccionProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="accion-regla" className="text-sm font-medium">Acción</label>
      <select id="accion-regla" value={valor} onChange={(e) => onChange(e.target.value as AccionRegla)}
        className="rounded-lg px-4 h-12 border" style={{ borderColor: 'var(--color-borde-fuerte)' }}>
        {ACCIONES_REGLA.map((a) => <option key={a.valor} value={a.valor}>{a.etiqueta}</option>)}
      </select>
    </div>
  );
}
