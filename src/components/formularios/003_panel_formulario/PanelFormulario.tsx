'use client';

/**
 * Panel principal de diligenciamiento dinamico del formulario.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AvisoConexionOffline } from '@/components/offline/003_aviso_conexion_offline';
import { TextosLegales } from '@/components/formularios/004_textos_legales';
import { ListaPendientes } from '@/components/formularios/005_lista_pendientes';
import { PantallaEnvioExitoso } from '@/components/formularios/009_pantalla_envio_exitoso';
import { PanelConsentimiento } from '@/components/formularios/008_panel_consentimiento';
import { BarraProgreso } from '@/components/ui/003_barra_progreso';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { Boton } from '@/components/ui/001_boton';
import { useConfirmacion } from '@/components/ui/006_proveedores_ui';
import { NavegacionPreguntas } from '@/components/ui/007_navegacion_preguntas';
import { useConectividad } from '@/hooks/useConectividad';
import { useSesionAnonima } from '@/hooks/useSesionAnonima';
import { useGuardarRespuesta } from '@/hooks/useGuardarRespuesta';
import { useSincronizacionAutomatica } from '@/hooks/useSincronizacionAutomatica';
import { useRestaurarRespuestas } from '@/hooks/useRestaurarRespuestas';
import { useLimpiarRespuestasOcultas } from '@/hooks/useLimpiarRespuestasOcultas';
import { useIdiomaStore } from '@/store/idiomaStore';
import { useFormulariosStore } from '@/store/formulariosStore';
import { AnuncioReglas } from '@/components/offline/003_anuncio_reglas';
import { useReglasStore } from '@/store/reglasStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/components/layout/007_app_theme';
import {
  validarFinalizacion,
  finalizarSesion,
  obtenerResumenSesion,
} from '@/services/sesionesServicio';
import type { FormularioEstructura, Pregunta } from '@/types/formulario';
import type { PreguntaPendiente, ResumenFormularioSesion } from '@/types/sesion';
import {
  listarPreguntasVisibles,
  buscarIndicePregunta,
  preguntaHabilitadaSegunReglas,
  preguntaObligatoriaSegunReglas,
  calcularNumeracionVisual,
  preguntaConNumeroVisual,
} from '@/utils/motorReglasUi';
import {
  listarPreguntasNavegacion,
  obtenerCamposGrupoGeografico,
  debeMostrarseComoGrupoGeografico,
} from '@/utils/preguntasCatalogoAgrupadas';
import {
  valorInicialPorTipo,
  construirValoresIniciales,
  respuestaPermiteContinuar,
} from '@/utils/validacionPregunta';
import { faltaTextoOtroObligatorio } from '@/utils/interaccionOpciones';
import { construirEsquemaFormulario } from '@/utils/esquemaFormularioZod';
import { debeBloquearFormularioOffline } from '@/utils/bloqueoOffline';
import {
  contenidoTextoFormulario,
  obtenerOpcionesConfirmacionEnvio,
  tituloTextoFormulario,
} from '@/utils/textosFormulario';
import { guardarEstructuraEnCache } from '@/storage/formulariosCache';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { extraerDetalleError, ErrorApi } from '@/utils/erroresApi';
import {
  ProveedorModalesFormulario,
  useFlujoModalesFormularioContext,
} from '@/components/formularios/011_proveedor_modales_formulario';

const PreguntaGrupoGeografico = dynamic(
  () =>
    import('@/components/preguntas/020_pregunta_grupo_catalogo').then((modulo) => ({
      default: modulo.PreguntaGrupoGeografico,
    })),
  { loading: () => <SkeletonFormulario /> }
);

const RenderizadorPregunta = dynamic(
  () =>
    import('@/components/preguntas/000_renderizador_pregunta').then((modulo) => ({
      default: modulo.RenderizadorPregunta,
    })),
  { loading: () => <SkeletonFormulario /> }
);

const MENSAJE_BLOQUEO_OFFLINE =
  'Este formulario no está habilitado para responderse sin conexión. ' +
  'Conéctese a internet para continuar.';

interface PanelFormularioProps {
  readonly uuidFormulario: string;
  readonly estructura: FormularioEstructura;
  /** Modo preview administrativo: no crea sesion ni guarda respuestas. */
  readonly modoPreview?: boolean;
  /** Indica que el consentimiento ya fue otorgado en el flujo de filtros. */
  readonly consentimientoPreaceptado?: boolean;
  /** Habilita el diligenciamiento sin conexion segun la parametrizacion del formulario. */
  readonly permiteOffline?: boolean;
}

