/**
 * I dati che il cliente non ha ancora dato non si scrivono come "XXX" dentro
 * un testo: da un campo libero una riga si cancella per distrazione e non se
 * ne accorge nessuno. Qui si registrano, si vedono a schermo in sviluppo, e
 * `npm run verifica-segnaposto` esce con errore finche' ne resta uno legale.
 */

export type Gravita = 'legale' | 'contenuto';

const registro = new Map<string, Gravita>();

export function tbd(id: string, gravita: Gravita = 'contenuto'): string {
  registro.set(id, gravita);
  return `«TBD:${id}»`;
}

export function elencoSegnaposti(): Array<[string, Gravita]> {
  return [...registro.entries()];
}

/** Vero se la stringa e' un segnaposto: serve ai componenti per marcarlo. */
export function eSegnaposto(v: string): boolean {
  return v.startsWith('«TBD:');
}
