'use client';
/**
 * Formulario de registro con correo electronico.
 * React Hook Form + Zod. Envio via authServicio al backend Django.
 * Diseno: windowContainer.png — email + contrasena + terminos inline.
 */

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { CampoContrasena } from '@/components/ui/009_campo_contrasena';
import { registrarCorreo } from '@/services/authServicio';
import { ErrorApi } from '@/utils/erroresApi';

const RUTA_REGISTRO_EXITOSO = '/auth/login?registro=exitoso';
const MENSAJE_ERROR_REGISTRO = 'No fue posible crear la cuenta. Intenta nuevamente.';

const esquema = z.object({
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  contrasena: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/\d/, 'Debe incluir al menos un número'),
});

type Datos = z.infer<typeof esquema>;

interface FormularioRegistroCorreoProps {
  readonly urlTerminos: string;
}

export function FormularioRegistroCorreo({ urlTerminos }: FormularioRegistroCorreoProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { correo: '', contrasena: '' },
  });

  const onSubmit = useCallback(
    async (datos: Datos) => {
      try {
        await registrarCorreo({
          correo: datos.correo,
          contrasena: datos.contrasena,
        });
        router.push(RUTA_REGISTRO_EXITOSO);
      } catch (error) {
        const mensaje =
          error instanceof ErrorApi ? error.detalle : MENSAJE_ERROR_REGISTRO;
        setError('correo', { message: mensaje });
      }
    },
    [router, setError],
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Formulario de registro con correo"
    >
      <div className="flex flex-col gap-4 mb-4">
        <CampoTexto
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="Escriba su correo electrónico"
          error={errors.correo?.message}
          {...register('correo')}
        />

        <CampoContrasena
          id="contrasena"
          etiqueta="Contraseña"
          autoComplete="new-password"
          placeholder="Escriba su contraseña"
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
      </div>

      {/* Terminos inline — sin checkbox, igual al diseno Figma */}
      <p className="text-sm mb-5" style={{ color: 'var(--color-texto-secundario)' }}>
        Al registrarte aceptas nuestros{' '}
        <Link
          href={urlTerminos}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold"
          style={{ color: 'var(--color-primario)' }}
        >
          Términos y condiciones
        </Link>
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="w-full min-h-[52px] py-4 px-6 rounded-lg text-sm font-semibold transition-opacity inline-flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-primario)',
          color: '#ffffff',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta y continuar'}
      </button>
    </form>
  );
}