function resolverCamposGrupoActual(
  preguntaActual: Pregunta | undefined,
  esGrupoGeografico: boolean,
  preguntasVisibles: Pregunta[],
): Pregunta[] {
  if (!preguntaActual) return [];
  if (esGrupoGeografico) {
    return obtenerCamposGrupoGeografico(preguntaActual, preguntasVisibles);
  }
  return [preguntaActual];
}

interface VistaFinalizadoPanelProps {
  readonly estructura: FormularioEstructura;
  readonly mensajeFinalizacion: string;
  readonly resumen: ResumenFormularioSesion | null;
  readonly uuidFormulario: string;
}

function VistaFinalizadoPanel({
  estructura,
  mensajeFinalizacion,
  resumen,
  uuidFormulario,
}: VistaFinalizadoPanelProps) {
  const { uuidSesion } = useSesionStore.getState();
  const { autenticado } = useAuthStore.getState();
  const { configuracion } = useAppTheme();
  const envioExitoso = configuracion.flujo_formulario?.envio_exitoso;
  const tituloEnvio = tituloTextoFormulario(
    estructura,
    'confirmacion_envio',
    'Encuesta enviada con éxito'
  );
  const subtituloEnvio =
    contenidoTextoFormulario(estructura, 'agradecimiento', mensajeFinalizacion) ||
    undefined;
  const urlResumen = uuidSesion ? `/encuestas/${uuidFormulario}/resumen` : undefined;

  return (
    <>
      {!resumen && <AvisoConexionOffline />}
      <PantallaEnvioExitoso
        titulo={tituloEnvio}
        subtitulo={subtituloEnvio}
        imagenPortada={estructura.imagen_portada}
        imagenExito={envioExitoso?.imagen_url}
        imagenExitoAlt={envioExitoso?.imagen_alt}
        nombreFormulario={estructura.nombre}
        urlOtrasEncuestas="/encuestas"
        urlResumen={urlResumen}
        esAnonimo={!autenticado}
      />
    </>
  );
}

interface AccionesFinalizacionPanel {
  readonly setProcesando: (valor: boolean) => void;
  readonly setErrorGlobal: (valor: string | null) => void;
  readonly setPendientes: (valor: PreguntaPendiente[]) => void;
  readonly setMensajeFinalizacion: (valor: string) => void;
  readonly setFinalizado: (valor: boolean) => void;
  readonly setResumen: (valor: ResumenFormularioSesion | null) => void;
}

interface ParametrosFinalizacionPanel {
  readonly enLinea: boolean;
  readonly uuidFormulario: string;
  readonly estructura: FormularioEstructura;
  readonly flushGuardadosPendientes: () => Promise<void>;
  readonly sincronizarEnSegundoPlano: () => Promise<void>;
  readonly establecerFinalizacionPendiente: (pendiente: boolean, uuid?: string) => void;
  readonly iniciarSesion: () => Promise<void>;
  readonly acciones: AccionesFinalizacionPanel;
}

