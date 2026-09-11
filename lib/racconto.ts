/**
 * La mappa del racconto.
 *
 * Ogni sezione e' uno spazio di scorrimento alto tot viewport. Il telaio non
 * scorre: sta fermo e cambia. Quindi l'altezza qui NON e' spazio da riempire,
 * e' TEMPO — quanto dura quella parte della storia mentre si scorre.
 *
 * S4 e' lunga il doppio delle altre perche' li' succede la cosa piu' difficile
 * da leggere: un rettangolo che cambia proporzioni. Darle meno spazio la
 * renderebbe un guizzo invece di una trasformazione.
 */

export const SEZIONI = [
  { id: 'hero', vh: 100 },
  { id: 's1', vh: 110 },
  { id: 's2', vh: 130 },
  { id: 's3', vh: 130 },
  { id: 's4', vh: 260 },
  { id: 's5', vh: 180 },
  { id: 's6', vh: 130 },
  { id: 's7', vh: 100 },
  // S8 non e' una schermata, sono tre tempi: il telefono si riapre, il modulo
  // si tiene un momento da solo, la cosa vera prende il suo posto. Con
  // `end: 'bottom bottom'` la corsa utile dell'ULTIMA sezione e' (altezza -
  // 100vh): a 150vh erano 50vh per tre tempi — meno della sezione piu' corta
  // del sito — e il 45% di quei 50vh era gia' immobilita' totale. 220vh ne
  // lasciano 120, e l'apertura del telefono dura 43vh invece di 21.
  // Allungarla non scentra piu' niente perche' il contenuto del finale non e'
  // piu' centrato nella sezione ma appiccicato allo schermo (.finale-palco):
  // prima le due cose erano legate — il centro stava a V*(1-k/2) e la corsa
  // valeva V*(k-1), cioe' lo sfasamento era META' della corsa — ed e' il
  // motivo per cui nessuno aveva mai potuto allungare S8.
  { id: 's8', vh: 220 },
] as const;

export type IdSezione = (typeof SEZIONI)[number]['id'];

/** Interpolazione lineare, con il risultato tenuto dentro gli estremi. */
export function fra(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Rimappa p dall'intervallo [da, a] a [0, 1]. La finestra dentro la finestra. */
export function fin(p: number, da: number, a: number) {
  return Math.max(0, Math.min(1, (p - da) / (a - da)));
}

export function px(v: number) {
  return `${v.toFixed(1)}px`;
}

export type Misure = { lato: number; vert: number; w: number; h: number };

/**
 * IL PALCO E' GRANDE QUANTO LO SCHERMO.
 *
 * Il video si apre a tutto schermo; da li' il telaio si stringe fino al
 * riquadro del racconto e poi fino al telefono. Non si scala mai niente: si
 * cambia quanta parte del palco si vede, con `clip-path: inset()`. Una scala
 * non uniforme schiaccerebbe il contenuto, e una uniforme non potrebbe
 * cambiare le proporzioni.
 *
 * Da qui discendono tutte le misure, cosi' CSS e JavaScript non possono
 * divergere: sono calcolate in un posto solo.
 */

/** Il riquadro del racconto: 16:9, centrato, come una finestra sul tavolo. */
export function misureRiquadro(vw: number, vh: number): Misure {
  const largo = vw < 900 ? vw * 0.9 : Math.min(vw * 0.62, 980);
  const alto = largo * (9 / 16);
  return {
    lato: Math.max(0, (vw - largo) / 2),
    vert: Math.max(0, (vh - alto) / 2),
    w: largo,
    h: alto,
  };
}

/**
 * Il telefono: 9:19,5, alto quanto serve per leggersi come un telefono in
 * piedi senza toccare i bordi dello schermo.
 *
 * 0,68 e non di piu': il titolo della sezione sta in basso, fisso, e su tre
 * righe arriva a meta' schermo. Un telefono piu' alto ci finisce sotto.
 */
export function misureTelefono(vw: number, vh: number): Misure {
  const r = misureRiquadro(vw, vh);
  const alto = Math.min(vh * 0.68, r.h * 1.7);
  const largo = alto * 0.4615; // 9 / 19,5
  return {
    lato: Math.max(0, (vw - largo) / 2),
    vert: Math.max(0, (vh - alto) / 2),
    w: largo,
    h: alto,
  };
}
