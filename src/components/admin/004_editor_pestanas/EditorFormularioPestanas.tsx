'use client';

/**
 * Editor de formulario con pestanas para cada seccion de configuracion.
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormularioAdminDetalle, VersionFormularioAdmin } from '@/types/admin';
import type { FormularioEstructura } from '@/types/formulario';
import {
  obtenerEstructuraAdmin,
  obtenerFormularioAdmin,
  listarVersionesAdmin,
  actualizarFormularioAdmin,
} from '@/services/formulariosAdminServicio';
import { FormularioBaseAdmin } from '@/components/admin/003_formulario_base';
import { EditorSecciones } from '@/components/admin/005_editor_secciones';
import { EditorPreguntas } from '@/components/admin/006_editor_preguntas';
import { EditorOpciones } from '@/components/admin/007_editor_opciones';
import { EditorTextos } from '@/components/admin/008_editor_textos';
import { EditorReglas } from '@/components/admin/009_editor_reglas';
import { VistaPreviaFormulario } from '@/components/admin/010_vista_previa';
import { extraerDetalleError } from '@/utils/erroresApi';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

type PestanaEditor =
  | 'generales'
  | 'versiones'
  | 'secciones'
  | 'preguntas'
  | 'textos'
  | 'reglas'
  | 'preview';

const PESTANAS: { id: PestanaEditor; etiqueta: string }[] = [
  { id: 'generales', etiqueta: 'Datos generales' },
  { id: 'versiones', etiqueta: 'Versiones' },
  { id: 'secciones', etiqueta: 'Secciones' },
  { id: 'preguntas', etiqueta: 'Preguntas' },
  { id: 'textos', etiqueta: 'Textos' },
  { id: 'reglas', etiqueta: 'Reglas' },
  { id: 'preview', etiqueta: 'Vista previa' },
];

interface EditorFormularioPestanasProps {
  readonly idFormulario: number;
}

export function EditorFormularioPestanas({ idFormulario }: EditorFormularioPestanasProps) {
  const [pestana, setPestana] = useState<PestanaEditor>('generales');
  const [detalle, setDetalle] = useState<FormularioAdminDetalle | null>(null);
  const [estructura, setEstructura] = useState<FormularioEstructura | null>(null);
  const [versiones, setVersiones] = useState<VersionFormularioAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [formulario, estruct, vers] = await Promise.all([
        obtenerFormularioAdmin(idFormulario),
        obtenerEstructuraAdmin(idFormulario),
        listarVersionesAdmin(idFormulario),
      ]);
      setDetalle(formulario);
      setEstructura(estruct);
      setVersiones(vers);
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
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

  if (cargando || !detalle || !estructura) {
    return error ? (
      <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>
    ) : (
      <SkeletonFormulario />
    );
  }

  const todasPreguntas = estructura.secciones.flatMap((s) => s.preguntas);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-texto-primario)' }}>
        {detalle.nombre}
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-texto-muted)' }}>
        Código: {detalle.codigo} — Estado: {detalle.estado}
      </p>

      <nav aria-label="Pestañas del editor" className="flex flex-wrap gap-2 mb-6 border-b pb-2"
        style={{ borderColor: 'var(--color-borde)' }}>
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            className="px-4 py-2 rounded-t-lg text-sm font-medium"
            style={{
              backgroundColor: pestana === p.id
                ? 'color-mix(in srgb, var(--color-primario) 12%, transparent)'
                : 'transparent',
              color: pestana === p.id ? 'var(--color-primario)' : 'var(--color-texto-secundario)',
              minHeight: 'var(--tamano-control-min)',
            }}
            onClick={() => setPestana(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </nav>

      {pestana === 'generales' && (
        <FormularioBaseAdmin
          valoresIniciales={detalle}
          onEnviar={async (datos) => {
            await actualizarFormularioAdmin(idFormulario, datos);
            await cargar();
          }}
        />
      )}

      {pestana === 'versiones' && (
        <ListaVersiones versiones={versiones} />
      )}

      {pestana === 'secciones' && (
        <EditorSecciones
          idFormulario={idFormulario}
          secciones={estructura.secciones}
          onActualizado={() => ejecutarSinEspera(cargar())}
        />
      )}

      {pestana === 'preguntas' && (
        <>
          <EditorPreguntas
            idFormulario={idFormulario}
            secciones={estructura.secciones}
            onActualizado={() => ejecutarSinEspera(cargar())}
          />
          <div className="mt-8">
            <EditorOpciones
              idFormulario={idFormulario}
              preguntas={todasPreguntas}
              onActualizado={() => ejecutarSinEspera(cargar())}
            />
          </div>
        </>
      )}

      {pestana === 'textos' && (
        <EditorTextos
          idFormulario={idFormulario}
          textos={estructura.textos}
          onActualizado={() => ejecutarSinEspera(cargar())}
        />
      )}

      {pestana === 'reglas' && (
        <EditorReglas
          idFormulario={idFormulario}
          codigosPreguntas={todasPreguntas.map((p) => p.codigo)}
          codigosSecciones={estructura.secciones.map((s) => s.codigo)}
        />
      )}

      {pestana === 'preview' && (
        <VistaPreviaFormulario uuidFormulario={detalle.uuid} estructura={estructura} />
      )}
    </div>
  );
}

function ListaVersiones({ versiones }: { versiones: VersionFormularioAdmin[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-texto-primario)' }}>
        Versiones
      </h2>
      <ul className="flex flex-col gap-2" role="list">
        {versiones.map((v) => (
          <li key={v.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-borde)' }}>
            Versión {v.numero_version} — {v.estado}
            {v.fecha_publicacion && ` — Publicada: ${v.fecha_publicacion}`}
          </li>
        ))}
        {versiones.length === 0 && (
          <li style={{ color: 'var(--color-texto-muted)' }}>Sin versiones registradas.</li>
        )}
      </ul>
    </div>
  );
}
