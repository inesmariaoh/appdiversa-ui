'use client';

/**
 * Muestra el resumen de respuestas de una sesion finalizada.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Boton } from '@/components/ui/001_boton';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { Modal } from '@/components/ui/011_modal';
import { FormularioEnviarCopia } from '@/components/formularios/007_formulario_enviar_copia';
import { BarraAccionesFormulario } from '@/components/formularios/010_barra_acciones_formulario';
import {
  ProveedorModalesFormulario,
  useFlujoModalesFormularioContext,
} from '@/components/formularios/011_proveedor_modales_formulario';
import { obtenerResumenSesion, obtenerHistorialSesiones } from '@/services/sesionesServicio';
import { useAuthStore } from '@/store/authStore';
import { useSesionStore } from '@/store/sesionStore';
import type { CredencialesSesion, ResumenFormularioSesion } from '@/types/sesion';
import type { SeccionFormulario } from '@/types/formulario';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { formatearFechaCompletada, resolverFechaDiligenciamientoIso } from '@/utils/resumenRespuestas';
import { useResumenEnriquecido } from '@/hooks/useResumenEnriquecido';
import { ItemRespuestaResumen } from './ItemRespuestaResumen';

export interface TextosResumenSesion {
  readonly textoGuardar?: string;
  readonly textoVerOtras?: string;
  readonly textoEnviarCopia?: string;
}

interface ResumenSesionProps {
  readonly uuidFormulario: string;
  readonly secciones: SeccionFormulario[];
  readonly textos?: TextosResumenSesion;
}

function resolverCredencialesResumen(
  uuidFormulario: string,
  uuidSesionParam: string | null,
  tokenClienteParam: string | null,
  autenticado: boolean,
): CredencialesSesion | null {
  const estadoSesion = useSesionStore.getState();
  if (estadoSesion.uuidSesion && estadoSesion.uuidFormulario === uuidFormulario) {
    return {
      uuidSesion: estadoSesion.uuidSesion,
      tokenCliente: estadoSesion.tokenCliente ?? undefined,
    };
  }

  if (uuidSesionParam && tokenClienteParam) {
    useSesionStore.getState().establecerSesion({
      uuidSesion: uuidSesionParam,
      tokenCliente: tokenClienteParam,
      uuidFormulario,
      estado: 'finalizada',
    });
    return { uuidSesion: uuidSesionParam, tokenCliente: tokenClienteParam };
  }

  if (uuidSesionParam && autenticado) {
    return { uuidSesion: uuidSesionParam };
  }

  return null;
}

export function ResumenSesion({ uuidFormulario, secciones, textos }: ResumenSesionProps) {
  return (
    <ProveedorModalesFormulario
      uuidFormulario={uuidFormulario}
      rutaActual={`/encuestas/${uuidFormulario}/resumen`}
    >
      <ResumenSesionContenido
        uuidFormulario={uuidFormulario}
        secciones={secciones}
        textos={textos}
      />
    </ProveedorModalesFormulario>
  );
}

function ResumenSesionContenido({
  uuidFormulario,
  secciones,
  textos,
}: ResumenSesionProps) {
  const flujo = useFlujoModalesFormularioContext();
  const autenticado = useAuthStore((s) => s.autenticado);
  const searchParams = useSearchParams();
  const [resumen, setResumen] = useState<ResumenFormularioSesion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalCopiaAbierto, setModalCopiaAbierto] = useState(false);
  const [credencialesSesion, setCredencialesSesion] = useState<CredencialesSesion | null>(
    null,
  );
  const [fechaDiligenciamientoIso, setFechaDiligenciamientoIso] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelado = false;

    async function cargarResumen() {
      const credenciales = resolverCredencialesResumen(
        uuidFormulario,
        searchParams.get('uuid_sesion'),
        searchParams.get('token_cliente'),
        useAuthStore.getState().autenticado,
      );

      if (!credenciales) {
        if (!cancelado) {
          setError('No hay una sesión activa para mostrar el resumen.');
          setCargando(false);
        }
        return;
      }

      try {
        const salida = await obtenerResumenSesion(credenciales);
        if (!cancelado) {
          setResumen(salida);
          setCredencialesSesion(credenciales);
        }
      } catch (err) {
        if (!cancelado) {
          setError(extraerDetalleError(err));
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    ejecutarSinEspera(cargarResumen());

    return () => {
      cancelado = true;
    };
  }, [searchParams, uuidFormulario]);

  useEffect(() => {
    if (
      !resumen ||
      resumen.fecha_finalizacion ||
      !autenticado ||
      !credencialesSesion?.uuidSesion
    ) {
      return;
    }

    let cancelado = false;

    obtenerHistorialSesiones()
      .then((historial) => {
        if (cancelado) return;
        const entrada = historial.find(
          (item) => item.uuid_sesion === credencialesSesion.uuidSesion,
        );
        if (entrada) {
          setFechaDiligenciamientoIso(resolverFechaDiligenciamientoIso(entrada));
        }
      })
      .catch(() => {
        // Si no se puede cargar historial, se mantiene el fallback visual.
      });

    return () => {
      cancelado = true;
    };
  }, [autenticado, credencialesSesion?.uuidSesion, resumen]);

  const { items: itemsPresentacion, cargandoEnriquecimiento } = useResumenEnriquecido(
    resumen,
    secciones,
  );

  if (cargando || flujo.verificandoTerminos || cargandoEnriquecimiento) {
    return <SkeletonFormulario />;
  }

  if (error) {
    return (
      <p role="alert" style={{ color: 'var(--color-error)' }}>
        {error}
      </p>
    );
  }

  if (!resumen) return null;

  const fechaCompletada = formatearFechaCompletada(
    resumen.fecha_finalizacion ?? fechaDiligenciamientoIso,
  );
  const textoGuardar = textos?.textoGuardar ?? 'Guardar';
  const textoVerOtras = textos?.textoVerOtras ?? flujo.textos.modal_guardado.boton_otras;
  const textoEnviarCopia = textos?.textoEnviarCopia ?? 'Enviar copia a mi correo';
  const puedeEnviarCopia = Boolean(credencialesSesion?.tokenCliente);

  return (
    <>
      <article
        className="mx-auto max-w-[801px] rounded-[20px] px-6 py-8 sm:px-10 flex flex-col gap-8"
        style={{
          backgroundColor: 'var(--color-fondo-tarjeta)',
          border: '1px solid var(--color-borde)',
          boxShadow: 'var(--sombra-md, 0 10px 40px color-mix(in srgb, var(--color-texto-primario) 8%, transparent))',
        }}
      >
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {fechaCompletada ? (
            <p className="text-sm font-medium" style={{ color: 'var(--color-texto-secundario)' }}>
              Completada el:{' '}
              <span style={{ color: 'var(--color-texto-primario)' }}>{fechaCompletada}</span>
            </p>
          ) : (
            <p className="text-sm font-medium" style={{ color: 'var(--color-texto-secundario)' }}>
              Formulario completado
            </p>
          )}
          <Boton
            type="button"
            variante="primario"
            ancho="auto"
            className="self-start sm:self-auto"
            onClick={flujo.ofrecerGuardarProgreso}
          >
            {textoGuardar}
          </Boton>
        </header>

        <div className="flex flex-col gap-8">
          {itemsPresentacion.map((presentacion, indice) => (
            <ItemRespuestaResumen
              key={`${presentacion.item.pregunta_codigo}-${presentacion.item.seccion_codigo}`}
              presentacion={presentacion}
              orden={indice + 1}
            />
          ))}
        </div>

        <BarraAccionesFormulario
          onGuardar={flujo.ofrecerGuardarProgreso}
          urlOtrasEncuestas="/"
          onEnviarCopia={() => setModalCopiaAbierto(true)}
          puedeCopia={puedeEnviarCopia}
          textoGuardar={textoGuardar}
          textoVerOtras={textoVerOtras}
          textoEnviarCopia={textoEnviarCopia}
        />

        {!autenticado && (
          <p className="text-xs" style={{ color: 'var(--color-texto-muted)' }}>
            {flujo.textos.modal_sesion.parrafo}
          </p>
        )}
      </article>

      {credencialesSesion?.tokenCliente && (
        <Modal
          abierto={modalCopiaAbierto}
          onCerrar={() => setModalCopiaAbierto(false)}
          titulo="Enviar copia de respuestas"
          descripcion="Recibe un resumen de tus respuestas en el correo indicado."
          tamano="sm"
        >
          <FormularioEnviarCopia
            uuidSesion={credencialesSesion.uuidSesion}
            tokenCliente={credencialesSesion.tokenCliente}
            variante="modal"
            onEnviado={() => setModalCopiaAbierto(false)}
          />
        </Modal>
      )}
    </>
  );
}
