'use client';

/**
 * Il nucleo di GSAP, e basta.
 *
 * I plugin vivono in lib/plugin.ts e si caricano a richiesta: tenerli qui
 * costava 31 KB gzip nel carico iniziale per roba che la hero non usa.
 */

import { gsap } from 'gsap';

let promessa: Promise<typeof import('./plugin')> | null = null;

/** Carica e registra i plugin. Chiamala dalla sezione che li usa. */
export function caricaPlugin() {
  promessa ??= import('./plugin');
  return promessa;
}

export { gsap };
