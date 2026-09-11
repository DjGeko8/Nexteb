#!/usr/bin/env node
/**
 * verifica-movimento — il cancello del vocabolario del movimento.
 *
 * Copialo in scripts/ del progetto e aggiungilo a `npm run verifica`.
 * Nessuna dipendenza. Esce con 1 se trova un errore, 0 se trova solo avvisi.
 *
 *   node scripts/verifica-movimento.mjs [cartella] [--avvisi] [--json]
 *
 * Perché esiste: la disciplina delle tre durate e tre curve decade al terzo
 * intervento, e decade in silenzio — nessuno se ne accorge finché il sito non
 * si muove più «con una mano sola». Un controllo che si può fare solo aprendo
 * il sito e guardando non viene fatto quasi mai.
 *
 * Per una riga che deve derogare, scrivi un commento «movimento-ok: <motivo>»
 * nella riga sopra (o sulla riga stessa).
 * Il motivo è obbligatorio: una deroga senza spiegazione è una svista.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const RADICE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.';
const MOSTRA_AVVISI = !process.argv.includes('--solo-errori');
const JSON_OUT = process.argv.includes('--json');

const ESTENSIONI = new Set(['.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.html', '.astro', '.vue', '.svelte']);
const SALTA = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', 'coverage', '.astro', '.vercel', '.wrangler', 'legacy', '_legacy']);

/** File che SONO la fonte dei token: lì i valori grezzi sono legittimi. */
const FONTI_TOKEN = /(design-tokens|tokens\.generated|tailwind\.config|theme\.(c|sc|le)ss|variabili|fondamenta\.css)/i;

const trovati = [];

function segnala(gravita, file, riga, testo, regola, spiegazione) {
  trovati.push({ gravita, file, riga, testo: testo.trim().slice(0, 110), regola, spiegazione });
}

function cammina(dir) {
  let voci;
  try { voci = readdirSync(dir); } catch { return; }
  for (const v of voci) {
    if (SALTA.has(v) || v.startsWith('.') && v !== '.claude') continue;
    const p = join(dir, v);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) cammina(p);
    else if (ESTENSIONI.has(extname(v))) esamina(p);
  }
}

