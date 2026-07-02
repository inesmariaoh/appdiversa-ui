'use client';

/**
 * Formulario publico de contacto con validacion Zod y feedback por toast.
 */

import { forwardRef, useState, type TextareaHTMLAttributes } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import { useToast } from '@/components/ui/006_proveedores_ui';
import { enviarMensajeContacto } from '@/services/contactoServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

const esquemaContacto = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  asunto: z.string().min(1, 'El asunto es obligatorio'),
  mensaje: z
    .string()
    .min(1, 'El mensaje es obligatorio')
    .min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type DatosContacto = z.infer<typeof esquemaContacto>;

interface FormularioContactoProps {
  readonly titulo?: string;
  readonly descripcion?: string;
}

export function FormularioContacto({
  titulo,
  descripcion,
}: FormularioContactoProps) {
  const { toast } = useToast();
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosContacto>({
    resolver: zodResolver(esquemaContacto),
    defaultValues: { nombre: '', correo: '', asunto: '', mensaje: '' },
  });

  async function enviar(datos: DatosContacto) {
    setCargando(true);
    try {
      const respuesta = await enviarMensajeContacto({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        asunto: datos.asunto.trim(),
        mensaje: datos.mensaje.trim(),
      });
      toast(respuesta.detalle, 'exito');
      reset();
    } catch (err) {
      toast(extraerDetalleError(err), 'error');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      {titulo && (
        <h1
          className="text-2xl font-bold text-center mb-4"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {titulo}
        </h1>
      )}

      {descripcion && (
        <p
          className="text-sm text-center leading-relaxed mb-6"
          style={{ color: 'var(--color-texto-secundario)' }}
        >
          {descripcion}
        </p>
      )}

      <form
        onSubmit={handleSubmit(enviar)}
        noValidate
        aria-label="Formulario de contacto"
        className="flex flex-col gap-4"
      >
        <CampoTexto
          etiqueta="Nombre"
          id="contacto-nombre"
          autoComplete="name"
          placeholder="Tu nombre completo"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        <CampoTexto
          etiqueta="Correo electrónico"
          id="contacto-correo"
          type="email"
          autoComplete="email"
          placeholder="usuario@correo.com"
          error={errors.correo?.message}
          {...register('correo')}
        />

        <CampoTexto
          etiqueta="Asunto"
          id="contacto-asunto"
          autoComplete="off"
          placeholder="Asunto del mensaje"
          error={errors.asunto?.message}
          {...register('asunto')}
        />

        <CampoAreaTexto
          etiqueta="Mensaje"
          id="contacto-mensaje"
          rows={5}
          placeholder="Escribe tu mensaje"
          error={errors.mensaje?.message}
          {...register('mensaje')}
        />

        <Boton type="submit" ancho="completo" cargando={cargando} disabled={cargando}>
          Enviar mensaje
        </Boton>

        <Link
          href="/"
          className="text-center text-sm font-semibold"
          style={{ color: 'var(--color-primario)' }}
        >
          Volver al inicio
        </Link>
      </form>
    </div>
  );
}

interface CampoAreaTextoProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly etiqueta: string;
  readonly error?: string;
}

const CampoAreaTexto = forwardRef<HTMLTextAreaElement, CampoAreaTextoProps>(
  function CampoAreaTexto({ etiqueta, error, id, className, ...rest }, ref) {
    const idCampo = id ?? `campo-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`;
    const idError = error ? `${idCampo}-error` : undefined;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor={idCampo}
          className="text-sm font-medium"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {etiqueta}
        </label>
        <textarea
          ref={ref}
          id={idCampo}
          aria-invalid={error ? true : undefined}
          aria-describedby={idError}
          className={['w-full rounded-lg px-4 py-3 text-sm resize-y transition-colors', className]
            .filter(Boolean)
            .join(' ')}
          style={{
            minHeight: '120px',
            border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-borde-fuerte)'}`,
            backgroundColor: 'var(--color-fondo-tarjeta)',
            color: 'var(--color-texto-primario)',
            outline: 'none',
          }}
          {...rest}
        />
        {error && (
          <p
            id={idError}
            role="alert"
            className="text-xs font-medium"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