async function ejecutarFinalizacionPanel({
  enLinea,
  uuidFormulario,
  estructura,
  flushGuardadosPendientes,
  sincronizarEnSegundoPlano,
  establecerFinalizacionPendiente,
  iniciarSesion,
  acciones,
}: ParametrosFinalizacionPanel): Promise<void> {
  const {
    setProcesando,
    setErrorGlobal,
    setPendientes,
    setMensajeFinalizacion,
    setFinalizado,
    setResumen,
  } = acciones;

  setProcesando(true);
  setErrorGlobal(null);
  setPendientes([]);
  try {
    await flushGuardadosPendientes();
    if (!enLinea) {
      establecerFinalizacionPendiente(true, uuidFormulario);
      setMensajeFinalizacion(
        'Sin conexión a internet. Su formulario quedó guardado en este dispositivo y se enviará automáticamente cuando se restablezca la conexión.',
      );
      setFinalizado(true);
      return;
    }

    await sincronizarEnSegundoPlano();
    const { uuidSesion, tokenCliente } = useSesionStore.getState();
    if (!uuidSesion || !tokenCliente) {
      setErrorGlobal('No hay sesión activa.');
      return;
    }
    const credenciales = { uuidSesion, tokenCliente };
    const validacion = await validarFinalizacion(credenciales);
    if (!validacion.es_valido) {
      setPendientes(validacion.preguntas_pendientes);
      setErrorGlobal(
        `Faltan ${validacion.total_pendientes} respuesta(s) obligatoria(s).`
      );
      return;
    }
    const resultado = await finalizarSesion(credenciales);
    establecerFinalizacionPendiente(false);
    setMensajeFinalizacion(
      resultado.mensaje ||
        contenidoTextoFormulario(estructura, 'confirmacion_envio', '')
    );
    const resumenSesion = await obtenerResumenSesion(credenciales);
    setResumen(resumenSesion);
    setFinalizado(true);
  } catch (err) {
    if (err instanceof ErrorApi && err.estadoHttp === 403) {
      setErrorGlobal('La sesión expiró. Se intentará crear una nueva sesión.');
      await iniciarSesion();
      return;
    }
    setErrorGlobal(extraerDetalleError(err));
  } finally {
    setProcesando(false);
  }
}

function formularioRequiereConsentimiento(estructura: FormularioEstructura): boolean {
  return estructura.textos.some(
    (texto) =>
      texto.tipo === 'autorizacion_datos' || texto.tipo === 'consentimiento_datos',
  );
}

interface EstadoIntermedioPanelProps {
  readonly errorSesion: string | null;
  readonly listo: boolean;
  readonly modoPreview: boolean;
  readonly verificandoTerminos: boolean;
  readonly terminosAceptados: boolean;
  readonly estructura: FormularioEstructura;
  readonly consentimientoAceptado: boolean;
  readonly onAceptarConsentimiento: () => void;
  readonly onAbrirTerminos: () => void;
  readonly textoEnlaceTerminos: string;
  readonly textoBotonAceptar: string;
  readonly noAplicaFormulario: boolean;
  readonly onVolverInicio: () => void;
  readonly finalizado: boolean;
  readonly mensajeFinalizacion: string;
  readonly resumen: ResumenFormularioSesion | null;
  readonly uuidFormulario: string;
  readonly preguntaActual: Pregunta | undefined;
}

function renderEstadoIntermedioPanel({
  errorSesion,
  listo,
  modoPreview,
  verificandoTerminos,
  terminosAceptados,
  estructura,
  consentimientoAceptado,
  onAceptarConsentimiento,
  onAbrirTerminos,
  textoEnlaceTerminos,
  textoBotonAceptar,
  noAplicaFormulario,
  onVolverInicio,
  finalizado,
  mensajeFinalizacion,
  resumen,
  uuidFormulario,
  preguntaActual,
}: EstadoIntermedioPanelProps) {
  if (errorSesion) {
    return (
      <p role="alert" style={{ color: 'var(--color-error)' }}>
        {errorSesion}
      </p>
    );
  }

  if (!listo || (!modoPreview && (verificandoTerminos || !terminosAceptados))) {
    return <SkeletonFormulario />;
  }

  if (
    formularioRequiereConsentimiento(estructura) &&
    !consentimientoAceptado &&
    !modoPreview
  ) {
    return (
      <PanelConsentimiento
        estructura={estructura}
        onAceptar={onAceptarConsentimiento}
        onAbrirTerminos={onAbrirTerminos}
        textoEnlaceTerminos={textoEnlaceTerminos}
        textoBotonAceptar={textoBotonAceptar}
      />
    );
  }

  if (noAplicaFormulario) {
    return <VistaNoAplicaFormulario onVolverInicio={onVolverInicio} />;
  }

  if (finalizado) {
    return (
      <VistaFinalizadoPanel
        estructura={estructura}
        mensajeFinalizacion={mensajeFinalizacion}
        resumen={resumen}
        uuidFormulario={uuidFormulario}
      />
    );
  }

  if (!preguntaActual) {
    return (
      <p style={{ color: 'var(--color-texto-muted)' }}>
        No hay preguntas visibles en este formulario.
      </p>
    );
  }

  return null;
}

