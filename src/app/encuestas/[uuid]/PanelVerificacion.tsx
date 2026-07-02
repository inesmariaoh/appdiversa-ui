'use client';

/**
 * Panel cliente que gestiona el flujo de preguntas filtro/preliminares.
 */

import { useRouter } from 'next/navigation';
import { BarraProgreso } from '@/components/ui/003_barra_progreso';
import { NavegacionPreguntas } from '@/components/ui/007_navegacion_preguntas';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { RenderizadorPregunta } from '@/components/preguntas/000_renderizador_pregunta';
import { PreguntaFechaNacimiento } from '@/components/preguntas/022_pregunta_fecha_nacimiento';
import { PreguntaGrupoGeografico } from '@/components/preguntas/020_pregunta_grupo_catalogo';
import { PanelConsentimiento } from '@/components/formularios/008_panel_consentimiento';
import { ModalNoCumpleCondiciones } from '@/components/formularios/013_modal_no_cumple_condiciones';
import {
  ProveedorModalesFormulario,
  useFlujoModalesFormularioContext,
} from '@/components/formularios/011_proveedor_modales_formulario';
import { useSesionAnonima } from '@/hooks/useSesionAnonima';
import { useConectividad } from '@/hooks/useConectividad';
import { useGuardarRespuesta } from '@/hooks/useGuardarRespuesta';
import { useFlujoPreguntasFiltro } from '@/hooks/useFlujoPreguntasFiltro';
import { useIdiomaStore } from '@/store/idiomaStore';
import type { FormularioEstructura, Pregunta } from '@/types/formulario';
import { marcarFiltrosCompletados } from '@/storage/filtrosSesion';
import { preguntaConNumeroVisual } from '@/utils/motorReglasUi';
import { useState } from 'react';

interface PanelVerificacionProps {
  readonly uuid: string;
  readonly estructura: FormularioEstructura;
  readonly preguntasFiltro: Pregunta[];
}

export function PanelVerificacion(props: PanelVerificacionProps) {
  return (
    <ProveedorModalesFormulario
      uuidFormulario={props.uuid}
      rutaActual={`/encuestas/${props.uuid}`}
    >
      <PanelVerificacionContenido {...props} />
    </ProveedorModalesFormulario>
  );
}

