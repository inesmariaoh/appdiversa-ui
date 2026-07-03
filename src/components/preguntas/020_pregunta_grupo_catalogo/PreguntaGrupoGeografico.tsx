'use client';

/**
 * Renderiza una pregunta geografica con sus niveles dependientes en una sola pantalla.
 */

import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { RenderizadorPregunta } from '../000_renderizador_pregunta';
import { LectorPregunta } from '@/components/accesibilidad/003_lector_voz';
import type { Pregunta } from '@/types/formulario';
import {
  obtenerCamposGrupoGeografico,
  obtenerDescendientesGeograficos,
  obtenerPreguntaPadreInmediata,
} from '@/utils/preguntasCatalogoAgrupadas';

interface CambioGrupoGeografico {
  codigo: string;
  valor: unknown;
}

interface PreguntaGrupoGeograficoProps {
  readonly preguntaRaiz: Pregunta;
  readonly preguntasFormulario: Pregunta[];
  readonly valores: Record<string, unknown>;
  readonly onCambioGrupo: (cambios: CambioGrupoGeografico[]) => void;
  readonly deshabilitada?: boolean;
  readonly obtenerObligatoria: (pregunta: Pregunta) => boolean;
  readonly obtenerError: (codigo: string) => string | undefined;
}

export function PreguntaGrupoGeografico({
  preguntaRaiz,
  preguntasFormulario,
  valores,
  onCambioGrupo,
  deshabilitada = false,
  obtenerObligatoria,
  obtenerError,
}: PreguntaGrupoGeograficoProps) {
  const campos = obtenerCamposGrupoGeografico(preguntaRaiz, preguntasFormulario);

  function manejarCambioCampo(codigo: string, valor: unknown) {
    const cambios: CambioGrupoGeografico[] = [{ codigo, valor }];
    const preguntaActual = preguntasFormulario.find((item) => item.codigo === codigo);
    if (!preguntaActual) {
      onCambioGrupo(cambios);
      return;
    }

    const descendientes = obtenerDescendientesGeograficos(
      preguntaActual,
      preguntasFormulario,
    );
    descendientes.forEach((descendiente) => {
      cambios.push({ codigo: descendiente.codigo, valor: '' });
    });

    onCambioGrupo(cambios);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <LectorPregunta pregunta={preguntaRaiz} campos={campos} />
      <EncabezadoPregunta
        orden={preguntaRaiz.orden}
        texto={preguntaRaiz.texto}
        ayuda={preguntaRaiz.descripcion || null}
        obligatoria={obtenerObligatoria(preguntaRaiz)}
      />
      <div className="flex flex-col gap-4">
        {campos.map((campo) => {
          const padreInmediato = obtenerPreguntaPadreInmediata(
            campo,
            preguntasFormulario,
          );
          const valorPadreInmediato = padreInmediato
            ? valores[padreInmediato.codigo]
            : undefined;
          const bloqueadoPorDependencia =
            padreInmediato !== undefined && !valorPadreInmediato;
          const deshabilitadaCampo =
            deshabilitada || bloqueadoPorDependencia;

          return (
            <RenderizadorPregunta
              key={campo.codigo}
              pregunta={campo}
              valor={valores[campo.codigo]}
              onCambio={(valor) => manejarCambioCampo(campo.codigo, valor)}
              deshabilitada={deshabilitadaCampo}
              obligatoria={obtenerObligatoria(campo)}
              error={obtenerError(campo.codigo)}
              idPrefijo={campo.codigo}
              respuestasFormulario={valores}
              preguntasFormulario={preguntasFormulario}
              modoSubcampo
              bloqueadoPorDependencia={bloqueadoPorDependencia}
              esCampoPadreGrupo={campo.codigo === preguntaRaiz.codigo}
            />
          );
        })}
      </div>
    </div>
  );
}

/** @deprecated Usar PreguntaGrupoGeografico */
export const PreguntaGrupoCatalogo = PreguntaGrupoGeografico;
