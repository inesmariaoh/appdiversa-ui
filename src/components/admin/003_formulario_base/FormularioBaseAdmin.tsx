'use client';

/**
 * Formulario base para crear o editar datos generales de un formulario.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CampoTexto } from '@/components/ui/008_campo_texto';
import { Boton } from '@/components/ui/001_boton';
import type { FormularioAdminDetalle, FormularioAdminEntrada } from '@/types/admin';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const esquema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  introduccion: z.string().optional(),
  objetivo: z.string().optional(),
  tipo_formulario: z.enum(['encuesta', 'inscripcion', 'registro', 'censo', 'evaluacion']),
  estado: z.enum(['borrador', 'publicado', 'cerrado', 'archivado']).optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  permite_offline: z.boolean().optional(),
  permite_registro_final: z.boolean().optional(),
  imagen_portada: z.string().optional(),
});

type DatosFormulario = z.infer<typeof esquema>;

interface FormularioBaseAdminProps {
  readonly valoresIniciales?: Partial<FormularioAdminDetalle>;
  readonly cargando?: boolean;
  readonly onEnviar: (datos: FormularioAdminEntrada) => Promise<void>;
  readonly etiquetaBoton?: string;
}

export function FormularioBaseAdmin({
  valoresIniciales,
  cargando = false,
  onEnviar,
  etiquetaBoton = 'Guardar',
}: FormularioBaseAdminProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      codigo: valoresIniciales?.codigo ?? '',
      nombre: valoresIniciales?.nombre ?? '',
      descripcion: valoresIniciales?.descripcion ?? '',
      introduccion: valoresIniciales?.introduccion ?? '',
      objetivo: valoresIniciales?.objetivo ?? '',
      tipo_formulario: valoresIniciales?.tipo_formulario ?? 'encuesta',
      estado: valoresIniciales?.estado ?? 'borrador',
      fecha_inicio: valoresIniciales?.fecha_inicio ?? '',
      fecha_fin: valoresIniciales?.fecha_fin ?? '',
      permite_offline: valoresIniciales?.permite_offline ?? true,
      permite_registro_final: valoresIniciales?.permite_registro_final ?? false,
      imagen_portada: valoresIniciales?.imagen_portada ?? '',
    },
  });

  return (
    <form
      onSubmit={(evento) =>
        ejecutarSinEspera(
          handleSubmit((datos) =>
            onEnviar({
              ...datos,
              fecha_inicio: datos.fecha_inicio || null,
              fecha_fin: datos.fecha_fin || null,
              imagen_portada: datos.imagen_portada || null,
            })
          )(evento)
        )
      }
      className="flex flex-col gap-4 max-w-2xl"
      noValidate
    >
      <CampoTexto etiqueta="Código" {...register('codigo')} error={errors.codigo?.message} />
      <CampoTexto etiqueta="Nombre" {...register('nombre')} error={errors.nombre?.message} />

      <CampoTextarea etiqueta="Descripción" {...register('descripcion')} />
      <CampoTextarea etiqueta="Introducción" {...register('introduccion')} />
      <CampoTextarea etiqueta="Objetivo" {...register('objetivo')} />

      <div className="flex flex-col gap-1">
        <label htmlFor="tipo_formulario" className="text-sm font-medium" style={{ color: 'var(--color-texto-primario)' }}>
          Tipo de formulario
        </label>
        <select
          id="tipo_formulario"
          {...register('tipo_formulario')}
          className="rounded-lg px-4 text-sm"
          style={{
            height: '48px',
            border: '1.5px solid var(--color-borde-fuerte)',
            backgroundColor: 'var(--color-fondo-tarjeta)',
          }}
        >
          <option value="encuesta">Encuesta</option>
          <option value="inscripcion">Inscripcion</option>
          <option value="registro">Registro</option>
          <option value="censo">Censo</option>
          <option value="evaluacion">Evaluacion</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="estado" className="text-sm font-medium" style={{ color: 'var(--color-texto-primario)' }}>
          Estado
        </label>
        <select
          id="estado"
          {...register('estado')}
          className="rounded-lg px-4 text-sm"
          style={{
            height: '48px',
            border: '1.5px solid var(--color-borde-fuerte)',
            backgroundColor: 'var(--color-fondo-tarjeta)',
          }}
        >
          <option value="borrador">Borrador</option>
          <option value="publicado">Publicado</option>
          <option value="cerrado">Cerrado</option>
          <option value="archivado">Archivado</option>
        </select>
      </div>

      <CampoTexto etiqueta="Fecha inicio" type="date" {...register('fecha_inicio')} />
      <CampoTexto etiqueta="Fecha fin" type="date" {...register('fecha_fin')} />
      <CampoTexto etiqueta="Imagen portada (URL)" {...register('imagen_portada')} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('permite_offline')} />
        Permite offline
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('permite_registro_final')} />
        Permite registro final
      </label>

      <Boton type="submit" cargando={cargando}>
        {etiquetaBoton}
      </Boton>
    </form>
  );
}

function CampoTextarea({
  etiqueta,
  ...rest
}: { etiqueta: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = rest.id ?? `textarea-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-texto-primario)' }}>
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={3}
        className="w-full rounded-lg px-4 py-3 text-sm"
        style={{
          border: '1.5px solid var(--color-borde-fuerte)',
          backgroundColor: 'var(--color-fondo-tarjeta)',
          color: 'var(--color-texto-primario)',
        }}
        {...rest}
      />
    </div>
  );
}