function esamina(percorso) {
  const rel = relative(RADICE, percorso) || percorso;
  const eFonteToken = FONTI_TOKEN.test(rel);
  let righe;
  try { righe = readFileSync(percorso, 'utf8').split(/\r?\n/); } catch { return; }

  let dentroCoarse = false;
  let graffeCoarse = 0;
  let dentroRidotto = false;
  let graffeRidotto = 0;
  let dentroCommento = false;

  for (let i = 0; i < righe.length; i++) {
    const grezza = righe[i];
    const n = i + 1;

    // I commenti sono prosa: analizzarli produce falsi positivi su ogni riga
    // che SPIEGA una regola (es. «100dvw e non 100vw»).
    let r = grezza;
    if (dentroCommento) {
      const fine = r.indexOf('*/');
      if (fine === -1) { r = ''; } else { r = r.slice(fine + 2); dentroCommento = false; }
    }
    r = r.replace(/\/\*[^]*?\*\//g, ' ');
    const apre = r.indexOf('/*');
    if (apre !== -1) { r = r.slice(0, apre); dentroCommento = true; }
    r = r.replace(/(^|[^:])\/\/.*$/, '$1');

    const precedente = i > 0 ? righe[i - 1] : '';
    // La deroga puo' stare su piu' righe: un motivo serio raramente ci sta in
    // una riga sola. Si guarda indietro fino a otto righe.
    const finestraDeroga = righe.slice(Math.max(0, i - 8), i + 1).join(String.fromCharCode(10));
    const derogata = /movimento-ok\s*:\s*\S/.test(finestraDeroga);

    // traccia il blocco @media (pointer: coarse), dove i 16px sono ammessi
    if (/@media[^{]*pointer\s*:\s*coarse/.test(r)) { dentroCoarse = true; graffeCoarse = 0; }
    if (dentroCoarse) {
      graffeCoarse += (r.match(/\{/g) || []).length - (r.match(/\}/g) || []).length;
      if (graffeCoarse <= 0 && /\}/.test(r)) dentroCoarse = false;
    }

    // traccia il ramo a movimento ridotto, dove .01ms è la forma prescritta
    if (/@media[^{]*prefers-reduced-motion\s*:\s*reduce/.test(r)) { dentroRidotto = true; graffeRidotto = 0; }
    if (dentroRidotto) {
      graffeRidotto += (r.match(/\{/g) || []).length - (r.match(/\}/g) || []).length;
      if (graffeRidotto <= 0 && /\}/.test(r)) dentroRidotto = false;
    }

    if (derogata) continue;

    // ── 1. durata scritta a mano dentro transition / animation ────────────────
    // Cerca un tempo che NON sia dentro una var(--durata-…) o var(--t…)
    if (!eFonteToken && !dentroRidotto && /\b(transition|animation)(-duration|-delay)?\s*:/.test(r)) {
      const senzaVar = r.replace(/var\(\s*--[\w-]+\s*(,[^)]*)?\)/g, 'VAR');
      const tempi = senzaVar.match(/(?<![\w.-])\d*\.?\d+\s*m?s\b/g) || [];
      const nonZero = tempi.filter((t) =>
        !/^0*\.?0+\s*m?s$/.test(t) &&        // 0s, 0ms, 0.0s
        !/^0*\.0*1\s*ms$/.test(t));          // .01ms — la forma prescritta per il ramo ridotto
      if (nonZero.length) {
        segnala('errore', rel, n, grezza, 'durata a mano',
          `${nonZero.join(', ')} — usa --durata-micro | --durata-componente | --durata-ingresso`);
      }
      const curve = senzaVar.match(/cubic-bezier\([^)]*\)|\b(ease-in-out|ease-in|ease-out|ease)\b(?!-)/g) || [];
      if (curve.length) {
        segnala('errore', rel, n, grezza, 'curva a mano',
          `${curve.join(', ')} — usa --ease-entrata | --ease-uscita | --ease-stato`);
      }
    }

    // ── 1b. durate e curve come utility Tailwind ─────────────────────────────
    // In un progetto Tailwind il vocabolario si aggira dalle classi, non dal CSS.
    if (/class(Name)?\s*=/.test(r) || /class(Name)?:/.test(r)) {
      const util = r.match(/(duration|delay)-\[?[\d.]+m?s?\]?/g) || [];
      const arbitrarie = util.filter((u) => !/-\[var\(/.test(u));
      if (arbitrarie.length) {
        segnala('avviso', rel, n, grezza, 'durata Tailwind a mano',
          `${[...new Set(arbitrarie)].join(', ')} — definisci le tre durate in tailwind.config e usa quelle utility`);
      }
      const curveU = r.match(/ease-(linear|in|out|in-out)/g) || [];
      if (curveU.length) {
        segnala('avviso', rel, n, grezza, 'curva Tailwind a mano',
          `${[...new Set(curveU)].join(', ')} — definisci --ease-entrata/uscita/stato e usa quelle`);
      }
    }

    // ── 2. transition: none nel ramo a movimento ridotto ─────────────────────
    if (/transition\s*:\s*none/.test(r)) {
      segnala('errore', rel, n, grezza, 'transition:none',
        'azzera con transition-duration: .01ms, o `transitionend` non spara più e le logiche appese alla fine si rompono in silenzio');
    }

    // ── 3. 100vw ─────────────────────────────────────────────────────────────
    if (/\b100vw\b/.test(r)) {
      segnala('errore', rel, n, grezza, '100vw',
        'include la barra di scorrimento: su Windows produce overflow orizzontale. Usa 100dvw con scrollbar-gutter: stable');
    }

    // ── 4. campi sotto i 16px ────────────────────────────────────────────────
    if (/font-size\s*:\s*(1[0-5]|[0-9])(\.\d+)?px/.test(r) && /input|select|textarea|campo|field/i.test(r + precedente)) {
      segnala('errore', rel, n, grezza, 'campo sotto 16px',
        'iOS ingrandisce la pagina a ogni tocco del campo');
    }

    // ── 5. animation-timeline senza guardia ──────────────────────────────────
    if (/animation-timeline\s*:/.test(r) && !/@supports/.test(r)) {
      const contesto = righe.slice(Math.max(0, i - 25), i).join('\n');
      if (!/@supports[^{]*animation-timeline/.test(contesto)) {
        segnala('errore', rel, n, grezza, 'animation-timeline senza @supports',
          'dove non è supportata la dichiarazione cade e l\'animazione riparte sulla timeline del documento: l\'effetto risulta già finito al caricamento');
      }
    }

    // ── 6. will-change permanente ────────────────────────────────────────────
    if (/will-change\s*:/.test(r) && !/\bnone\b/.test(r)) {
      const sel = righe.slice(Math.max(0, i - 6), i + 1).join(' ');
      const inStato = /:hover|:focus|:active|\.is-|\[aria-|\[data-|\.aperto|\.open/.test(sel);
      if (!inStato) {
        segnala('avviso', rel, n, grezza, 'will-change permanente',
          'dichiaralo solo dentro la regola dello stato attivo e fallo sparire con esso: è memoria video occupata a vuoto');
      }
    }

    // ── 7. opacity:0 come stato iniziale senza guardia html.js ───────────────
    if (/opacity\s*:\s*0\s*[;}]/.test(r) && /\.(rivela|entra|reveal|fade|appare)/i.test(righe.slice(Math.max(0, i - 4), i + 1).join(' '))) {
      const contesto = righe.slice(Math.max(0, i - 6), i + 1).join('\n');
      if (!/html\.js|\.js\s|\[data-js/.test(contesto)) {
        segnala('errore', rel, n, grezza, 'contenuto invisibile senza JS',
          'lo stato nascosto va sotto una classe che solo il JavaScript può mettere (html.js), o senza JS il contenuto non esiste');
      }
    }

    // ── 8. hover senza cancello sul puntatore ────────────────────────────────
    if (/:hover\b/.test(r) && /(opacity|display|visibility)\s*:/.test(r)) {
      const contesto = righe.slice(Math.max(0, i - 30), i).join('\n');
      if (!/@media[^{]*hover\s*:\s*hover/.test(contesto)) {
        segnala('avviso', rel, n, grezza, 'hover senza (hover:hover)',
          'su schermo tattile lo stato resta attaccato dopo il tocco');
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
cammina(RADICE);

const errori = trovati.filter((t) => t.gravita === 'errore');
const avvisi = trovati.filter((t) => t.gravita === 'avviso');

if (JSON_OUT) {
  console.log(JSON.stringify({ errori, avvisi }, null, 2));
  process.exit(errori.length ? 1 : 0);
}

const perRegola = (elenco) => {
  const m = new Map();
  for (const t of elenco) (m.get(t.regola) ?? m.set(t.regola, []).get(t.regola)).push(t);
  return m;
};

function stampa(titolo, elenco) {
  if (!elenco.length) return;
  console.log(`\n${titolo}\n`);
  for (const [regola, voci] of perRegola(elenco)) {
    console.log(`  ${regola}  (${voci.length})`);
    console.log(`    ${voci[0].spiegazione}`);
    for (const v of voci.slice(0, 12)) console.log(`      ${v.file}:${v.riga}  ${v.testo}`);
    if (voci.length > 12) console.log(`      …e altre ${voci.length - 12}`);
    console.log('');
  }
}

stampa('ERRORI', errori);
if (MOSTRA_AVVISI) stampa('AVVISI', avvisi);

if (!trovati.length) {
  console.log('verifica-movimento: nessun rilievo.');
} else {
  console.log(`verifica-movimento: ${errori.length} errori, ${avvisi.length} avvisi.`);
  console.log('Per una deroga legittima scrivi sopra la riga:  /* movimento-ok: <motivo> */');
}

process.exit(errori.length ? 1 : 0);
