'use client';

/**
 * Blocco dello scorrimento a conteggio di riferimenti.
 *
 * Menu, banner del consenso e pannello contatti possono bloccare insieme senza
 * sbloccarselo a vicenda: e' un difetto che si manifesta raramente e si
 * diagnostica pessimamente, cioe' il peggior tipo possibile.
 *
 * Salvare e ripristinare scrollY non e' un extra: senza, su iOS overflow:hidden
 * sul body fa saltare in cima e il visitatore perde il punto in cui stava.
 */

import { bloccaScorrimento as fermaLenis } from './lenis';

const attivi = new Set<string>();
let yMemorizzato = 0;

export function blocca(attivo: boolean, tag = 'gate') {
  if (typeof document === 'undefined') return;
  const prima = attivi.size;
  attivo ? attivi.add(tag) : attivi.delete(tag);

  if (prima === 0 && attivi.size > 0) {
    yMemorizzato = window.scrollY;
    fermaLenis(true);
    const b = document.body.style;
    b.position = 'fixed';
    b.insetInline = '0';
    b.top = `-${yMemorizzato}px`;
    b.overflow = 'hidden';
  }
  if (prima > 0 && attivi.size === 0) {
    const b = document.body.style;
    b.position = '';
    b.insetInline = '';
    b.top = '';
    b.overflow = '';
    window.scrollTo(0, yMemorizzato);
    fermaLenis(false);
  }
}
