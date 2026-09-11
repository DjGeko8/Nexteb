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
import { VideoHero } from '@/components/hero/VideoHero';
import { Sovrimpressione } from '@/components/hero/Sovrimpressione';
import { avviaScorrimento } from '@/lib/lenis';
import { eroe } from '@/content/it';

export default function Pagina() {
  const video = useRef<HTMLVideoElement>(null);
  const [pronto, setPronto] = useState(false);
  const [contatti, setContatti] = useState(false);
  const [uscitaHero, setUscitaHero] = useState(0);
  const [tempoVideo, setTempoVideo] = useState(0);
  const [animando, setAnimando] = useState(false);

  useEffect(() => avviaScorrimento(), []);

  // quanto siamo usciti dalla hero: 0 in cima, 1 dopo il primo schermo
  useEffect(() => {
    let fermo: ReturnType<typeof setTimeout>;

    const leggi = () => {
      // innerHeight puo' valere 0 al primo calcolo, prima che il layout esista.
      // 0/0 propaga NaN per sempre, e un NaN in un confronto e' sempre falso:
      // niente errori, niente segni a schermo, solo una cosa che non compare
      // mai. E' il difetto che costa piu' tempo a trovare, quindi la guardia
      // sta qui e non altrove.
      const alto = innerHeight || document.documentElement.clientHeight || 1;
      const quota = window.scrollY / alto;
      setUscitaHero(Number.isFinite(quota) ? Math.max(0, Math.min(1, quota)) : 0);

      // `animando` accende will-change solo mentre il telaio si muove davvero
      setAnimando(true);
      clearTimeout(fermo);
      fermo = setTimeout(() => setAnimando(false), 200);
    };

    leggi();
    addEventListener('scroll', leggi, { passive: true });
    addEventListener('resize', leggi, { passive: true });
    return () => {
      removeEventListener('scroll', leggi);
      removeEventListener('resize', leggi);
      clearTimeout(fermo);
    };
  }, []);

  // il bagliore del bottone finale insegue il puntatore dentro il bottone
  const seguiCursore = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const b = e.currentTarget;
    const r = b.getBoundingClientRect();
    const dentro = ((e.clientX - r.left) / r.width) * 100;
    b.style.setProperty('--cx', `${dentro.toFixed(1)}%`);
  }, []);

  const apriContatti = useCallback(() => setContatti(true), []);
  const chiudiContatti = useCallback(() => setContatti(false), []);

  return (
    <>
      <Luce />
      <Preloader video={video} onFinito={() => setPronto(true)} />
      <Testata visibile={pronto} onContatti={apriContatti} contattiAperti={contatti} />
      <PannelloContatti aperto={contatti} onChiudi={chiudiContatti} />

      {/* Il palco: fisso, vive per tutto il documento */}
      <div className="palco" aria-hidden="false">
        <div className="telaio-guscio" data-animando={animando ? "si" : "no"}>
          <div className="telaio">
            <VideoHero
              videoRef={video}
              uscita={uscitaHero}
              pronto={pronto}
              onTempo={setTempoVideo}
            />
          </div>
        </div>
      </div>

      {/* I titoli stanno sotto il telaio, sempre nello stesso punto: cosi'
          l'occhio ha un posto solo dove cercare la parola, per tutta la pagina. */}
      <div className="titoli" aria-hidden="true">
        <Sovrimpressione tempo={tempoVideo} visibile={pronto && uscitaHero < 0.45} />
      </div>

      <main id="contenuto">
        {/* Lo spazio di scorrimento della hero. Le sezioni arrivano qui. */}
        <section className="corsa" style={{ height: '200vh' }} aria-label="Apertura" />

        <p className="invito-scorri" data-visibile={uscitaHero < 0.1 && pronto ? 'si' : 'no'}>
          {eroe.scorri}
        </p>

        {/* Chi arriva in fondo ha finito di guardare: qui la cosa da fare e' una
            sola, e deve essere grossa e sola. Apre lo stesso pannello della
            testata, cosi' i recapiti stanno scritti in un posto solo. */}
        <section className="chiusura" aria-label={eroe.contattaci}>
          <button
            type="button"
            className="bottone-grande"
            onClick={apriContatti}
            onPointerMove={seguiCursore}
          >
            {eroe.contattaci}
          </button>
        </section>
      </main>
    </>
  );
}
