'use client';

/**
 * La testata: tre colonne, trasparente in ogni stato.
 *
 * A sinistra il vuoto, al centro il marchio, a destra "Contatti". Niente menu,
 * niente hamburger, niente sfondo pieno: dove la leggibilita' cala ci pensa
 * un'ombra del testo, non un pannello.
 *
 * Non si ritira allo scorrimento: su un sito che e' un racconto continuo la
 * testata e' l'unico punto fermo, e toglierla fa perdere l'orientamento.
 */

import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { testata } from '@/content/it';
import { vaiInCima } from '@/lib/lenis';

type Props = {
  /** nascosta finche' il preloader non ha finito la sua uscita */
  visibile: boolean;
  onContatti: () => void;
  contattiAperti: boolean;
};

export function Testata({ visibile, onContatti, contattiAperti }: Props) {
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (!visibile) return;
    document.documentElement.style.setProperty(
      '--intro-volo',
      matchMedia('(max-width: 767px)').matches ? '320ms' : '420ms',
    );
    const t = requestAnimationFrame(() => setIntro(true));
    return () => cancelAnimationFrame(t);
  }, [visibile]);

  return (
    <header
      className="testata"
      data-intro={intro ? 'in' : undefined}
      data-visibile={visibile ? 'si' : 'no'}
    >
      {/* La colonna di sinistra resta vuota di proposito: e' cio' che tiene il
          marchio esattamente al centro senza compensazioni a mano. */}
      <span aria-hidden="true" />

      <button
        type="button"
        className="testata-marchio entra"
        style={{ '--passo': 1 } as React.CSSProperties}
        onClick={vaiInCima}
        aria-label="Torna in cima"
      >
        <Logo id="marchio-testata" />
      </button>

      <button
        type="button"
        className="testata-contatti entra"
        style={{ '--passo': 2 } as React.CSSProperties}
        onClick={onContatti}
        aria-expanded={contattiAperti}
        aria-controls="pannello-contatti"
      >
        {testata.contatti}
      </button>
    </header>
  );
}