function irAPreguntaPendienteEnNavegacion(
  codigo: string,
  preguntasNavegacion: Pregunta[],
  preguntasVisibles: Pregunta[],
): number | null {
  const indice = buscarIndicePregunta(preguntasNavegacion, codigo);
  if (indice >= 0) return indice;

  const preguntaDependiente = preguntasVisibles.find((item) => item.codigo === codigo);
  const codigoPadre =
    preguntaDependiente?.pregunta_origen_flujo_codigo ??
    preguntaDependiente?.pregunta_padre_catalogo?.codigo ??
    codigo;
  const indicePadre = buscarIndicePregunta(preguntasNavegacion, codigoPadre);
  return indicePadre >= 0 ? indicePadre : null;
}

function VistaNoAplicaFormulario({ onVolverInicio }: { readonly onVolverInicio: () => void }) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
    >
      <output
        aria-live="polite"
        className="block"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        Este formulario no aplica según las reglas evaluadas.
      </output>
      <Boton variante="secundario" ancho="auto" onClick={onVolverInicio}>
        Volver al inicio
      </Boton>
    </div>
  );
}

function VistaBloqueoOffline({ onVolverInicio }: { readonly onVolverInicio: () => void }) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
    >
      <output
        role="alert"
        aria-live="assertive"
        className="block"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        {MENSAJE_BLOQUEO_OFFLINE}
      </output>
      <Boton variante="secundario" ancho="auto" onClick={onVolverInicio}>
        Volver al inicio
      </Boton>
    </div>
  );
}

export function PanelFormulario(props: PanelFormularioProps) {
  const rutaActual = `/encuestas/${props.uuidFormulario}/responder`;
  return (
    <ProveedorModalesFormulario
      uuidFormulario={props.uuidFormulario}
      rutaActual={rutaActual}
      deshabilitado={props.modoPreview}
    >
      <PanelFormularioContenido {...props} />
    </ProveedorModalesFormulario>
  );
}

