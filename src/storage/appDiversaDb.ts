/**
 * Base de datos IndexedDB con Dexie para operacion offline.
 */

import Dexie, { type Table } from 'dexie';
import type { FormularioEstructura } from '@/types/formulario';
import type { ItemCatalogo } from '@/types/catalogo';
import type { EstadoSesion } from '@/types/sesion';
import type { OperacionSincronizacionEntrada } from '@/types/sincronizacion';

export interface RegistroFormularioCache {
  uuid_formulario: string;
  estructura: FormularioEstructura;
  fecha_cache: string;
}

export interface RegistroSesionLocal {
  uuid_sesion: string;
  token_cliente: string;
  uuid_formulario: string;
  estado: EstadoSesion;
  fecha_actualizacion: string;
}

export interface RegistroRespuestaLocal {
  uuid_local: string;
  uuid_sesion: string;
  codigo_pregunta: string;
  valor: unknown;
  version_cliente: number;
  fecha_cliente: string;
  checksum: string;
}

export interface RegistroColaSincronizacion extends OperacionSincronizacionEntrada {
  uuid_sesion: string;
  estado: 'pendiente' | 'error';
}

export interface RegistroErrorSincronizacion {
  id?: number;
  uuid_local: string;
  detalle: string;
  fecha: string;
}

export interface RegistroCatalogoCache {
  codigo_catalogo: string;
  items: ItemCatalogo[];
  fecha_cache: string;
}

export interface RegistroAceptacionTerminos {
  id?: number;
  uuid_sesion: string;
  uuid_formulario: string;
  fecha_aceptacion: string;
  version_texto_terminos?: string | null;
}

export class AppDiversaDatabase extends Dexie {
  formularios_cache!: Table<RegistroFormularioCache, string>;
  sesiones!: Table<RegistroSesionLocal, string>;
  respuestas_locales!: Table<RegistroRespuestaLocal, string>;
  cola_sincronizacion!: Table<RegistroColaSincronizacion, string>;
  errores_sincronizacion!: Table<RegistroErrorSincronizacion, number>;
  catalogos_cache!: Table<RegistroCatalogoCache, string>;
  aceptaciones_terminos!: Table<RegistroAceptacionTerminos, number>;

  constructor() {
    super('appDiversaDb');

    this.version(1).stores({
      formularios_cache: 'uuid_formulario, fecha_cache',
      sesiones: 'uuid_sesion, uuid_formulario, estado',
      respuestas_locales: 'uuid_local, uuid_sesion, codigo_pregunta',
      cola_sincronizacion: 'uuid_local, uuid_sesion, estado, codigo_pregunta',
      errores_sincronizacion: '++id, uuid_local, fecha',
      catalogos_cache: 'codigo_catalogo, fecha_cache',
    });

    this.version(2).stores({
      cola_sincronizacion:
        'uuid_local, uuid_sesion, estado, codigo_pregunta, [uuid_sesion+estado]',
    });

    this.version(3).stores({
      aceptaciones_terminos:
        '++id, uuid_sesion, uuid_formulario, [uuid_sesion+uuid_formulario]',
    });
  }
}

export const appDiversaDb = new AppDiversaDatabase();
