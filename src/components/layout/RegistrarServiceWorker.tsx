'use client';

/**
 * Registra el service worker basico para soporte PWA offline de assets estaticos.
 */

import { useEffect } from 'react';

export function RegistrarServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // El registro falla en entornos sin HTTPS o durante desarrollo local.
    });
  }, []);

  return null;
}
