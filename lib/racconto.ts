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
  { id: 's8', vh: 150 },
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

/**
 * Le proporzioni del telefono, ricavate dal telaio invece che scritte a mano.
 *
 * Il passaggio da 16:9 a 9:19,5 NON e' una scala: una scala non uniforme
 * schiaccerebbe il contenuto. Si ritaglia — si cambia quanta parte del palco
 * si vede — e il contenuto dentro non viene deformato di un pixel.
 */
export function misureTelefono(larghezza: number, altezza: number) {
  const altezzaVisibile = altezza * 0.96;
  const larghezzaVisibile = altezzaVisibile * 0.4615; // 9 / 19,5
  return {
    lato: Math.max(0, (larghezza - larghezzaVisibile) / 2),
    vert: Math.max(0, (altezza - altezzaVisibile) / 2),
  };
}
