'use client';

/**
 * Pregunta de ubicacion geografica compuesta (departamento y municipio en un JSON).
 */

import { useEffect, useState } from 'react';
import { Selector } from '@/components/ui/002_selector';
import { Skeleton } from '@/components/ui/004_skeleton';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import type { PropsPregunta } from '../types';
import type { ValorUbicacionGeografica } from '@/types/formulario';
import { obtenerItemsCatalogo } from '@/services/catalogosServicio';
import { itemsCatalogoAopciones } from '@/utils/itemsCatalogoAopciones';
import { extraerCodigoCatalogo } from '@/utils/extraerCodigoCatalogo';
import { useIdiomaStore } from '@/store/idiomaStore';
import { useOfflineStore } from '@/store/offlineStore';
import { obtenerCatalogoDesdeCache } from '@/storage/catalogosCache';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const VALOR_VACIO: ValorUbicacionGeografica = {
  departamento_codigo: '',
  departamento_nombre: '',
  municipio_codigo: '',
  municipio_nombre: '',
};

function normalizarValor(valor: unknown): ValorUbicacionGeografica {
  if (!valor || typeof valor !== 'object') {
    return { ...VALOR_VACIO };
  }
  const datos = valor as Partial<ValorUbicacionGeografica>;
  return {
    departamento_codigo: datos.departamento_codigo ?? '',
    departamento_nombre: datos.departamento_nombre ?? '',
    municipio_codigo: datos.municipio_codigo ?? '',
    municipio_nombre: datos.municipio_nombre ?? '',
  };
}

export function PreguntaUbicacionGeografica({
  pregunta,
  valor,
  onCambio,
  deshabilitada = false,
  obligatoria,
  error,
  idPrefijo,
}: PropsPregunta) {
  const id = idPrefijo ?? pregunta.codigo;
  const valorActual = normalizarValor(valor);
  const idioma = useIdiomaStore((estado) => estado.idioma);
  const enLinea = useOfflineStore((estado) => estado.enLinea);

  const codigoDepartamentos =
    pregunta.codigo_catalogo_departamento?.trim() ||
    extraerCodigoCatalogo(pregunta.catalogo_departamento) ||
    'departamentos';
  const codigoMunicipios =
    extraerCodigoCatalogo(pregunta.catalogo_asociado) ?? 'municipios';

  const [opcionesDepartamentos, setOpcionesDepartamentos] = useState<
    Array<{ valor: string; etiqueta: string }>
  >([]);
  const [opcionesMunicipios, setOpcionesMunicipios] = useState<
    Array<{ valor: string; etiqueta: string }>
  >([]);
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(false);
  const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDepartamentos() {
      setCargandoDepartamentos(true);
      setErrorCatalogo(null);
      try {
        let items;
        if (enLinea) {
          items = await obtenerItemsCatalogo(codigoDepartamentos, {
            solo_activos: true,
            idioma,
          });
        } else {
          items = (await obtenerCatalogoDesdeCache(codigoDepartamentos)) ?? [];
        }
        if (!cancelado) {
          setOpcionesDepartamentos(itemsCatalogoAopciones(items));
        }
      } catch {
        const cache = await obtenerCatalogoDesdeCache(codigoDepartamentos);
        if (!cancelado) {
          setOpcionesDepartamentos(
            cache ? itemsCatalogoAopciones(cache) : [],
          );
          if (!cache) {
            setErrorCatalogo('No fue posible cargar los departamentos.');
          }
        }
      } finally {
        if (!cancelado) {
          setCargandoDepartamentos(false);
        }
      }
    }

    ejecutarSinEspera(cargarDepartamentos());
    return () => {
      cancelado = true;
    };
  }, [codigoDepartamentos, enLinea, idioma]);

  useEffect(() => {
    if (!valorActual.departamento_codigo) {
      return;
    }

    let cancelado = false;

    async function cargarMunicipios() {
      setCargandoMunicipios(true);
      try {
        let items;
        if (enLinea) {
          items = await obtenerItemsCatalogo(codigoMunicipios, {
            codigo_padre: valorActual.departamento_codigo,
            solo_activos: true,
            idioma,
          });
        } else {
          const cache = await obtenerCatalogoDesdeCache(codigoMunicipios);
          items = (cache ?? []).filter(
            (item) => item.codigo_padre === valorActual.departamento_codigo,
          );
        }
        if (!cancelado) {
          setOpcionesMunicipios(itemsCatalogoAopciones(items));
        }
      } catch {
        const cache = await obtenerCatalogoDesdeCache(codigoMunicipios);
        const filtrados = (cache ?? []).filter(
          (item) => item.codigo_padre === valorActual.departamento_codigo,
        );
        if (!cancelado) {
          setOpcionesMunicipios(itemsCatalogoAopciones(filtrados));
        }
      } finally {
        if (!cancelado) {
          setCargandoMunicipios(false);
        }
      }
    }

    ejecutarSinEspera(cargarMunicipios());
    return () => {
      cancelado = true;
    };
  }, [
    codigoMunicipios,
    valorActual.departamento_codigo,
    enLinea,
    idioma,
  ]);

  function manejarCambioDepartamento(codigo: string) {
    const opcion = opcionesDepartamentos.find((item) => item.valor === codigo);
    onCambio({
      departamento_codigo: codigo,
      departamento_nombre: opcion?.etiqueta ?? '',
      municipio_codigo: '',
      municipio_nombre: '',
    });
  }

  function manejarCambioMunicipio(codigo: string) {
    const opcion = opcionesMunicipios.find((item) => item.valor === codigo);
    onCambio({
      ...valorActual,
      municipio_codigo: codigo,
      municipio_nombre: opcion?.etiqueta ?? '',
    });
  }

  const municipioBloqueado =
    deshabilitada || !valorActual.departamento_codigo;
  const opcionesMunicipiosVisibles = valorActual.departamento_codigo
    ? opcionesMunicipios
    : [];

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.descripcion || pregunta.tooltip || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <div className="flex flex-col gap-4">
        <div>
          {cargandoDepartamentos ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <Selector
              id={`${id}-departamento`}
              etiqueta="Departamento"
              value={valorActual.departamento_codigo}
              opciones={opcionesDepartamentos}
              onChange={(evento) =>
                manejarCambioDepartamento(evento.target.value)
              }
              disabled={deshabilitada}
              placeholder="Seleccione departamento"
              error={error}
            />
          )}
        </div>
        <div>
          {cargandoMunicipios && valorActual.departamento_codigo ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <Selector
              id={`${id}-municipio`}
              etiqueta="Municipio"
              value={valorActual.municipio_codigo}
              opciones={opcionesMunicipiosVisibles}
              onChange={(evento) => manejarCambioMunicipio(evento.target.value)}
              disabled={municipioBloqueado}
              placeholder={
                valorActual.departamento_codigo
                  ? 'Seleccione municipio'
                  : 'Primero seleccione departamento'
              }
              error={error}
            />
          )}
        </div>
      </div>
      {errorCatalogo && (
        <p className="text-sm mt-2" style={{ color: 'var(--color-error)' }}>
          {errorCatalogo}
        </p>
      )}
    </fieldset>
  );
}
