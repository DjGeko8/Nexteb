'use client';

/**
 * Sei segmenti sottili che si riempiono col tempo del video.
 * Cliccando un segmento si salta al capitolo; passandoci sopra si legge cosa
 * contiene. Ogni segmento e' un <button> vero: raggiungibile con Tab.
 */

import { useState } from 'react';
import { hero } from '@/config/hero';
import { eroe } from '@/content/it';

type Props = {
  /** secondo corrente del video */
  tempo: number;
  onSalta: (secondo: number) => void;
  visibile: boolean;
};

export function BarraCapitoli({ tempo, onSalta, visibile }: Props) {
  const [sopra, setSopra] = useState<number | null>(null);

  return (
    <div
      className="barra-capitoli"
      data-visibile={visibile ? 'si' : 'no'}
      role="group"
      aria-label={eroe.ariaBarra}
    >
      {hero.capitoli.map((c, i) => {
        const durata = c.a - c.da;
        const p = Math.max(0, Math.min(1, (tempo - c.da) / durata));
        return (
          <button
            key={c.cosa}
            type="button"
            style={{ '--p': p.toFixed(3) } as React.CSSProperties}
            onClick={() => onSalta(c.da + 0.05)}
            onPointerEnter={() => setSopra(i)}
            onPointerLeave={() => setSopra((s) => (s === i ? null : s))}
            aria-label={`Capitolo ${i + 1}: ${c.cosa}`}
          >
            <span className="barra-etichetta" data-on={sopra === i ? 'si' : 'no'}>
              {c.cosa}
            </span>
          </button>
        );
      })}
    </div>
  );
}
