#!/usr/bin/env node
/**
 * build-campionario.mjs — compila nexteb per vivere dentro il campionario.
 *
 *   npm run build:campionario
 *
 * Differenza dalla build normale: `basePath` vale `/siti/nexteb`, perche' li'
 * il sito non sta alla radice del dominio ma in una sottocartella.
 *
 * Il risultato NON resta in `out/`. Next scrive sempre li' e non si puo'
 * cambiare da configurazione, quindi a fine compilazione la cartella viene
 * spostata in `out-campionario/`. Cosi' `out/` non contiene mai una versione
 * con basePath: se restasse, un `wrangler deploy` successivo pubblicherebbe sul
 * dominio vero un sito che cerca le proprie risorse sotto /siti/nexteb/ — cioe'
 * una pagina bianca, scoperta dal cliente e non da noi.
 */

import { execFileSync } from 'node:child_process';
import { rmSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '/siti/nexteb';

const out = join(RADICE, 'out');
const destinazione = join(RADICE, 'out-campionario');

// Una `out/` rimasta da una compilazione normale verrebbe scambiata per il
// risultato di questa: si toglie prima, non dopo.
rmSync(out, { recursive: true, force: true });
rmSync(destinazione, { recursive: true, force: true });

console.log(`\n  nexteb -> campionario  (basePath ${BASE})\n`);

// Si chiama il binario di Next con questo stesso Node, non `npm run build`.
// Da Node 20 `execFileSync` rifiuta di lanciare un `.cmd` senza `shell: true`
// (EINVAL), e passare per la shell su Windows vorrebbe dire far riquotare gli
// argomenti a cmd.exe. Il binario e' un file .js: Node lo esegue e basta.
//
// `--webpack` non e' una preferenza: Turbopack va in OOM sulle macchine con
// poca RAM, ed e' il motivo per cui anche `npm run build` lo passa.
execFileSync(process.execPath, [join(RADICE, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build', '--webpack'], {
  cwd: RADICE,
  stdio: 'inherit',
  env: { ...process.env, NEXT_BASE_PATH: BASE },
});

if (!existsSync(out)) {
  console.error('\n  La compilazione non ha prodotto out/. Niente da spostare.\n');
  process.exit(1);
}

renameSync(out, destinazione);

console.log(`\n  Fatto: out-campionario/ pronta.`);
console.log(`  out/ e' stata svuotata di proposito — per il deploy vero, npm run build.\n`);
