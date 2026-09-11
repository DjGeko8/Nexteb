'use client';

/**
 * Una o due parole per capitolo, sotto il telaio.
 *
 * Stanno FUORI dal riquadro per due ragioni: dal secondo 28,3 il filmato porta
 * il testo impresso dentro e si scontrerebbero, e perche' i titoli delle
 * sezioni compaiono nello stesso punto — cosi' l'occhio ha un posto solo dove
 * cercare la parola, per tutta la pagina.
 *
 * Le lettere entrano sfalsate e si sollevano sotto il puntatore.
 */

import { useEffect, useRef, useState } from 'react';
import { hero, sovrimpressioneFinoA } from '@/config/hero';

type Props = { tempo: number; visibile: boolean };

export function Sovrimpressione({ tempo, visibile }: Props) {
  const rif = useRef<HTMLParagraphElement>(null);
  const [finePunt, setFinePunt] = useState(false);

  useEffect(() => {
    setFinePunt(
      matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);

  const indice = hero.capitoli.findIndex((c) => tempo >= c.da && tempo < c.a);
  const capitolo = hero.capitoli[indice < 0 ? 0 : indice];
  const testo = tempo < sovrimpressioneFinoA ? (capitolo?.titolo ?? '') : '';

  // le lettere si sollevano sotto il puntatore, a onda
  const muovi = (e: React.PointerEvent<HTMLParagraphElement>) => {
    if (!finePunt) return;
    const lettere = rif.current?.querySelectorAll<HTMLElement>('.lettera');
    if (!lettere) return;
    for (const l of lettere) {
      const r = l.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const su = Math.max(0, 1 - d / 110);
      l.style.setProperty('--onda', `${(-su * 7).toFixed(1)}px`);
    }
  };

  const esci = () => {
    rif.current?.querySelectorAll<HTMLElement>('.lettera').forEach((l) => {
      l.style.setProperty('--onda', '0px');
    });
  };

  if (!testo || !visibile) return null;

  return (
    <p
      ref={rif}
      className="sovrimpressione"
      key={testo}
      onPointerMove={muovi}
      onPointerLeave={esci}
    >
      {[...testo].map((ch, i) =>
        ch === ' ' ? (
          <span key={`${ch}-${i}`}> </span>
        ) : (
          <span
            key={`${ch}-${i}`}
            className="lettera"
            style={{ '--i': i } as React.CSSProperties}
          >
            {ch}
          </span>
        ),
      )}
    </p>
  );
}
