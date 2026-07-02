/**
 * Formatea la fecha de lanzamiento de una encuesta para el listado publico.
 */

const MESES_ABREVIADOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

interface PartesCalendario {
  anio: number;
  mes: number;
  dia: number;
}

const PATRON_FECHA_INICIO = /^(\d{4})-(\d{2})-(\d{2})/;

function extraerPartesCalendario(fechaInicio: string): PartesCalendario | null {
  const coincidencia = PATRON_FECHA_INICIO.exec(fechaInicio.trim());
  if (!coincidencia) return null;

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  return { anio, mes, dia };
}

function formatearMesAnio(partes: PartesCalendario): string {
  const mes = MESES_ABREVIADOS[partes.mes - 1];
  return `${mes} ${partes.anio}`;
}

function formatearDiaMesAnio(partes: PartesCalendario): string {
  const mes = MESES_ABREVIADOS[partes.mes - 1];
  return `${partes.dia} ${mes} ${partes.anio}`;
}

/**
 * Devuelve, por ejemplo, "Feb 2026" o "31 Jul 2026" cuando el dia es relevante.
 */
export function formatearFechaLanzamiento(fechaInicio: string | null): string | null {
  if (!fechaInicio?.trim()) return null;

  const partes = extraerPartesCalendario(fechaInicio);
  if (!partes) return null;

  if (partes.dia === 1) {
    return formatearMesAnio(partes);
  }

  return formatearDiaMesAnio(partes);
}
