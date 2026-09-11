'use client';

/**
 * I plugin di GSAP, in un pezzo a parte.
 *
 * Stanno qui e non in lib/gsap.ts per una ragione misurata: importarli dove si
 * importa il ticker li faceva finire nel carico INIZIALE della pagina — 31 KB
 * gzip per quattro plugin che la hero non usa nemmeno. Servono alle sezioni,
 * che stanno sotto la piega: si caricano quando si arriva.
 *
 * Dalla 3.13 sono tutti gratuiti e arrivano nel pacchetto npm: nessuna licenza,
 * nessun CDN, nessuna terza parte al primo caricamento.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { collegaScrollTrigger } from './lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip);

// Lo scorrimento morbido e ScrollTrigger devono leggere la stessa posizione:
// il collegamento si fa ora, non prima, perche' prima ScrollTrigger non c'era.
collegaScrollTrigger(ScrollTrigger);

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip };
