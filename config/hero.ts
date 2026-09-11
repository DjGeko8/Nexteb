/**
 * Tutto quello che riguarda il video della hero sta qui.
 * Sostituire il filmato significa cambiare questi numeri e rigenerare i file
 * con `npm run media`. Nessun componente conosce durate o percorsi.
 */

export type Capitolo = {
  /** secondo d'inizio nel montaggio */
  da: number;
  /** secondo di fine */
  a: number;
  /** una o due parole, mostrate in sovrimpressione */
  titolo: string;
  /** cosa si vede, per l'etichetta della barra capitoli e per l'alt */
  cosa: string;
};

export const hero = {
  /**
   * Le sorgenti, in ordine di preferenza: il browser prende la PRIMA che sa
   * leggere, non la migliore. Per questo il 720p sta davanti.
   *
   * Il telaio non supera i 980 px di larghezza, quindi il 1080p non servirebbe
   * a nessuno e costerebbe 3,4 MB in piu' a ogni visita. Conta piu' del solito
   * perche' Cloudflare NON serve richieste parziali sugli asset statici: il
   * file si scarica sempre INTERO, anche a chi se ne va dopo tre secondi.
   */
  sorgenti: [
    { src: '/media/intro-720.mp4', type: 'video/mp4' },
    { src: '/media/intro-1080.webm', type: 'video/webm' },
  ],
  /** Sotto questa larghezza si serve il 720p: meno della meta' dei byte. */
  sorgentiMobile: [{ src: '/media/intro-720.mp4', type: 'video/mp4' }],
  larghezzaMobile: 820,

  /**
   * Il poster e' l'elemento LCP. NON e' il primo fotogramma: il montaggio
   * entra dal nero, e un poster nero non dice niente. E' preso a 1,6 s, dove
   * il sito vecchio riempie il campo.
   */
  poster: '/media/poster.webp',
  posterAvif: '/media/poster.avif',

  durata: 38.17,

  /** Il filmato gira in continuo: testa e coda sfumano dal nero, quindi il
   *  giro non ha stacco e non serve nessun espediente nella pagina. */
  inCiclo: true,

  /** Punto d'interesse per il ritaglio su schermi stretti (0-1). */
  fuoco: { x: 0.5, y: 0.42 },

  capitoli: [
    { da: 0,    a: 4.0,   titolo: 'Vecchio. Lento.',      cosa: 'Il sito vecchio' },
    { da: 4.0,  a: 10.4,  titolo: 'Si smonta.',           cosa: 'La trasformazione' },
    { da: 10.4, a: 17.1,  titolo: 'Si ricostruisce.',     cosa: 'Il nuovo sito' },
    { da: 17.1, a: 22.8,  titolo: 'Diventa app.',         cosa: "Dal web all'app" },
    { da: 22.8, a: 32.1,  titolo: 'Funziona.',            cosa: "L'app in azione" },
    { da: 32.1, a: 38.17, titolo: '',                     cosa: "L'ecosistema" },
  ] satisfies Capitolo[],
} as const;

/**
 * Da questo secondo in poi IL VIDEO PARLA DA SOLO: il montaggio porta il testo
 * impresso dentro — «Vuole viverlo», i tre vantaggi, «Web. App. Esperienza.»,
 * il claim e il bottone disegnato. Verificato fotogramma per fotogramma.
 *
 * Sovrapporre la nostra sovrimpressione li' produce due testi uno sull'altro.
 * Se il filmato cambia, questo e' l'unico numero da rivedere.
 */
export const sovrimpressioneFinoA = 28.3;

/** Nel finale il bottone e' disegnato dentro il video: sopra ci va solo quello
 *  vero e cliccabile, allineato a quello del filmato. */
export const capitoloFinale = 5;
