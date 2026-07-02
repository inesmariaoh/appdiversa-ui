'use client';

/**
 * Renderiza el contenido del paso activo del asistente reutilizando los
 * editores especializados existentes.
 */

import type { FormularioAdminDetalle, FormularioAdminEntrada } from '@/types/admin';
import type { FormularioEstructura } from '@/types/formulario';
import { FormularioBaseAdmin } from '@/components/admin/003_formulario_base';
import { EditorSecciones } from '@/components/admin/005_editor_secciones';
import { EditorPreguntas } from '@/components/admin/006_editor_preguntas';
import { EditorOpciones } from '@/components/admin/007_editor_opciones';
import { EditorTextos } from '@/components/admin/008_editor_textos';
import { EditorReglas } from '@/components/admin/009_editor_reglas';
import { AvisoPaso } from './AvisoPaso';
import { PasoRevisar } from './PasoRevisar';
import type { PasoAsistenteId } from './pasos';

interface ContenidoPasoProps {
  readonly paso: PasoAsistenteId;
  readonly idFormulario: number;
  readonly detalle: FormularioAdminDetalle;
  readonly estructura: FormularioEstructura;
  readonly onGuardarGenerales: (datos: FormularioAdminEntrada) => Promise<void>;
  readonly onActualizado: () => void;
  readonly onPublicado: () => void;
}

export function ContenidoPaso({
  paso,
  idFormulario,
  detalle,
  estructura,
  onGuardarGenerales,
  onActualizado,
  onPublicado,
}: ContenidoPasoProps) {
  const secciones = estructura.secciones;
  const preguntas = secciones.flatMap((seccion) => seccion.preguntas);

  if (paso === 'generales') {
    return <FormularioBaseAdmin valoresIniciales={detalle} onEnviar={onGuardarGenerales} />;
  }

  if (paso === 'secciones') {
    return (
      <EditorSecciones idFormulario={idFormulario} secciones={secciones} onActualizado={onActualizado} />
    );
  }

  if (paso === 'preguntas') {
    return (
      <PasoPreguntas idFormulario={idFormulario} estructura={estructura} onActualizado={onActualizado} />
    );
  }

  if (paso === 'reglas') {
    return (
      <PasoReglas idFormulario={idFormulario} secciones={secciones} preguntas={preguntas} />
    );
  }

  if (paso === 'textos') {
    return (
      <EditorTextos idFormulario={idFormulario} textos={estructura.textos} onActualizado={onActualizado} />
    );
  }

  return (
    <PasoRevisar
      idFormulario={idFormulario}
      detalle={detalle}
      estructura={estructura}
      onPublicado={onPublicado}
    />
  );
}

function PasoPreguntas({
  idFormulario,
  estructura,
  onActualizado,
}: {
  readonly idFormulario: number;
  readonly estructura: FormularioEstructura;
  readonly onActualizado: () => void;
}) {
  if (estructura.secciones.length === 0) {
    return (
      <AvisoPaso mensaje="Primero crea al menos una seccion en el paso anterior para poder agregar preguntas." />
    );
  }
  const preguntas = estructura.secciones.flatMap((seccion) => seccion.preguntas);
  return (
    <div className="flex flex-col gap-8">
      <EditorPreguntas
        idFormulario={idFormulario}
        secciones={estructura.secciones}
        onActualizado={onActualizado}
      />
      <EditorOpciones idFormulario={idFormulario} preguntas={preguntas} onActualizado={onActualizado} />
    </div>
  );
}

function PasoReglas({
  idFormulario,
  secciones,
  preguntas,
}: {
  readonly idFormulario: number;
  readonly secciones: FormularioEstructura['secciones'];
  readonly preguntas: FormularioEstructura['secciones'][number]['preguntas'];
}) {
  if (preguntas.length === 0) {
    return (
      <AvisoPaso mensaje="Agrega preguntas antes de definir reglas de salto o visibilidad." />
    );
  }
  return (
    <EditorReglas
      idFormulario={idFormulario}
      codigosPreguntas={preguntas.map((pregunta) => pregunta.codigo)}
      codigosSecciones={secciones.map((seccion) => seccion.codigo)}
    />
  );
}
