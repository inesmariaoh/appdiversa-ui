'use client';

/**
 * Formulario de datos del usuario autenticado.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RutaProtegida } from '@/components/auth/006_ruta_protegida';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { CampoContrasena } from '@/components/ui/009_campo_contrasena';
import { Boton } from '@/components/ui/001_boton';
import { Modal } from '@/components/ui/011_modal';
import {
  actualizarPerfil,
  cambiarPassword,
  obtenerPerfilEditable,
} from '@/services/authServicio';
import { useAuthStore } from '@/store/authStore';
import type { PerfilEditable } from '@/types/auth';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const ESTILO_CAMPO_SOLO_LECTURA = {
  backgroundColor: 'var(--color-fondo-tarjeta)',
  cursor: 'default',
} as const;

function formatearFechaUltimoInicio(isoFecha: string | null): string {
  if (!isoFecha) {
    return '—';
  }
  const fecha = new Date(isoFecha);
  if (Number.isNaN(fecha.getTime())) {
    return isoFecha;
  }
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  }).format(fecha);
}

function IconoPapelera() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function TarjetaPerfil({ perfil }: { readonly perfil: PerfilEditable }) {
  const router = useRouter();
  const cargarPerfilAuth = useAuthStore((s) => s.cargarPerfil);
  const [nombres, setNombres] = useState(perfil.first_name);
  const [apellidos, setApellidos] = useState(perfil.last_name);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  useEffect(() => {
    setNombres(perfil.first_name);
    setApellidos(perfil.last_name);
  }, [perfil.first_name, perfil.last_name]);

  async function guardarCambiosPerfil() {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarPerfil({
        first_name: nombres.trim(),
        last_name: apellidos.trim(),
      });
      await cargarPerfilAuth();
      setMensaje('Tus datos se actualizaron correctamente.');
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function enviarCambioPassword() {
    setError(null);
    setMensaje(null);
    setCambiandoPassword(true);
    try {
      await cambiarPassword({
        password_actual: passwordActual,
        password_nueva: passwordNueva,
        password_nueva_confirmacion: passwordConfirmacion,
      });
      setMensaje('Contraseña actualizada correctamente.');
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmacion('');
      setMostrarCambioPassword(false);
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCambiandoPassword(false);
    }
  }

  return (
    <>
      <article
        className="mx-auto max-w-[634px] rounded-2xl px-6 py-8 sm:px-10 flex flex-col gap-8"
        style={{
          backgroundColor: 'var(--color-fondo-tarjeta)',
          border: '1px solid var(--color-borde)',
          boxShadow: 'var(--sombra-sm)',
        }}
      >
        <header>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
            Hola {perfil.email || perfil.username}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-texto-secundario)' }}>
            Último inicio de sesión:{' '}
            <span style={{ color: 'var(--color-texto-primario)' }}>
              {formatearFechaUltimoInicio(perfil.fecha_ultimo_inicio_sesion)}
            </span>
          </p>
        </header>

        <div className="flex flex-col gap-5">
          <CampoTexto
            id="tipo-inicio-sesion"
            etiqueta="Tipo de inicio de sesión"
            value={perfil.tipo_inicio_sesion_etiqueta}
            readOnly
            style={ESTILO_CAMPO_SOLO_LECTURA}
          />
          <CampoTexto
            id="correo-perfil"
            etiqueta="Correo electrónico"
            value={perfil.email}
            readOnly
            style={ESTILO_CAMPO_SOLO_LECTURA}
          />

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 min-w-0">
              <CampoContrasena
                id="contrasena-enmascarada"
                etiqueta="Contraseña actual"
                value="••••••••••••"
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                onChange={() => undefined}
              />
            </div>
            <Boton
              type="button"
              variante="contorno"
              ancho="auto"
              className="shrink-0"
              onClick={() => setMostrarCambioPassword((visible) => !visible)}
              aria-expanded={mostrarCambioPassword}
            >
              Cambiar contraseña
            </Boton>
          </div>

          {mostrarCambioPassword && (
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoContrasena
                etiqueta="Contraseña actual"
                value={passwordActual}
                onChange={(evento) => setPasswordActual(evento.target.value)}
                autoComplete="current-password"
              />
              <CampoContrasena
                etiqueta="Nueva contraseña"
                value={passwordNueva}
                onChange={(evento) => setPasswordNueva(evento.target.value)}
                autoComplete="new-password"
              />
              <CampoContrasena
                etiqueta="Confirmar nueva contraseña"
                value={passwordConfirmacion}
                onChange={(evento) => setPasswordConfirmacion(evento.target.value)}
                autoComplete="new-password"
              />
              <div className="flex items-end">
                <Boton
                  type="button"
                  variante="secundario"
                  ancho="auto"
                  cargando={cambiandoPassword}
                  onClick={() => ejecutarSinEspera(enviarCambioPassword())}
                >
                  Actualizar contraseña
                </Boton>
              </div>
            </div>
          )}
        </div>

        <hr style={{ borderColor: 'var(--color-borde)' }} />

        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto
            id="nombres-perfil"
            etiqueta="Nombre(s)"
            value={nombres}
            onChange={(evento) => setNombres(evento.target.value)}
            placeholder="Escriba su(s) nombre(s)"
            autoComplete="given-name"
          />
          <CampoTexto
            id="apellidos-perfil"
            etiqueta="Apellidos"
            value={apellidos}
            onChange={(evento) => setApellidos(evento.target.value)}
            placeholder="Escriba su apellido"
            autoComplete="family-name"
          />
        </div>

        {mensaje && (
          <output className="text-sm block" style={{ color: 'var(--color-acento)' }}>
            {mensaje}
          </output>
        )}
        {error && (
          <p role="alert" className="text-sm" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <Boton
            type="button"
            variante="secundario"
            ancho="auto"
            cargando={guardando}
            onClick={() => ejecutarSinEspera(guardarCambiosPerfil())}
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primario) 12%, var(--color-fondo-tarjeta))',
            }}
          >
            Guardar cambios
          </Boton>
          <Boton
            type="button"
            variante="contorno"
            ancho="auto"
            iconoIzquierda={<IconoPapelera />}
            onClick={() => setModalEliminarAbierto(true)}
            style={{
              color: 'var(--color-error)',
              borderColor: 'var(--color-error)',
            }}
          >
            Eliminar cuenta
          </Boton>
        </div>
      </article>

      <Modal
        abierto={modalEliminarAbierto}
        onCerrar={() => setModalEliminarAbierto(false)}
        titulo="Eliminar cuenta"
        descripcion="La eliminación de la cuenta debe gestionarse con el equipo de soporte."
        tamano="sm"
      >
        <p className="text-sm mb-6" style={{ color: 'var(--color-texto-secundario)' }}>
          Por el momento no es posible eliminar la cuenta desde la aplicación. Si deseas solicitar
          la eliminación de tus datos, comunícate con nosotros.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Boton type="button" variante="secundario" ancho="completo" onClick={() => setModalEliminarAbierto(false)}>
            Cancelar
          </Boton>
          <Boton
            type="button"
            variante="primario"
            ancho="completo"
            onClick={() => router.push('/contacto')}
          >
            Ir a contacto
          </Boton>
        </div>
      </Modal>
    </>
  );
}

export function ContenidoPerfil() {
  const [perfil, setPerfil] = useState<PerfilEditable | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerPerfilEditable()
      .then((datos) => {
        if (!cancelado) setPerfil(datos);
      })
      .catch(() => {
        if (!cancelado) {
          setError('No fue posible cargar tus datos. Intenta nuevamente.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <RutaProtegida rutaLogin="/auth/login?destino=/perfil">
      {cargando && (
        <output
          aria-label="Cargando datos del perfil"
          className="mx-auto block max-w-[634px] animate-pulse h-96 rounded-2xl"
        />
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
      {!cargando && perfil && <TarjetaPerfil perfil={perfil} />}
    </RutaProtegida>
  );
}
