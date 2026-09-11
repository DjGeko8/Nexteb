'use client';

/**
 * Il video della hero, dentro il telaio.
 *
 * Il montaggio entra dal nero e si spegne nel nero, quindi `loop` basta e il
 * giro non ha stacco: nessun secondo elemento video, nessuna sorveglianza su
 * timeupdate. La continuita' e' risolta nel file, non con un espediente.
 *
 * Si mette in pausa da solo quando esce di scena: fuori schermo sarebbe solo
 * batteria consumata.
 *
 * La sovrimpressione NON vive qui: sta sotto il telaio, gestita dalla pagina.
 * Dentro il riquadro si scontrerebbe con il testo che il filmato porta impresso
 * dal secondo 28,3 in poi.
 */

import { useEffect, useRef, useState } from 'react';
import { hero } from '@/config/hero';
import { eroe } from '@/content/it';
import { BarraCapitoli } from './BarraCapitoli';

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** il preloader ha finito: si puo' partire */
  pronto: boolean;
  /** la pagina usa il tempo per decidere quale sovrimpressione mostrare */
  onTempo: (secondi: number) => void;
};

export function VideoHero({ videoRef, pronto, onTempo }: Props) {
  const [tempo, setTempo] = useState(0);
  const [inPausa, setInPausa] = useState(false);
  const [audio, setAudio] = useState(false);
  const avvisa = useRef(onTempo);
  avvisa.current = onTempo;

  // avanzamento: requestVideoFrameCallback dove c'e', timeupdate dove no
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    type ConRVFC = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (id: number) => void;
    };
    const vv = v as ConRVFC;
    let id = 0;
    let vivo = true;

    const aggiorna = () => {
      setTempo(v.currentTime);
      avvisa.current(v.currentTime);
    };

    if (vv.requestVideoFrameCallback) {
      const passo = () => {
        if (!vivo) return;
        aggiorna();
        id = vv.requestVideoFrameCallback!(passo);
      };
      id = vv.requestVideoFrameCallback(passo);
      return () => {
        vivo = false;
        vv.cancelVideoFrameCallback?.(id);
      };
    }

    v.addEventListener('timeupdate', aggiorna);
    return () => v.removeEventListener('timeupdate', aggiorna);
  }, [videoRef]);

  // in pausa quando esce dallo schermo: fuori campo consuma e basta
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([voce]) => {
        if (!voce) return;
        if (!voce.isIntersecting) v.pause();
        else if (!inPausa && pronto) v.play().catch(() => {});
      },
      { threshold: 0.05 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [videoRef, inPausa, pronto]);

  // parte quando il preloader ha finito, mai prima
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !pronto) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.play().catch(() => {});
  }, [pronto, videoRef]);

  const salta = (s: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = s;
  };

  const commutaPausa = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setInPausa(false);
    } else {
      v.pause();
      setInPausa(true);
    }
  };

  const commutaAudio = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setAudio(!v.muted);
  };

  return (
    <div className="hero-video">
      <video
        ref={videoRef}
        className="hero-video-el"
        poster={hero.poster}
        muted
        loop={hero.inCiclo}
        playsInline
        preload="auto"
        aria-label={`Video di presentazione: ${hero.capitoli.map((c) => c.cosa).join(', ')}`}
      >
        {hero.sorgenti.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      <BarraCapitoli tempo={tempo} onSalta={salta} visibile />

      <div className="hero-controlli" data-visibile="si">
        <button
          type="button"
          onClick={commutaPausa}
          aria-label={inPausa ? eroe.riproduci : eroe.pausa}
        >
          {inPausa ? '▶' : '❚❚'}
        </button>
        <button type="button" onClick={commutaAudio} aria-label={eroe.suono} aria-pressed={audio}>
          {audio ? 'A' : 'M'}
        </button>
      </div>
    </div>
  );
}