function PanelFormularioContenido({
  uuidFormulario,
  estructura,
  modoPreview = false,
  consentimientoPreaceptado = false,
  permiteOffline = true,
}: PanelFormularioProps) {
  const flujo = useFlujoModalesFormularioContext();
  const router = useRouter();
  useConectividad();
  const enLinea = useOfflineStore((s) => s.enLinea);
  const idioma = useIdiomaStore((s) => s.idioma);
  const { listo, error: errorSesion, iniciarSesion } = useSesionAnonima({
    uuidFormulario,
    idioma,
    deshabilitado: modoPreview,
  });
  const { programarGuardado, flushGuardadosPendientes } = useGuardarRespuesta();
  const establecerFinalizacionPendiente = useOfflineStore(
    (estado) => estado.establecerFinalizacionPendiente,
  );

  const resultadoReglas = useReglasStore((s) => s.resultado);
  const [indiceActual, setIndiceActual] = useState(0);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState<PreguntaPendiente[]>([]);
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(
    consentimientoPreaceptado,
  );
  const [finalizado, setFinalizado] = useState(false);
  const [resumen, setResumen] = useState<ResumenFormularioSesion | null>(null);
  const [mensajeFinalizacion, setMensajeFinalizacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  const { confirmar } = useConfirmacion();
  const { sincronizarEnSegundoPlano } = useSincronizacionAutomatica({
    listo: modoPreview ? false : listo,
    uuidFormulario,
    alFinalizarOffline: setMensajeFinalizacion,
  });

  const preguntasVisibles = useMemo(
    () => listarPreguntasVisibles(estructura.secciones, resultadoReglas),
    [estructura.secciones, resultadoReglas]
  );

  const preguntasNavegacion = useMemo(
    () => listarPreguntasNavegacion(estructura.secciones, resultadoReglas),
    [estructura.secciones, resultadoReglas]
  );

  const numeracionVisual = useMemo(
    () => calcularNumeracionVisual(preguntasNavegacion),
    [preguntasNavegacion]
  );

  const valoresIniciales = useMemo(
    () => construirValoresIniciales(preguntasVisibles),
    [preguntasVisibles]
  );

  const indiceSeguro = Math.min(
    indiceActual,
    Math.max(0, preguntasNavegacion.length - 1)
  );
  const preguntaActual = preguntasNavegacion[indiceSeguro];
  const esUltima = indiceSeguro >= preguntasNavegacion.length - 1;
  const esGrupoGeografico = preguntaActual
    ? debeMostrarseComoGrupoGeografico(preguntaActual, preguntasVisibles)
    : false;
  const camposGrupoActual = resolverCamposGrupoActual(
    preguntaActual,
    esGrupoGeografico,
    preguntasVisibles,
  );

  const obligatoriaActual = preguntaActual
    ? preguntaObligatoriaSegunReglas(
        preguntaActual.codigo,
        preguntaActual.es_obligatoria,
        resultadoReglas
      )
    : false;

  const esquemaFormulario = useMemo(
    () =>
      construirEsquemaFormulario(preguntasVisibles, (codigo, base) =>
        preguntaObligatoriaSegunReglas(codigo, base, resultadoReglas)
      ),
    [preguntasVisibles, resultadoReglas]
  );

  const {
    control,
    setValue,
    reset,
    trigger,
    formState: { errors: erroresFormulario },
  } = useForm<Record<string, unknown>>({
    defaultValues: valoresIniciales,
    resolver: zodResolver(esquemaFormulario),
  });

  const valoresFormulario = useWatch({ control }) ?? {};

  useRestaurarRespuestas({ listo: modoPreview ? false : listo, preguntas: preguntasVisibles, reset });

  useLimpiarRespuestasOcultas(
    estructura.secciones,
    resultadoReglas,
    setValue,
    modoPreview,
  );
  useEffect(() => {
    ejecutarSinEspera(guardarEstructuraEnCache(uuidFormulario, estructura));
    useFormulariosStore.getState().establecerEstructura(estructura);
    return () => useFormulariosStore.getState().limpiar();
  }, [uuidFormulario, estructura]);

  useEffect(() => {
    if (!preguntaActual) return;
    const seccion = estructura.secciones.find((item) =>
      item.preguntas.some((p) => p.codigo === preguntaActual.codigo)
    );
    if (seccion) {
      useFormulariosStore.getState().establecerSeccionActiva(seccion.codigo);
    }
  }, [estructura.secciones, preguntaActual]);

  function valorRespuesta(pregunta: NonNullable<typeof preguntaActual>): unknown {
    return valoresFormulario[pregunta.codigo] ?? valorInicialPorTipo(pregunta.tipo_pregunta);
  }

  function resolverIndiceDestino(): number {
    const reglas = useReglasStore.getState().resultado;
    if (reglas.saltar_a_pregunta) {
      const indice = buscarIndicePregunta(
        preguntasNavegacion,
        reglas.saltar_a_pregunta
      );
      if (indice >= 0) return indice;
    }
    if (reglas.saltar_a_seccion) {
      const seccion = estructura.secciones.find(
        (s) => s.codigo === reglas.saltar_a_seccion
      );
      const codigoPrimera = seccion?.preguntas[0]?.codigo;
      if (codigoPrimera) {
        const indice = buscarIndicePregunta(preguntasNavegacion, codigoPrimera);
        if (indice >= 0) return indice;
      }
    }
    return indiceSeguro + 1;
  }

  const manejarCambioGrupo = useCallback(
    (cambios: Array<{ codigo: string; valor: unknown }>) => {
      for (const cambio of cambios) {
        const pregunta = preguntasVisibles.find(
          (item) => item.codigo === cambio.codigo,
        );
        if (!pregunta) continue;
        setValue(cambio.codigo, cambio.valor, { shouldDirty: true });
        if (!modoPreview) {
          programarGuardado(pregunta, cambio.valor);
        }
      }
    },
    [preguntasVisibles, programarGuardado, setValue, modoPreview],
  );

  const manejarCambio = useCallback(
    (codigo: string, valor: unknown) => {
      if (preguntaActual?.codigo !== codigo) return;
      setValue(codigo, valor, { shouldDirty: true });
      if (!modoPreview) {
        programarGuardado(preguntaActual, valor);
      }
    },
    [preguntaActual, programarGuardado, setValue, modoPreview]
  );

  const manejarCambioObservacion = useCallback(
    (codigo: string, texto: string) => {
      if (preguntaActual?.codigo !== codigo) return;
      const valor =
        valoresFormulario[codigo] ??
        valorInicialPorTipo(preguntaActual.tipo_pregunta);
      if (modoPreview) {
        const respuestaPrev = useRespuestasStore.getState().obtenerRespuesta(codigo);
        useRespuestasStore.getState().establecerRespuesta(codigo, {
          valor: respuestaPrev?.valor ?? valor,
          observacion: texto,
          versionCliente: respuestaPrev?.versionCliente ?? 1,
          origenRespuesta: respuestaPrev?.origenRespuesta ?? 'web',
          fechaCliente: new Date().toISOString(),
        });
        return;
      }
      programarGuardado(preguntaActual, valor, texto);
    },
    [preguntaActual, programarGuardado, modoPreview, valoresFormulario]
  );

  async function validarActual(): Promise<boolean> {
    if (!preguntaActual) return true;
    const codigosValidar = camposGrupoActual.map((campo) => campo.codigo);
    return trigger(codigosValidar);
  }

  function obtenerObligatoriaPregunta(pregunta: NonNullable<typeof preguntaActual>) {
    return preguntaObligatoriaSegunReglas(
      pregunta.codigo,
      pregunta.es_obligatoria,
      resultadoReglas,
    );
  }

  function obtenerErrorPregunta(codigo: string): string | undefined {
    const mensaje = erroresFormulario[codigo]?.message;
    return typeof mensaje === 'string' ? mensaje : undefined;
  }

  function irAPreguntaPendiente(codigo: string) {
    const indiceDestino = irAPreguntaPendienteEnNavegacion(
      codigo,
      preguntasNavegacion,
      preguntasVisibles,
    );
    if (indiceDestino === null) return;
    setIndiceActual(indiceDestino);
    setPendientes([]);
    setErrorGlobal(null);
  }

  async function ejecutarFinalizacion() {
    await ejecutarFinalizacionPanel({
      enLinea,
      uuidFormulario,
      estructura,
      flushGuardadosPendientes,
      sincronizarEnSegundoPlano,
      establecerFinalizacionPendiente,
      iniciarSesion,
      acciones: {
        setProcesando,
        setErrorGlobal,
        setPendientes,
        setMensajeFinalizacion,
        setFinalizado,
        setResumen,
      },
    });
  }

  async function manejarFinalizar() {
    if (modoPreview) {
      setMensajeFinalizacion('Vista previa: el formulario no se envia.');
      setFinalizado(true);
      return;
    }
    if (!(await validarActual())) return;
    const aceptado = await confirmar(obtenerOpcionesConfirmacionEnvio(estructura));
    if (aceptado) {
      await ejecutarFinalizacion();
    }
  }

  async function manejarContinuar() {
    if (resultadoReglas.finalizar_formulario) {
      await manejarFinalizar();
      return;
    }
    if (!(await validarActual())) return;
    if (esUltima) {
      await manejarFinalizar();
    } else {
      setIndiceActual(resolverIndiceDestino());
    }
  }

  function manejarVolver() {
    setErrorGlobal(null);
    if (indiceSeguro > 0) {
      setIndiceActual(indiceSeguro - 1);
      return;
    }
    flujo.solicitarSalida(`/encuestas/${uuidFormulario}`);
  }

  const codigoPreguntaActual = preguntaActual?.codigo ?? '';
  const respuestasPorCodigo = useRespuestasStore((estado) => estado.respuestas);
  const observacionActual =
    respuestasPorCodigo[codigoPreguntaActual]?.observacion ?? '';

  function observacionDePregunta(codigo: string): string {
    return respuestasPorCodigo[codigo]?.observacion ?? '';
  }

  const vistaIntermedia = renderEstadoIntermedioPanel({
    errorSesion,
    listo,
    modoPreview,
    verificandoTerminos: flujo.verificandoTerminos,
    terminosAceptados: flujo.terminosAceptados,
    estructura,
    consentimientoAceptado,
    onAceptarConsentimiento: () => setConsentimientoAceptado(true),
    onAbrirTerminos: flujo.abrirTerminos,
    textoEnlaceTerminos:
      flujo.textos.terminos.enlace_terminos ?? 'Términos y condiciones',
    textoBotonAceptar:
      flujo.textos.terminos.boton_aceptar ?? 'Aceptar y comenzar encuesta',
    noAplicaFormulario: resultadoReglas.no_aplica_formulario,
    onVolverInicio: () => router.push('/'),
    finalizado,
    mensajeFinalizacion,
    resumen,
    uuidFormulario,
    preguntaActual,
  });

  if (vistaIntermedia) {
    return vistaIntermedia;
  }

  if (debeBloquearFormularioOffline({ modoPreview, enLinea, permiteOffline })) {
    return <VistaBloqueoOffline onVolverInicio={() => router.push('/')} />;
  }

  const deshabilitada = !preguntaHabilitadaSegunReglas(
    preguntaActual.codigo,
    resultadoReglas
  );

  const valorActual = valorRespuesta(preguntaActual);

  function campoPermiteContinuar(campo: NonNullable<typeof preguntaActual>): boolean {
    const valor = valorRespuesta(campo);
    if (
      !respuestaPermiteContinuar(campo, valor, obtenerObligatoriaPregunta(campo))
    ) {
      return false;
    }
    return !faltaTextoOtroObligatorio(
      campo,
      valor,
      observacionDePregunta(campo.codigo),
    );
  }

  const puedeContinuar =
    !deshabilitada && camposGrupoActual.every(campoPermiteContinuar);

  const textoContinuar =
    esUltima || resultadoReglas.finalizar_formulario ? 'Finalizar' : 'Continuar';
  const ariaLabelContinuar =
    esUltima || resultadoReglas.finalizar_formulario
      ? 'Finalizar formulario'
      : 'Continuar a la siguiente pregunta';

  const numeroVisualActual =
    numeracionVisual.get(preguntaActual.codigo) ?? indiceSeguro + 1;
  const preguntaVisual = preguntaConNumeroVisual(
    preguntaActual,
    numeroVisualActual,
  );

  return (
    <div
      className="rounded-xl p-6 sm:p-8 flex flex-col gap-4"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        boxShadow: 'var(--sombra-md)',
      }}
    >
      <TextosLegales estructura={estructura} />

      <AvisoConexionOffline />

      <AnuncioReglas resultado={resultadoReglas} />

      {resultadoReglas.mensajes.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg p-3 text-sm"
          style={{
            backgroundColor: 'var(--color-fondo-pagina)',
            color: 'var(--color-texto-secundario)',
          }}
        >
          {resultadoReglas.mensajes.map((mensaje) => (
            <p key={mensaje}>{mensaje}</p>
          ))}
        </div>
      )}

      <ListaPendientes
        pendientes={pendientes}
        onSeleccionar={irAPreguntaPendiente}
        numeroPorCodigo={numeracionVisual}
      />

      <BarraProgreso
        preguntaActual={indiceSeguro + 1}
        totalPreguntas={preguntasNavegacion.length}
      />

      {esGrupoGeografico ? (
        <PreguntaGrupoGeografico
          preguntaRaiz={preguntaVisual}
          preguntasFormulario={preguntasVisibles}
          valores={valoresFormulario}
          onCambioGrupo={manejarCambioGrupo}
          deshabilitada={deshabilitada}
          obtenerObligatoria={obtenerObligatoriaPregunta}
          obtenerError={obtenerErrorPregunta}
        />
      ) : (
        <RenderizadorPregunta
          pregunta={preguntaVisual}
          valor={valorActual}
          observacion={observacionActual}
          onCambioObservacion={(texto) =>
            manejarCambioObservacion(preguntaActual.codigo, texto)
          }
          onCambio={(valor) => manejarCambio(preguntaActual.codigo, valor)}
          deshabilitada={deshabilitada}
          obligatoria={obligatoriaActual}
          error={obtenerErrorPregunta(preguntaActual.codigo)}
          idPrefijo={preguntaActual.codigo}
          respuestasFormulario={valoresFormulario}
        />
      )}

      {errorGlobal && (
        <p role="alert" className="text-sm" style={{ color: 'var(--color-error)' }}>
          {errorGlobal}
        </p>
      )}

      <NavegacionPreguntas
        puedeContinuar={puedeContinuar}
        procesando={procesando}
        textoContinuar={textoContinuar}
        ariaLabelContinuar={ariaLabelContinuar}
        onVolver={manejarVolver}
        onContinuar={manejarContinuar}
      />
    </div>
  );
}
