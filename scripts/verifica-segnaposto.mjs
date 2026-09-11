#!/usr/bin/env node
/**
 * Cancello dei dati che il cliente non ha ancora dato.
 * Esce con 1 finche' resta un segnaposto di gravita' "legale".
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SALTA = new Set(['node_modules', '.next', '.git', 'out', 'public', 'assets-in', 'scripts']);
const trovati = [];

function cammina(dir) {
  for (const v of readdirSync(dir)) {
    if (SALTA.has(v) || v.startsWith('.')) continue;
    const p = join(dir, v);
    if (statSync(p).isDirectory()) cammina(p);
    else if (['.ts', '.tsx'].includes(extname(v))) esamina(p);
  }
}

function esamina(p) {
  const righe = readFileSync(p, 'utf8').split(/\r?\n/);
  righe.forEach((r, i) => {
    const m = r.match(/tbd\(\s*'([^']+)'\s*(?:,\s*'(legale|contenuto)')?/);
    if (m) trovati.push({ file: p, riga: i + 1, id: m[1], gravita: m[2] ?? 'contenuto' });
  });
}

cammina('.');
const legali = trovati.filter((t) => t.gravita === 'legale');

if (!trovati.length) {
  console.log('verifica-segnaposto: nessun segnaposto. Si puo' + String.fromCharCode(39) + ' pubblicare.');
  process.exit(0);
}

console.log('\nSEGNAPOSTI APERTI\n');
for (const t of trovati) {
  console.log(`  ${t.gravita === 'legale' ? '[BLOCCANTE]' : '[contenuto] '} ${t.id.padEnd(18)} ${t.file}:${t.riga}`);
}
console.log('');
if (legali.length) {
  console.log(`verifica-segnaposto: ${legali.length} dati obbligatori mancanti. Non si pubblica.`);
  process.exit(1);
}
console.log('verifica-segnaposto: nessun dato obbligatorio manca.');
process.exit(0);
