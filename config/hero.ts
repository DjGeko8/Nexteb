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
   * LE SORGENTI, IN ORDINE. Il browser prende la PRIMA che sa leggere e la cui
   * `media` corrisponde — non la migliore. Quindi l'ordine e' la scelta.
   *
   * Prima qui c'erano DUE elenchi, `sorgenti` e `sorgentiMobile`, e il secondo
   * non lo leggeva nessuno: il componente mappava solo il primo. Finche' in
   * testa c'era la copia stretta il telefono la prendeva per caso; il giorno
   * che l'ordine e' cambiato si e' ritrovato a scaricare la copia larga, cioe'
   * tre megabyte in piu' sulla connessione peggiore, senza un errore da nessuna
   * parte. Un campo che nessuno legge non e' codice morto innocuo: e' una
   * decisione che sembra presa e non lo e'. Un elenco solo, e la condizione
   * scritta accanto alla riga a cui si applica.
   *
   * `media` e' verificato sul campo, non dedotto: dentro <video> la selezione
   * della risorsa lo rispetta davvero (provato con soglie sopra e sotto la
   * larghezza della finestra, restituisce le due copie giuste).
   *
   * Perche' due copie. Il video sta A TUTTO SCHERMO: su un portatile una copia
   * stretta ingrandita si vede, e la prima cosa che si sfalda e' il testo
   * piccolo della finta interfaccia dentro il filmato. Sotto gli 820 px quei
   * pixel non li vedrebbe nessuno e la connessione e' quasi sempre peggiore.
   * Il peso conta piu' del solito perche' Cloudflare NON serve richieste
   * parziali sugli asset statici: il file si scarica sempre INTERO, anche da
   * chi se ne va dopo tre secondi.
   */
  sorgenti: [
    { src: '/media/intro-stretto.mp4', type: 'video/mp4', media: '(max-width: 820px)' },
    { src: '/media/intro-largo.webm', type: 'video/webm' },
    { src: '/media/intro-largo.mp4', type: 'video/mp4' },
  ] as ReadonlyArray<{ src: string; type: string; media?: string }>,

  /**
   * Il poster e' l'elemento LCP. NON e' il primo fotogramma: il montaggio
   * entra dal nero, e un poster nero non dice niente. E' preso a 1,6 s, dove
   * il sito vecchio riempie il campo.
   */
  poster: '/media/poster.webp',
  posterAvif: '/media/poster.avif',

  durata: 38.17,

  /**
   * Il filmato gira in continuo, e il giro NON passa dal nero.
   *
   * Prima testa e coda avevano una dissolvenza dal nero, messa perche' il
   * ciclo non avesse stacco: insieme duravano quasi un secondo, e a ogni giro
   * quel secondo si leggeva come una pausa. Tolte. L'ultima scena e la prima
   * sono entrambe scure, quindi lo stacco diretto regge da se'.
   */
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
