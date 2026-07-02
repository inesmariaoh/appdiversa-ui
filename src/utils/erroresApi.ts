/**
 * Utilidades para extraer mensajes funcionales de errores API.
 */

import axios from 'axios';

const MENSAJE_ERROR_GENERICO =
  'No fue posible completar la operacion. Intente nuevamente.';

export class ErrorApi extends Error {
  readonly detalle: string;
  readonly estadoHttp?: number;

  constructor(detalle: string, estadoHttp?: number) {
    super(detalle);
    this.name = 'ErrorApi';
    this.detalle = detalle;
    this.estadoHttp = estadoHttp;
  }
}

function extraerDetalleDesdeDatos(datos: unknown): string | null {
  if (!datos || typeof datos !== 'object') return null;
  const registro = datos as Record<string, unknown>;
  const detalle = registro.detalle ?? registro.detail;
  if (typeof detalle === 'string' && detalle.trim()) {
    return detalle.trim();
  }
  return null;
}

export function debeInvalidarSesionAnonima(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) {
    return false;
  }
  const detalle = extraerDetalleDesdeDatos(error.response?.data)?.toLowerCase() ?? '';
  return (
    detalle.includes('token de sesión no es válido') ||
    detalle.includes('sesión anónima no existe')
  );
}

export function extraerDetalleError(error: unknown): string {
  if (error instanceof ErrorApi) {
    return error.detalle;
  }

  if (axios.isAxiosError(error)) {
    const detalleRespuesta = extraerDetalleDesdeDatos(error.response?.data);
    if (detalleRespuesta) return detalleRespuesta;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return MENSAJE_ERROR_GENERICO;
}

export function crearErrorApiDesdeAxios(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) return error;

  const estadoHttp = axios.isAxiosError(error)
    ? error.response?.status
    : undefined;
  const detalle = extraerDetalleError(error);

  return new ErrorApi(detalle, estadoHttp);
}
