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

  /** 31,75 s. Era 38,17 finche' il montaggio incollava le sette clip con sei
   *  dissolvenze lunghe; ora quattro sono corte e due sono stacchi netti. */
  durata: 31.75,

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

  /**
   * I capitoli seguono le GIUNZIONI del montaggio, non una divisione a occhio:
   * 5,375 · 8,959 · 13,500 · 17,500 · 22,750 · 26,208. Sono i punti di taglio
   * che `cerca-giunzioni.sh` ha trovato in ../intro, quindi una barra che si
   * sposta qui salta esattamente dove il filmato cambia scena.
   * Il 5 e il 6 stanno insieme in un capitolo solo: da 22,75 in poi il video
   * parla da se' e la nostra sovrimpressione tace, quindi un salto li' in mezzo
   * porterebbe a un pezzo senza titolo.
   */
  capitoli: [
    { da: 0,     a: 5.375,  titolo: 'Vecchio. Lento.',  cosa: 'Il sito vecchio' },
    { da: 5.375, a: 8.959,  titolo: 'Si smonta.',       cosa: 'La trasformazione' },
    { da: 8.959, a: 13.5,   titolo: 'Si ricostruisce.', cosa: 'Il nuovo sito' },
    { da: 13.5,  a: 17.5,   titolo: 'Diventa app.',     cosa: "Dal web all'app" },
    { da: 17.5,  a: 22.75,  titolo: 'Funziona.',        cosa: "L'app in azione" },
    { da: 22.75, a: 31.75,  titolo: '',                 cosa: "L'ecosistema" },
  ] satisfies Capitolo[],
} as const;

/**
 * Da questo secondo in poi IL VIDEO PARLA DA SOLO: il montaggio porta il testo
 * impresso dentro — «Vuole viverlo», i tre vantaggi, «Web. App. Esperienza.»,
 * il claim e il bottone disegnato. Verificato guardando i fotogrammi: a 22,60
 * lo schermo e' ancora il telefono in mano, a 23,15 la frase c'e' gia'.
 *
 * Sovrapporre la nostra sovrimpressione li' produce due testi uno sull'altro.
 * Se il filmato cambia, questo e' l'unico numero da rivedere — ed e' cambiato:
 * era 28,3 sul montaggio da 38,17 s, ora la giunzione che porta la frase e' a
 * 22,75 e il numero e' un filo prima, perche' la dissolvenza dura otto
 * fotogrammi e il testo comincia a comparire gia' dentro di essa.
 */
export const sovrimpressioneFinoA = 22.6;

/** Nel finale il bottone e' disegnato dentro il video: sopra ci va solo quello
 *  vero e cliccabile, allineato a quello del filmato. */
export const capitoloFinale = 5;
