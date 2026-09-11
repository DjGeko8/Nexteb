'use client';

/**
 * Il pannello dei contatti: entra da sinistra con un rivelo in clip-path.
 *
 * Tre cose che non sono facoltative e che di solito mancano:
 *  - `inert` su tutti i fratelli, ma ABBINATO alla gestione esplicita del
 *    fuoco: inert toglie gli altri dal giro, non porta il fuoco dentro ne' lo
 *    restituisce;
 *  - il pannello nasce `inert` nel markup, non lo riceve da JavaScript: un
 *    pannello aria-hidden pieno di elementi focusabili senza inert e' nascosto
 *    agli screen reader e raggiungibile con Tab, il peggiore dei due mondi;
 *  - transizioni asimmetriche, entrata e uscita scritte due volte.
 */

import { useEffect, useRef } from 'react';
import { contatti } from '@/content/it';
import { blocca } from '@/lib/blocco';
import { primoFocusabile, rendiEsclusivo } from '@/lib/inerte';
import { eSegnaposto } from '@/lib/segnaposti';

type Props = { aperto: boolean; onChiudi: () => void };

function Voce({ etichetta, valore, href }: { etichetta: string; valore: string; href?: string }) {
  const segnaposto = eSegnaposto(valore);
  const corpo = (
    <span className={segnaposto ? 'tbd' : undefined}>{valore}</span>
  );
  return (
    <p className="contatti-voce">
      <span className="contatti-etichetta">{etichetta}</span>
      {href && !segnaposto ? <a href={href}>{corpo}</a> : corpo}
    </p>
  );
}

export function PannelloContatti({ aperto, onChiudi }: Props) {
  const pannello = useRef<HTMLDivElement>(null);
  const apriva = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = pannello.current;
    if (!el) return;

    if (!aperto) {
      el.setAttribute('inert', '');
      return;
    }

    apriva.current = document.activeElement as HTMLElement | null;
    el.removeAttribute('inert');
    const ripristina = rendiEsclusivo(el);
    blocca(true, 'contatti');

    (primoFocusabile(el) ?? el).focus({ preventScroll: true });

    const suTasto = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChiudi();
    };
    addEventListener('keydown', suTasto);

    return () => {
      removeEventListener('keydown', suTasto);
      ripristina();
      blocca(false, 'contatti');
      apriva.current?.focus({ preventScroll: true });
    };
  }, [aperto, onChiudi]);

  return (
    <>
      <div
        className="contatti-velo"
        data-aperto={aperto ? 'si' : 'no'}
        onClick={onChiudi}
        aria-hidden="true"
      />
      <div
        id="pannello-contatti"
        ref={pannello}
        className="contatti-pannello"
        data-aperto={aperto ? 'si' : 'no'}
        role="dialog"
        aria-modal="true"
        aria-label={contatti.titolo}
        tabIndex={-1}
        inert={!aperto ? true : undefined}
      >
        <button type="button" className="contatti-chiudi" onClick={onChiudi}>
          Chiudi
        </button>

        <h2 className="contatti-titolo">{contatti.titolo}</h2>
        <p className="contatti-testo">{contatti.testo}</p>

        <div className="contatti-elenco">
          <Voce etichetta="Email" valore={contatti.email} href={`mailto:${contatti.email}`} />
          <Voce etichetta="Telefono" valore={contatti.telefono} href={`tel:${contatti.telefono}`} />
          <Voce etichetta="WhatsApp" valore={contatti.whatsapp} />
          <Voce etichetta="Zona" valore={contatti.zona} />
        </div>

        <a className="contatti-modulo" href="#modulo" onClick={onChiudi}>
          {contatti.vaiAlModulo}
        </a>
      </div>
    </>
  );
}
