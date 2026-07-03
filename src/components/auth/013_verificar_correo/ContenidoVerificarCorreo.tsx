'use client';

/**
 * Verifica el correo del usuario a partir del uid y token del enlace.
 * Al montar consume el enlace y muestra el resultado; permite reenviar si falla.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Boton } from '@/components/ui/001_boton';
import { verificarCorreo } from '@/services/authServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

type EstadoVerificacion = 'verificando' | 'exito' | 'error' | 'enlace_invalido';

const MENSAJE_ENLACE_INVALIDO =
  'El enlace de verificación no es válido o ha expirado.';

export function ContenidoVerificarCorreo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid')?.trim() ?? '';
  const token = searchParams.get('token')?.trim() ?? '';

  const [estado, setEstado] = useState<EstadoVerificacion>('verificando');
  const [mensaje, setMensaje] = useState<string>('');
  const yaEjecutado = useRef(false);

  useEffect(() => {
    if (yaEjecutado.current) return;
    yaEjecutado.current = true;

    if (!uid || !token) {
      setEstado('enlace_invalido');
      setMensaje(MENSAJE_ENLACE_INVALIDO);
      return;
    }

    verificarCorreo(uid, token)
      .then((respuesta) => {
        setEstado('exito');
        setMensaje(respuesta.detalle);
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(extraerDetalleError(err));
      });
  }, [uid, token]);

  if (estado === 'verificando') {
    return (
      <output aria-live="polite" className="block" style={{ color: 'var(--color-texto-secundario)' }}>
        Verificando tu correo electrónico…
      </output>
    );
  }

  const esExito = estado === 'exito';

  return (
    <div className="flex flex-col gap-4">
      {esExito ? (
        <output aria-live="polite" className="text-sm block" style={{ color: 'var(--color-acento)' }}>
          {mensaje}
        </output>
      ) : (
        <p role="alert" className="text-sm" style={{ color: 'var(--color-error)' }}>
          {mensaje}
        </p>
      )}
      <Boton
        type="button"
        ancho="completo"
        variante="primario"
        onClick={() => router.push('/auth/login')}
      >
        Ir a inicio de sesión
      </Boton>
    </div>
  );
}
