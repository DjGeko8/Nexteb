'use client';

/**
 * Il marchio. Segnaposto, sostituibile con quello definitivo toccando SOLO
 * questo file: il resto del sito importa <Logo /> e non sa com'e' fatto.
 *
 * La parola e' testo vero in Archivo, con la N nel colore d'accento: un
 * wordmark in <path> non si potrebbe selezionare ne' leggere.
 *
 * Il segno a parte esiste solo per il preloader, che lo disegna con DrawSVG.
 * NON va messo accanto alla parola: il segno E' una N, e affiancato a "Nexteb"
 * si legge "N Nexteb". Per questo `soloSegno` e' esplicito e la forma normale
 * del marchio e' la sola parola.
 *
 * La b e' minuscola, come nel filmato: "Nexteb".
 */

import { marchio } from '@/content/it';

type Props = {
  className?: string;
  /** riferimento al tracciato, per l'animazione di disegno del preloader */
  segnoRef?: React.Ref<SVGPathElement>;
  /** solo il segno disegnabile, senza la parola. Usato dal preloader. */
  soloSegno?: boolean;
  id?: string;
};

export function Logo({ className = '', segnoRef, soloSegno = false, id }: Props) {
  if (soloSegno) {
    return (
      <span className={`logo logo--segno ${className}`} id={id}>
        <svg className="logo-segno" viewBox="0 0 34 34" aria-hidden="true" focusable="false">
          {/* La N in un tratto solo, cosi' si disegna come un gesto unico
              invece che in tre pezzi separati. */}
          <path
            ref={segnoRef}
            d="M7 27 V7 L27 27 V7"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className={`logo ${className}`} id={id}>
      <span className="logo-parola">
        <span className="logo-iniziale">{marchio.primaLettera}</span>
        {marchio.resto}
      </span>
    </span>
  );
}
