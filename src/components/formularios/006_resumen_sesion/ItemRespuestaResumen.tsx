/**
 * Renderiza una pregunta del resumen segun su tipo.
 */

import type { ItemResumenPresentacion } from '@/utils/enriquecerRespuestaResumen';
import { CajaOpcionResumen } from './CajaOpcionResumen';

interface ItemRespuestaResumenProps {
  readonly presentacion: ItemResumenPresentacion;
  readonly orden: number;
}

export function ItemRespuestaResumen({ presentacion, orden }: ItemRespuestaResumenProps) {
  const { item } = presentacion;

  return (
    <article className="flex flex-col gap-3" aria-labelledby={`resumen-pregunta-${item.pregunta_codigo}`}>
      <h3
        id={`resumen-pregunta-${item.pregunta_codigo}`}
        className="text-base sm:text-lg font-bold leading-snug"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        {orden}. {item.pregunta_texto}
      </h3>
      <ContenidoRespuestaResumen presentacion={presentacion} />
    </article>
  );
}

function ContenidoRespuestaResumen({
  presentacion,
}: {
  readonly presentacion: ItemResumenPresentacion;
}) {
  const { item, textoSimple, opcionesMultiples, filasMatriz } = presentacion;

  if (filasMatriz.length > 0) {
    return <RespuestaMatrizResumen filas={filasMatriz} codigoPregunta={item.pregunta_codigo} />;
  }

  if (opcionesMultiples.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        {opcionesMultiples.map((opcion) => (
          <CajaOpcionResumen
            key={`${item.pregunta_codigo}-${opcion}`}
            texto={opcion}
            tipoIndicador="checkbox"
          />
        ))}
      </div>
    );
  }

  return (
    <CajaOpcionResumen
      texto={textoSimple || '—'}
      tipoIndicador={item.tipo_pregunta === 'radio' || item.tipo_pregunta === 'select' ? 'radio' : 'ninguno'}
    />
  );
}

function RespuestaMatrizResumen({
  filas,
  codigoPregunta,
}: {
  readonly filas: ItemResumenPresentacion['filasMatriz'];
  readonly codigoPregunta: string;
}) {
  return (
    <div className="flex flex-col gap-2" aria-label="Respuestas por entorno">
      {filas.map((fila) => (
        <div
          key={`${codigoPregunta}-${fila.etiqueta}`}
          className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_12rem] gap-2 sm:gap-x-4 sm:items-center rounded-xl px-4 py-3"
          style={{
            border: '1px solid var(--color-borde)',
            backgroundColor: 'var(--color-fondo-tarjeta)',
          }}
        >
          <span
            className="text-sm font-semibold leading-snug sm:pr-2"
            style={{ color: 'var(--color-texto-primario)' }}
          >
            {fila.etiqueta}:
          </span>
          <CajaOpcionResumen
            texto={fila.respuesta || '—'}
            tipoIndicador="radio"
            className="w-full min-w-0"
          />
        </div>
      ))}
    </div>
  );
}
