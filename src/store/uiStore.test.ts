import { describe, it, expect } from 'vitest';
import { useUiStore } from './uiStore';

describe('uiStore', () => {
  it('gestiona carga global y toasts', () => {
    useUiStore.setState({
      cargandoGlobal: false,
      mensajeCarga: null,
      toasts: [],
      dialogo: null,
      confirmacion: null,
    });

    useUiStore.getState().establecerCarga(true, 'Guardando');
    expect(useUiStore.getState().cargandoGlobal).toBe(true);
    expect(useUiStore.getState().mensajeCarga).toBe('Guardando');

    useUiStore.getState().agregarToast({ mensaje: 'Listo', variante: 'exito' });
    expect(useUiStore.getState().toasts).toHaveLength(1);

    const id = useUiStore.getState().toasts[0].id;
    useUiStore.getState().eliminarToast(id);
    expect(useUiStore.getState().toasts).toHaveLength(0);
  });

  it('resuelve confirmacion con promesa desde mensaje simple', async () => {
    useUiStore.setState({ confirmacion: null });

    const promesa = useUiStore.getState().confirmar('¿Continuar?');
    expect(useUiStore.getState().confirmacion?.mensaje).toBe('¿Continuar?');

    useUiStore.getState().resolverConfirmacion(true);
    await expect(promesa).resolves.toBe(true);
  });

  it('resuelve confirmacion con opciones completas', async () => {
    useUiStore.setState({ confirmacion: null });

    const promesa = useUiStore.getState().confirmar({
      titulo: 'Confirmar envío',
      mensaje: '¿Desea enviar el formulario?',
      etiquetaConfirmar: 'Enviar',
      etiquetaCancelar: 'Volver',
    });

    expect(useUiStore.getState().confirmacion?.titulo).toBe('Confirmar envío');
    expect(useUiStore.getState().confirmacion?.etiquetaConfirmar).toBe('Enviar');

    useUiStore.getState().resolverConfirmacion(false);
    await expect(promesa).resolves.toBe(false);
  });
});
