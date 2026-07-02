'use client';
/**
 * Formulario de inicio de sesion.
 * Diseno: Social First.png
 * Campo identificador acepta: correo / celular / usuario.
 * Integrado con authStore (iniciarSesion -> Django Token Auth).
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { CampoContrasena } from '@/components/ui/009_campo_contrasena';
import { useAuthStore } from '@/store/authStore';
import { useSesionStore } from '@/store/sesionStore';
import { vincularUsuarioSesion } from '@/services/sesionesServicio';
import { RUTA_HISTORIAL_RESPUESTAS } from '@/utils/destinoPostAuth';
import { extraerDetalleError } from '@/utils/erroresApi';

const esquemaLogin = z.object({
  identificador: z.string().min(1, 'Este campo es obligatorio'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
});

type DatosLogin = z.infer<typeof esquemaLogin>;

export function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinoParam = searchParams.get('destino');
  const uuidSesionParam = searchParams.get('uuid_sesion');
  const tokenClienteParam = searchParams.get('token_cliente');
  const uuidFormularioParam = searchParams.get('uuid_formulario');

  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const cargando = useAuthStore((s) => s.cargando);
  const limpiarError = useAuthStore((s) => s.limpiarError);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { identificador: '', contrasena: '' },
  });

  async function enviar(datos: DatosLogin) {
    setErrorLocal(null);
    limpiarError();
    try {
      await iniciarSesion({ username: datos.identificador, password: datos.contrasena });

      const destino = destinoParam ?? RUTA_HISTORIAL_RESPUESTAS;

      const uuidSesion = uuidSesionParam ?? useSesionStore.getState().uuidSesion;
      const tokenCliente =
        tokenClienteParam ?? useSesionStore.getState().tokenCliente ?? null;

      if (uuidSesion && tokenCliente) {
        try {
          await vincularUsuarioSesion({ uuidSesion, tokenCliente });
        } catch (err) {
          if (destino === RUTA_HISTORIAL_RESPUESTAS) {
            setErrorLocal(
              extraerDetalleError(err) ||
                'No fue posible vincular la encuesta a tu cuenta. Intenta nuevamente.',
            );
            return;
          }
        }
      }

      if (uuidSesion && tokenCliente && uuidFormularioParam) {
        useSesionStore.getState().establecerSesion({
          uuidSesion,
          tokenCliente,
          uuidFormulario: uuidFormularioParam,
          estado: 'finalizada',
        });
      }

      router.replace(destino);
    } catch (err) {
      setErrorLocal(extraerDetalleError(err));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Formulario de inicio de sesión"
    >
      <div className="flex flex-col gap-4 mb-1">
        <CampoTexto
          etiqueta="Correo electrónico o número de celular o usuario"
          id="identificador"
          autoComplete="username"
          placeholder="Escriba su correo electrónico o número de celular"
          error={errors.identificador?.message}
          {...register('identificador')}
        />

        <CampoContrasena
          etiqueta="Contraseña"
          id="contrasena"
          autoComplete="current-password"
          placeholder="Escriba su contraseña"
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
      </div>

      {/* Enlace recuperar contrasena — alineado derecha segun Figma */}
      <div className="flex justify-end mb-5">
        <Link
          href="/auth/solicitar-restaurar-password"
          className="text-sm font-semibold"
          style={{ color: 'var(--color-primario)' }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {errorLocal && (
        <p role="alert" className="text-sm mb-3" style={{ color: 'var(--color-error)' }}>
          {errorLocal}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        aria-busy={cargando}
        className="w-full min-h-[52px] py-4 px-6 rounded-lg text-sm font-semibold transition-opacity inline-flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-primario)',
          color: '#ffffff',
          opacity: cargando ? 0.7 : 1,
        }}
      >
        {cargando ? 'Iniciando sesión...' : 'Inicia sesión'}
      </button>
    </form>
  );
}
