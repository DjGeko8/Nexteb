'use client';

/**
 * Il preloader.
 *
 * La dottrina interna lo scarta: su un sito di clienti un velo che ritarda il
 * contenuto danneggia indicizzazione e conversione. Qui e' ammesso perche' il
 * contenuto della hero E' un video da sei megabyte, e perche' rispetta quattro
 * condizioni che lo rendono onesto invece che teatrale:
 *
 *  1. NON compare se il video e' gia' pronto entro 300 ms;
 *  2. la barra segue il buffering reale (video.buffered), non un timer finto;
 *  3. si toglie comunque dopo 8 s, qualunque cosa succeda;
 *  4. e — il presidio che manca a tutti — il velo si toglie da solo anche se
 *     il JavaScript non parte MAI, con un'animazione CSS di sicurezza. Un
 *     preloader che puo' restare nero per sempre e' il difetto piu' grave che
 *     si possa spedire, e nel sito d'autore da cui viene questa idea e'
 *     esattamente cosa succede: schermo nero su tutte e ventidue le pagine.
 */

import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { preloader as testi } from '@/content/it';

const ATTESA_MASSIMA = 8000;
const SOGLIA_SALTO = 300;

type Props = {
  video: React.RefObject<HTMLVideoElement | null>;
  onFinito: () => void;
};

export function Preloader({ video, onFinito }: Props) {
  const [attivo, setAttivo] = useState<boolean | null>(null);
  const [uscita, setUscita] = useState(false);
  const [avanz, setAvanz] = useState(0);
  const segno = useRef<SVGPathElement>(null);
  const finito = useRef(false);

  // 1 · decidere se serve. Se il video e' gia' pronto, il preloader non esiste.
  useEffect(() => {
    const t = setTimeout(() => {
      const v = video.current;
      setAttivo(!(v && v.readyState >= 3));
    }, SOGLIA_SALTO);
    return () => clearTimeout(t);
  }, [video]);

  // 2 · l'avanzamento e' quello vero del buffer
  useEffect(() => {
    if (!attivo) return;
    let raf = 0;
    const leggi = () => {
      const v = video.current;
      if (v && v.duration > 0 && v.buffered.length > 0) {
        setAvanz(Math.min(1, v.buffered.end(v.buffered.length - 1) / v.duration));
      }
      raf = requestAnimationFrame(leggi);
    };
    raf = requestAnimationFrame(leggi);
    return () => cancelAnimationFrame(raf);
  }, [attivo, video]);

  // 3 · le condizioni d'uscita, piu' il tetto di sicurezza
  useEffect(() => {
    if (attivo === null) return;

    const chiudi = () => {
      if (finito.current) return;
      finito.current = true;
      setUscita(true);
      // il velo esce in 900 ms; il resto della pagina parte subito dopo
      setTimeout(onFinito, attivo ? 900 : 0);
    };

    if (!attivo) {
      chiudi();
      return;
    }

    const v = video.current;
    let pronti = 0;
    const forse = () => {
      pronti += 1;
      if (pronti >= 2) chiudi();
    };

    v?.addEventListener('canplaythrough', forse, { once: true });
    document.fonts?.ready.then(forse).catch(forse);

    const tetto = setTimeout(chiudi, ATTESA_MASSIMA);
    return () => {
      clearTimeout(tetto);
      v?.removeEventListener('canplaythrough', forse);
    };
  }, [attivo, onFinito, video]);

  if (attivo === false) return null;

  return (
    <div
      id="preloader"
      className="preloader"
      data-uscita={uscita ? 'si' : 'no'}
      role="status"
      aria-live="polite"
      aria-label={testi.etichetta}
    >
      <div className="preloader-centro">
        <Logo className="preloader-logo" segnoRef={segno} soloSegno />
        <div className="preloader-barra" aria-hidden="true">
          <i style={{ transform: `scaleX(${avanz.toFixed(3)})` }} />
        </div>
      </div>
    </div>
  );
}
