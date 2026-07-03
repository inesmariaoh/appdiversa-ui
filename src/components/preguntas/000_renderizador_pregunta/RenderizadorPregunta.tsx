'use client';

/**
 * Renderizador central que mapea tipo_pregunta al componente correspondiente.
 * Cubre los 18 tipos definidos en TipoPreguntaEnum del backend.
 */

import { PreguntaFecha } from '../001_pregunta_fecha';
import type { ValorFecha } from '../001_pregunta_fecha';
import { PreguntaTextoCorto } from '../002_pregunta_texto_corto';
import { PreguntaRadio } from '../003_pregunta_radio';
import { PreguntaSelect } from '../004_pregunta_select';
import { PreguntaNumero } from '../006_pregunta_numero';
import { PreguntaTextoLargo } from '../007_pregunta_texto_largo';
import { PreguntaHora } from '../008_pregunta_hora';
import { PreguntaFechaHora } from '../009_pregunta_fecha_hora';
import { PreguntaCheckbox } from '../010_pregunta_checkbox';
import { PreguntaSelectMultiple } from '../011_pregunta_select_multiple';
import { PreguntaAutocomplete } from '../012_pregunta_autocomplete';
import { PreguntaLikert } from '../013_pregunta_likert';
import { PreguntaMatriz } from '../014_pregunta_matriz';
import { PreguntaArchivo } from '../015_pregunta_archivo';
import { PreguntaFirma } from '../016_pregunta_firma';
import { PreguntaGeolocalizacion } from '../017_pregunta_geolocalizacion';
import { PreguntaAudio } from '../018_pregunta_audio';
import { PreguntaVideo } from '../019_pregunta_video';
import { PreguntaUbicacionGeografica } from '../021_pregunta_ubicacion_geografica';
import { PreguntaPlaceholder } from '../099_pregunta_placeholder';
import { ContenidoAccesiblePregunta } from '@/components/accesibilidad/002_contenido_accesible';
import { LectorPregunta } from '@/components/accesibilidad/003_lector_voz';
import type { PropsPregunta } from '../types';
import type { TipoPregunta } from '@/types/formulario';
import type { ComponentType } from 'react';

const MAPA_COMPONENTES: Record<TipoPregunta, ComponentType<PropsPregunta>> = {
  texto_corto: PreguntaTextoCorto,
  texto_largo: PreguntaTextoLargo,
  numero: PreguntaNumero,
  fecha: PreguntaFecha as unknown as ComponentType<PropsPregunta>,
  hora: PreguntaHora,
  fecha_hora: PreguntaFechaHora,
  radio: PreguntaRadio,
  checkbox: PreguntaCheckbox,
  select: PreguntaSelect,
  select_multiple: PreguntaSelectMultiple,
  autocomplete: PreguntaAutocomplete,
  likert: PreguntaLikert,
  matriz: PreguntaMatriz,
  archivo: PreguntaArchivo,
  firma: PreguntaFirma,
  geolocalizacion: PreguntaGeolocalizacion,
  ubicacion_geografica: PreguntaUbicacionGeografica,
  audio: PreguntaAudio,
  video: PreguntaVideo,
};

function adaptarPreguntaFecha(props: PropsPregunta) {
  const valorFecha: ValorFecha =
    props.valor &&
    typeof props.valor === 'object' &&
    !Array.isArray(props.valor) &&
    'anio' in (props.valor as ValorFecha)
      ? (props.valor as ValorFecha)
      : { anio: '', mes: '', dia: '' };

  return (
    <PreguntaFecha
      idPregunta={props.idPrefijo ?? props.pregunta.codigo}
      texto={props.pregunta.texto}
      ayuda={props.pregunta.tooltip || props.pregunta.descripcion || null}
      orden={props.pregunta.orden}
      obligatoria={props.obligatoria ?? props.pregunta.es_obligatoria}
      deshabilitada={props.deshabilitada}
      valor={valorFecha}
      onChange={props.onCambio}
      error={props.error}
    />
  );
}

export function RenderizadorPregunta(props: PropsPregunta) {
  const tipo = props.pregunta.tipo_pregunta;

  let contenido = null;

  if (tipo === 'fecha') {
    contenido = adaptarPreguntaFecha(props);
  } else {
    const Componente = MAPA_COMPONENTES[tipo];
    contenido = Componente ? (
      <Componente {...props} />
    ) : (
      <PreguntaPlaceholder {...props} />
    );
  }

  return (
    <>
      {!props.modoSubcampo && <LectorPregunta pregunta={props.pregunta} />}
      {contenido}
      <ContenidoAccesiblePregunta contenido={props.pregunta.contenido_accesible} />
    </>
  );
}
