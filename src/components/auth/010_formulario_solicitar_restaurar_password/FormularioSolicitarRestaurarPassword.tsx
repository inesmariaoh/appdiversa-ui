'use client';

/**
 * Formulario para solicitar restauración de contraseña por correo.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import { solicitarRestaurarPassword } from '@/services/authServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

const esquemaSolicitar = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
});

type DatosSolicitar = z.infer<typeof esquemaSolicitar>;

export function FormularioSolicitarRestaurarPassword() {
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosSolicitar>({
    resolver: zodResolver(esquemaSolicitar),
    defaultValues: { email: '' },
  });

  async function enviar(datos: DatosSolicitar) {
    setError(null);
    setMensajeExito(null);
    setCargando(true);
    try {
      const respuesta = await solicitarRestaurarPassword({ email: datos.email.trim() });
      setMensajeExito(respuesta.detalle);
      reset({ email: '' });
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Formulario para solicitar restauración de contraseña"
    >
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        Ingresa tu correo electrónico. Si está registrado, recibirás instrucciones
        para restaurar tu contraseña.
      </p>

      <CampoTexto
        etiqueta="Correo electrónico"
        id="email-restaurar"
        type="email"
        autoComplete="email"
        placeholder="usuario@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />

      {mensajeExito && (
        <output
          className="text-sm mt-4 block"
          style={{ color: 'var(--color-acento)' }}
        >
          {mensajeExito}
        </output>
      )}

      {error && (
        <p role="alert" className="text-sm mt-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Boton type="submit" ancho="completo" cargando={cargando} disabled={cargando}>
          Enviar instrucciones
        </Boton>
        <Link
          href="/auth/login"
          className="text-center text-sm font-semibold"
          style={{ color: 'var(--color-primario)' }}
        >
          Volver a inicio de sesión
        </Link>
      </div>
    </form>
  );
}
