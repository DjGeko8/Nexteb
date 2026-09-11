/**
 * Tutti i testi del sito. Nessuna stringa scritta dentro un componente.
 *
 * Regola di scrittura: massimo sei parole per titolo, una riga di sottotitolo.
 * Niente urgenza inventata, niente affermazioni che il cliente non puo'
 * dimostrare. I dati che il cliente non ha ancora dato passano da tbd().
 */

import { tbd } from '@/lib/segnaposti';

export const marchio = {
  nome: 'Nexteb',
  /** La N e' l'unica lettera in colore: e' il segno del marchio. */
  primaLettera: 'N',
  resto: 'exteb',
  sottotitolo: 'Digital Solutions',
} as const;

export const meta = {
  titolo: 'Nexteb — Trasformiamo idee in esperienze digitali',
  descrizione:
    'Creiamo e ristrutturiamo siti web, sviluppiamo app e portiamo l’intelligenza artificiale dentro i servizi delle aziende.',
  claim: 'Trasformiamo idee in esperienze digitali.',
} as const;

export const testata = {
  contatti: 'Contatti',
  chiudi: 'Chiudi',
  ariaMenu: 'Apri i contatti',
} as const;

export const preloader = {
  etichetta: 'Caricamento',
} as const;

export const eroe = {
  cta: 'Parliamo del tuo progetto',
  contattaci: 'Contattaci',
  rivedi: 'Rivedi',
  scorri: 'Scorri',
  ariaBarra: 'Capitoli del video',
  suono: 'Attiva o disattiva l’audio',
  riproduci: 'Riproduci',
  pausa: 'Metti in pausa',
} as const;

/** Le otto sezioni. L'ordine e' la storia. */
export const sezioni = {
  s1: {
    titolo: 'Vecchio. Lento. Invisibile.',
    testo: 'Un sito che non rappresenta più il valore della tua azienda.',
  },
  s2: {
    titolo: 'Lo smontiamo.',
    testo: 'Pezzo per pezzo, tenendo quello che vale.',
  },
  s3: {
    titolo: 'E lo ricostruiamo meglio.',
    testo: 'Nuovo disegno, nuove funzioni, pensate per i tuoi clienti.',
  },
  s4: {
    titolo: 'Il tuo sito diventa app.',
    testo: 'La stessa esperienza, in tasca ai tuoi clienti.',
  },
  s5: {
    titolo: 'Vuole viverlo.',
    testo: 'Oggi il tuo cliente non vuole solo visitare il tuo sito.',
    didascalie: ['Home', 'Prenota', 'Ordini', 'Assistente', 'Confermato'],
    conversazione: [
      'Come posso aiutarti oggi?',
      'Vorrei spostare l’appuntamento',
      'Fatto: spostato a giovedì 14:30.',
    ],
  },
  s6: {
    titolo: 'Cosa facciamo',
    voci: [
      {
        nome: 'Siti web nuovi',
        testo: 'Dalla strategia alla pubblicazione, su misura e senza temi comprati.',
      },
      {
        nome: 'Restyling di siti esistenti',
        testo: 'Teniamo quello che funziona e rifacciamo il resto. Le posizioni sui motori non si perdono.',
        confronto: true,
      },
      {
        nome: 'App mobile',
        testo: 'Il tuo sito in tasca ai tuoi clienti, con notifiche e prenotazioni.',
      },
      {
        nome: 'Servizi web con AI',
        testo: 'Assistenti che rispondono, prenotano e ordinano al posto tuo.',
      },
    ],
    prima: 'prima',
    dopo: 'dopo',
  },
  s7: {
    titolo: 'Come lavoriamo',
    tappe: [
      { nome: 'Analisi', testo: 'Guardiamo cosa avete e cosa vi frena.' },
      { nome: 'Progetto', testo: 'Struttura, testi e disegno, prima del codice.' },
      { nome: 'Sviluppo', testo: 'Costruzione, prove, misure.' },
      { nome: 'Lancio', testo: 'Pubblicazione e assistenza dedicata.' },
    ],
  },
  s8: {
    claim: meta.claim,
    modulo: {
      nome: 'Nome',
      email: 'Email',
      messaggio: 'Messaggio',
      consenso: 'Ho letto l’informativa privacy e acconsento al trattamento dei dati.',
      invia: 'Invia richiesta',
      inCorso: 'Invio in corso…',
      inviato: 'Richiesta inviata. Ti rispondiamo entro 24 ore lavorative.',
      erroreNome: 'Scrivi il tuo nome.',
      erroreEmail: 'Controlla l’indirizzo email: manca la chiocciola o il dominio.',
      erroreMessaggio: 'Scrivi due righe su cosa ti serve.',
      erroreConsenso: 'Serve il consenso per poterti rispondere.',
      erroreInvio: 'Non siamo riusciti a inviare. Riprova, oppure scrivici direttamente.',
    },
  },
} as const;

export const contatti = {
  titolo: 'Parliamone',
  testo: 'Raccontaci cosa vuoi costruire. Rispondiamo entro 24 ore lavorative.',
  email: tbd('EMAIL', 'contenuto'),
  telefono: tbd('TELEFONO', 'contenuto'),
  whatsapp: tbd('WHATSAPP', 'contenuto'),
  zona: tbd('ZONA', 'contenuto'),
  vaiAlModulo: 'Oppure scrivici dal modulo',
} as const;

export const piede = {
  ragioneSociale: tbd('RAGIONE_SOCIALE', 'legale'),
  piva: tbd('PIVA', 'legale'),
  privacy: 'Privacy',
  cookie: 'Cookie',
  anno: '© 2026',
} as const;
