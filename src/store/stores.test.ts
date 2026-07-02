import { describe, it, expect, beforeEach } from 'vitest';
import { useAccesibilidadStore } from './accesibilidadStore';
import { useFormulariosStore } from './formulariosStore';
import { useCatalogosStore } from './catalogosStore';
import { useReglasStore } from './reglasStore';
import { useInterfazStore } from './interfazStore';
import { useSesionStore } from './sesionStore';
import { useOfflineStore } from './offlineStore';
import { useRespuestasStore } from './respuestasStore';
import { useIdiomaStore } from './idiomaStore';
import { CONFIGURACION_FALLBACK } from '@/services/interfazServicio';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';

describe('accesibilidadStore', () => {
  beforeEach(() => {
    useAccesibilidadStore.setState({
      alto_contraste: false,
      tamano_texto: 'normal',
      reducir_animaciones: false,
    });
  });

  it('alterna alto contraste y tamano de texto', () => {
    useAccesibilidadStore.getState().activarAltoContraste();
    expect(useAccesibilidadStore.getState().alto_contraste).toBe(true);

    useAccesibilidadStore.getState().aumentarTexto();
    expect(useAccesibilidadStore.getState().tamano_texto).toBe('grande');

    useAccesibilidadStore.getState().aumentarTexto();
    expect(useAccesibilidadStore.getState().tamano_texto).toBe('muy_grande');

    useAccesibilidadStore.getState().disminuirTexto();
    expect(useAccesibilidadStore.getState().tamano_texto).toBe('grande');

    useAccesibilidadStore.getState().activarReducirAnimaciones();
    expect(useAccesibilidadStore.getState().reducir_animaciones).toBe(true);
    useAccesibilidadStore.getState().desactivarReducirAnimaciones();
    expect(useAccesibilidadStore.getState().reducir_animaciones).toBe(false);
  });
});

describe('formulariosStore', () => {
  beforeEach(() => useFormulariosStore.getState().limpiar());

  it('gestiona disponibles, estructura y seccion activa', () => {
    const formularios = [{ uuid: 'f1', nombre: 'Encuesta' }] as never;
    useFormulariosStore.getState().establecerDisponibles(formularios);
    expect(useFormulariosStore.getState().disponibles).toEqual(formularios);

    const estructura = { uuid: 'f1', nombre: 'Encuesta', secciones: [], textos: [] } as never;
    useFormulariosStore.getState().establecerEstructura(estructura);
    useFormulariosStore.getState().establecerSeccionActiva('S1');
    expect(useFormulariosStore.getState().seccionActivaCodigo).toBe('S1');

    useFormulariosStore.getState().establecerCargando(true);
    useFormulariosStore.getState().establecerError('Error');
    expect(useFormulariosStore.getState().cargando).toBe(true);
    expect(useFormulariosStore.getState().error).toBe('Error');

    useFormulariosStore.getState().limpiar();
    expect(useFormulariosStore.getState().disponibles).toEqual([]);
  });
});

describe('catalogosStore', () => {
  beforeEach(() => useCatalogosStore.getState().limpiar());

  it('cachea catalogos e items en memoria', () => {
    const catalogos = [{ codigo: 'dep', nombre: 'Departamentos' }] as never;
    useCatalogosStore.getState().establecerCatalogos(catalogos);
    expect(useCatalogosStore.getState().catalogos).toEqual(catalogos);

    const items = [{ codigo: '05', nombre: 'Antioquia' }] as never;
    useCatalogosStore.getState().establecerItems('dep', items);
    expect(useCatalogosStore.getState().obtenerItems('dep')).toEqual(items);
    expect(useCatalogosStore.getState().obtenerItems('otro')).toEqual([]);

    useCatalogosStore.getState().limpiar();
    expect(useCatalogosStore.getState().catalogos).toEqual([]);
  });

  it('fusiona items sin duplicar codigos', () => {
    useCatalogosStore.getState().establecerItems('municipios', [
      { codigo: '05001', nombre: 'Medellin', orden: 1 },
    ] as never);

    useCatalogosStore.getState().fusionarItems('municipios', [
      { codigo: '05001', nombre: 'Medellin actualizado', orden: 1 },
      { codigo: '11001', nombre: 'Bogota', orden: 2 },
    ] as never);

    const items = useCatalogosStore.getState().obtenerItems('municipios');
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.codigo === '05001')?.nombre).toBe('Medellin actualizado');
  });
});

