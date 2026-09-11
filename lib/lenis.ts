'use client';

/**
 * Scorrimento morbido, con i presidi.
 *
 * La dottrina interna scarta le librerie di smooth-scroll: girano a 60-120 Hz
 * per tutta l'inerzia anche a input fermo e tolgono all'utente il controllo di
 * un gesto che il sistema operativo gia' gestisce, comprese le preferenze di
 * accessibilita' che ha impostato.
 *
 * Qui e' ammesso perche' il pubblico e' chi valuta uno studio e il sito E' il
 * portfolio — ma con tre condizioni, che sono il motivo per cui esiste questo
 * file invece di tre righe in un componente:
 *
 *   1. spento del tutto sotto prefers-reduced-motion, e riacceso in diretta se
 *      la preferenza cambia mentre il sito e' aperto;
 *   2. spento su puntatore grossolano: sul telefono lo scorrimento nativo e'
 *      migliore, e l'inerzia doppia si sente;
 *   3. un solo ticker, quello di GSAP, mai un secondo requestAnimationFrame.
 *
 * Importa SOLO il nucleo di GSAP: tirarsi dietro i plugin da qui li faceva
 * finire nel carico iniziale della pagina.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';

type ConUpdate = { update: () => void };

let lenis: Lenis | null = null;
let mqRidotto: MediaQueryList | null = null;
let staccaTicker: (() => void) | null = null;
let scrollTrigger: ConUpdate | null = null;

function puoScorrereMorbido() {
  if (typeof window === 'undefined') return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (matchMedia('(pointer: coarse)').matches) return false;
  return true;
}

function accendi() {
  if (lenis) return;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // il tocco resta nativo: l'inerzia del sistema e' gia' quella giusta
    syncTouch: false,
  });

  if (scrollTrigger) lenis.on('scroll', scrollTrigger.update);

  const tick = (tempo: number) => lenis?.raf(tempo * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  staccaTicker = () => gsap.ticker.remove(tick);
}

function spegni() {
  staccaTicker?.();
  staccaTicker = null;
  lenis?.destroy();
  lenis = null;
}

/**
 * Lo chiama lib/plugin.ts quando ScrollTrigger arriva davvero: prima non
 * esisteva, e collegarlo in anticipo significherebbe caricarlo in anticipo.
 */
export function collegaScrollTrigger(st: ConUpdate) {
  scrollTrigger = st;
  lenis?.on('scroll', st.update);
}

export function avviaScorrimento() {
  if (typeof window === 'undefined') return () => {};

  if (puoScorrereMorbido()) accendi();

  // La preferenza si ASCOLTA, non si legge una volta: chi la cambia mentre il
  // sito e' aperto deve vederlo calmarsi senza ricaricare.
  mqRidotto = matchMedia('(prefers-reduced-motion: reduce)');
  const alCambio = () => (puoScorrereMorbido() ? accendi() : spegni());
  mqRidotto.addEventListener('change', alCambio);

  return () => {
    mqRidotto?.removeEventListener('change', alCambio);
    spegni();
  };
}

/** Porta in cima. Usata dal marchio nella testata. */
export function vaiInCima() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.1 });
    return;
  }
  scrollTo({
    top: 0,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

/** Ferma lo scorrimento mentre un pannello e' aperto, e lo restituisce dopo. */
export function bloccaScorrimento(attivo: boolean) {
  if (attivo) lenis?.stop();
  else lenis?.start();
}
