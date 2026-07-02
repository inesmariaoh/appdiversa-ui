/**
 * Props compartidas para componentes de pregunta del motor dinamico.
 */

import type { Pregunta } from '@/types/formulario';

export interface PropsPregunta {
  readonly pregunta: Pregunta;
  readonly valor: unknown;
  readonly onCambio: (valor: unknown) => void;
  readonly observacion?: string;
  readonly onCambioObservacion?: (texto: string) => void;
  readonly deshabilitada?: boolean;
  readonly obligatoria?: boolean;
  readonly error?: string;
  readonly idPrefijo?: string;
  readonly respuestasFormulario?: Record<string, unknown>;
  readonly preguntasFormulario?: Pregunta[];
  readonly modoSubcampo?: boolean;
  readonly bloqueadoPorDependencia?: boolean;
  readonly esCampoPadreGrupo?: boolean;
}
