import { describe, it, expect, beforeEach } from 'vitest';
import {
  NOMBRE_COOKIE_IDIOMA,
  NOMBRE_COOKIE_ACCESIBILIDAD,
  establecerCookieIdioma,
  leerCookieIdioma,
  establecerCookieAccesibilidad,
  leerCookieAccesibilidad,
} from './idiomaCookie';

describe('idiomaCookie', () => {
  beforeEach(() => {
    document.cookie = `${NOMBRE_COOKIE_IDIOMA}=;max-age=0`;
    document.cookie = `${NOMBRE_COOKIE_ACCESIBILIDAD}=;max-age=0`;
  });

  it('persiste y lee idioma', () => {
    establecerCookieIdioma('en');
    expect(leerCookieIdioma()).toBe('en');
  });

  it('persiste y lee accesibilidad', () => {
    establecerCookieAccesibilidad(true);
    expect(leerCookieAccesibilidad()).toBe(true);
    establecerCookieAccesibilidad(false);
    expect(leerCookieAccesibilidad()).toBe(false);
  });
});
