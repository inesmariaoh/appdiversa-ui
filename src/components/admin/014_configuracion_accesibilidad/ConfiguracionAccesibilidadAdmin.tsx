'use client';

/**
 * Panel administrativo para activar o desactivar las funcionalidades de
 * accesibilidad de la interfaz y parametrizar el video en lengua de senas y el
 * enlace al Centro de Relevo. La configuracion se lee y persiste en el backend,
 * de modo que el comportamiento del aplicativo se ajusta sin nuevos despliegues.
 */

import { useEffect, useState } from 'react';
import { Boton } from '@/components/ui/001_boton';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { useInterfazStore } from '@/store/interfazStore';
import type {
  AccesibilidadAdminDatos,
  AccesibilidadServidor,
  TemaAccesibilidad,
} from '@/types/interfaz';
import {
  actualizarAccesibilidadAdmin,
  obtenerAccesibilidadAdmin,
} from '@/services/interfazAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

type ClaveBooleana =
  | 'lectura_voz_habilitada'
  | 'comandos_voz_habilitada'
  | 'lengua_senas_habilitada'
  | 'fuente_dislexia_habilitada'
  | 'centro_relevo_habilitado';

interface DescripcionBandera {
  readonly clave: ClaveBooleana;
  readonly etiqueta: string;
  readonly descripcion: string;
}

const BANDERAS: readonly DescripcionBandera[] = [
  {
    clave: 'lectura_voz_habilitada',
    etiqueta: 'Lectura por voz (texto a voz)',
    descripcion: 'Muestra un botón "Escuchar" junto al enunciado de cada pregunta.',
  },
  {
    clave: 'comandos_voz_habilitada',
    etiqueta: 'Comandos de voz',
    descripcion: 'Permite avanzar y retroceder la encuesta usando la voz.',
  },
  {
    clave: 'lengua_senas_habilitada',
    etiqueta: 'Panel de lengua de señas',
    descripcion:
      'Habilita el video en lengua de señas cuando existe una URL configurada.',
  },
  {
    clave: 'fuente_dislexia_habilitada',
    etiqueta: 'Fuente para dislexia',
    descripcion:
      'Agrega en la barra de accesibilidad el botón para una tipografía adaptada.',
  },
  {
    clave: 'centro_relevo_habilitado',
    etiqueta: 'Centro de Relevo',
    descripcion:
      'Muestra en la barra de accesibilidad un enlace al servicio Centro de Relevo.',
  },
];

const TEMAS: readonly { readonly valor: TemaAccesibilidad; readonly etiqueta: string }[] = [
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
  { valor: 'alto_contraste', etiqueta: 'Alto contraste' },
];

const MENSAJE_GUARDADO = 'Cambios guardados correctamente.';

interface FilaInterruptorProps {
  readonly bandera: DescripcionBandera;
  readonly activo: boolean;
  readonly onCambio: (valor: boolean) => void;
}

function FilaInterruptor({ bandera, activo, onCambio }: FilaInterruptorProps) {
  const idControl = `bandera-${bandera.clave}`;
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border"
      style={{ borderColor: 'var(--color-borde)' }}
    >
      <input
        id={idControl}
        type="checkbox"
        className="mt-1"
        checked={activo}
        onChange={(evento) => onCambio(evento.target.checked)}
      />
      <label htmlFor={idControl}>
        <span className="block font-medium" style={{ color: 'var(--color-texto-primario)' }}>
          {bandera.etiqueta}
        </span>
        <span className="block text-sm" style={{ color: 'var(--color-texto-secundario)' }}>
          {bandera.descripcion}
        </span>
      </label>
    </div>
  );
}

function extraerBanderasPublicas(datos: AccesibilidadAdminDatos): AccesibilidadServidor {
  return {
    lectura_voz_habilitada: datos.lectura_voz_habilitada,
    comandos_voz_habilitada: datos.comandos_voz_habilitada,
    lengua_senas_habilitada: datos.lengua_senas_habilitada,
    fuente_dislexia_habilitada: datos.fuente_dislexia_habilitada,
    tema_por_defecto: datos.tema_por_defecto,
    centro_relevo_habilitado: datos.centro_relevo_habilitado,
    url_centro_relevo: datos.url_centro_relevo,
  };
}

