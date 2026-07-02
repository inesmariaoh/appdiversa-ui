'use client';

/**
 * Proveedor que renderiza los modales genericos del flujo de formulario.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { ModalTerminos } from '@/components/ui/012_modal_terminos';
import { ModalSalirSinGuardar } from '@/components/ui/013_modal_salir_sin_guardar';
import { ModalIniciarSesionRegistro } from '@/components/ui/014_modal_login_registro';
import { ModalEncuestaGuardada } from '@/components/ui/015_modal_encuesta_guardada';
import {
  useFlujoModalesFormulario,
  type FlujoModalesFormularioValor,
} from '@/hooks/useFlujoModalesFormulario';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const FlujoModalesContext = createContext<FlujoModalesFormularioValor | null>(null);

interface ProveedorModalesFormularioProps {
  readonly uuidFormulario: string;
  readonly rutaActual: string;
  readonly deshabilitado?: boolean;
  readonly children: ReactNode;
}

export function ProveedorModalesFormulario({
  uuidFormulario,
  rutaActual,
  deshabilitado = false,
  children,
}: ProveedorModalesFormularioProps) {
  const flujo = useFlujoModalesFormulario({
    uuidFormulario,
    rutaActual,
    deshabilitado,
  });

  const bloqueanteTerminos =
    flujo.modalActivo === 'terminos' && !flujo.terminosSoloLectura && !flujo.terminosAceptados;

  return (
    <FlujoModalesContext.Provider value={flujo}>
      {children}

      <ModalTerminos
        abierto={flujo.modalActivo === 'terminos'}
        onCerrar={flujo.cerrarModal}
        onAceptar={
          bloqueanteTerminos
            ? () => ejecutarSinEspera(flujo.aceptarTerminos())
            : undefined
        }
        textos={flujo.textos.terminos}
        bloqueante={bloqueanteTerminos}
      />

      <ModalSalirSinGuardar
        abierto={flujo.modalActivo === 'salir'}
        onCerrar={flujo.cerrarModal}
        onVolver={flujo.volverDesdeSalida}
        onSalir={() => ejecutarSinEspera(flujo.confirmarSalidaSinGuardar())}
        textos={flujo.textos.modal_salir}
        urlLogin={flujo.urlLogin}
      />

      <ModalIniciarSesionRegistro
        abierto={flujo.modalActivo === 'sesion'}
        onCerrar={flujo.cerrarModal}
        textos={flujo.textos.modal_sesion}
        urlLogin={flujo.urlLogin}
        urlRegistro={flujo.urlRegistro}
      />

      <ModalEncuestaGuardada
        abierto={flujo.modalActivo === 'guardado'}
        onCerrar={flujo.cerrarModal}
        onSeguirViendo={flujo.confirmarSeguirViendo}
        textos={flujo.textos.modal_guardado}
      />
    </FlujoModalesContext.Provider>
  );
}

export function useFlujoModalesFormularioContext(): FlujoModalesFormularioValor {
  const contexto = useContext(FlujoModalesContext);
  if (!contexto) {
    throw new Error(
      'useFlujoModalesFormularioContext debe usarse dentro de ProveedorModalesFormulario.'
    );
  }
  return contexto;
}