describe('reglasStore', () => {
  beforeEach(() => useReglasStore.getState().limpiar());

  it('evalua visibilidad, habilitacion y obligatoriedad', () => {
    useReglasStore.getState().establecerResultado({
      ...RESULTADO_REGLAS_VACIO,
      preguntas_ocultas: ['P1'],
      preguntas_deshabilitadas: ['P2'],
      preguntas_obligatorias: ['P3'],
      preguntas_opcionales: ['P4'],
    });

    expect(useReglasStore.getState().preguntaEstaVisible('P1', true)).toBe(false);
    expect(useReglasStore.getState().preguntaEstaHabilitada('P2')).toBe(false);
    expect(useReglasStore.getState().preguntaEsObligatoria('P3', false)).toBe(true);
    expect(useReglasStore.getState().preguntaEsObligatoria('P4', true)).toBe(false);
    expect(useReglasStore.getState().preguntaEsObligatoria('P5', true)).toBe(true);
  });
});

describe('interfazStore', () => {
  it('expone estilos de tokens desde configuracion', () => {
    useInterfazStore.setState({ configuracion: null, cargando: false, error: null });
    expect(useInterfazStore.getState().obtenerEstilosTokens()).toEqual({});

    useInterfazStore.getState().establecerConfiguracion(CONFIGURACION_FALLBACK);
    const estilos = useInterfazStore.getState().obtenerEstilosTokens();
    expect(estilos['--color-primario']).toBe(CONFIGURACION_FALLBACK.color_primario);

    useInterfazStore.getState().establecerCargando(true);
    useInterfazStore.getState().establecerError('fallo');
    expect(useInterfazStore.getState().error).toBe('fallo');
  });
});

describe('sesionStore', () => {
  beforeEach(() => useSesionStore.getState().limpiar());

  it('gestiona credenciales de sesion', () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    expect(useSesionStore.getState().tieneCredenciales()).toBe(true);
    expect(useSesionStore.getState().obtenerCredenciales()).toEqual({
      uuidSesion: 's1',
      tokenCliente: 't1',
    });

    useSesionStore.getState().actualizarEstado('finalizada');
    expect(useSesionStore.getState().estado).toBe('finalizada');

    useSesionStore.getState().limpiar();
    expect(useSesionStore.getState().obtenerCredenciales()).toBeNull();
  });
});

describe('offlineStore', () => {
  it('actualiza estado de conexion, sincronizacion y finalizacion pendiente', () => {
    useOfflineStore.getState().establecerEnLinea(false);
    useOfflineStore.getState().establecerOperacionesPendientes(3);
    useOfflineStore.getState().establecerSincronizando(true);
    useOfflineStore.getState().establecerFinalizacionPendiente(true, 'form-uuid');
    useOfflineStore.getState().establecerUltimoResultado({
      operaciones_procesadas: 1,
      operaciones_actualizadas: 1,
      duplicadas: 0,
      conflictos: [],
      errores: [],
    });

    expect(useOfflineStore.getState().enLinea).toBe(false);
    expect(useOfflineStore.getState().operacionesPendientes).toBe(3);
    expect(useOfflineStore.getState().sincronizando).toBe(true);
    expect(useOfflineStore.getState().finalizacionPendiente).toBe(true);
    expect(useOfflineStore.getState().uuidFormularioFinalizacion).toBe('form-uuid');
    expect(useOfflineStore.getState().ultimoResultado?.operaciones_procesadas).toBe(1);

    useOfflineStore.getState().establecerFinalizacionPendiente(false);
    expect(useOfflineStore.getState().finalizacionPendiente).toBe(false);
    expect(useOfflineStore.getState().uuidFormularioFinalizacion).toBeNull();
  });
});

describe('respuestasStore', () => {
  beforeEach(() => useRespuestasStore.getState().limpiar());

  it('almacena y recupera respuestas locales', () => {
    useRespuestasStore.getState().establecerRespuesta('P1', {
      valor: 'Ana',
      versionCliente: 1,
      origenRespuesta: 'web',
      fechaCliente: '2026-01-01T00:00:00.000Z',
    });

    expect(useRespuestasStore.getState().obtenerRespuesta('P1')?.valor).toBe('Ana');
    useRespuestasStore.getState().limpiar();
    expect(useRespuestasStore.getState().obtenerRespuesta('P1')).toBeUndefined();
  });
});

describe('idiomaStore', () => {
  it('traduce con fallback', () => {
    useIdiomaStore.setState({
      idioma: 'es',
      incluirAccesibilidad: false,
      traducciones: { 'app.titulo': 'Inicio' },
      cargandoTraducciones: false,
    });

    expect(useIdiomaStore.getState().traducir('app.titulo', 'Home')).toBe('Inicio');
    expect(useIdiomaStore.getState().traducir('app.otro', 'Home')).toBe('Home');

    useIdiomaStore.getState().establecerIdioma('en');
    useIdiomaStore.getState().establecerIncluirAccesibilidad(true);
    useIdiomaStore.getState().establecerTraducciones({});
    useIdiomaStore.getState().establecerCargandoTraducciones(true);

    expect(useIdiomaStore.getState().idioma).toBe('en');
    expect(useIdiomaStore.getState().incluirAccesibilidad).toBe(true);
  });
});
