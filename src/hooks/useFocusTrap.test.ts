import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from './useFocusTrap';

function hacerElementosVisiblesParaJsdom(contenedor: HTMLElement) {
  Object.defineProperty(contenedor, 'offsetParent', {
    configurable: true,
    value: document.body,
  });
  contenedor.querySelectorAll('button').forEach((boton) => {
    Object.defineProperty(boton, 'offsetParent', {
      configurable: true,
      value: contenedor,
    });
  });
}

function renderFocusTrap(activo: boolean) {
  const contenedor = document.createElement('div');
  contenedor.innerHTML = `
    <button type="button" id="primero">Primero</button>
    <button type="button" id="segundo">Segundo</button>
  `;
  document.body.appendChild(contenedor);
  hacerElementosVisiblesParaJsdom(contenedor);

  const view = renderHook(() => {
    const ref = useRef<HTMLDivElement | null>(contenedor);
    useFocusTrap(ref, activo);
    return ref;
  });

  return { contenedor, view };
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('enfoca el primer elemento enfocable cuando esta activo', () => {
    const { contenedor } = renderFocusTrap(true);
    const primero = contenedor.querySelector<HTMLElement>('#primero');

    expect(document.activeElement).toBe(primero);
  });

  it('no altera el foco cuando esta inactivo', () => {
    const botonExterno = document.createElement('button');
    document.body.appendChild(botonExterno);
    botonExterno.focus();

    renderFocusTrap(false);

    expect(document.activeElement).toBe(botonExterno);
  });

  it('cicla el foco con Tab y Shift+Tab', () => {
    const { contenedor } = renderFocusTrap(true);
    const primero = contenedor.querySelector<HTMLElement>('#primero');
    const segundo = contenedor.querySelector<HTMLElement>('#segundo');
    const focusPrimero = vi.spyOn(primero!, 'focus');
    const focusSegundo = vi.spyOn(segundo!, 'focus');

    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => segundo,
    });

    fireEvent.keyDown(contenedor, { key: 'Tab' });
    expect(focusPrimero).toHaveBeenCalled();

    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => primero,
    });

    fireEvent.keyDown(contenedor, { key: 'Tab', shiftKey: true });
    expect(focusSegundo).toHaveBeenCalled();
  });

  it('registra y elimina el listener de teclado al montar y desmontar', () => {
    const addSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');
    const removeSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');

    const { view } = renderFocusTrap(true);

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    view.unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('ignora Tab cuando no hay elementos enfocables visibles', () => {
    const contenedor = document.createElement('div');
    document.body.appendChild(contenedor);
    Object.defineProperty(contenedor, 'offsetParent', {
      configurable: true,
      value: document.body,
    });

    renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(contenedor);
      useFocusTrap(ref, true);
    });

    expect(() => {
      fireEvent.keyDown(contenedor, { key: 'Tab' });
    }).not.toThrow();
  });
});
