'use client';

/**
 * Rende un pannello esclusivo: il resto della pagina esce dal giro di Tab e
 * degli screen reader.
 *
 * `inert` da solo NON confina il fuoco — toglie gli altri, non porta il fuoco
 * dentro ne' lo restituisce. Servono entrambe le cose, ed e' la parte che
 * quasi tutti sbagliano. L'altra: si memorizza cosa si e' marcato, e alla
 * chiusura si toglie SOLO da quelli, o si smarca roba che era gia' inerte.
 */

export function rendiEsclusivo(pannello: HTMLElement) {
  const marcati: HTMLElement[] = [];
  for (const el of Array.from(document.body.children)) {
    if (el === pannello || !(el instanceof HTMLElement)) continue;
    if (el.hasAttribute('inert')) continue;
    el.setAttribute('inert', '');
    marcati.push(el);
  }
  return () => {
    for (const el of marcati) el.removeAttribute('inert');
    marcati.length = 0;
  };
}

/** Primo elemento raggiungibile dentro un contenitore. */
export function primoFocusabile(dentro: HTMLElement): HTMLElement | null {
  return dentro.querySelector<HTMLElement>(
    '[autofocus], button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
  );
}
