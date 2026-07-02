'use client';

/**
 * Permite enviar una copia de las respuestas al correo del usuario en el resumen.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import { useToast } from '@/components/ui/006_proveedores_ui';
import { enviarCopiaRespuestas } from '@/services/sesionesServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

const esquemaEnviarCopia = z.object({
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
});

type DatosEnviarCopia = z.infer<typeof esquemaEnviarCopia>;

interface FormularioEnviarCopiaProps {
  readonly uuidSesion: string;
  readonly tokenCliente: string;
  readonly variante?: 'seccion' | 'modal';
  readonly onEnviado?: () => void;
}

export function FormularioEnviarCopia({
  uuidSesion,
  tokenCliente,
  variante = 'seccion',
  onEnviado,
}: FormularioEnviarCopiaProps) {
  const { toast } = useToast();
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosEnviarCopia>({
    resolver: zodResolver(esquemaEnviarCopia),
    defaultValues: { correo: '' },
  });

  async function enviar(datos: DatosEnviarCopia) {
    setCargando(true);
    try {
      const respuesta = await enviarCopiaRespuestas(
        uuidSesion,
        tokenCliente,
        datos.correo.trim()
      );
      toast(respuesta.detalle, 'exito');
      reset({ correo: '' });
      onEnviado?.();
    } catch (err) {
      toast(extraerDetalleError(err), 'error');
    } finally {
      setCargando(false);
    }
  }

  const contenidoFormulario = (
      <form
        onSubmit={handleSubmit(enviar)}
        noValidate
        aria-label="Formulario para enviar copia de respuestas"
        className="flex flex-col gap-3 max-w-md"
      >
        <CampoTexto
          etiqueta="Correo electrónico"
          id="correo-copia-respuestas"
          type="email"
          autoComplete="email"
          placeholder="usuario@correo.com"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <Boton type="submit" ancho={variante === 'modal' ? 'completo' : 'auto'} cargando={cargando} disabled={cargando}>
          Enviar copia
        </Boton>
      </form>
  );

  if (variante === 'modal') {
    return contenidoFormulario;
  }

  return (
    <section
      aria-labelledby="titulo-enviar-copia"
      className="mt-6 pt-6 border-t"
      style={{ borderColor: 'var(--color-borde)' }}
    >
      <h3
        id="titulo-enviar-copia"
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        Enviar copia de mis respuestas a mi correo
      </h3>
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        Recibe un resumen de tus respuestas en el correo indicado.
      </p>
      {contenidoFormulario}
    </section>
  );
}