function PanelVerificacionContenido({
  uuid,
  estructura,
  preguntasFiltro,
}: PanelVerificacionProps) {
  const router = useRouter();
  const flujo = useFlujoModalesFormularioContext();
  useConectividad();
  const idioma = useIdiomaStore((s) => s.idioma);
  const { listo, error: errorSesion } = useSesionAnonima({
    uuidFormulario: uuid,
    idioma,
  });
  const { guardarInmediato } = useGuardarRespuesta();
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const flujoFiltro = useFlujoPreguntasFiltro({
    preguntasFiltro,
    estructura,
  });

  async function guardarPreguntaActual(): Promise<boolean> {
    const preguntasPaso = flujoFiltro.preguntasPasoActual;
    if (preguntasPaso.length === 0) {
      return false;
    }
    setGuardando(true);
    setErrorGlobal(null);
    try {
      for (const pregunta of preguntasPaso) {
        await guardarInmediato(pregunta, flujoFiltro.respuestas[pregunta.codigo]);
      }
      return true;
    } catch {
      setErrorGlobal('No fue posible guardar la respuesta de verificación.');
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function manejarContinuar() {
    if (!flujoFiltro.validarPreguntaActual()) {
      return;
    }
    const guardado = await guardarPreguntaActual();
    if (!guardado) {
      return;
    }
    flujoFiltro.continuarFlujo();
  }

  function manejarVolver() {
    setErrorGlobal(null);
    if (flujoFiltro.fase === 'verificacion_exitosa') {
      flujoFiltro.retroceder();
      return;
    }
    if (flujoFiltro.indiceActual > 0) {
      flujoFiltro.retroceder();
      return;
    }
    flujo.solicitarSalida('/');
  }

  async function manejarAceptarVerificacion() {
    await flujo.aceptarTerminos();
    marcarFiltrosCompletados(uuid);
    router.push(`/encuestas/${uuid}/responder`);
  }

  if (errorSesion) {
    return (
      <p role="alert" style={{ color: 'var(--color-error)' }}>
        {errorSesion}
      </p>
    );
  }

  if (!listo || flujo.verificandoTerminos || !flujo.terminosAceptados) {
    return <SkeletonFormulario />;
  }

  if (flujoFiltro.fase === 'verificacion_exitosa') {
    return (
      <PanelConsentimiento
        estructura={estructura}
        onAceptar={manejarAceptarVerificacion}
        onAbrirTerminos={flujo.abrirTerminos}
        textoEnlaceTerminos={
          flujo.textos.terminos.enlace_terminos ?? 'Términos y condiciones'
        }
        textoBotonAceptar={flujoFiltro.textosVerificacion.botonAceptar}
        tituloVerificacion={flujoFiltro.textosVerificacion.titulo}
        descripcionVerificacion={flujoFiltro.textosVerificacion.cuerpo}
        procesando={guardando}
      />
    );
  }

  const preguntaActual = flujoFiltro.preguntaActual;
  if (!preguntaActual) {
    return <SkeletonFormulario />;
  }

  const numeroVisual = flujoFiltro.indiceActual + 1;
  const preguntaVisual = preguntaConNumeroVisual(preguntaActual, numeroVisual);
  const valorActual = flujoFiltro.respuestas[preguntaActual.codigo];

  function renderizarContenidoPaso() {
    if (flujoFiltro.esGrupoGeograficoActual) {
      return (
        <PreguntaGrupoGeografico
          preguntaRaiz={preguntaVisual}
          preguntasFormulario={preguntasFiltro}
          valores={flujoFiltro.respuestas}
          onCambioGrupo={(cambios) =>
            cambios.forEach((cambio) =>
              flujoFiltro.actualizarRespuesta(cambio.codigo, cambio.valor),
            )
          }
          obtenerObligatoria={(pregunta) => pregunta.es_obligatoria}
          obtenerError={(codigo) => flujoFiltro.errores[codigo]}
        />
      );
    }
    if (flujoFiltro.esPreguntaFechaNacimiento(preguntaActual)) {
      return (
        <PreguntaFechaNacimiento
          pregunta={preguntaVisual}
          valor={valorActual}
          numeroVisual={numeroVisual}
          onCambio={(valor) =>
            flujoFiltro.actualizarRespuesta(preguntaActual.codigo, valor)
          }
          obligatoria={preguntaActual.es_obligatoria}
          errorExterno={flujoFiltro.errores[preguntaActual.codigo]}
        />
      );
    }
    return (
      <RenderizadorPregunta
        pregunta={preguntaVisual}
        valor={valorActual}
        onCambio={(valor) =>
          flujoFiltro.actualizarRespuesta(preguntaActual.codigo, valor)
        }
        obligatoria={preguntaActual.es_obligatoria}
        error={flujoFiltro.errores[preguntaActual.codigo]}
        idPrefijo={preguntaActual.codigo}
        respuestasFormulario={flujoFiltro.respuestas}
      />
    );
  }

  return (
    <>
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-fondo-tarjeta)',
          boxShadow: 'var(--sombra-md)',
        }}
      >
        <div className="mb-6">
          <BarraProgreso
            preguntaActual={numeroVisual}
            totalPreguntas={flujoFiltro.totalPreguntas}
          />
        </div>

        <div className="mb-8">
          {renderizarContenidoPaso()}
        </div>

        {errorGlobal && (
          <p role="alert" className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>
            {errorGlobal}
          </p>
        )}

        <NavegacionPreguntas
          puedeContinuar={flujoFiltro.puedeContinuarActual}
          procesando={guardando}
          ariaLabelContinuar={
            flujoFiltro.esUltima
              ? 'Continuar a la verificación'
              : 'Continuar a la siguiente pregunta'
          }
          onVolver={manejarVolver}
          onContinuar={manejarContinuar}
        />
      </div>

      <ModalNoCumpleCondiciones
        abierto={flujoFiltro.mostrarModalNoElegible}
        textos={flujoFiltro.textosNoElegible}
        onVerOtrasEncuestas={() => router.push('/encuestas')}
        onVolver={() => {
          flujoFiltro.cerrarModalNoElegible();
          router.push('/encuestas');
        }}
      />
    </>
  );
}
