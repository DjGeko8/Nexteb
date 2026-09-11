'use client';

/**
 * La sorgente di luce. Una sola per tutto il documento.
 *
 * Nel genere, ogni elemento metallico ha il suo gradiente con la sua
 * angolazione, decisa a caso: il risultato si legge come decorazione. Qui la
 * luce ha una posizione, e ogni superficie calcola il riflesso dalla propria
 * posizione rispetto a quella.
 *
 * Il puntatore non comanda il riflesso: SPOSTA la sorgente, e di poco. E' la
 * differenza fra un effetto e un materiale — e costa una custom property
 * aggiornata in un solo requestAnimationFrame, non uno per elemento.
 */

import { useEffect, useRef } from 'react';

export function Luce() {
  const alone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePunt = matchMedia('(hover: hover) and (pointer: fine)');
    const ridotto = matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePunt.matches || ridotto.matches) return;

    const radice = document.documentElement;
    let x = 50;
    let obiettivo = 50;
    let raf = 0;

    const passo = () => {
      x += (obiettivo - x) * 0.09;
      radice.style.setProperty('--sheen-x', `${x.toFixed(2)}%`);
      raf = Math.abs(obiettivo - x) > 0.05 ? requestAnimationFrame(passo) : 0;
    };

    const muovi = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      // la sorgente si muove in una fascia stretta: non insegue, accompagna
      obiettivo = 35 + (e.clientX / innerWidth) * 30;
      radice.style.setProperty('--luce-x', `${((e.clientX / innerWidth) * 100).toFixed(1)}%`);
      radice.style.setProperty('--luce-y', `${((e.clientY / innerHeight) * 100).toFixed(1)}%`);
      alone.current?.style.setProperty('--alone', '1');
      if (!raf) raf = requestAnimationFrame(passo);
    };

    const esci = () => alone.current?.style.setProperty('--alone', '0');

    addEventListener('pointermove', muovi, { passive: true });
    document.addEventListener('pointerleave', esci);
    return () => {
      removeEventListener('pointermove', muovi);
      document.removeEventListener('pointerleave', esci);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="alone" ref={alone} aria-hidden="true" />;
}
