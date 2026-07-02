/**
 * Definicion de los pasos del asistente guiado de formularios.
 * Centraliza el orden y los textos para reutilizarlos en el indicador y el orquestador.
 */

export type PasoAsistenteId =
  | 'generales'
  | 'secciones'
  | 'preguntas'
  | 'reglas'
  | 'textos'
  | 'revisar';

export interface DefinicionPaso {
  readonly id: PasoAsistenteId;
  readonly numero: number;
  readonly etiqueta: string;
  readonly descripcion: string;
}

export const PASOS_ASISTENTE: readonly DefinicionPaso[] = [
  {
    id: 'generales',
    numero: 1,
    etiqueta: 'Datos generales',
    descripcion: 'Nombre, tipo y fechas de la encuesta.',
  },
  {
    id: 'secciones',
    numero: 2,
    etiqueta: 'Secciones',
    descripcion: 'Organiza la encuesta en bloques tematicos.',
  },
  {
    id: 'preguntas',
    numero: 3,
    etiqueta: 'Preguntas',
    descripcion: 'Agrega las preguntas y sus opciones.',
  },
  {
    id: 'reglas',
    numero: 4,
    etiqueta: 'Reglas',
    descripcion: 'Define saltos y condiciones de visibilidad.',
  },
  {
    id: 'textos',
    numero: 5,
    etiqueta: 'Textos',
    descripcion: 'Mensajes, introducciones y consentimientos.',
  },
  {
    id: 'revisar',
    numero: 6,
    etiqueta: 'Revisar y publicar',
    descripcion: 'Vista previa final y publicacion.',
  },
];
