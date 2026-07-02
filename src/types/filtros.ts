/**
 * Tipos para preguntas filtro/preliminares y resultados de elegibilidad.
 */

export type TipoValidacionFiltro =
  | 'rango_edad'
  | 'opcion_exacta'
  | 'lista_opciones'
  | 'rango_numerico'
  | 'booleano';

export interface ValidacionFiltro {
  tipo_validacion: TipoValidacionFiltro;
  valor_minimo: string | null;
  valor_maximo: string | null;
  valor_esperado: unknown;
  bloquea_continuacion: boolean;
  mensaje_no_cumple: string | null;
}

export interface FiltroCumplido {
  estado: 'cumplido';
  codigoPregunta: string;
}

export interface FiltroNoCumplido {
  estado: 'no_cumplido';
  codigoPregunta: string;
  mensaje: string;
  bloqueaContinuacion: boolean;
}

export interface FiltroPendiente {
  estado: 'pendiente';
  codigoPregunta: string;
}

export type ResultadoFiltroPregunta =
  | FiltroCumplido
  | FiltroNoCumplido
  | FiltroPendiente;

export type FaseFlujoFiltro =
  | 'preguntas'
  | 'verificacion_exitosa'
  | 'no_elegible';

export interface TextosModalNoElegible {
  titulo: string;
  cuerpo: string;
  botonPrimario: string;
  botonSecundario: string;
}

export interface TextosModalVerificacion {
  titulo: string;
  cuerpo: string;
  botonAceptar: string;
}
