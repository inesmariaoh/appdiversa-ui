'use client';

/**
 * Pregunta de tipo fecha: selectores de Año, Mes y Dia.
 * Basado en el diseno Figma parte02: tres dropdowns lado a lado.
 * Genera anios desde el anio actual hasta 100 anios atras.
 * WCAG: fieldset/legend, labels vinculados, errores accesibles.
 */

import { Selector } from '@/components/ui/002_selector';
import type { OpcionSelector } from '@/components/ui/002_selector';

const NOMBRES_MES: OpcionSelector[] = [
  { valor: '1',  etiqueta: 'Enero' },
  { valor: '2',  etiqueta: 'Febrero' },
  { valor: '3',  etiqueta: 'Marzo' },
  { valor: '4',  etiqueta: 'Abril' },
  { valor: '5',  etiqueta: 'Mayo' },
  { valor: '6',  etiqueta: 'Junio' },
  { valor: '7',  etiqueta: 'Julio' },
  { valor: '8',  etiqueta: 'Agosto' },
  { valor: '9',  etiqueta: 'Septiembre' },
  { valor: '10', etiqueta: 'Octubre' },
  { valor: '11', etiqueta: 'Noviembre' },
  { valor: '12', etiqueta: 'Diciembre' },
];

function generarOpcionesAnio(): OpcionSelector[] {
  const anioActual = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => {
    const anio = anioActual - i;
    return { valor: String(anio), etiqueta: String(anio) };
  });
}

function generarOpcionesDia(mes: string, anio: string): OpcionSelector[] {
  const mesNum = parseInt(mes, 10);
  const anioNum = parseInt(anio, 10);
  const diasEnMes =
    mes && anio
      ? new Date(anioNum, mesNum, 0).getDate()
      : 31;
  return Array.from({ length: diasEnMes }, (_, i) => {
    const dia = i + 1;
    return { valor: String(dia), etiqueta: String(dia).padStart(2, '0') };
  });
}

export interface ValorFecha {
  anio: string;
  mes: string;
  dia: string;
}

interface PreguntaFechaProps {
  readonly idPregunta: string;
  readonly texto: string;
  readonly ayuda?: string | null;
  readonly orden: number;
  readonly obligatoria?: boolean;
  readonly deshabilitada?: boolean;
  readonly valor: ValorFecha;
  readonly onChange: (valor: ValorFecha) => void;
  readonly error?: string;
  readonly errorAgrupado?: boolean;
}

export function PreguntaFecha({
  idPregunta,
  texto,
  ayuda,
  orden,
  obligatoria = false,
  deshabilitada = false,
  valor,
  onChange,
  error,
  errorAgrupado = false,
}: PreguntaFechaProps) {
  const opcionesAnio = generarOpcionesAnio();
  const opcionesDia = generarOpcionesDia(valor.mes, valor.anio);
  const idError = error ? `${idPregunta}-error` : undefined;

  return (
    <fieldset
      className="border-0 p-0 m-0 w-full"
      aria-describedby={idError}
      disabled={deshabilitada}
    >
      <legend className="w-full mb-4">
        <span
          className="text-2xl font-bold leading-snug"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {orden}.{' '}
          {texto}
          {obligatoria && (
            <span className="solo-lector-pantalla"> (obligatoria)</span>
          )}
        </span>
        {ayuda && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            {ayuda}
          </p>
        )}
      </legend>

      <div className="flex gap-4 flex-wrap sm:flex-nowrap">
        <Selector
          id={`${idPregunta}-anio`}
          etiqueta="Año"
          placeholder="Año"
          opciones={opcionesAnio}
          value={valor.anio}
          required={obligatoria}
          error={error}
          mostrarTextoError={!errorAgrupado}
          className="flex-1 min-w-[110px]"
          onChange={(e) => onChange({ ...valor, anio: e.target.value, dia: '' })}
        />
        <Selector
          id={`${idPregunta}-mes`}
          etiqueta="Mes"
          placeholder="Mes"
          opciones={NOMBRES_MES}
          value={valor.mes}
          required={obligatoria}
          error={error}
          mostrarTextoError={!errorAgrupado}
          className="flex-1 min-w-[130px]"
          onChange={(e) => onChange({ ...valor, mes: e.target.value, dia: '' })}
        />
        <Selector
          id={`${idPregunta}-dia`}
          etiqueta="Día"
          placeholder="Día"
          opciones={opcionesDia}
          value={valor.dia}
          required={obligatoria}
          error={error}
          mostrarTextoError={!errorAgrupado}
          disabled={!valor.mes || !valor.anio}
          className="flex-1 min-w-[100px]"
          onChange={(e) => onChange({ ...valor, dia: e.target.value })}
        />
      </div>

      {error && !errorAgrupado && (
        <p
          id={idError}
          role="alert"
          className="text-xs mt-2"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