function sincronizarStoreInterfaz(datos: AccesibilidadAdminDatos): void {
  const configuracion = useInterfazStore.getState().configuracion;
  if (!configuracion) return;
  useInterfazStore.getState().establecerConfiguracion({
    ...configuracion,
    accesibilidad: extraerBanderasPublicas(datos),
    url_lengua_senas: datos.url_lengua_senas || null,
    texto_lengua_senas: datos.texto_lengua_senas || null,
  });
}

export function ConfiguracionAccesibilidadAdmin() {
  const [datos, setDatos] = useState<AccesibilidadAdminDatos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    ejecutarSinEspera(
      (async () => {
        try {
          const respuesta = await obtenerAccesibilidadAdmin();
          if (!cancelado) setDatos(respuesta);
        } catch (err) {
          if (!cancelado) setError(extraerDetalleError(err));
        } finally {
          if (!cancelado) setCargando(false);
        }
      })()
    );
    return () => {
      cancelado = true;
    };
  }, []);

  function actualizarCampo(
    clave: keyof AccesibilidadAdminDatos,
    valor: boolean | string
  ) {
    setMensaje(null);
    setDatos((previo) => (previo ? { ...previo, [clave]: valor } : previo));
  }

  async function guardar() {
    if (!datos) return;
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const actualizado = await actualizarAccesibilidadAdmin(datos);
      setDatos(actualizado);
      sincronizarStoreInterfaz(actualizado);
      setMensaje(MENSAJE_GUARDADO);
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <output aria-live="polite" className="block">
        Cargando configuración de accesibilidad...
      </output>
    );
  }

  if (!datos) {
    return (
      <p role="alert" style={{ color: 'var(--color-error)' }}>
        {error ?? 'No se pudo cargar la configuración de accesibilidad.'}
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-texto-primario)' }}>
        Accesibilidad
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-texto-secundario)' }}>
        Activa o desactiva las funcionalidades de accesibilidad del aplicativo.
      </p>

      {error && (
        <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
      {mensaje && (
        <output aria-live="polite" className="block mb-4" style={{ color: 'var(--color-primario)' }}>
          {mensaje}
        </output>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {BANDERAS.map((bandera) => (
          <FilaInterruptor
            key={bandera.clave}
            bandera={bandera}
            activo={datos[bandera.clave]}
            onCambio={(valor) => actualizarCampo(bandera.clave, valor)}
          />
        ))}
      </div>

      <div className="mb-6">
        <label
          htmlFor="tema-accesibilidad"
          className="block font-medium mb-1"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          Tema por defecto
        </label>
        <select
          id="tema-accesibilidad"
          className="rounded-lg border px-3 py-2"
          style={{ borderColor: 'var(--color-borde)' }}
          value={datos.tema_por_defecto}
          onChange={(evento) =>
            actualizarCampo('tema_por_defecto', evento.target.value as TemaAccesibilidad)
          }
        >
          {TEMAS.map((tema) => (
            <option key={tema.valor} value={tema.valor}>
              {tema.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <CampoTexto
          etiqueta="URL del video en lengua de señas"
          type="url"
          value={datos.url_lengua_senas}
          placeholder="https://..."
          onChange={(evento) => actualizarCampo('url_lengua_senas', evento.target.value)}
        />
        <CampoTexto
          etiqueta="Texto del enlace de lengua de señas"
          value={datos.texto_lengua_senas}
          placeholder="Ver en lengua de señas"
          onChange={(evento) => actualizarCampo('texto_lengua_senas', evento.target.value)}
        />
        <CampoTexto
          etiqueta="URL del Centro de Relevo"
          type="url"
          value={datos.url_centro_relevo}
          placeholder="https://centroderelevo.gov.co/"
          onChange={(evento) => actualizarCampo('url_centro_relevo', evento.target.value)}
        />
      </div>

      <Boton type="button" onClick={() => ejecutarSinEspera(guardar())} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </Boton>
    </div>
  );
}
