/**
 * Il vocabolario del movimento. Tre durate e tre curve per tutto il sito,
 * nominate per ruolo e non per forma.
 *
 * Il template ha una curva diversa per ogni componente, perche' ogni
 * componente e' stato scritto in un giorno diverso. Questo ne ha tre.
 *
 * I valori vivono in app/globals.css (@theme): qui si leggono, cosi' GSAP e
 * il CSS non possono divergere.
 */

export const durata = {
  /** colore, bordo, stato di un controllo */
  micro: 0.14,
  /** pannelli, accordion, menu */
  componente: 0.26,
  /** comparse */
  ingresso: 0.52,
} as const;

export const curva = {
  /** la dominante: tutto cio' che entra */
  entrata: 'power4.out',
  /** tutto cio' che esce: piu' rapido e accelerato */
  uscita: 'power2.in',
  /** cambi di stato */
  stato: 'power2.inOut',
} as const;

/** Le stesse curve in CSS, per le transizioni che non passano da GSAP. */
export const curvaCss = {
  entrata: 'cubic-bezier(.16, 1, .3, 1)',
  uscita: 'cubic-bezier(.55, 0, .85, .2)',
  stato: 'cubic-bezier(.4, 0, .2, 1)',
} as const;

/** Sfalsamento fra elementi in una comparsa a lotti. Gradini di 60-80 ms:
 *  piu' lunghi e l'effetto diventa attesa. */
export const passo = 0.07;
