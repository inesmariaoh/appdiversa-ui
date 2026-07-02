'use client';

/**
 * Componente de encabezado principal de AppDiversa UI.
 * Muestra logos institucionales a la izquierda y acciones de navegacion a la derecha.
 * En pantallas medianas y pequenas usa menu hamburguesa accesible.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ConfiguracionInterfaz } from '@/types/interfaz';
import { MenuHamburguesa } from '@/components/layout/009_menu_hamburguesa';
import { MenuPerfil } from '@/components/layout/011_menu_perfil';
import { useAuthStore } from '@/store/authStore';
import {
  PERMISO_FORMULARIOS_VER,
} from '@/types/auth';

interface EncabezadoProps {
  readonly configuracion: Pick<
    ConfiguracionInterfaz,
    | 'nombre_aplicativo'
    | 'logo_institucional'
    | 'logo_institucional_alt'
    | 'logo_principal'
    | 'logo_principal_alt'
    | 'texto_contacto'
    | 'url_contacto'
    | 'color_primario'
  >;
  readonly usuarioAutenticado?: boolean;
}

export function Encabezado({
  configuracion,
  usuarioAutenticado = false,
}: Readonly<EncabezadoProps>) {
  const {
    nombre_aplicativo,
    logo_institucional,
    logo_institucional_alt = 'DANE y SEN',
    logo_principal,
    logo_principal_alt,
    texto_contacto,
    url_contacto,
  } = configuracion;

  const [logoInstitucionalFallido, setLogoInstitucionalFallido] = useState(false);
  const [logoPrincipalFallido, setLogoPrincipalFallido] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  const esAdministrador = useAuthStore((s) => s.esAdministrador);

  const mostrarAdmin =
    usuarioAutenticado &&
    (tienePermiso(PERMISO_FORMULARIOS_VER) || esAdministrador());

  const mostrarLogoInstitucional =
    logo_institucional && !logoInstitucionalFallido;
  const mostrarLogoPrincipal = logo_principal && !logoPrincipalFallido;
  const altLogoPrincipal = logo_principal_alt || nombre_aplicativo;

  const estiloLogoInstitucional = {
    height: 'var(--altura-logo-institucional)',
    maxHeight: 'var(--altura-logo-institucional)',
    maxWidth: 'var(--ancho-max-logo-institucional)',
    width: 'auto',
    objectFit: 'contain',
  } as const;

  const estiloLogoPrincipal = {
    height: 'var(--altura-logo-principal)',
    maxHeight: 'var(--altura-logo-principal)',
    maxWidth: 'var(--ancho-max-logo-principal)',
    width: 'auto',
    objectFit: 'contain',
  } as const;

  return (
    <header
      className="w-full bg-white border-b border-gray-200 shadow-sm"
      style={{ minHeight: 'var(--altura-encabezado)' }}
      role="banner"
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between"
        style={{
          minHeight: 'var(--altura-encabezado)',
          paddingTop: 'var(--padding-vertical-encabezado)',
          paddingBottom: 'var(--padding-vertical-encabezado)',
          gap: 'var(--espacio-logos-encabezado)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="md:hidden flex items-center justify-center rounded-lg border shrink-0"
            style={{
              minWidth: 'var(--tamano-control-min)',
              minHeight: 'var(--tamano-control-min)',
              borderColor: 'var(--color-borde)',
              color: 'var(--color-texto-primario)',
            }}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            aria-controls="menu-global-drawer"
            onClick={() => setMenuAbierto(true)}
          >
            <IconoMenu />
          </button>

          <fieldset
            className="flex items-center shrink-0 min-w-0 border-0 p-0 m-0"
            style={{ gap: 'var(--espacio-logos-encabezado)' }}
          >
            <legend className="sr-only">Logos institucionales</legend>
            {mostrarLogoInstitucional ? (
              <Link href="/" aria-label="Ir al inicio de encuestas">
                <Image
                  src={logo_institucional}
                  alt={logo_institucional_alt}
                  width={400}
                  height={80}
                  unoptimized
                  data-logo-encabezado
                  style={estiloLogoInstitucional}
                  onError={() => setLogoInstitucionalFallido(true)}
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="flex items-center shrink-0"
                style={{ gap: 'var(--espacio-logos-encabezado)' }}
                aria-label="Ir al inicio de encuestas"
              >
                <LogoFallbackDane />
                <LogoFallbackSen />
              </Link>
            )}

            <div
              className="flex items-center shrink-0 border-l"
              style={{
                gap: 'var(--espacio-logo-principal)',
                paddingLeft: 'var(--espacio-logos-encabezado)',
                borderColor: 'var(--color-borde)',
                minHeight: 'var(--altura-logo-principal)',
              }}
            >
              {mostrarLogoPrincipal ? (
                <Link href="/" aria-label={`Ir al inicio: ${nombre_aplicativo}`}>
                  <Image
                    src={logo_principal}
                    alt={altLogoPrincipal}
                    width={400}
                    height={80}
                    unoptimized
                    data-logo-encabezado
                    style={estiloLogoPrincipal}
                    onError={() => setLogoPrincipalFallido(true)}
                  />
                </Link>
              ) : (
                <Link
                  href="/"
                  className="font-bold text-lg tracking-wide"
                  style={{ color: 'var(--color-primario)' }}
                  aria-label={`Ir al inicio: ${nombre_aplicativo}`}
                >
                  {nombre_aplicativo}
                </Link>
              )}
            </div>
          </fieldset>
        </div>

        <nav aria-label="Acciones de usuario" className="hidden md:block">
          <ul className="flex items-center gap-3">
            <li>
              <Link
                href={url_contacto}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--color-texto-secundario)',
                  minHeight: 'var(--tamano-control-min)',
                }}
                aria-label={texto_contacto}
              >
                <IconoCorreo aria-hidden={true} />
                <span>{texto_contacto}</span>
              </Link>
            </li>

            {!usuarioAutenticado && (
              <>
                <li>
                  <Link
                    href="/auth/registro"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                    style={{
                      borderColor: 'var(--color-primario)',
                      color: 'var(--color-primario)',
                      minHeight: 'var(--tamano-control-min)',
                    }}
                    aria-label="Registrarse en la aplicación"
                  >
                    Registrarse
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--color-primario)',
                      color: 'var(--color-texto-invertido)',
                      minHeight: 'var(--tamano-control-min)',
                    }}
                    aria-label="Iniciar sesión en la aplicación"
                  >
                    Iniciar sesión
                  </Link>
                </li>
              </>
            )}

            {usuarioAutenticado && (
              <>
                {mostrarAdmin && (
                  <li>
                    <Link
                      href="/admin/formularios"
                      className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                      style={{
                        borderColor: 'var(--color-primario)',
                        color: 'var(--color-primario)',
                        minHeight: 'var(--tamano-control-min)',
                      }}
                    >
                      Panel administrativo
                    </Link>
                  </li>
                )}
                <li>
                  <MenuPerfil />
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <MenuHamburguesa
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        textoContacto={texto_contacto}
        urlContacto={url_contacto}
      />
    </header>
  );
}

function LogoFallbackDane() {
  return (
    <span
      className="font-bold text-sm"
      style={{ color: 'var(--color-secundario)' }}
      aria-label="DANE"
    >
      DANE
    </span>
  );
}

function LogoFallbackSen() {
  return (
    <span
      className="font-bold text-sm"
      style={{ color: 'var(--color-acento)' }}
      aria-label="SEN"
    >
      SEN
    </span>
  );
}

interface IconoCorreoProps {
  readonly 'aria-hidden'?: boolean;
}

function IconoCorreo({ 'aria-hidden': ariaHidden }: IconoCorreoProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

function IconoMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
