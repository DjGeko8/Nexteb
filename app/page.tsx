'use client';

/**
 * La pagina. Una sola, un racconto solo.
 *
 * L'architettura e' "il telaio": un rettangolo nasce nella hero e non viene
 * mai distrutto — cambia contenuto, proporzioni e distanza fino a diventare il
 * modulo di contatto. Per questo il palco e' `position: fixed` e non serve
 * nessun pin di ScrollTrigger: niente si aggancia perche' niente si e' mai
 * sganciato.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Luce } from '@/components/brand/Luce';
import { Testata } from '@/components/layout/Testata';
import { PannelloContatti } from '@/components/layout/PannelloContatti';
import { Preloader } from '@/components/layout/Preloader';
import { Palco } from '@/components/palco/Palco';
import { Sovrimpressione } from '@/components/hero/Sovrimpressione';
import { Sezioni } from '@/components/sections/Sezioni';
import { avviaScorrimento } from '@/lib/lenis';
import { caricaPlugin } from '@/lib/gsap';
import { SEZIONI, fin, type IdSezione } from '@/lib/racconto';
import { eroe } from '@/content/it';

export default function Pagina() {
  const video = useRef<HTMLVideoElement>(null);
  const [pronto, setPronto] = useState(false);
  const [contatti, setContatti] = useState(false);
  const [tempoVideo, setTempoVideo] = useState(0);
  const [inHero, setInHero] = useState(true);

  useEffect(() => avviaScorrimento(), []);

  /**
   * Le sezioni avvisano qui. L'unico stato di React che dipende dallo scroll e'
   * `inHero`, e cambia due volte in tutta la pagina: tutto il resto passa dal
   * palco, che scrive sul DOM senza far ridisegnare l'albero.
   */
  const suSezione = useCallback((id: IdSezione, p: number) => {
    setInHero(id === 'hero' && p < 0.55);
  }, []);

  /* La linea del metodo e le sue tappe: l'unica animazione fuori dal palco. */
  useEffect(() => {
    let vivo = true;
    const disfa: Array<() => void> = [];

    caricaPlugin().then(({ ScrollTrigger }) => {
      if (!vivo) return;
      const sez = document.querySelector<HTMLElement>('[data-sezione="s7"]');
      const linea = sez?.querySelector<SVGLineElement>('.linea-svg line');
      const tappe = Array.from(sez?.querySelectorAll<HTMLElement>('.tappa') ?? []);
      if (!sez || !linea) return;

      const st = ScrollTrigger.create({
        trigger: sez,
        start: 'top 75%',
        end: 'bottom 70%',
        scrub: true,
        onUpdate: (self) => {
          const q = fin(self.progress, 0.05, 0.8);
          linea.style.setProperty('--dis', q.toFixed(3));
          tappe.forEach((t, i) => {
            t.dataset.on = q > (i + 0.25) / tappe.length ? 'si' : 'no';
          });
        },
      });
      disfa.push(() => st.kill());
    });

    return () => {
      vivo = false;
      disfa.forEach((f) => f());
    };
  }, []);

  const apriContatti = useCallback(() => setContatti(true), []);
  const chiudiContatti = useCallback(() => setContatti(false), []);

  return (
    <>
      <Luce />
      <Preloader video={video} onFinito={() => setPronto(true)} />
      <Testata visibile={pronto} onContatti={apriContatti} contattiAperti={contatti} />
      <PannelloContatti aperto={contatti} onChiudi={chiudiContatti} />

      <Palco videoRef={video} pronto={pronto} onTempo={setTempoVideo} onSezione={suSezione} />

      {/* I titoli stanno sotto il telaio, sempre nello stesso punto: cosi'
          l'occhio ha un posto solo dove cercare la parola, per tutta la pagina. */}
      <div className="titoli" aria-hidden="true">
        <Sovrimpressione tempo={tempoVideo} visibile={pronto && inHero} />
      </div>

      <main id="contenuto">
        {/* La corsa della hero: il video sta fermo, questo e' il suo tempo. */}
        <section
          className="corsa"
          data-sezione="hero"
          style={{ height: `${SEZIONI[0].vh}vh` }}
          aria-label="Apertura"
        />

        <Sezioni onContatti={apriContatti} />

        <p className="invito-scorri" data-visibile={inHero && pronto ? 'si' : 'no'}>
          {eroe.scorri}
        </p>
      </main>
    </>
  );
}
