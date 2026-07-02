'use client';

/**
 * Formulario para establecer nueva contraseña con uid y token del enlace.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CampoContrasena } from '@/components/ui/009_campo_contrasena';
import { Boton } from '@/components/ui/001_boton';
import { restaurarPassword } from '@/services/authServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

const esquemaRestaurar = z
  .object({
    password_nueva: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password_confirmacion: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((datos) => datos.password_nueva === datos.password_confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmacion'],
  });

type DatosRestaurar = z.infer<typeof esquemaRestaurar>;

export function FormularioRestaurarPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid')?.trim() ?? '';
  const token = searchParams.get('token')?.trim() ?? '';
  const enlaceInvalido = !uid || !token;

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosRestaurar>({
    resolver: zodResolver(esquemaRestaurar),
    defaultValues: { password_nueva: '', password_confirmacion: '' },
  });

  async function enviar(datos: DatosRestaurar) {
    if (enlaceInvalido) return;
    setError(null);
    setMensajeExito(null);
    setCargando(true);
    try {
      const respuesta = await restaurarPassword({
        uid,
        token,
        password_nueva: datos.password_nueva,
        password_confirmacion: datos.password_confirmacion,
      });
      setMensajeExito(respuesta.detalle);
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }

  if (enlaceInvalido) {
    return (
      <div role="alert">
        <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>
          El enlace de restauración no es válido o ha expirado. Solicita uno nuevo.
        </p>
        <Link
          href="/auth/solicitar-restaurar-password"
          className="text-sm font-semibold"
          style={{ color: 'var(--color-primario)' }}
        >
          Solicitar restauración de contraseña
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Formulario para restaurar contraseña"
    >
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
      </p>

      <div className="flex flex-col gap-4">
        <CampoContrasena
          etiqueta="Nueva contraseña"
          id="password-nueva"
          autoComplete="new-password"
          placeholder="Nueva contraseña"
          error={errors.password_nueva?.message}
          {...register('password_nueva')}
        />
        <CampoContrasena
          etiqueta="Confirmar contraseña"
          id="password-confirmacion"
          autoComplete="new-password"
          placeholder="Confirma la contraseña"
          error={errors.password_confirmacion?.message}
          {...register('password_confirmacion')}
        />
      </div>

      {mensajeExito && (
        <div className="mt-4 flex flex-col gap-3">
          <output className="text-sm block" style={{ color: 'var(--color-acento)' }}>
            {mensajeExito}
          </output>
          <Boton
            type="button"
            ancho="completo"
            variante="primario"
            onClick={() => router.push('/auth/login')}
          >
            Ir a inicio de sesión
          </Boton>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm mt-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      {!mensajeExito && (
        <div className="mt-6">
          <Boton type="submit" ancho="completo" cargando={cargando} disabled={cargando}>
            Restaurar contraseña
          </Boton>
        </div>
      )}
    </form>
  );
}
